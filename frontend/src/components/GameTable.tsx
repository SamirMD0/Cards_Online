import { ReactNode } from 'react';

interface GameTableProps {
  children?: ReactNode;
  className?: string;
}

export default function GameTable({ children, className = '' }: GameTableProps) {
  return (
    <div className={`perspective-2000 ${className}`}>
      <div 
        className="relative w-full max-w-6xl mx-auto preserve-3d"
        style={{
          transform: 'rotateX(15deg)',
        }}
      >
        {/* Table Surface */}
        <div 
          className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-[3rem] p-12 shadow-2xl"
          style={{
            background: 'radial-gradient(ellipse at center, #1a5f3f 0%, #0f4230 100%)',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 2px 10px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Table Texture Overlay */}
          <div 
            className="absolute inset-0 rounded-[3rem] opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, 0.05) 10px,
                rgba(255, 255, 255, 0.05) 20px
              )`,
            }}
          />

          {/* Inner Border Highlight */}
          <div className="absolute inset-4 border-2 border-white/10 rounded-[2.5rem]" />

          {/* Content Area */}
          <div className="relative z-10">
            {children}
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
          <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
          <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
          <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
        </div>

        {/* Table Shadow on Ground */}
        <div 
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-4/5 h-8 bg-black/40 rounded-full blur-2xl"
        />
      </div>
    </div>
  );
}