// 全局变量
let allPlaces = [];
let currentFilter = 'all';
const profileLabels = {
    social: '出行方式',
    consumption: '价格偏好',
    lifestyle: '风格偏好',
    schedule: '当前状态',
    aspirations: '理想周末'
};

const typeMap = {
    '餐厅': 'Restaurant',
    '酒吧': 'Bar',
    '咖啡馆': 'Café'
};

// 生成本地SVG占位图
function getImageUrl(type, name) {
    const title = name || type || '城市向导';
    const label = type === 'Bar' || type === '酒吧' ? '酒吧'
        : type === 'Restaurant' || type === '餐厅' ? '餐厅'
        : type === 'Café' || type === '咖啡馆' ? '咖啡馆'
        : '探索';
    const color = type === 'Bar' || type === '酒吧' ? '#7f5af0'
        : type === 'Restaurant' || type === '餐厅' ? '#ff6b6b'
        : type === 'Café' || type === '咖啡馆' ? '#56cfe1'
        : '#6c5ce7';
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
            <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop stop-color="${color}" offset="0%" />
                    <stop stop-color="#2f2fa2" offset="100%" />
                </linearGradient>
            </defs>
            <rect width="300" height="200" fill="url(#g)" rx="20" ry="20" />
            <text x="50%" y="55%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#ffffff" font-weight="700">${label}</text>
            <text x="50%" y="75%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#ffffff" opacity="0.85">${title}</text>
        </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// 添加消息
function addMessage(type, text) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    if (type === 'bot') {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-map-pin"></i>
            </div>
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addPlacesMessage(places = []) {
    if (!places || places.length === 0) {
        return;
    }
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    
    let cardsHTML = '';
    places.slice(0, 2).forEach(place => {
        const priceLabel = place.price === '$' ? '¥60-100' : place.price === '$$' ? '¥150-250' : '¥300+';
        cardsHTML += `
            <div class="place-card-inline" onclick="showPlaceDetail('${place.name}')">
                <div class="card-header">
                    <span class="card-name">📍 <strong>${place.name}</strong></span>
                    <span class="card-rating">· ${place.rating}</span>
                </div>
                <div class="card-meta">
                    💰 人均: ${priceLabel} | 距离: ${place.distance}
                </div>
                <div class="card-reason">
                    💡 <strong>推荐理由</strong>：${place.description.substring(0, 25)}
                </div>
                ${place.tip ? `<div class="card-tip">> 💡 ${place.tip}</div>` : ''}
            </div>
            <hr class="card-divider" />
        `;
    });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-map-pin"></i>
        </div>
        <div class="message-content message-places-only">
            ${cardsHTML}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessages(text) {
    const trimmed = text.trim();
    if (!trimmed) {
        return;
    }
    const sentences = trimmed.match(/[^。！？!?]+[。！？!?]?/g) || [trimmed];
    if (sentences.length <= 1) {
        addMessage('bot', trimmed);
        return;
    }
    addMessage('bot', sentences[0]);
    addMessage('bot', sentences.slice(1).join('').trim());
}

// 更新地点列表
function updatePlaces(places) {
    allPlaces = places;
    filterPlaces(currentFilter);
}

// 筛选地点
function normalizeType(type) {
    return typeMap[type] || type;
}

function filterPlaces(filter) {
    currentFilter = filter;
    const placesList = document.getElementById('places-list');
    if (!placesList) return;
    
    placesList.innerHTML = '';

    const normalizedFilter = filter === 'all' ? 'all' : normalizeType(filter);
    const filteredPlaces = normalizedFilter === 'all' ? allPlaces : allPlaces.filter(place => normalizeType(place.type) === normalizedFilter);

    filteredPlaces.forEach(place => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.onclick = () => showPlaceDetail(place.name);

        card.innerHTML = `
            <div class="place-image">
                <img src="${getImageUrl(place.type, place.name)}" alt="${place.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(place.name)}'">
            </div>
            <div class="place-content">
                <div class="place-header">
                    <h3 class="place-name">${place.name}</h3>
                    <span class="place-area">${place.area}</span>
                </div>
                <div class="place-meta">
                    <div class="place-rating">
                        <span class="stars">${'★'.repeat(Math.floor(place.rating))}${'☆'.repeat(5 - Math.floor(place.rating))}</span>
                        <span>${place.rating}</span>
                    </div>
                    <span class="place-price">${place.price}</span>
                    <span class="place-distance">${place.distance}</span>
                </div>
                <p class="place-description">${place.description}</p>
            </div>
        `;
        placesList.appendChild(card);
    });
}

function updateProfile(profile) {
    const profileItems = document.getElementById('profile-items');
    if (!profileItems) return;
    
    profileItems.innerHTML = '';

    Object.keys(profileLabels).forEach(key => {
        const value = profile[key] || '收集中...';
        const item = document.createElement('div');
        item.className = 'profile-item';
        item.innerHTML = `
            <span>${profileLabels[key]}</span>
            <strong>${value}</strong>
        `;
        profileItems.appendChild(item);
    });
}

// 显示地点详情
function showPlaceDetail(placeName) {
    const place = allPlaces.find(p => p.name === placeName);
    if (!place) return;

    const modal = document.getElementById('place-modal');
    const modalDetails = document.getElementById('modal-details');

    modalDetails.innerHTML = `
        <div class="modal-image">
            <img src="${getImageUrl(place.type, place.name)}" alt="${place.name}" onerror="this.src='https://via.placeholder.com/400x250?text=${encodeURIComponent(place.name)}'">
        </div>
        <div class="modal-content">
            <h2>${place.name}</h2>
            <div class="modal-meta">
                <span class="modal-type">${place.type}</span>
                <span class="modal-area">${place.area}</span>
            </div>
            <div class="modal-rating">
                <span class="stars">${'★'.repeat(Math.floor(place.rating))}${'☆'.repeat(5 - Math.floor(place.rating))}</span>
                <span>${place.rating} 分</span>
            </div>
            <div class="modal-details">
                <p><strong>价格等级:</strong> ${place.price}</p>
                <p><strong>距离:</strong> ${place.distance}</p>
                <p><strong>简介:</strong> ${place.description}</p>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// 发送消息
function sendMessage(message = null) {
    const userInput = document.getElementById('user-input');
    const text = message || userInput.value.trim();
    if (!text) return;

    addMessage('user', text);
    userInput.value = '';

    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            addMessage('bot', data.error);
        } else {
            const reply = data.reply || '';
            addBotMessages(reply);
            addPlacesMessage(data.places);
            if (data.followup) {
                addMessage('bot', data.followup);
            }
            updatePlaces(data.places);
            if (data.profile) {
                updateProfile(data.profile);
            }
        }
    })
    .catch(error => {
        addMessage('bot', '抱歉，发生了错误。请稍后再试。');
        console.error('Error:', error);
    });
}

// 处理键盘事件
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 筛选标签事件
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterPlaces(this.dataset.filter);
        });
    });

    // 模态框关闭
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('place-modal').style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        const modal = document.getElementById('place-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    updateProfile({});
});