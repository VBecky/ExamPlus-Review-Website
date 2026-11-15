interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

const sizeMap = {
  sm: { container: 'w-9 h-9', text: 'text-lg' },
  md: { container: 'w-11 h-11', text: 'text-xl' },
  lg: { container: 'w-16 h-16', text: 'text-3xl' },
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
      <div className={`${s.container} flex items-center justify-center overflow-hidden rounded-xl`}>
        <img
          src="/icon.png"
          alt="ExamPlus"
          className="h-full w-full object-contain"
        />
      </div>

      {showText && (
        <span className={`font-display font-extrabold tracking-tight text-ink-900 ${s.text} ${textClassName}`}>
          Exam<span className="text-brand-600">Plus</span>
        </span>
      )}
    </div>
  );
}
