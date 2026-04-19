export interface CategoryStyle {
  gradient: string
  emoji: string
  label: string
}

const STYLES: Record<string, CategoryStyle> = {
  jazz:       { gradient: 'linear-gradient(135deg, #7a5230 0%, #c49a6c 100%)', emoji: '🎷', label: 'Jazz' },
  bar:        { gradient: 'linear-gradient(135deg, #5c4a2a 0%, #b8935a 100%)', emoji: '🍸', label: 'Bar' },
  café:       { gradient: 'linear-gradient(135deg, #3a5e42 0%, #7ea67a 100%)', emoji: '☕', label: 'Café' },
  coffee:     { gradient: 'linear-gradient(135deg, #3a5e42 0%, #7ea67a 100%)', emoji: '☕', label: 'Café' },
  咖啡:       { gradient: 'linear-gradient(135deg, #3a5e42 0%, #7ea67a 100%)', emoji: '☕', label: '咖啡' },
  restaurant: { gradient: 'linear-gradient(135deg, #7a3a2a 0%, #c47a5a 100%)', emoji: '🍜', label: '餐厅' },
  餐厅:       { gradient: 'linear-gradient(135deg, #7a3a2a 0%, #c47a5a 100%)', emoji: '🍜', label: '餐厅' },
}

const FALLBACK: CategoryStyle = {
  gradient: 'linear-gradient(135deg, #7a6a5a 0%, #b8a898 100%)',
  emoji: '✨',
  label: '',
}

export function getCategoryStyle(hint: string): CategoryStyle {
  const key = Object.keys(STYLES).find(k => hint.toLowerCase().includes(k.toLowerCase()))
  return key ? STYLES[key] : { ...FALLBACK, label: hint }
}
