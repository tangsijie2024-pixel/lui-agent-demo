import { useEffect, useRef, useState } from 'react'
import type { RecommendationCard } from '../types'
import { getCategoryStyle } from '../utils/categoryStyle'

interface Props {
  card: RecommendationCard
  onClose: () => void
}

export default function BottomSheet({ card, onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const touchStartY = useRef(0)

  const catStyle = getCategoryStyle(card.area)
  const nameStyle = getCategoryStyle(card.place_name)
  const finalStyle = catStyle.emoji === '✨' ? nameStyle : catStyle

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 280)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (e.changedTouches[0].clientY - touchStartY.current > 60) handleClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(58, 53, 48, 0.45)',
          backdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 300ms ease-out, backdrop-filter 300ms ease-out',
        }}
      />

      {/* Sheet */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '390px',
          backgroundColor: '#faf8f5',
          borderRadius: '24px 24px 0 0',
          maxHeight: '88vh',
          overflowY: 'auto',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms ease-out',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: '#d4c9bc' }} />
        </div>

        {/* Cover */}
        <div style={{ padding: '0 16px', marginTop: '8px' }}>
          <div
            style={{
              height: '200px',
              background: finalStyle.gradient,
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '14px',
                left: '14px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(4px)',
                borderRadius: '20px',
                padding: '5px 12px',
                fontSize: '12px',
                color: '#fff',
                fontWeight: 500,
              }}
            >
              {finalStyle.emoji} {finalStyle.label} · {card.area}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 20px 40px' }}>
          {/* Name + price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#3a3530', lineHeight: 1.2 }}>
              {card.place_name}
            </span>
            <span style={{ fontSize: '14px', color: '#c8a97e', fontWeight: 600, marginLeft: '12px', flexShrink: 0, marginTop: '4px' }}>
              {card.price}
            </span>
          </div>

          {/* Vibe text */}
          <p style={{ fontSize: '14px', color: '#6a5e56', lineHeight: 1.65, margin: '0 0 18px' }}>
            {card.vibe_text}
          </p>

          {/* Divider */}
          <div style={{ height: '0.5px', backgroundColor: '#ede8e2', marginBottom: '18px' }} />

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
            {[
              { icon: '📍', text: card.area },
              { icon: '🕐', text: card.opening },
              { icon: '💰', text: card.price },
              { icon: '💡', text: card.insider_tip },
            ].map(({ icon, text }) => (
              <div key={icon} style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#3a3530', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0 }}>{icon}</span>
                <span style={{ lineHeight: 1.55 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: '#c8a97e',
                border: 'none',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              导航过去
            </button>
            <button
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: 'transparent',
                border: '1.5px solid #c8a97e',
                color: '#c8a97e',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              告诉朋友
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
