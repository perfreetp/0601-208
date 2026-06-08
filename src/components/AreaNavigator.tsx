import { cn, getAreaIcon, getAreaName } from '@/lib/utils';
import type { GameArea } from '@/types';

const AREAS: GameArea[] = ['lobby', 'island', 'tasks', 'build', 'voice', 'map', 'replay'];

interface AreaNavigatorProps {
  currentArea: GameArea;
  onAreaChange: (area: GameArea) => void;
  className?: string;
}

export default function AreaNavigator({
  currentArea,
  onAreaChange,
  className,
}: AreaNavigatorProps) {
  return (
    <nav
      className={cn(
        'relative z-20 flex items-center justify-around px-4 py-3',
        'bg-gradient-to-t from-ocean-dark/90 via-ocean-mid/80 to-ocean-mid/60',
        'backdrop-blur-xl border-t border-neon-cyan/20',
        className
      )}
    >
      {AREAS.map((area, index) => {
        const isActive = currentArea === area;

        return (
          <button
            key={area}
            onClick={() => onAreaChange(area)}
            className={cn(
              'relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300',
              'min-w-[70px]',
              isActive
                ? 'bg-neon-cyan/15 scale-105'
                : 'hover:bg-ocean-light/40 hover:scale-102 active:scale-95'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {isActive && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            )}

            <div
              className={cn(
                'relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300',
                isActive
                  ? 'bg-gradient-to-br from-neon-cyan/30 to-neon-cyan/10 border-2 border-neon-cyan/60 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'bg-ocean-light/30 border border-ocean-light/40'
              )}
            >
              <span className={cn(isActive ? 'scale-110' : '', 'transition-transform duration-300')}>
                {getAreaIcon(area)}
              </span>
              {isActive && (
                <div className="absolute inset-0 rounded-xl border border-neon-cyan/30 animate-ping opacity-60" />
              )}
            </div>

            <span
              className={cn(
                'text-xs font-medium transition-all duration-300',
                isActive ? 'text-neon-cyan' : 'text-gray-400 group-hover:text-white'
              )}
            >
              {getAreaName(area)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
