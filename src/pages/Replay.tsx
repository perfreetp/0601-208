import { useState } from 'react';
import { Play, Trophy, Clock, Users, Sparkles, Star, Target, Award, X, MapPin } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { cn, formatDate, formatRelativeTime, getRarityColor, getRarityBg, getRarityText, getAreaName } from '@/lib/utils';
import type { Highlight, Rarity, Achievement, EventLog } from '@/types';

const EVENT_ICONS: Record<string, string> = {
  taskStart: '🚀',
  taskComplete: '🎯',
  itemFound: '💎',
  puzzlePlaced: '🧩',
  quizAnswered: '❓',
  voteCast: '🗳️',
  buildingPlaced: '🏗️',
  buildingMoved: '🔄',
  buildingUndo: '↩️',
  hostHint: '💡',
  gamePause: '⏸️',
  gameResume: '▶️',
  achievement: '🏆',
  teamWork: '🤝',
  funnyMoment: '🕺',
};

const EVENT_NAMES: Record<string, string> = {
  taskStart: '任务开始',
  taskComplete: '任务完成',
  itemFound: '找到宝物',
  puzzlePlaced: '放置拼图',
  quizAnswered: '回答问答',
  voteCast: '投票决策',
  buildingPlaced: '放置建筑',
  buildingMoved: '移动建筑',
  buildingUndo: '撤回建筑',
  hostHint: '主持人提示',
  gamePause: '游戏暂停',
  gameResume: '游戏继续',
  achievement: '解锁成就',
  teamWork: '团队协作',
  funnyMoment: '欢乐时刻',
};

const RARITY_ORDER: Rarity[] = ['legendary', 'epic', 'rare', 'common'];

interface NormalizedEvent {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  playerIds: string[];
  scoreDelta?: number;
  area?: string;
  teamScoreAfter?: number;
}

function normalizeEvent(event: EventLog | Highlight): NormalizedEvent {
  if ('playerId' in event || 'playerIds' in event) {
    const log = event as EventLog;
    return {
      id: log.id,
      timestamp: log.timestamp,
      type: log.type,
      description: log.description,
      playerIds: log.playerIds || (log.playerId ? [log.playerId] : []),
      scoreDelta: log.scoreDelta,
      area: log.area,
      teamScoreAfter: log.teamScoreAfter,
    };
  }
  const h = event as Highlight;
  return {
    id: h.id,
    timestamp: h.timestamp,
    type: h.type,
    description: h.description,
    playerIds: h.playerIds,
    scoreDelta: h.scoreDelta ?? h.points,
    area: h.area,
    teamScoreAfter: h.teamScoreAfter,
  };
}

