import { cn } from '@/lib/utils';

export type ProgressColor = 'cyan' | 'coral' | 'purple' | 'green' | 'gold';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ProgressColor;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const colorMap: Record<ProgressColor, { bar: string; glow: string; text: string }> = {
  cyan: {
    bar: 'from-neon-cyan to-neon-cyan-dim',
    glow: 'shadow-[0_0_10px_rgba(0,240,255,0.5)]',
    text: 'text-neon-cyan',
  },
  coral: {
    bar: 'from-coral-orange to-coral-light',
    glow: 'shadow-[0_0_10px_rgba(255,107,107,0.5)]',
    text: 'text-coral-orange',
  },
  purple: {
    bar: 'from-starlight-purple to-starlight-light',
    glow: 'shadow-[0_0_10px_rgba(157,78,221,0.5)]',
    text: 'text-starlight-light',
  },
  green: {
    bar: 'from-aurora-green to-emerald-400',
    glow: 'shadow-[0_0_10px_rgba(0,255,163,0.5)]',
    text: 'text-aurora-green',
  },
  gold: {
    bar: 'from-gold-yellow to-amber-400',
    glow: 'shadow-[0_0_10px_rgba(255,215,0,0.5)]',
    text: 'text-gold-yellow',
  },
};

const sizeMap = {
  sm: { bar: 'h-1.5', text: 'text-xs' },
  md: { bar: 'h-2.5', text: 'text-sm' },
  lg: { bar: 'h-4', text: 'text-base' },
};

export default function ProgressBar({
  value,
  max = 100,
  color = 'cyan',
  showLabel = true,
  label,
  size = 'md',
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const colors = colorMap[color];
  const sizes = sizeMap[size];

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className={cn('font-medium', colors.text)}>
            {label || '进度'}
          </span>
          <span className={cn('font-orbitron font-bold', colors.text, sizes.text)}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          'bg-ocean-light/40 border border-ocean-light/30',
          sizes.bar
        )}
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out',
            colors.bar,
            colors.glow,
            animated && percentage > 0 && 'animate-shimmer',
          )}
          style={{
            width: `${percentage}%`,
            backgroundSize: '200% 100%',
          }}
        />
      </div>
    </div>
  );
}
