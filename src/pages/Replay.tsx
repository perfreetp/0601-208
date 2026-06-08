import { useState } from 'react';
import { Play, Trophy, Clock, Users, Sparkles, Star, Target, Award } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { cn, formatDate, getRarityColor, getRarityBg, getRarityText } from '@/lib/utils';
import type { Highlight, Rarity, Achievement } from '@/types';

const HIGHLIGHT_ICONS: Record<string, string> = {
  taskComplete: '🎯',
  achievement: '🏆',
  teamWork: '🤝',
  funnyMoment: '🕺',
};

const RARITY_ORDER: Rarity[] = ['legendary', 'epic', 'rare', 'common'];

function TimelineItem({ highlight, active, onClick }: { highlight: Highlight; active: boolean; onClick: () => void }) {
  const { players } = usePlayerStore();
  const playerNames = highlight.playerIds
    .map(id => players.find(p => p.id === id)?.name)
    .filter(Boolean)
    .join('、');

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-start gap-4 p-4 rounded-xl transition-all text-left w-full',
        'bg-glass border backdrop-blur-md',
        active
          ? 'border-neon-cyan/50 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
          : 'border-white/10 hover:bg-white/5'
      )}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-ocean-mid flex items-center justify-center text-2xl border border-white/10">
        {HIGHLIGHT_ICONS[highlight.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm line-clamp-1">{highlight.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-white/50 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(highlight.timestamp)}
          </span>
          {playerNames && (
            <span className="text-xs text-white/50 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {playerNames}
            </span>
          )}
          {highlight.points && (
            <span className="text-xs text-gold-yellow flex items-center gap-1">
              <Star className="w-3 h-3" />
              +{highlight.points}
            </span>
          )}
        </div>
      </div>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-cyan rounded-r-full" />
      )}
    </button>
  );
}

function HighlightCard({ highlight }: { highlight: Highlight }) {
  const { players } = usePlayerStore();
  const playerNames = highlight.playerIds
    .map(id => players.find(p => p.id === id)?.name)
    .filter(Boolean)
    .join('、');

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-glass border border-white/10 backdrop-blur-md hover:border-white/20 transition-all">
      <div className="aspect-video bg-gradient-to-br from-ocean-mid to-ocean-dark flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-starlight-purple/5" />
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {HIGHLIGHT_ICONS[highlight.type]}
        </span>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-white font-medium text-sm line-clamp-2">{highlight.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-white/50">{formatDate(highlight.timestamp)}</span>
          {highlight.points && (
            <span className="text-xs text-gold-yellow font-medium">+{highlight.points} 分</span>
          )}
        </div>
        {playerNames && (
          <p className="text-xs text-white/40 mt-1">参与者：{playerNames}</p>
        )}
      </div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const progress = achievement.target
    ? Math.min(((achievement.progress || 0) / achievement.target) * 100, 100)
    : achievement.unlocked
    ? 100
    : 0;

  return (
    <div
      className={cn(
        'relative p-4 rounded-xl border backdrop-blur-md transition-all hover:scale-[1.02]',
        getRarityBg(achievement.rarity),
        getRarityColor(achievement.rarity),
        achievement.unlocked ? 'opacity-100' : 'opacity-70'
      )}
      style={{ borderWidth: '1px' }}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl border',
            getRarityBg(achievement.rarity),
            getRarityColor(achievement.rarity)
          )}
        >
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-white text-sm">{achievement.name}</h4>
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full border', getRarityColor(achievement.rarity))}>
              {getRarityText(achievement.rarity)}
            </span>
          </div>
          <p className="text-xs text-white/60 mt-1 line-clamp-1">{achievement.description}</p>
          {achievement.target && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/50">进度</span>
                <span className="text-white/80">{achievement.progress || 0}/{achievement.target}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    achievement.rarity === 'legendary' && 'bg-gold-yellow',
                    achievement.rarity === 'epic' && 'bg-starlight-light',
                    achievement.rarity === 'rare' && 'bg-neon-cyan',
                    achievement.rarity === 'common' && 'bg-white/60'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        {achievement.unlocked && (
          <div className="absolute top-2 right-2">
            <Trophy className="w-4 h-4 text-gold-yellow" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Replay() {
  const { highlights, achievements } = useGameStore();
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(highlights[0]?.id || null);

  const achievementsByRarity = RARITY_ORDER.map(rarity => ({
    rarity,
    items: achievements.filter(a => a.rarity === rarity),
  })).filter(group => group.items.length > 0);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="h-full flex flex-col p-6 gap-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-coral-orange/20 border border-coral-orange/40 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-coral-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">回放区</h1>
            <p className="text-sm text-white/60">{highlights.length} 个高光时刻 · {unlockedCount}/{achievements.length} 成就已解锁</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-4 flex flex-col gap-4 min-h-0">
          <div className="flex items-center gap-2 text-white/80">
            <Target className="w-5 h-5" />
            <h2 className="font-semibold">高光时间轴</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {highlights.map((highlight) => (
              <TimelineItem
                key={highlight.id}
                highlight={highlight}
                active={activeHighlightId === highlight.id}
                onClick={() => setActiveHighlightId(highlight.id)}
              />
            ))}
          </div>
        </div>

        <div className="col-span-8 flex flex-col gap-6 min-h-0">
          <div>
            <div className="flex items-center gap-2 text-white/80 mb-4">
              <Play className="w-5 h-5" />
              <h2 className="font-semibold">精彩瞬间</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {highlights.slice(0, 6).map((highlight) => (
                <HighlightCard key={highlight.id} highlight={highlight} />
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-2">
            <div className="flex items-center gap-2 text-white/80 mb-4">
              <Award className="w-5 h-5" />
              <h2 className="font-semibold">成就墙</h2>
            </div>
            <div className="space-y-6">
              {achievementsByRarity.map(({ rarity, items }) => (
                <div key={rarity}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn('text-sm font-medium', getRarityColor(rarity))}>
                      {getRarityText(rarity)}
                    </span>
                    <span className="text-xs text-white/40">
                      {items.filter(i => i.unlocked).length}/{items.length} 已解锁
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {items.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