function TimelineItem({ event, active, onClick }: { event: NormalizedEvent; active: boolean; onClick: () => void }) {
  const { players } = usePlayerStore();
  const playerNames = event.playerIds
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
        {EVENT_ICONS[event.type] || '📌'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm line-clamp-1">{event.description}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          <span className="text-xs text-white/50 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(event.timestamp)}
          </span>
          {playerNames && (
            <span className="text-xs text-white/50 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {playerNames}
            </span>
          )}
          {event.area && (
            <span className="text-xs text-white/50 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {getAreaName(event.area)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span />
          <div className="flex items-center gap-3">
            {event.teamScoreAfter !== undefined && (
              <span className="text-xs text-white/40">当时积分：{event.teamScoreAfter}</span>
            )}
            {event.scoreDelta !== undefined && (
              <span className={cn(
                'text-xs font-medium flex items-center gap-1',
                event.scoreDelta >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                <Star className="w-3 h-3" />
                {event.scoreDelta >= 0 ? '+' : ''}{event.scoreDelta} 分
              </span>
            )}
          </div>
        </div>
      </div>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-cyan rounded-r-full" />
      )}
    </button>
  );
}

function HighlightCard({ highlight, onClick }: { highlight: Highlight; onClick: () => void }) {
  const { players } = usePlayerStore();
  const normalized = normalizeEvent(highlight);
  const playerNames = normalized.playerIds
    .map(id => players.find(p => p.id === id)?.name)
    .filter(Boolean)
    .join('、');

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-glass border border-white/10 backdrop-blur-md hover:border-white/20 transition-all text-left w-full"
    >
      <div className="aspect-video bg-gradient-to-br from-ocean-mid to-ocean-dark flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-starlight-purple/5" />
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {EVENT_ICONS[normalized.type] || '📌'}
        </span>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-white font-medium text-sm line-clamp-2">{normalized.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-white/50">{formatDate(normalized.timestamp)}</span>
          {normalized.scoreDelta !== undefined && (
            <span className={cn(
              'text-xs font-medium',
              normalized.scoreDelta >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              {normalized.scoreDelta >= 0 ? '+' : ''}{normalized.scoreDelta} 分
            </span>
          )}
        </div>
        {playerNames && (
          <p className="text-xs text-white/40 mt-1">参与者：{playerNames}</p>
        )}
      </div>
    </button>
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

function HighlightModal({ event, onClose }: { event: EventLog | Highlight; onClose: () => void }) {
  const { players } = usePlayerStore();
  const normalized = normalizeEvent(event);
  const relatedPlayers = normalized.playerIds
    .map(id => players.find(p => p.id === id))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-glass border border-white/20 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="bg-gradient-to-br from-ocean-mid via-ocean-dark to-ocean-mid p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 via-transparent to-starlight-purple/10" />
          <span className="text-7xl relative z-10 block">
            {EVENT_ICONS[normalized.type] || '📌'}
          </span>
          <h3 className="text-xl font-bold text-white mt-4 relative z-10">
            {EVENT_NAMES[normalized.type] || '事件'}
          </h3>
        </div>

        <div className="p-6">
          <p className="text-white font-medium text-base leading-relaxed">{normalized.description}</p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                <Clock className="w-3 h-3" />
                <span>时间</span>
              </div>
              <p className="text-white text-sm font-medium">{formatDate(normalized.timestamp)}</p>
            </div>

            {normalized.area && (
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>区域</span>
                </div>
                <p className="text-white text-sm font-medium">{getAreaName(normalized.area)}</p>
              </div>
            )}

            {normalized.scoreDelta !== undefined && (
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <Star className="w-3 h-3" />
                  <span>积分变化</span>
                </div>
                <p className={cn(
                  'text-sm font-bold',
                  normalized.scoreDelta >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {normalized.scoreDelta >= 0 ? '+' : ''}{normalized.scoreDelta} 分
                </p>
              </div>
            )}

            {normalized.teamScoreAfter !== undefined && (
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                  <Trophy className="w-3 h-3" />
                  <span>事件后团队积分</span>
                </div>
                <p className="text-gold-yellow text-sm font-bold">{normalized.teamScoreAfter}</p>
              </div>
            )}
          </div>

          {relatedPlayers.length > 0 && (
            <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
                <Users className="w-3 h-3" />
                <span>参与者</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {relatedPlayers.map((player) => player && (
                  <div key={player.id} className="flex items-center gap-2 bg-white/5 rounded-full pl-1 pr-3 py-1 border border-white/10">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2"
                      style={{ backgroundColor: `${player.color}30`, borderColor: player.color }}
                    >
                      {player.avatarEmoji}
                    </div>
                    <span className="text-white text-xs font-medium">{player.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-xl bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-medium hover:bg-neon-cyan/30 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Replay() {
  const { highlights, achievements, eventLogs } = useGameStore();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showHighlightModal, setShowHighlightModal] = useState<(EventLog | Highlight) | null>(null);

  const allEvents = [
    ...eventLogs,
    ...highlights.filter(h => !eventLogs.some(e => e.id === h.id)),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const normalizedEvents = allEvents.map(normalizeEvent);

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
            <p className="text-sm text-white/60">{allEvents.length} 个事件 · {highlights.length} 个高光时刻 · {unlockedCount}/{achievements.length} 成就已解锁</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-4 flex flex-col gap-4 min-h-0">
          <div className="flex items-center gap-2 text-white/80">
            <Target className="w-5 h-5" />
            <h2 className="font-semibold">事件时间线</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {normalizedEvents.map((event) => (
              <TimelineItem
                key={event.id}
                event={event}
                active={selectedEventId === event.id}
                onClick={() => setSelectedEventId(event.id)}
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
                <HighlightCard
                  key={highlight.id}
                  highlight={highlight}
                  onClick={() => setShowHighlightModal(highlight)}
                />
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

      {showHighlightModal && (
        <HighlightModal
          event={showHighlightModal}
          onClose={() => setShowHighlightModal(null)}
        />
      )}
    </div>
  );
}
