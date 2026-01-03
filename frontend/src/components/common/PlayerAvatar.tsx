import { cn } from "../../lib/utils";

interface PlayerAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

const avatarColors = [
  'from-red-400 to-red-600',
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-yellow-400 to-yellow-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-cyan-400 to-cyan-600',
  'from-orange-400 to-orange-600',
];

function getColorFromName(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

export default function PlayerAvatar({ name, size = 'md', className }: PlayerAvatarProps) {
  const initials = name.slice(0, 2).toUpperCase();
  const colorClass = getColorFromName(name);

  return (
    <div
      className={cn(
        sizeStyles[size],
        'rounded-full flex items-center justify-center font-bold text-white shadow-lg',
        `bg-gradient-to-br ${colorClass}`,
        'border-2 border-white/30',
        className
      )}
    >
      {initials}
    </div>
  );
}
