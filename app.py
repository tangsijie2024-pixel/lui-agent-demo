from flask import Flask, request, jsonify, render_template, session
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # 设置session密钥

# Mock data for Shanghai locations
MOCK_PLACES = [
    {
        "name": "Migas Mercado",
        "type": "Bar",
        "rating": 4.5,
        "price": "$$",
        "distance": "300m",
        "description": "A vibrant rooftop bar with great cocktails and city views.",
        "area": "Jing'an"
    },
    {
        "name": "Din Tai Fung",
        "type": "Restaurant",
        "rating": 4.8,
        "price": "$$$",
        "distance": "500m",
        "description": "Famous for soup dumplings and Taiwanese cuisine.",
        "area": "Jing'an"
    },
    {
        "name": "Blue Frog",
        "type": "Bar",
        "rating": 4.2,
        "price": "$$",
        "distance": "700m",
        "description": "A popular pub with live music and craft beers.",
        "area": "Jing'an"
    },
    {
        "name": "Element Fresh",
        "type": "Café",
        "rating": 4.0,
        "price": "$",
        "distance": "400m",
        "description": "Healthy salads and smoothies in a modern setting.",
        "area": "Xuhui"
    },
    {
        "name": "Lost Heaven",
        "type": "Restaurant",
        "rating": 4.6,
        "price": "$$$",
        "distance": "600m",
        "description": "Authentic Yunnan cuisine with a focus on wild mushrooms.",
        "area": "Xuhui"
    },
    {
        "name": "The Bund",
        "type": "Attraction",
        "rating": 4.7,
        "price": "Free",
        "distance": "1km",
        "description": "Historic waterfront area with colonial architecture.",
        "area": "Huangpu"
    },
    {
        "name": "Old Heaven",
        "type": "Restaurant",
        "rating": 4.4,
        "price": "$$",
        "distance": "800m",
        "description": "Yunnan restaurant with a cozy atmosphere.",
        "area": "Huangpu"
    },
    {
        "name": "Bellini",
        "type": "Café",
        "rating": 4.3,
        "price": "$$",
        "distance": "500m",
        "description": "Italian café with excellent coffee and pastries.",
        "area": "Changning"
    },
    {
        "name": "Commute",
        "type": "Café",
        "rating": 4.1,
        "price": "$",
        "distance": "300m",
        "description": "Cozy café perfect for working or relaxing.",
        "area": "Changning"
    },
    {
        "name": "Bar Rouge",
        "type": "Bar",
        "rating": 4.5,
        "price": "$$$",
        "distance": "900m",
        "description": "Luxury bar at the top of IFC with stunning views.",
        "area": "Huangpu"
    }
]

user_profile = {
    "identity": None,
    "social": None,
    "consumption": None,
    "lifestyle": None,
    "schedule": None,
    "feed": [],
    "aspirations": None,
    "last_vibe": None,
}

profile_order = [
    "social",
    "consumption",
    "lifestyle",
    "schedule",
]

followup_prompts = {
    "social": "这次是一个人去还是和朋友一起？",
    "consumption": "你平时消费大概什么价位？",
    "lifestyle": "你平时偏好什么氛围？安静、热闹还是文艺？",
    "schedule": "最近是什么时间段？下班后、周末还是其他？",
}

profile_labels = {
    "social": "出行方式",
    "consumption": "价格偏好",
    "lifestyle": "风格偏好",
    "schedule": "当前状态",
}

# 默认profile结构（用于初始化）
default_profile = {
    "identity": None,
    "social": None,
    "consumption": None,
    "lifestyle": None,
    "schedule": None,
    "feed": [],
    "aspirations": None,
    "last_vibe": None,
}


def identify_user_type(profile):
    """
    用户研究层：识别用户类型
    - 异乡人：刚到新城市，缺乏本地朋友圈
    - 社交组织者：经常聚会，需要选址决策
    - 独处探索者：一个人活动，追求个性化
    - 本地老手：住了很久，想突破舒适圈
    """
    social_pattern = profile.get("social")
    interaction_count = len(profile.get("feed", []))
    
    if not social_pattern and interaction_count < 3:
        return "异乡人"
    elif social_pattern == "和朋友":
        return "社交组织者"
    elif social_pattern == "一个人":
        return "独处探索者"
    else:
        return "本地老手"


