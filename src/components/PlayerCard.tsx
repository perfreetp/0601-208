import { Crown, Mic, MicOff, Hand, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
  isCurrentUser?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function PlayerCard({
  player,
  isCurrentUser = false,
  onClick,
  className,
}: PlayerCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative group p-3 rounded-2xl cursor-pointer transition-all duration-300',
        'bg-glass backdrop-blur-md border',
        isCurrentUser
          ? 'border-neon-cyan/60 shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]'
          : 'border-ocean-light/50 hover:border-neon-cyan/40',
        className
      )}
    >
      {player.isHost && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-yellow to-coral-orange flex items-center justify-center shadow-lg">
            <Crown className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all duration-300',
              'bg-gradient-to-br from-ocean-light to-ocean-mid border-2',
              player.isSpeaking
                ? 'border-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.6)] scale-105'
                : isCurrentUser
                ? 'border-neon-cyan/60'
                : 'border-ocean-light'
            )}
            style={{ backgroundColor: player.color + '30' }}
          >
            {player.avatarEmoji}
          </div>
          {player.isSpeaking && (
            <div className="absolute -inset-1 rounded-xl border-2 border-neon-cyan/40 animate-ping" />
          )}

          <div className="absolute -bottom-1 -right-1 flex gap-0.5">
            {player.isMuted ? (
              <div className="w-5 h-5 rounded-full bg-coral-orange/90 flex items-center justify-center backdrop-blur-sm">
                <MicOff className="w-3 h-3 text-white" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-aurora-green/90 flex items-center justify-center backdrop-blur-sm">
                <Mic className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              'font-medium truncate',
              isCurrentUser ? 'text-neon-cyan' : 'text-white'
            )}>
              {player.name}
            </p>
            {isCurrentUser && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40">
                你
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <Star className="w-3.5 h-3.5 text-coral-orange fill-coral-orange" />
            <span className="text-sm font-orbitron font-bold text-coral-orange">
              {player.score}
            </span>
          </div>
        </div>
      </div>

      {player.isHandRaised && (
        <div className="absolute -top-2 -left-2 z-10 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-aurora-green flex items-center justify-center shadow-lg animate-pulse-glow">
            <Hand className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
