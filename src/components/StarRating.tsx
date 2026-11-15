import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
  hoverValue?: number;
  onHover?: (value: number) => void;
}

const sizeMap = {
  sm: 16,
  md: 22,
  lg: 34,
};

export default function StarRating({
  value,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  hoverValue,
  onHover,
}: StarRatingProps) {
  const px = sizeMap[size];
  const displayValue = hoverValue ?? value;

  return (
    <div
      className={`flex items-center gap-0.5 ${interactive ? 'cursor-pointer' : ''}`}
      onMouseLeave={() => interactive && onHover?.(0)}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayValue;
        const isHalf = !isFilled && starValue - 0.5 <= displayValue;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            onMouseEnter={() => interactive && onHover?.(starValue)}
            className={`relative ${interactive ? 'transition-transform hover:scale-110 active:scale-95' : ''} ${!interactive ? 'cursor-default' : ''}`}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            aria-pressed={value === starValue}
          >
            <Star
              size={px}
              className={
                isFilled
                  ? 'fill-accent-400 text-accent-400'
                  : isHalf
                    ? 'fill-accent-400/50 text-accent-400/50'
                    : 'fill-ink-200 text-ink-200'
              }
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
