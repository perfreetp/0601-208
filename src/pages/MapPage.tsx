import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, MapPin } from 'lucide-react';
import { AREAS, MOCK_BUILDINGS } from '@/data/mockData';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import {
  cn,
  getAreaIcon,
  getAreaName,
  getDifficultyStars,
  getTaskTypeIcon,
  getTaskTypeName,
  formatRelativeTime,
} from '@/lib/utils';
import type { AreaInfo, BuildingItem, GameArea, TaskStatus } from '@/types';

const statusColors: Record<TaskStatus, string> = {
  locked: 'bg-gray-500/30 text-gray-400 border-gray-500/30',
  available: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40',
  inProgress: 'bg-gold-yellow/20 text-gold-yellow border-gold-yellow/40',
  completed: 'bg-aurora-green/20 text-aurora-green border-aurora-green/40',
};

const statusText: Record<TaskStatus, string> = {
  locked: '未解锁',
  available: '可挑战',
  inProgress: '进行中',
  completed: '已完成',
};

const AREA_ROUTES: Record<GameArea, string> = {
  lobby: '/lobby',
  tasks: '/tasks',
  build: '/build',
  voice: '/voice',
  map: '/map',
  replay: '/replay',
  host: '/host',
  island: '/island',
};

export default function MapPage() {
  const { tasks, completedTasks, teamScore, setCurrentArea, buildings } = useGameStore();
  const { players, currentPlayer } = usePlayerStore();
  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState<GameArea | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingItem | null>(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes player-pulse {
        0%, 100% { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
        50% { box-shadow: 0 0 0 12px transparent; opacity: 0.7; }
      }
      @keyframes player-bounce {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.15); }
      }
      .player-pulse {
        animation: player-pulse 1.8s ease-out infinite;
      }
      .player-bounce {
        animation: player-bounce 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const overallProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  }, [tasks, completedTasks]);

  const rankedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  const handleTeleport = (area: AreaInfo) => {
    setCurrentArea(area.id);
    navigate(AREA_ROUTES[area.id]);
  };

  const placedBuildings = buildings.filter((b) => b.placed);

  return (
    <div className="relative w-full min-h-screen bg-deep-ocean p-4 md:p-6">
      <div className="absolute inset-0 bg-stars opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-aurora animate-aurora opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="glass-panel px-6 py-3 flex items-center gap-3">
              <span className="text-3xl">🗺️</span>
              <div>
                <h1 className="title-font text-2xl text-gradient">地图中心</h1>
                <p className="text-sm text-white/60">掌握全局态势，快速传送各区域</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass-panel px-5 py-2 text-center">
              <p className="text-xs text-white/50">团队积分</p>
              <p className="title-font text-xl text-glow">{teamScore}</p>
            </div>
            <div className="glass-panel px-5 py-2 text-center">
              <p className="text-xs text-white/50">任务完成</p>
              <p className="title-font text-xl text-aurora-green">
                {completedTasks.length}/{tasks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass-panel p-5 h-full">
              <h2 className="section-title mb-4">
                <span className="text-xl">🏝️</span>
                岛屿俯视图
              </h2>

              <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                <svg viewBox="0 0 600 450" className="w-full h-full">
                  <defs>
                    <radialGradient id="mapIslandGradient" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#1e4a2e" stopOpacity="0.8" />
                      <stop offset="60%" stopColor="#0d3320" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#061a10" stopOpacity="1" />
                    </radialGradient>
                    <radialGradient id="mapWaterGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#142A45" />
                      <stop offset="100%" stopColor="#0A1628" />
                    </radialGradient>
                  </defs>

                  <rect width="600" height="450" fill="url(#mapWaterGradient)" rx="12" />

                  <path
                    d="M100 300 Q85 265 100 220 Q120 175 165 155 Q195 120 260 110 Q305 85 365 105 Q425 95 470 145 Q525 175 515 235 Q525 290 485 325 Q450 360 375 360 Q300 378 230 360 Q155 360 100 300 Z"
                    fill="url(#mapIslandGradient)"
                    stroke="#00F0FF"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />

                  {AREAS.map((area) => (
                    <g key={area.id}>
                      <circle
                        cx={(area.position.x / 100) * 600}
                        cy={(area.position.y / 100) * 450}
                        r="8"
                        fill={area.color}
                        fillOpacity="0.2"
                        stroke={area.color}
                        strokeWidth="2"
                      />
                      <text
                        x={(area.position.x / 100) * 600}
                        y={(area.position.y / 100) * 450 + 22}
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        opacity="0.7"
                      >
                        {area.name}
                      </text>
                    </g>
                  ))}

                  {placedBuildings.map((b) =>
                    b.position ? (
                      <g
                        key={b.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedBuilding(b)}
                      >
                        <circle
                          cx={(b.position.x / 100) * 600}
                          cy={(b.position.y / 100) * 450}
                          r="16"
                          fill="white"
                          fillOpacity="0.1"
                          stroke="white"
                          strokeOpacity="0.2"
                        />
                        <text
                          x={(b.position.x / 100) * 600}
                          y={(b.position.y / 100) * 450}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="18"
                        >
                          {b.icon}
                        </text>
                      </g>
                    ) : null
                  )}
                </svg>

                {players.map((player) => (
                  <div
                    key={player.id}
                    className="absolute player-bounce"
                    style={{
                      left: `${player.position.x}%`,
                      top: `${player.position.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: player.id === currentPlayer.id ? 20 : 10,
                    }}
                  >
                    <div
                      className="relative w-10 h-10 rounded-full flex items-center justify-center border-3 player-pulse"
                      style={{
                        backgroundColor: player.color,
                        borderColor: player.color,
                        color: player.color,
                        boxShadow: `0 0 15px ${player.color}80`,
                      }}
                    >
                      <span className="text-lg drop-shadow-md">{player.avatarEmoji}</span>
                      {player.isSpeaking && (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-aurora-green rounded-full animate-pulse border-2 border-deep-ocean" />
                      )}
                      {player.id === currentPlayer.id && (
                        <span className="absolute -top-1 -left-1 text-xs">👑</span>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full glass-panel"
                        style={{ color: player.color }}
                      >
                        {player.name}
                      </span>
                    </div>
                  </div>
                ))}

                {selectedArea && (
                  <div
                    className="absolute glass-panel px-3 py-2 text-xs pointer-events-none"
                    style={{
                      left: `${AREAS.find((a) => a.id === selectedArea)?.position.x}%`,
                      top: `${AREAS.find((a) => a.id === selectedArea)?.position.y}%`,
                      transform: 'translate(-50%, -120%)',
                    }}
                  >
                    {getAreaName(selectedArea)}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-neon-cyan" />
                  <span>区域节点</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-gold-yellow animate-pulse" />
                  <span>队友位置</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🌸</span>
                  <span>已放置建筑</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-5">
              <h2 className="section-title mb-4">
                <span className="text-xl">📊</span>
                任务进度
              </h2>

              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/70">总体完成度</span>
                  <span className="title-font text-lg text-glow">{overallProgress}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-starlight-light to-aurora-green transition-all duration-700"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <p className="text-xs text-white/50 mt-1">
                  已完成 {completedTasks.length} / {tasks.length} 个任务
                </p>
              </div>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'p-3 rounded-xl border transition-all',
                      statusColors[task.status],
                      'hover:scale-[1.02]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <span className="text-lg flex-shrink-0">{getTaskTypeIcon(task.type)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs opacity-70 mt-0.5">
                            {getTaskTypeName(task.type)} · {getDifficultyStars(task.difficulty)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                          {statusText[task.status]}
                        </p>
                        <p className="text-xs mt-1 opacity-70">+{task.points}分</p>
                      </div>
                    </div>
                    {task.progress !== undefined && task.status === 'inProgress' && (
                      <div className="mt-2">
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-current"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-5">
              <h2 className="section-title mb-4">
                <span className="text-xl">🏆</span>
                贡献榜
              </h2>

              <div className="space-y-2">
                {rankedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-xl transition-all',
                      player.id === currentPlayer.id
                        ? 'bg-neon-cyan/15 border border-neon-cyan/30'
                        : 'hover:bg-white/5'
                    )}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center title-font text-sm flex-shrink-0',
                        index === 0 && 'bg-gold-yellow/30 text-gold-yellow',
                        index === 1 && 'bg-white/20 text-white/90',
                        index === 2 && 'bg-coral-orange/30 text-coral-orange',
                        index > 2 && 'bg-white/10 text-white/60'
                      )}
                    >
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.avatarEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {player.name}
                        {player.isHost && <span className="ml-1 text-xs">👑</span>}
                      </p>
                      <p className="text-xs text-white/50">
                        {getAreaIcon(player.currentArea)} {getAreaName(player.currentArea)}
                      </p>
                    </div>
                    <p className="title-font text-lg text-glow flex-shrink-0">{player.score}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 glass-panel p-5">
          <h2 className="section-title mb-4">
            <span className="text-xl">⚡</span>
            快速传送
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {AREAS.map((area) => (
              <button
                key={area.id}
                onClick={() => handleTeleport(area)}
                onMouseEnter={() => setSelectedArea(area.id)}
                onMouseLeave={() => setSelectedArea(null)}
                className={cn(
                  'glass-panel-hover p-4 flex flex-col items-center gap-2 text-center group',
                  'transition-all duration-300 hover:-translate-y-1'
                )}
                style={{
                  borderColor: selectedArea === area.id ? `${area.color}60` : undefined,
                  boxShadow:
                    selectedArea === area.id ? `0 0 25px ${area.color}30` : undefined,
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all group-hover:scale-110"
                  style={{
                    backgroundColor: `${area.color}22`,
                    border: `2px solid ${area.color}66`,
                    boxShadow: `0 0 15px ${area.color}40`,
                  }}
                >
                  {area.icon}
                </div>
                <p className="text-sm font-medium" style={{ color: area.color }}>
                  {area.name}
                </p>
                <p className="text-xs text-white/50 line-clamp-2 leading-tight">
                  {area.description}
                </p>
                <span className="text-xs text-neon-cyan/80 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  点击传送 →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedBuilding && (() => {
        const placer = selectedBuilding.placedBy ? players.find(p => p.id === selectedBuilding.placedBy) : null;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedBuilding(null)}
          >
            <div
              className="glass-panel w-full max-w-md p-6 m-4 animate-bounce-in"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center text-3xl">
                    {selectedBuilding.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="title-font text-lg text-white">{selectedBuilding.name}</h3>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        selectedBuilding.category === 'decoration' && 'bg-neon-cyan/20 text-neon-cyan',
                        selectedBuilding.category === 'landmark' && 'bg-gold-yellow/20 text-gold-yellow',
                        selectedBuilding.category === 'functional' && 'bg-starlight-light/20 text-starlight-light'
                      )}>
                        {selectedBuilding.category === 'decoration' ? '🎨 装饰物' : selectedBuilding.category === 'landmark' ? '🏛️ 地标' : '⚙️ 功能设施'}
                      </span>
                    </div>
                    {selectedBuilding.confirmed ? (
                      <span className="text-xs text-aurora-green">✓ 已确认</span>
                    ) : selectedBuilding.placed ? (
                      <span className="text-xs text-gold-yellow">● 待确认</span>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBuilding(null)}
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-white/70 mb-4">{selectedBuilding.description}</p>

              {selectedBuilding.position && (
                <div className="flex items-center gap-2 text-sm text-white/80 mb-3">
                  <MapPin size={16} className="text-neon-cyan flex-shrink-0" />
                  <span>位置：{selectedBuilding.position.x.toFixed(1)}%, {selectedBuilding.position.y.toFixed(1)}%</span>
                </div>
              )}

              {selectedBuilding.placedBy && selectedBuilding.placedAt && (
                <div className="glass-panel p-3 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: placer?.color || '#666' }}
                  >
                    {placer?.avatarEmoji || <User size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm text-white/90">
                      <User size={14} />
                      <span>由 {placer?.name || '未知玩家'} 放置</span>
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">
                      放置于 {formatRelativeTime(selectedBuilding.placedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
