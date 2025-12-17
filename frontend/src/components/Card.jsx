const CARD_COLORS = {
  red: '#e53e3e',
  blue: '#3182ce',
  green: '#38a169',
  yellow: '#d69e2e',
  wild: '#2d3748'
};

export default function Card({ card, onClick, disabled = false }) {
  const backgroundColor = CARD_COLORS[card.color] || '#ddd';
  
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        width: 80,
        height: 120,
        background: backgroundColor,
        border: '3px solid white',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'transform 0.2s',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        opacity: disabled ? 0.6 : 1
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = 'translateY(-10px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div style={{
        background: 'white',
        width: 60,
        height: 85,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: backgroundColor
      }}>
        {card.value.replace('_', ' ')}
      </div>
    </div>
  );
}