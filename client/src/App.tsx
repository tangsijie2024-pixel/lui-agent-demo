import { useState, useRef, useEffect } from 'react'
import './index.css'
import type { RecommendationCard, ConversationMessage, ChatResponse, ProactiveResponse } from './types'
import TypingIndicator from './components/TypingIndicator'
import CardBubble from './components/CardBubble'
import BottomSheet from './components/BottomSheet'
import ChatInput from './components/ChatInput'

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'ai'; kind: 'text'; text: string }
  | { id: string; role: 'ai'; kind: 'card'; card: RecommendationCard }

function uid() {
  return Math.random().toString(36).slice(2)
}

function randDelay() {
  return 750 + Math.random() * 100
}

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [history, setHistory] = useState<ConversationMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sheetCard, setSheetCard] = useState<RecommendationCard | null>(null)
  const pushedRef = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [time, setTime] = useState(() => {
    const now = new Date()
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`)
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Proactive push polling — every 30 seconds
  useEffect(() => {
    async function poll() {
      if (pushedRef.current || loading) return
      try {
        const res = await fetch('/proactive/user_001')
        if (!res.ok) return
        const data = await res.json() as ProactiveResponse
        if (!data.shouldPush || pushedRef.current) return
        pushedRef.current = true

        const { opening, cards } = data.push
        await addAiBubble({ id: uid(), role: 'ai', kind: 'text', text: opening })
        for (const card of cards) {
          await addAiBubble({ id: uid(), role: 'ai', kind: 'card', card })
        }
        // Start 24h cooldown server-side
        fetch('/mark-read/user_001', { method: 'POST' }).catch(() => {})
      } catch {
        // silent — polling should never crash the UI
      }
    }

    poll()
    const timer = setInterval(poll, 30_000)
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function addAiBubble(msg: ChatMessage) {
    setIsTyping(true)
    await sleep(randDelay())
    setIsTyping(false)
    setMessages(prev => [...prev, msg])
  }

  async function handleSend(query: string) {
    if (loading) return
    setLoading(true)
    setMessages(prev => [...prev, { id: uid(), role: 'user', text: query }])

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user_001', query, messages: history }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as ChatResponse

      // Track user turn in history
      const userEntry: ConversationMessage = { role: 'user', content: query }

      if (data.state === 'decided' || data.state === 'following_up') {
        // Single text response
        await addAiBubble({ id: uid(), role: 'ai', kind: 'text', text: data.message })
        setHistory(prev => [...prev, userEntry, { role: 'assistant', content: data.message }])
      } else {
        // Recommendation flow (exploring / new_query)
        const { cards } = data

        await addAiBubble({ id: uid(), role: 'ai', kind: 'text', text: cards[0]?.vibe_text ?? '懂你 😌' })

        const transition = cards.length === 1
          ? '找到一个，应该合适 👇'
          : '帮你找了两个，都不用提前订 👇'
        await addAiBubble({ id: uid(), role: 'ai', kind: 'text', text: transition })

        for (const card of cards) {
          await addAiBubble({ id: uid(), role: 'ai', kind: 'card', card })
        }

        const last = cards[cards.length - 1]
        if (last) {
          await addAiBubble({ id: uid(), role: 'ai', kind: 'text', text: last.cta })
        }

        // Build assistant history entry summarizing the recommendations
        const cardSummary = cards
          .map(c => `${c.place_name}（${c.area}，${c.price}）`)
          .join('、')
        const assistantEntry: ConversationMessage = {
          role: 'assistant',
          content: `推荐了：${cardSummary}。${last?.cta ?? ''}`,
        }
        setHistory(prev => [
          ...(data.state === 'new_query' ? [] : prev),
          userEntry,
          assistantEntry,
        ])
      }
    } catch {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: uid(), role: 'ai', kind: 'text',
        text: '出了点小问题，稍后再试试？🙈',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex flex-col h-svh"
      style={{ backgroundColor: '#faf8f5', maxWidth: '390px', margin: '0 auto' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 shrink-0"
        style={{
          borderBottom: '0.5px solid #ede8e2',
          backgroundColor: '#faf8f5',
          height: '54px',
        }}
      >
        <span className="text-sm font-medium w-12" style={{ color: '#8a7e76' }}>{time}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-base tracking-widest" style={{ color: '#3a3530' }}>LUI</span>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#4ade80',
              display: 'inline-block',
            }}
          />
        </div>
        <span className="text-sm text-right w-12" style={{ color: '#8a7e76' }}>上海</span>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-2.5">
        {messages.length === 0 && !isTyping && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 select-none" style={{ opacity: 0.45 }}>
            <span style={{ fontSize: '32px' }}>✨</span>
            <p style={{ fontSize: '13px', color: '#8a7e76', margin: 0 }}>告诉 LUI 你今晚想做什么</p>
          </div>
        )}

        {messages.map(msg => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex justify-end bubble-appear">
                <div
                  className="text-sm leading-relaxed"
                  style={{
                    maxWidth: '72%',
                    padding: '10px 16px',
                    backgroundColor: '#d4c9bc',
                    borderRadius: '18px 18px 4px 18px',
                    color: '#3a3530',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            )
          }

          if (msg.kind === 'card') {
            return (
              <div key={msg.id} className="bubble-appear" style={{ alignSelf: 'flex-start' }}>
                <CardBubble card={msg.card} onClick={() => setSheetCard(msg.card)} />
              </div>
            )
          }

          return (
            <div key={msg.id} className="flex justify-start bubble-appear">
              <div
                className="text-sm leading-relaxed"
                style={{
                  maxWidth: '72%',
                  padding: '10px 16px',
                  backgroundColor: '#ffffff',
                  border: '0.5px solid #ede8e2',
                  borderRadius: '18px 18px 18px 4px',
                  color: '#3a3530',
                }}
              >
                {msg.text}
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={loading} />

      {/* Bottom sheet */}
      {sheetCard && <BottomSheet card={sheetCard} onClose={() => setSheetCard(null)} />}
    </div>
  )
}
