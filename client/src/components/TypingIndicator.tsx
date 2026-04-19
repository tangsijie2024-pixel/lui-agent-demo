export default function TypingIndicator() {
  return (
    <div
      className="px-4 py-3 bubble-appear"
      style={{
        backgroundColor: '#ffffff',
        border: '0.5px solid #ede8e2',
        borderRadius: '18px 18px 18px 4px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <span className="dot-typing" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <span />
        <span />
        <span />
      </span>
    </div>
  )
}
