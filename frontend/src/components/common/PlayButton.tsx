import { useNavigate } from 'react-router-dom';

interface PlayButtonProps {
  className?: string;
}

export default function PlayButton({ className = '' }: PlayButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/lobby')}
      className={`
        relative group
        px-16 py-6 
        text-4xl font-poppins font-extrabold text-white
        bg-gradient-to-r from-uno-red via-uno-yellow to-uno-green
        rounded-2xl
        transform transition-all duration-300
        hover:scale-110 hover:-translate-y-2
        animate-pulse-glow
        shadow-2xl
        ${className}
      `}
      style={{
        boxShadow: `
          0 0 40px rgba(229, 62, 62, 0.5),
          0 0 80px rgba(214, 158, 46, 0.3),
          0 20px 40px rgba(0, 0, 0, 0.5)
        `,
      }}
    >
      {/* Inner Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Text with Shadow */}
      <span className="relative z-10 drop-shadow-2xl">
        PLAY NOW
      </span>

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-2xl border-4 border-white/30 group-hover:border-white/60 transition-all duration-300" />

      {/* Shine Effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      </div>

      {/* Pulsing Ring */}
      <div className="absolute inset-0 rounded-2xl animate-glow" />
    </button>
  );
}