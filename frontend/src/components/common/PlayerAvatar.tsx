interface PlayerAvatarProps {
  name: string;
  isHost?: boolean;
  isReady?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-xl',
  lg: 'w-24 h-24 text-3xl',
};

const gradients = [
  'from-uno-red to-pink-600',
  'from-uno-blue to-blue-600',
  'from-uno-green to-emerald-600',
  'from-uno-yellow to-orange-600',
  'from-purple-500 to-pink-600',
  'from-indigo-500 to-purple-600',
];

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getGradientForName(name: string): string {
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

export default function PlayerAvatar({
  name,
  isHost = false,
  isReady = false,
  size = 'md',
  className = '',
}: PlayerAvatarProps) {
  const initials = getInitials(name);
  const gradient = getGradientForName(name);
  const sizeClass = sizeMap[size];

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Avatar Circle */}
      <div
        className={`
          ${sizeClass}
          rounded-full
          bg-gradient-to-br ${gradient}
          flex items-center justify-center
          font-poppins font-bold text-white
          shadow-lg
          ring-4 ring-dark-700
          ${isReady ? 'ring-green-500' : ''}
          transition-all duration-300
        `}
      >
        {initials}
      </div>

      {/* Host Crown Badge */}
      {isHost && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg ring-2 ring-dark-900">
          <span className="text-lg">👑</span>
        </div>
      )}

      {/* Ready Indicator */}
      {isReady && !isHost && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-dark-900 shadow-lg">
          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
        </div>
      )}

      {/* Not Ready Indicator */}
      {!isReady && !isHost && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-500 rounded-full border-2 border-dark-900 shadow-lg" />
      )}
    </div>
  );
}