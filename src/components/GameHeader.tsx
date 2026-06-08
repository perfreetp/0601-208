import { Trophy, Clock, Menu, User } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import type { Player } from '@/types';

interface GameHeaderProps {
  logo?: string;
  teamScore: number;
  gameTime: number;
  currentPlayer?: Player;
  onMenuClick?: () => void;
  className?: string;
}

export default function GameHeader({
  logo = '🎮',
  teamScore,
  gameTime,
  currentPlayer,
  onMenuClick,
  className,
}: GameHeaderProps) {
  return (
    <header
      className={cn(
        'relative z-20 flex items-center justify-between px-6 py-3',
        'bg-gradient-to-r from-ocean-dark/80 via-ocean-mid/70 to-ocean-dark/80',
        'backdrop-blur-xl border-b border-neon-cyan/20',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl animate-float">{logo}</div>
        <div>
          <h1 className="font-orbitron text-lg font-bold text-neon-cyan tracking-wider">
            METAVERSE
          </h1>
          <p className="text-xs text-gray-400">元宇宙派对</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-glass backdrop-blur-md border border-coral-orange/30">
          <Trophy className="w-5 h-5 text-coral-orange" />
          <span className="font-orbitron text-lg font-bold text-coral-orange">
            {teamScore.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400 ml-1">团队积分</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-glass backdrop-blur-md border border-neon-cyan/30">
          <Clock className="w-5 h-5 text-neon-cyan animate-pulse" />
          <span className="font-orbitron text-lg font-bold text-neon-cyan">
            {formatTime(gameTime)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {currentPlayer ? (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{currentPlayer.name}</p>
              <p className="text-xs text-gray-400">#{currentPlayer.id.slice(-4)}</p>
            </div>
            <div
              className={cn(
                'relative w-11 h-11 rounded-full flex items-center justify-center text-2xl',
                'bg-gradient-to-br from-ocean-light to-ocean-mid',
                'border-2 transition-all duration-300',
                currentPlayer.isSpeaking
                  ? 'border-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                  : 'border-neon-cyan/40'
              )}
            >
              {currentPlayer.avatarEmoji}
              {currentPlayer.isSpeaking && (
                <div className="absolute -inset-1 rounded-full border-2 border-neon-cyan/50 animate-ping" />
              )}
            </div>
          </div>
        ) : (
          <div className="w-11 h-11 rounded-full bg-ocean-light flex items-center justify-center border border-neon-cyan/30">
            <User className="w-5 h-5 text-gray-400" />
          </div>
        )}

        <button
          onClick={onMenuClick}
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center',
            'bg-glass backdrop-blur-md border border-neon-cyan/30',
            'hover:border-neon-cyan/60 hover:bg-ocean-light/50 transition-all duration-300',
            'active:scale-95'
          )}
        >
          <Menu className="w-5 h-5 text-neon-cyan" />
        </button>
      </div>
    </header>
  );
}
