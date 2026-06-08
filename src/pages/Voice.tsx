import { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Hand, Users } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { cn, getEmoteEmoji } from '@/lib/utils';
import type { EmoteType, Player } from '@/types';

const EMOTES: { type: EmoteType; label: string }[] = [
  { type: 'wave', label: '挥手' },
  { type: 'clap', label: '鼓掌' },
  { type: 'dance', label: '跳舞' },
  { type: 'like', label: '点赞' },
  { type: 'celebrate', label: '庆祝' },
  { type: 'think', label: '思考' },
];

function SpeakingRipple({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/60 animate-ping" />
      <div className="absolute -inset-1 rounded-full border border-neon-cyan/40 animate-pulse" />
      <div className="absolute -inset-3 rounded-full border border-neon-cyan/20 animate-pulse" style={{ animationDelay: '0.3s' }} />
    </>
  );
}

function PlayerAvatar({ player, index, total }: { player: Player; index: number; total: number }) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const radius = 180;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <div
      className="absolute flex flex-col items-center transition-all duration-500"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <div className="relative">
        <SpeakingRipple active={player.isSpeaking && !player.isMuted} />
        <div
          className={cn(
            'relative w-20 h-20 rounded-full flex items-center justify-center text-4xl',
            'bg-gradient-to-br from-ocean-mid to-ocean-dark border-2 backdrop-blur-sm',
            player.isSpeaking && !player.isMuted
              ? 'border-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.5)]'
              : 'border-white/20'
          )}
          style={{ borderColor: player.isSpeaking && !player.isMuted ? undefined : player.color }}
        >
          <span>{player.avatarEmoji}</span>
          {player.isMuted && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-coral-orange rounded-full flex items-center justify-center border-2 border-ocean-dark">
              <MicOff className="w-4 h-4 text-white" />
            </div>
          )}
          {player.isHandRaised && (
            <div className="absolute -top-2 -right-2 w-7 h-7 bg-gold-yellow rounded-full flex items-center justify-center border-2 border-ocean-dark animate-bounce">
              <Hand className="w-4 h-4 text-ocean-dark" />
            </div>
          )}
          {player.currentEmote && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-bounce-in">
              {getEmoteEmoji(player.currentEmote)}
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-white">{player.name}</p>
        <p className="text-xs text-white/60">
          {player.isHost && '🎙️ 主持人'}
        </p>
      </div>
    </div>
  );
}

export default function Voice() {
  const { players, currentPlayer, updatePlayer } = usePlayerStore();
  const { triggerEmote } = useGameStore();
  const [volume, setVolume] = useState(75);
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);

  const handleToggleMute = () => {
    updatePlayer(currentPlayer.id, { isMuted: !currentPlayer.isMuted });
  };

  const handleToggleHandRaise = () => {
    updatePlayer(currentPlayer.id, { isHandRaised: !currentPlayer.isHandRaised });
  };

  const handleEmote = (emote: EmoteType) => {
    triggerEmote(currentPlayer.id, emote);
    updatePlayer(currentPlayer.id, { currentEmote: emote });
    setTimeout(() => {
      updatePlayer(currentPlayer.id, { currentEmote: undefined });
    }, 2000);
  };

  const speakingCount = players.filter(p => p.isSpeaking && !p.isMuted).length;

  return (
    <div className="h-full flex flex-col p-6 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-aurora-green/20 border border-aurora-green/40 flex items-center justify-center">
            <Users className="w-6 h-6 text-aurora-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">语音区</h1>
            <p className="text-sm text-white/60">{players.length} 人在线 · {speakingCount} 人发言中</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-glass border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setIsVolumeMuted(!isVolumeMuted)}
              className="text-white/80 hover:text-white transition-colors"
            >
              {isVolumeMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isVolumeMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (Number(e.target.value) > 0) setIsVolumeMuted(false);
              }}
              className="w-24 h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-neon-cyan"
            />
            <span className="text-sm text-white/80 w-8 text-right">{isVolumeMuted ? 0 : volume}%</span>
          </div>
          <button
            onClick={handleToggleMute}
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center transition-all border-2',
              currentPlayer.isMuted
                ? 'bg-coral-orange border-coral-light text-white'
                : 'bg-aurora-green/20 border-aurora-green/40 text-aurora-green hover:bg-aurora-green/30'
            )}
          >
            {currentPlayer.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <div className="absolute w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute w-[28rem] h-[28rem] rounded-full border border-white/5" />
        <div className="absolute w-[36rem] h-[36rem] rounded-full border border-white/5" />
        <div className="relative">
          {players.map((player, idx) => (
            <PlayerAvatar key={player.id} player={player} index={idx} total={players.length} />
          ))}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-cyan/20 to-starlight-purple/20 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center">
            <span className="text-4xl mb-1">🎙️</span>
            <span className="text-sm text-white/80">语音频道</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleToggleHandRaise}
          className={cn(
            'px-6 py-3 rounded-xl flex items-center gap-2 transition-all border-2',
            currentPlayer.isHandRaised
              ? 'bg-gold-yellow/30 border-gold-yellow text-gold-yellow'
              : 'bg-glass border-white/10 text-white hover:bg-white/10'
          )}
        >
          <Hand className="w-5 h-5" />
          <span>{currentPlayer.isHandRaised ? '放下手' : '举手发言'}</span>
        </button>
        {EMOTES.map((emote) => (
          <button
            key={emote.type}
            onClick={() => handleEmote(emote.type)}
            className="w-16 h-16 rounded-xl bg-glass border border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-white/10 hover:scale-105 transition-all backdrop-blur-md group"
            title={emote.label}
          >
            <span className="text-2xl group-hover:scale-125 transition-transform">{getEmoteEmoji(emote.type)}</span>
            <span className="text-[10px] text-white/60">{emote.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
