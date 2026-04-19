# LUI Agent

A lifestyle recommendation chatbot demo built with Express + TypeScript backend and React/Vite frontend. LUI understands your vibe, recommends places, and proactively pushes suggestions at the right moment.

## Features

- **Passive response** — chat with LUI to get personalized place recommendations (bars, cafes, restaurants) based on your profile
- **Conversation state machine** — tracks `exploring → decided → following_up` within a session
- **Proactive push** — polls every 30 seconds and pushes recommendations when signals align (mood, time of day, golden hour)
- **Live feed memory** — automatically extracts mood and signals from each conversation turn, persists to user profile
- **24-hour push cooldown** — no duplicate pushes

## Tech Stack

- **Backend**: Express + TypeScript, `ts-node-dev`
- **Frontend**: React + Vite + Tailwind CSS
- **AI**: Anthropic Claude API (`claude-sonnet-4-6-thinking`)
- **Data**: JSON files (users + places)

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/yourusername/lui-agent-demo.git
cd lui-agent-demo
npm install
cd client && npm install && cd ..

# 2. Set up environment
cp .env.example .env
# Edit .env and fill in your API key

# 3. Run dev server (backend + frontend)
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4000`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GLM_API_KEY` | Your Anthropic-compatible API key |

The backend uses `https://aiapi.world` as the base URL. To use the official Anthropic endpoint, change `baseURL` in `src/lib/anthropic.ts`.

## API

```bash
# Chat (passive response)
curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_001","query":"附近有什么好玩的"}'

# Proactive push check
curl http://localhost:4000/proactive/user_001

# Mark push as read (starts 24h cooldown)
curl -X POST http://localhost:4000/mark-read/user_001
```

## Project Structure

```
src/
├── agent/          # passiveResponse, proactiveResponse
├── data/           # users.json, places.json
├── lib/            # shared Anthropic client, extractJson util
├── prompts/        # one file per feature
├── skills/
│   ├── intent/     # parseIntent
│   ├── memory/     # getMemory, updateMemory, extractFeedSignals
│   ├── recommendation/ # filterByProfile, buildCard
│   ├── state/      # detectState, respondDecided
│   └── trigger/    # shouldProactivelyPush, detectFeedSignal
└── types.ts
client/src/
├── App.tsx
├── components/     # CardBubble, BottomSheet, ChatInput, TypingIndicator
└── utils/
```

## Users

Three demo users are pre-configured in `src/data/users.json`:

- **user_001 Sijie** — jazz bars, craft beer, dim lighting, 静安/徐汇
- **user_002 Lin** — introvert, craft beer, quiet spots, 虹桥/杨浦
- **user_003 Yumi** — indie cafes, art, social, 徐汇/黄浦