def extract_deep_intent(user_input, profile):
    """
    三层剥洋葱法则：
    1. 即时意图：用户想要什么物理空间
    2. 场景意图：用户现在处于什么情境
    3. 深层意图：用户需要什么心理补偿
    """
    immediate = None
    context = None
    emotional = None

    # 即时意图识别
    if any(w in user_input for w in ["吃饭", "餐厅", "美食"]):
        immediate = "Restaurant"
    elif any(w in user_input for w in ["喝酒", "酒吧", "cocktail"]):
        immediate = "Bar"
    elif any(w in user_input for w in ["咖啡", "咖啡馆", "coffee"]):
        immediate = "Café"

    # 场景意图识别
    if any(w in user_input for w in ["刚下班", "下班", "加班", "累了"]):
        context = "刚下班疲惫"
        emotional = "需要心理补偿"
    elif any(w in user_input for w in ["周五", "周六", "周末"]):
        context = "周末休闲"
        emotional = "寻求氛围感"
    elif any(w in user_input for w in ["休息", "放松", "安静", "待得住"]):
        context = "需要独处"
        emotional = "逃离喧嚣"
    elif any(w in user_input for w in ["朋友", "聚会", "热闹"]):
        context = "社交活动"
        emotional = "寻求连接"

    return {
        "immediate": immediate,
        "context": context,
        "emotional": emotional,
    }


def generate_empathetic_reply(intent, profile, places, next_field=None):
    """
    移动端 LUI 排版协议：
    - 纯文字回复不超过 50 字
    - 不暴露画像对账逻辑
    - 直接给结果，用结果证明听懂了
    """
    emotional = intent.get("emotional")
    num_places = len(places)
    has_next_question = bool(next_field)

    if emotional == "需要心理补偿":
        reply = "刚加班，找个地儿回回神吧。"
    elif emotional == "逃离喧嚣":
        reply = "这几家最适合瘫着，包你舒服。" if num_places > 1 else "这家最适合瘫着，包你舒服。"
    elif emotional == "寻求连接":
        reply = "朋友聚会的话，下面这两家很带劲。" if num_places > 1 else "朋友聚会的话，这家很带劲。"
    elif emotional == "寻求氛围感":
        reply = "周末想感受点新鲜感，给你挑了最有feel的。" if num_places > 1 else "周末想感受点新鲜感，给你挑了这家最有feel的。"
    else:
        if has_next_question:
            reply = "先给你推荐这几家，顺便问一下。"
        else:
            reply = "这几家都不错，你看中哪个。" if num_places > 1 else "这家不错，你觉得怎么样。"

    return reply


def multi_dimensional_filter(candidates, profile, intent):
    """
    业务层：多维过滤
    基于用户画像的每个维度进行智能筛选
    权重顺序：lifestyle > consumption > social > schedule
    """
    filtered = candidates[:]

    # 第一层：lifestyle过滤（核心调性匹配）
    if profile.get("lifestyle"):
        if "安静" in profile["lifestyle"]:
            filtered = [p for p in filtered if p["type"] in ["Café", "Restaurant"]]
        elif "热闹" in profile["lifestyle"]:
            filtered = [p for p in filtered if p["type"] in ["Bar", "Restaurant"]]
        elif "文艺" in profile["lifestyle"]:
            filtered = [p for p in filtered if p["type"] in ["Café", "Restaurant"]]

    # 第二层：consumption过滤（价格承受力）
    if profile.get("consumption"):
        price_map = {"平价": ["$"], "中档": ["$$"], "中高档": ["$$$"]}
        allowed_prices = price_map.get(profile["consumption"], [])
        filtered = [p for p in filtered if p["price"] in allowed_prices]

    # 第三层：social场景适配
    if profile.get("social") == "和朋友":
        social_friendly = [p for p in filtered if p["type"] in ["Bar", "Restaurant"]]
        if social_friendly:
            filtered = social_friendly
    elif profile.get("social") == "一个人":
        solo_friendly = [p for p in filtered if p["type"] in ["Café", "Restaurant"]]
        if solo_friendly:
            filtered = solo_friendly

    # 第四层：schedule时机考虑
    if profile.get("schedule"):
        if "下班后" in profile["schedule"]:
            evening_friendly = [p for p in filtered if p["type"] in ["Bar", "Café"]]
            if evening_friendly:
                filtered = evening_friendly

    # 保底：如果筛选过严，返回原候选
    if not filtered:
        filtered = candidates[:]

    return filtered[:2]


