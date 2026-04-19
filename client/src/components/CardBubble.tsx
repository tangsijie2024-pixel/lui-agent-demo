import type { RecommendationCard } from '../types'
import { getCategoryStyle } from '../utils/categoryStyle'

interface Props {
  card: RecommendationCard
  onClick: () => void
}

export default function CardBubble({ card, onClick }: Props) {
  const catStyle = getCategoryStyle(card.area)
  const nameStyle = getCategoryStyle(card.place_name)
  const finalStyle = catStyle.emoji === '✨' ? nameStyle : catStyle

  return (
    <div
      onClick={onClick}
      style={{
        width: '240px',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        border: '0.5px solid #ede8e2',
        overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(58,53,48,0.06)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Cover */}
      <div style={{ height: '108px', background: finalStyle.gradient, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'rgba(0,0,0,0.32)',
            backdropFilter: 'blur(4px)',
            borderRadius: '20px',
            padding: '3px 10px',
            fontSize: '11px',
            color: '#fff',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {finalStyle.emoji} {finalStyle.label} · {card.area}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#3a3530' }}>{card.place_name}</span>
          <span style={{ fontSize: '12px', color: '#b07a4a', fontWeight: 500, flexShrink: 0, marginLeft: '8px' }}>{card.price}</span>
        </div>
        <div style={{ fontSize: '11px', color: '#9a8e86', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>🕐</span>
          <span>{card.opening}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#6a5e56', backgroundColor: '#faf8f5', borderRadius: '8px', padding: '7px 9px', lineHeight: '1.5' }}>
          💡 {card.insider_tip}
        </div>

      </div>
    </div>
  )
}
