import { GraduationCap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

const sizeMap = {
  sm: { icon: 20, container: 'w-9 h-9', text: 'text-lg' },
  md: { icon: 26, container: 'w-11 h-11', text: 'text-xl' },
  lg: { icon: 36, container: 'w-16 h-16', text: 'text-3xl' },
};

export default function Logo({
  size = 'md',
  showText = true,
  className = '',
  textClassName = '',
}: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${s.container} flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/25 ring-1 ring-brand-400/30`}
      >
        <GraduationCap size={s.icon} className="text-white" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className={`font-display font-extrabold tracking-tight text-ink-900 ${s.text} ${textClassName}`}>
          Exam<span className="text-brand-600">Plus</span>
        </span>
      )}
    </div>
  );
}
