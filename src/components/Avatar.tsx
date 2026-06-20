import { useUIPreferences } from '../contexts/UIPreferencesContext';
import Icon from './Icon';

interface AvatarProps {
  /** URL to load an image from */
  src?: string;
  /** Fallback initials when no image is provided */
  initials?: string;
  /** Tailwind gradient classes e.g. "from-summer-sky to-vibrant-pink" */
  gradient?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-32 h-32 text-2xl',
};

export default function Avatar({
  src,
  initials,
  gradient = 'from-summer-sky to-vibrant-pink',
  alt = 'Avatar',
  size = 'lg',
  className = '',
}: AvatarProps) {
  const { showAvatars } = useUIPreferences();
  const sizeClass = sizeMap[size];

  if (!showAvatars) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-slate-200 flex items-center justify-center text-slate-400 shrink-0 ${className}`}
      >
        <Icon name="person" fill className="text-[60%]" />
      </div>
    );
  }

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-sm shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