def call_glm_api(user_input, profile, selected_places, next_field=None):
    intent = extract_deep_intent(user_input, profile)
    reply = generate_empathetic_reply(intent, profile, selected_places, next_field)
    return reply


def get_next_profile_field(profile):
    for key in profile_order:
        if not profile.get(key):
            return key
    return None


def parse_profile_answer(user_input, field):
    text = user_input.strip()
    if field == "social":
        if "朋友" in text or "一起" in text:
            return "和朋友"
        if "一个人" in text or "独自" in text or "自己" in text:
            return "一个人"
        return text
    if field == "consumption":
        if "便宜" in text or "平价" in text or "大众" in text:
            return "平价"
        if "中" in text or "中档" in text or "适中" in text:
            return "中档"
        if "贵" in text or "高" in text or "高档" in text:
            return "中高档"
        return text
    return text

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    if not user_input:
        return jsonify({"error": "No message provided"}), 400

    # 从session获取profile和question_pending
    profile = session.get('user_profile', default_profile.copy())
    question_pending = session.get('question_pending', None)

    answered_profile_question = False
    if question_pending:
        profile[question_pending] = parse_profile_answer(user_input, question_pending)
        question_pending = None
        answered_profile_question = True

    def select_places(user_input, profile):
        """
        执行层：被动响应模式下的选择逻辑
        1. 根据即时意图筛选基础候选
        2. 根据多维画像进行智能过滤
        3. 返回最匹配的2个地点
        """
        intent = extract_deep_intent(user_input, profile)
        
        # 基础候选：按即时意图筛选
        candidates = MOCK_PLACES
        if intent.get("immediate"):
            candidates = [p for p in MOCK_PLACES if p['type'] == intent["immediate"]]
        
        # 区域过滤
        area_map = {
            '静安': "Jing'an",
            '徐汇': 'Xuhui',
            '黄浦': 'Huangpu',
            '长宁': 'Changning'
        }
        for cn, en in area_map.items():
            if cn in user_input:
                area_candidates = [p for p in candidates if p['area'] == en]
                if area_candidates:
                    candidates = area_candidates
                break
        
        # 多维过滤（核心：基于画像过滤）
        return multi_dimensional_filter(candidates, profile, intent)

    selected_places = select_places(user_input, profile)
    intent = extract_deep_intent(user_input, profile)
    next_field = get_next_profile_field(profile)
    reply = generate_empathetic_reply(intent, profile, selected_places, next_field)
    glm_response = call_glm_api(user_input, profile, selected_places, next_field)

    tool_reply = None
    confirm_keywords = [
        "就这", "就这家", "就这间", "这个吧",
        "这家不错", "不错这家", "好这家", "这个不错", "就它", "可以这家"
    ]
    if not answered_profile_question and selected_places and any(keyword in user_input for keyword in confirm_keywords):
        tool_reply = f"好嘞，这家我帮你算好了，打车过去大概15分钟。要不要我把地址发到你手机上？"

    next_field = get_next_profile_field(profile)
    followup = None
    if tool_reply:
        followup = tool_reply
    elif next_field:
        followup = followup_prompts[next_field]
        question_pending = next_field

    # 更新session
    session['user_profile'] = profile
    session['question_pending'] = question_pending

    return jsonify({
        "reply": reply,
        "followup": followup,
        "profile": profile,
        "places": selected_places
    })

if __name__ == '__main__':
    import sys
    port = 5001
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except:
            pass
    app.run(debug=True, port=port, host='0.0.0.0')