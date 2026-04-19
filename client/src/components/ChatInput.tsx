import { useState, type KeyboardEvent } from 'react'

interface Props {
  onSend: (text: string) => void
  disabled: boolean
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{ borderTop: '0.5px solid #ede8e2', backgroundColor: '#faf8f5' }}
      className="px-4 py-3 flex items-end gap-2"
    >
      <textarea
        rows={1}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder="告诉我你今晚想做什么…"
        disabled={disabled}
        style={{
          flex: 1,
          resize: 'none',
          borderRadius: '20px',
          border: '0.5px solid #ddd6ce',
          backgroundColor: disabled ? '#f0ece8' : '#ffffff',
          color: '#3a3530',
          fontSize: '14px',
          lineHeight: '1.5',
          padding: '10px 16px',
          outline: 'none',
          fontFamily: 'inherit',
          maxHeight: '96px',
          overflowY: 'auto',
        }}
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: !value.trim() || disabled ? '#c9bfb6' : '#b07a4a',
          border: 'none',
          cursor: !value.trim() || disabled ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background-color 0.15s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8L14 8M14 8L9 3M14 8L9 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
