import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, Clock, Users, Sparkles, Star, Target, Award, X, MapPin, RotateCcw, Filter } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { cn, formatDate, formatRelativeTime, getRarityColor, getRarityBg, getRarityText, getAreaName, getAreaIcon } from '@/lib/utils';
import type { Highlight, Rarity, Achievement, EventLog, GameArea } from '@/types';

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

const AREA_ROUTES: Record<GameArea, string> = {
  island: '/island',
  tasks: '/tasks',
  build: '/build',
  voice: '/voice',
  map: '/map',
  replay: '/replay',
  host: '/host',
  lobby: '/lobby',
};

const RARITY_ORDER: Rarity[] = ['legendary', 'epic', 'rare', 'common'];

interface NormalizedEvent {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  playerId?: string;
  playerIds: string[];
  scoreDelta?: number;
  area?: string;
  teamScoreAfter?: number;
  taskId?: string;
  buildingId?: string;
}

function normalizeEvent(event: EventLog | Highlight): NormalizedEvent {
  if ('playerId' in event || 'playerIds' in event) {
    const log = event as EventLog;
    return {
      id: log.id,
      timestamp: log.timestamp,
      type: log.type,
      description: log.description,
      playerId: log.playerId,
      playerIds: log.playerIds || (log.playerId ? [log.playerId] : []),
      scoreDelta: log.scoreDelta,
      area: log.area,
      teamScoreAfter: log.teamScoreAfter,
      taskId: log.taskId,
      buildingId: log.buildingId,
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
        'border backdrop-blur-md',
        active
          ? 'bg-neon-cyan/10 border-l-4 border-l-neon-cyan border-t border-r border-b border-neon-cyan/30 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
          : 'bg-glass border-white/10 hover:bg-white/5'
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

function FilterPanel({
  filterPlayer,
  setFilterPlayer,
  filterArea,
  setFilterArea,
  filterType,
  setFilterType,
  onReset,
}: {
  filterPlayer: string;
  setFilterPlayer: (v: string) => void;
  filterArea: string;
  setFilterArea: (v: string) => void;
  filterType: string;
  setFilterType: (v: string) => void;
  onReset: () => void;
}) {
  const { players } = usePlayerStore();
  const areas: GameArea[] = ['lobby', 'island', 'tasks', 'build', 'voice', 'map', 'replay', 'host'];
  const eventTypes = [
    { value: 'taskComplete', label: '任务完成' },
    { value: 'itemFound', label: '找到物品' },
    { value: 'puzzlePlaced', label: '放置拼图' },
    { value: 'quizAnswered', label: '回答问题' },
    { value: 'voteCast', label: '投票' },
    { value: 'buildingPlaced', label: '放置建筑' },
    { value: 'buildingMoved', label: '建筑移动' },
    { value: 'buildingUndo', label: '建筑撤回' },
    { value: 'hostHint', label: '主持人提示' },
    { value: 'gamePause', label: '暂停' },
    { value: 'gameResume', label: '继续' },
  ];

  return (
    <div className="bg-glass border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/80">
          <Filter className="w-4 h-4" />
          <h3 className="font-semibold text-sm">筛选条件</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          重置
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        <div>
          <label className="text-xs text-white/50 mb-2 block">👤 玩家</label>
          <div className="space-y-1.5">
            <button
              onClick={() => setFilterPlayer('all')}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all text-left',
                filterPlayer === 'all'
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-transparent'
              )}
            >
              全部玩家
            </button>
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => setFilterPlayer(player.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all text-left',
                  filterPlayer === player.id
                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-transparent'
                )}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                  style={{ backgroundColor: `${player.color}30`, border: `1px solid ${player.color}` }}
                >
                  {player.avatarEmoji}
                </div>
                <span className="truncate">{player.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-white/50 mb-2 block">📍 区域</label>
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
          >
            <option value="all">全部区域</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {getAreaName(area)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-white/50 mb-2 block">📋 事件类型</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
          >
            <option value="all">全部事件</option>
            {eventTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function EventDetailPanel({ event }: { event: NormalizedEvent | null }) {
  const navigate = useNavigate();
  const { players } = usePlayerStore();
  const { tasks, buildings } = useGameStore();

  if (!event) {
    return (
      <div className="bg-glass border border-white/10 rounded-2xl p-6 backdrop-blur-md h-full flex items-center justify-center">
        <div className="text-center text-white/40">
          <div className="text-5xl mb-3">👈</div>
          <p className="text-sm">选择一个事件查看详情</p>
        </div>
      </div>
    );
  }

  const relatedPlayers = event.playerIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean);
  const relatedTask = event.taskId ? tasks.find((t) => t.id === event.taskId) : null;
  const relatedBuilding = event.buildingId ? buildings.find((b) => b.id === event.buildingId) : null;
  const scoreBefore = event.teamScoreAfter !== undefined && event.scoreDelta !== undefined
    ? event.teamScoreAfter - event.scoreDelta
    : undefined;

  return (
    <div className="bg-glass border border-white/10 rounded-2xl p-6 backdrop-blur-md h-full flex flex-col gap-5 overflow-y-auto">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-ocean-mid flex items-center justify-center text-5xl border border-white/10">
          {EVENT_ICONS[event.type] || '📌'}
        </div>
        <h3 className="text-xl font-bold text-white mt-4">
          {EVENT_NAMES[event.type] || '事件'}
        </h3>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
          <Sparkles className="w-3 h-3" />
          <span>描述</span>
        </div>
        <p className="text-white text-sm leading-relaxed">{event.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1.5">
            <Clock className="w-3 h-3" />
            <span>时间</span>
          </div>
          <p className="text-white text-sm font-medium">{formatDate(event.timestamp)}</p>
          <p className="text-white/40 text-xs mt-0.5">{formatRelativeTime(event.timestamp)}</p>
        </div>

        {event.area && (
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-1.5">
              <MapPin className="w-3 h-3" />
              <span>发生区域</span>
            </div>
            <p className="text-white text-sm font-medium flex items-center gap-1.5">
              <span>{getAreaIcon(event.area)}</span>
              {getAreaName(event.area)}
            </p>
          </div>
        )}

        <div className="bg-white/5 rounded-xl p-3 border border-white/10 col-span-2">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
            <Users className="w-3 h-3" />
            <span>参与者</span>
          </div>
          {relatedPlayers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {relatedPlayers.map((player) => player && (
                <div
                  key={player.id}
                  className="flex items-center gap-1.5 bg-white/5 rounded-full pl-1 pr-2.5 py-1 border border-white/10"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: `${player.color}30`, border: `1px solid ${player.color}` }}
                  >
                    {player.avatarEmoji}
                  </div>
                  <span className="text-white text-xs">{player.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-xs">无参与者信息</p>
          )}
        </div>

        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1.5">
            <Star className="w-3 h-3" />
            <span>积分变化</span>
          </div>
          {event.scoreDelta !== undefined ? (
            <p className={cn(
              'text-sm font-bold',
              event.scoreDelta >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              {event.scoreDelta >= 0 ? '+' : ''}{event.scoreDelta} 分
            </p>
          ) : (
            <p className="text-white/40 text-sm">无变化</p>
          )}
        </div>

        {scoreBefore !== undefined && (
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-1.5">
              <Trophy className="w-3 h-3" />
              <span>事件前积分</span>
            </div>
            <p className="text-white text-sm font-medium">{scoreBefore}</p>
          </div>
        )}

        {event.teamScoreAfter !== undefined && (
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-1.5">
              <Trophy className="w-3 h-3" />
              <span>事件后积分</span>
            </div>
            <p className="text-gold-yellow text-sm font-bold">{event.teamScoreAfter}</p>
          </div>
        )}
      </div>

      {(relatedTask || relatedBuilding) && (
        <div className="space-y-2">
          {relatedTask && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 text-white/50 text-xs mb-1.5">
                <Target className="w-3 h-3" />
                <span>关联任务</span>
              </div>
              <p className="text-white text-sm font-medium">{relatedTask.title}</p>
            </div>
          )}
          {relatedBuilding && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 text-white/50 text-xs mb-1.5">
                <Play className="w-3 h-3" />
                <span>关联建筑</span>
              </div>
              <p className="text-white text-sm font-medium flex items-center gap-1.5">
                <span>{relatedBuilding.icon}</span>
                {relatedBuilding.name}
              </p>
            </div>
          )}
        </div>
      )}

      {event.area && AREA_ROUTES[event.area as GameArea] && (
        <button
          onClick={() => navigate(AREA_ROUTES[event.area as GameArea])}
          className="mt-auto w-full py-3 rounded-xl bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-medium hover:bg-neon-cyan/30 transition-colors flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          跳转到 {getAreaName(event.area)}
        </button>
      )}
    </div>
  );
}

export default function Replay() {
  const { highlights, achievements, eventLogs } = useGameStore();
  const [filterPlayer, setFilterPlayer] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(null);
  const [showHighlightModal, setShowHighlightModal] = useState<(EventLog | Highlight) | null>(null);

  const allEvents = [
    ...eventLogs,
    ...highlights.filter(h => !eventLogs.some(e => e.id === h.id)),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const normalizedEvents = allEvents.map(normalizeEvent);

  const filteredEvents = useMemo(() => {
    return normalizedEvents.filter(e => {
      if (filterPlayer !== 'all') {
        if (!e.playerIds?.includes(filterPlayer) && e.playerId !== filterPlayer) return false;
      }
      if (filterArea !== 'all' && e.area !== filterArea) return false;
      if (filterType !== 'all' && e.type !== filterType) return false;
      return true;
    });
  }, [normalizedEvents, filterPlayer, filterArea, filterType]);

  const resetFilters = () => {
    setFilterPlayer('all');
    setFilterArea('all');
    setFilterType('all');
  };

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
        <div className="col-span-12 lg:col-span-2 min-h-0">
          <FilterPanel
            filterPlayer={filterPlayer}
            setFilterPlayer={setFilterPlayer}
            filterArea={filterArea}
            setFilterArea={setFilterArea}
            filterType={filterType}
            setFilterType={setFilterType}
            onReset={resetFilters}
          />
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <Target className="w-5 h-5" />
              <h2 className="font-semibold">事件时间线</h2>
            </div>
            <span className="text-xs text-white/40">{filteredEvents.length} 条</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filteredEvents.map((event) => (
              <TimelineItem
                key={event.id}
                event={event}
                active={selectedEvent?.id === event.id}
                onClick={() => setSelectedEvent(event)}
              />
            ))}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12 text-white/40">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-sm">没有匹配的事件</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 min-h-0">
          <EventDetailPanel event={selectedEvent} />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-white/80 mb-4">
            <Play className="w-5 h-5" />
            <h2 className="font-semibold">精彩瞬间</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {highlights.slice(0, 6).map((highlight) => (
              <HighlightCard
                key={highlight.id}
                highlight={highlight}
                onClick={() => setShowHighlightModal(highlight)}
              />
            ))}
          </div>
        </div>

        <div>
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

      {showHighlightModal && (
        <HighlightModal
          event={showHighlightModal}
          onClose={() => setShowHighlightModal(null)}
        />
      )}
    </div>
  );
}
