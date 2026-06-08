import { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Timer,
  Users,
  Crown,
  Trophy,
  Download,
  BarChart3,
  Settings2,
  ChevronRight,
  Star,
  Target,
  CheckCircle2,
  Circle,
  MessageSquare,
  GripVertical,
  Edit3,
  Check,
  X,
  Plus,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { cn, formatTime, getAreaName } from '@/lib/utils';
import type { GameArea, TaskStatus } from '@/types';

const STAGES: { id: GameArea; name: string; icon: string }[] = [
  { id: 'lobby', name: '大厅', icon: '🏛️' },
  { id: 'island', name: '岛屿', icon: '🏝️' },
  { id: 'tasks', name: '任务区', icon: '🎯' },
  { id: 'build', name: '建造区', icon: '🏗️' },
  { id: 'voice', name: '语音区', icon: '🎙️' },
  { id: 'replay', name: '回放区', icon: '🎬' },
];

const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  locked: '未解锁',
  available: '可进行',
  inProgress: '进行中',
  completed: '已完成',
};

export default function Host() {
  const {
    isPaused,
    togglePause,
    setCurrentArea,
    currentArea,
    teamScore,
    gameTime,
    tasks,
    completedTasks,
    sendHint,
    teams,
    renameTeam,
    setTeamCaptain,
    addTeam,
  } = useGameStore();
  const { players, currentPlayer, updatePlayer } = usePlayerStore();
  const [countdown, setCountdown] = useState(10);
  const [hintContent, setHintContent] = useState('');
  const [hintSent, setHintSent] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');

  if (!currentPlayer.isHost) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">无权限访问</h2>
          <p className="text-white/60">主持区仅对主持人开放</p>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'inProgress').length;
  const averageScore = players.length > 0
    ? Math.round(players.reduce((sum, p) => sum + p.score, 0) / players.length)
    : 0;

  const handleSetHost = (playerId: string) => {
    players.forEach(p => {
      updatePlayer(p.id, { isHost: p.id === playerId ? true : false });
    });
  };

  const handleChangeTeam = (playerId: string, teamId: string) => {
    updatePlayer(playerId, { teamId });
  };

  const handleStartEditTeam = (teamId: string, name: string) => {
    setEditingTeamId(teamId);
    setEditingTeamName(name);
  };

  const handleSaveTeamName = () => {
    if (editingTeamId && editingTeamName.trim()) {
      renameTeam(editingTeamId, editingTeamName.trim());
    }
    setEditingTeamId(null);
    setEditingTeamName('');
  };

  const handleCancelEditTeam = () => {
    setEditingTeamId(null);
    setEditingTeamName('');
  };

  const handleAddTeam = () => {
    const newIndex = teams.length + 1;
    const colors = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];
    addTeam({
      name: `队伍${newIndex}`,
      color: colors[(newIndex - 1) % colors.length],
    });
  };

  const handleExportResults = () => {
    const data = {
      exportTime: new Date().toISOString(),
      teamScore,
      gameTime,
      completedTasks,
      players: players.map(p => ({
        name: p.name,
        score: p.score,
        team: p.teamId,
        teamName: teams.find(t => t.id === p.teamId)?.name,
        teamCaptain: p.isTeamCaptain,
      })),
      teams: teams.map(t => ({
        name: t.name,
        captain: players.find(p => p.id === t.captainId)?.name,
        totalScore: players.filter(p => p.teamId === t.id).reduce((s, p) => s + p.score, 0),
        players: players.filter(p => p.teamId === t.id).map(p => ({ name: p.name, score: p.score })),
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendHint = () => {
    if (!hintContent.trim()) return;
    sendHint(hintContent.trim());
    setHintContent('');
    setHintSent(true);
    setTimeout(() => setHintSent(false), 2000);
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-starlight-purple/20 border border-starlight-purple/40 flex items-center justify-center">
            <Settings2 className="w-6 h-6 text-starlight-light" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">主持控制台</h1>
            <p className="text-sm text-white/60">游戏时间：{formatTime(gameTime)} · 团队积分：{teamScore}</p>
          </div>
        </div>
        <button
          onClick={handleExportResults}
          className="px-5 py-2.5 rounded-xl bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan flex items-center gap-2 hover:bg-neon-cyan/30 transition-all"
        >
          <Download className="w-5 h-5" />
          导出成绩
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-3 flex flex-col gap-6 min-h-0">
          <div className="rounded-2xl bg-glass border border-white/10 backdrop-blur-md p-5">
            <div className="flex items-center gap-2 text-white/80 mb-4">
              <Play className="w-5 h-5" />
              <h2 className="font-semibold">流程控制</h2>
            </div>
            <div className="space-y-4">
              <button
                onClick={togglePause}
                className={cn(
                  'w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all border-2',
                  isPaused
                    ? 'bg-aurora-green/20 border-aurora-green/40 text-aurora-green hover:bg-aurora-green/30'
                    : 'bg-gold-yellow/20 border-gold-yellow/40 text-gold-yellow hover:bg-gold-yellow/30'
                )}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                {isPaused ? '继续游戏' : '暂停游戏'}
              </button>

              <div>
                <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                  <Timer className="w-4 h-4" />
                  倒计时（分钟）
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={countdown}
                    onChange={(e) => setCountdown(Math.max(0, Math.min(120, Number(e.target.value))))}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-ocean-dark border border-white/10 text-white text-center focus:outline-none focus:border-neon-cyan/50"
                  />
                  <button className="px-4 py-2.5 rounded-xl bg-glass border border-white/10 text-white hover:bg-white/10 transition-all">
                    启动
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/80 mb-3">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="font-semibold">发送提示</h3>
                </div>
                <textarea
                  value={hintContent}
                  onChange={(e) => setHintContent(e.target.value)}
                  placeholder="输入要发送给全体玩家的提示内容..."
                  className="w-full px-3 py-2.5 rounded-xl bg-ocean-dark border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/50 resize-none"
                  rows={3}
                />
                <button
                  onClick={handleSendHint}
                  disabled={!hintContent.trim()}
                  className={cn(
                    'w-full mt-2 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
                    hintContent.trim()
                      ? 'bg-gradient-to-r from-neon-cyan to-starlight-purple text-white hover:shadow-lg hover:shadow-neon-cyan/30 active:scale-[0.98]'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  )}
                >
                  {hintSent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      提示已发送
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      发送给全体玩家
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-glass border border-white/10 backdrop-blur-md p-5 flex-1 min-h-0 overflow-y-auto">
            <div className="flex items-center gap-2 text-white/80 mb-4">
              <SkipForward className="w-5 h-5" />
              <h2 className="font-semibold">阶段跳转</h2>
            </div>
            <div className="space-y-2">
              {STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setCurrentArea(stage.id)}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all text-left',
                    currentArea === stage.id
                      ? 'bg-neon-cyan/20 border border-neon-cyan/40'
                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                  )}
                >
                  <span className="text-xl">{stage.icon}</span>
                  <span className={cn(
                    'flex-1 font-medium',
                    currentArea === stage.id ? 'text-neon-cyan' : 'text-white'
                  )}>
                    {stage.name}
                  </span>
                  <ChevronRight className={cn(
                    'w-4 h-4',
                    currentArea === stage.id ? 'text-neon-cyan' : 'text-white/40'
                  )} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-5 flex flex-col gap-6 min-h-0">
          <div className="rounded-2xl bg-glass border border-white/10 backdrop-blur-md p-5 flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 text-white/80 mb-4">
              <Users className="w-5 h-5" />
              <h2 className="font-semibold">团队管理</h2>
              <span className="text-sm text-white/50">({teams.length}队 / {players.length}人)</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div className="grid grid-cols-2 gap-4">
                {teams.map((team) => {
                  const teamPlayers = players.filter(p => p.teamId === team.id);
                  const captain = players.find(p => p.id === team.captainId);
                  return (
                    <div
                      key={team.id}
                      className="rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg"
                      style={{ borderColor: `${team.color}60`, backgroundColor: `${team.color}08` }}
                    >
                      <div
                        className="p-3 flex items-center justify-between"
                        style={{ backgroundColor: `${team.color}15` }}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {editingTeamId === team.id ? (
                            <input
                              value={editingTeamName}
                              onChange={(e) => setEditingTeamName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTeamName();
                                if (e.key === 'Escape') handleCancelEditTeam();
                              }}
                              autoFocus
                              className="flex-1 px-2 py-1 rounded-lg bg-ocean-dark border border-white/20 text-white text-sm font-semibold focus:outline-none focus:border-neon-cyan/50"
                            />
                          ) : (
                            <span className="font-semibold text-white truncate">{team.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {editingTeamId === team.id ? (
                            <>
                              <button
                                onClick={handleSaveTeamName}
                                className="p-1.5 rounded-lg bg-aurora-green/20 text-aurora-green hover:bg-aurora-green/30 transition-all"
                                title="保存"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={handleCancelEditTeam}
                                className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-all"
                                title="取消"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleStartEditTeam(team.id, team.name)}
                              className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-all"
                              title="编辑队名"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
                        <Crown className="w-4 h-4 text-gold-yellow flex-shrink-0" />
                        <span className="text-sm text-white/70">
                          队长：<span className="text-white font-medium">{captain?.name || '未设置'}</span>
                        </span>
                      </div>
                      <div className="p-2 space-y-1.5">
                        {teamPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg border flex-shrink-0"
                                style={{ borderColor: player.color, backgroundColor: `${player.color}20` }}
                              >
                                {player.avatarEmoji}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm text-white truncate">{player.name}</span>
                                  {player.isTeamCaptain && (
                                    <Crown className="w-3 h-3 text-gold-yellow flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-white/50">{getAreaName(player.currentArea)}</span>
                                  <span className="text-xs text-gold-yellow flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5" />
                                    {player.score}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <select
                                  value={player.teamId}
                                  onChange={(e) => handleChangeTeam(player.id, e.target.value)}
                                  className="px-1.5 py-1 rounded-md bg-ocean-dark border border-white/10 text-white text-xs focus:outline-none focus:border-neon-cyan/50"
                                >
                                  {teams.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                                </select>
                                {!player.isTeamCaptain && (
                                  <button
                                    onClick={() => setTeamCaptain(team.id, player.id)}
                                    className="px-1.5 py-1 rounded-md bg-gold-yellow/20 border border-gold-yellow/30 text-gold-yellow text-xs hover:bg-gold-yellow/30 transition-all"
                                    title="设为队长"
                                  >
                                    <Crown className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {teamPlayers.length === 0 && (
                          <div className="text-center text-xs text-white/40 py-3">暂无玩家</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleAddTeam}
                className="w-full py-3 rounded-xl border-2 border-dashed border-white/20 text-white/60 flex items-center justify-center gap-2 hover:bg-white/5 hover:border-white/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                新增队伍
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-glass border border-white/10 backdrop-blur-md p-5">
            <div className="flex items-center gap-2 text-white/80 mb-4">
              <Crown className="w-5 h-5 text-gold-yellow" />
              <h2 className="font-semibold">主持人管理</h2>
            </div>
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xl border"
                      style={{ borderColor: player.color, backgroundColor: `${player.color}20` }}
                    >
                      {player.avatarEmoji}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-white">{player.name}</span>
                      {player.isHost && (
                        <Crown className="w-3.5 h-3.5 text-gold-yellow" />
                      )}
                    </div>
                  </div>
                  {!player.isHost ? (
                    <button
                      onClick={() => handleSetHost(player.id)}
                      className="px-3 py-1.5 rounded-lg bg-gold-yellow/20 border border-gold-yellow/30 text-gold-yellow text-xs hover:bg-gold-yellow/30 transition-all"
                    >
                      设为主持人
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-gold-yellow/10 text-gold-yellow text-xs">
                      当前主持人
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-6 min-h-0">
          <div className="rounded-2xl bg-glass border border-white/10 backdrop-blur-md p-5">
            <div className="flex items-center gap-2 text-white/80 mb-4">
              <BarChart3 className="w-5 h-5" />
              <h2 className="font-semibold">数据统计</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-gold-yellow/20 to-transparent border border-gold-yellow/20">
                <Trophy className="w-5 h-5 text-gold-yellow mb-2" />
                <p className="text-2xl font-bold text-white">{teamScore}</p>
                <p className="text-xs text-white/60">团队积分</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-transparent border border-neon-cyan/20">
                <Star className="w-5 h-5 text-neon-cyan mb-2" />
                <p className="text-2xl font-bold text-white">{averageScore}</p>
                <p className="text-xs text-white/60">人均积分</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-aurora-green/20 to-transparent border border-aurora-green/20">
                <CheckCircle2 className="w-5 h-5 text-aurora-green mb-2" />
                <p className="text-2xl font-bold text-white">{completedCount}/{tasks.length}</p>
                <p className="text-xs text-white/60">任务完成</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-starlight-purple/20 to-transparent border border-starlight-purple/20">
                <Circle className="w-5 h-5 text-starlight-light mb-2" />
                <p className="text-2xl font-bold text-white">{inProgressCount}</p>
                <p className="text-xs text-white/60">进行中</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-glass border border-white/10 backdrop-blur-md p-5 flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 text-white/80 mb-4">
              <Target className="w-5 h-5" />
              <h2 className="font-semibold">任务进度</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {tasks.map((task) => {
                const progress = task.progress ?? (task.status === 'completed' ? 100 : 0);
                return (
                  <div key={task.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white truncate">{task.title}</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        task.status === 'completed' && 'bg-aurora-green/20 text-aurora-green',
                        task.status === 'inProgress' && 'bg-neon-cyan/20 text-neon-cyan',
                        task.status === 'available' && 'bg-gold-yellow/20 text-gold-yellow',
                        task.status === 'locked' && 'bg-white/10 text-white/50'
                      )}>
                        {TASK_STATUS_LABEL[task.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-neon-cyan to-starlight-light rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/60 w-10 text-right">{progress}%</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-white/40">{'⭐'.repeat(task.difficulty)}</span>
                      <span className="text-xs text-gold-yellow">+{task.points}分</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
