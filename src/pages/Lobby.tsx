import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  DoorOpen,
  Plus,
  LogIn,
  Copy,
  Check,
  Mic,
  Wifi,
  WifiOff,
  Clock,
  Crown,
  Volume2,
  Users,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { AVATARS, AVATAR_COLORS, MOCK_ROOM, generateRoomCode } from '@/data/mockData';
import type { Player } from '@/types';
import { cn } from '@/lib/utils';

export default function Lobby() {
  const navigate = useNavigate();
  const { setCurrentArea } = useGameStore();
  const { currentPlayer, players, updatePlayer } = usePlayerStore();

  const [roomCode, setRoomCode] = useState(MOCK_ROOM.roomCode);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState(currentPlayer.avatarId);
  const [selectedColor, setSelectedColor] = useState(currentPlayer.color);
  const [micVolume, setMicVolume] = useState(45);
  const [networkStatus, setNetworkStatus] = useState<'good' | 'medium' | 'poor'>('good');
  const [showJoinInput, setShowJoinInput] = useState(false);

  useEffect(() => {
    const micInterval = setInterval(() => setMicVolume(Math.floor(Math.random() * 40) + 30), 200);
    const netInterval = setInterval(() => {
      const s: Array<'good' | 'medium' | 'poor'> = ['good', 'good', 'good', 'medium'];
      setNetworkStatus(s[Math.floor(Math.random() * s.length)]);
    }, 5000);
    return () => { clearInterval(micInterval); clearInterval(netInterval); };
  }, []);

  const handleCreateRoom = () => setRoomCode(generateRoomCode());
  const handleJoinRoom = () => {
    if (joinCode.trim()) { setRoomCode(joinCode.trim().toUpperCase()); setShowJoinInput(false); setJoinCode(''); }
  };
  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const handleSelectAvatar = (avatarId: string, avatarEmoji: string) => {
    setSelectedAvatarId(avatarId); updatePlayer(currentPlayer.id, { avatarId, avatarEmoji, color: selectedColor });
  };
  const handleSelectColor = (color: string) => { setSelectedColor(color); updatePlayer(currentPlayer.id, { color }); };
  const handleReady = () => setIsReady(!isReady);
  const handleStartGame = () => { setCurrentArea('island'); navigate('/island'); };

  const selectedAvatar = AVATARS.find((a) => a.id === selectedAvatarId);
  const readyPlayers = useMemo(() => players.slice(0, Math.floor(Math.random() * 3) + 2), [players]);
  const netMetrics = { good: ['12', '0.0', '2'], medium: ['45', '0.5', '8'], poor: ['128', '2.3', '25'] };
  const netLabels = { good: '优秀', medium: '一般', poor: '较差' };

  return (
    <div className="relative min-h-screen w-full bg-deep-ocean overflow-hidden">
      <div className="absolute inset-0 bg-stars opacity-20" />
      <div className="absolute inset-0 bg-aurora animate-aurora opacity-20" />

      <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/60 hover:text-neon-cyan transition-colors">
            <HomeIcon className="w-5 h-5" /><span className="hidden sm:inline">返回首页</span>
          </button>
          <h1 className="title-font text-2xl md:text-3xl text-gradient">游戏大厅</h1>
          <div className="w-20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="glass-panel p-6 animate-fade-in">
            <div className="section-title"><DoorOpen className="w-6 h-6 text-neon-cyan" />房间管理</div>
            <div className="space-y-4">
              <div className="glass-panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/60 text-sm">当前房间号</span>
                  <button onClick={handleCopyCode} className="flex items-center gap-1 text-neon-cyan hover:text-neon-cyan-dim transition-colors text-sm">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
                <div className="title-font text-3xl text-neon-cyan tracking-widest text-glow">{roomCode}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleCreateRoom} className="neon-button flex items-center justify-center gap-2 text-sm py-2.5">
                  <Plus className="w-4 h-4" />创建房间
                </button>
                <button onClick={() => setShowJoinInput(!showJoinInput)} className="coral-button flex items-center justify-center gap-2 text-sm py-2.5">
                  <LogIn className="w-4 h-4" />加入房间
                </button>
              </div>
              {showJoinInput && (
                <div className="flex gap-2 animate-slide-up">
                  <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="输入房间号 META-XXXX" maxLength={10}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 transition-colors font-orbitron tracking-wider uppercase" />
                  <button onClick={handleJoinRoom} className="neon-button py-2.5 px-6 text-sm">加入</button>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="section-title"><span className="text-2xl">{selectedAvatar?.emoji || '👤'}</span>头像选择</div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 glass-panel">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl transition-all"
                  style={{ backgroundColor: selectedColor + '30', border: `2px solid ${selectedColor}`, boxShadow: `0 0 20px ${selectedColor}40` }}>
                  {selectedAvatar?.emoji}
                </div>
                <div>
                  <div className="title-font text-lg text-white">{selectedAvatar?.name}</div>
                  <div className="text-sm text-white/50">当前玩家</div>
                </div>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-2">选择头像</p>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((avatar) => (
                    <button key={avatar.id} onClick={() => handleSelectAvatar(avatar.id, avatar.emoji)} title={avatar.name}
                      className={cn('aspect-square rounded-xl flex items-center justify-center text-2xl transition-all',
                        selectedAvatarId === avatar.id ? 'bg-neon-cyan/20 border-2 border-neon-cyan scale-110' : 'bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10')}>
                      {avatar.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-2">选择颜色</p>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button key={color} onClick={() => handleSelectColor(color)}
                      className={cn('w-9 h-9 rounded-full transition-all', selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-ocean-dark scale-110' : 'hover:scale-105')}
                      style={{ backgroundColor: color, boxShadow: selectedColor === color ? `0 0 15px ${color}` : 'none' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="section-title"><Users className="w-6 h-6 text-coral-orange" />匹配队友</div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">已加入玩家 <span className="text-neon-cyan font-bold">{readyPlayers.length}</span> / 8</span>
                <div className="flex items-center gap-1 text-white/40"><Clock className="w-4 h-4" />等待中...</div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-2">
                {readyPlayers.map((player: Player, index: number) => {
                  const isReadyPlayer = index < readyPlayers.length - 1 || player.id === currentPlayer.id;
                  return (
                    <div key={player.id}
                      className={cn('flex items-center gap-3 p-3 rounded-xl transition-all', player.id === currentPlayer.id ? 'bg-neon-cyan/10 border border-neon-cyan/30' : 'bg-white/5 border border-white/5')}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style={{ backgroundColor: player.color + '30', border: `2px solid ${player.color}` }}>
                        {player.avatarEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium truncate">{player.name}</span>
                          {player.isHost && <Crown className="w-4 h-4 text-gold-yellow shrink-0" />}
                        </div>
                        <div className="text-xs text-white/40">{player.id === currentPlayer.id ? '（我）' : ''}</div>
                      </div>
                      <div className={cn('px-3 py-1 rounded-full text-xs font-medium', isReadyPlayer ? 'bg-aurora-green/20 text-aurora-green' : 'bg-white/10 text-white/50')}>
                        {isReadyPlayer ? '已准备' : '准备中'}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleReady}
                  className={cn('py-3 rounded-full font-orbitron font-semibold transition-all', isReady ? 'bg-aurora-green/20 text-aurora-green border border-aurora-green/50' : 'neon-button-outline')}>
                  {isReady ? '✓ 已准备' : '准备'}
                </button>
                <button onClick={handleStartGame} disabled={readyPlayers.length < 2} className="coral-button py-3 disabled:opacity-40">开始游戏</button>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="section-title"><Mic className="w-6 h-6 text-starlight-light" />设备测试</div>
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Mic className="w-5 h-5 text-neon-cyan" /><span className="text-white/80">麦克风</span></div>
                  <span className="text-sm text-aurora-green">正常</span>
                </div>
                <div className="relative h-10 bg-white/5 rounded-xl overflow-hidden border border-white/10">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-cyan via-starlight-light to-coral-orange transition-all duration-150 rounded-l-xl" style={{ width: `${micVolume}%` }} />
                  <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                    {Array.from({ length: 40 }).map((_, i) => <div key={i} className="w-0.5 bg-white/10" style={{ height: `${Math.random() * 60 + 20}%` }} />)}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center"><Volume2 className="w-4 h-4 text-white/60" /></div>
                </div>
                <div className="flex justify-between text-xs text-white/40"><span>音量: {micVolume}%</span><span>采样率: 48kHz</span></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {networkStatus === 'poor' ? <WifiOff className="w-5 h-5 text-coral-orange" /> :
                      <Wifi className={cn('w-5 h-5', networkStatus === 'good' ? 'text-aurora-green' : 'text-gold-yellow')} />}
                    <span className="text-white/80">网络状态</span>
                  </div>
                  <span className={cn('text-sm font-medium', networkStatus === 'good' && 'text-aurora-green', networkStatus === 'medium' && 'text-gold-yellow', networkStatus === 'poor' && 'text-coral-orange')}>
                    {netLabels[networkStatus]}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: '延迟', value: netMetrics[networkStatus][0], unit: 'ms', color: 'text-neon-cyan' },
                    { label: '丢包', value: netMetrics[networkStatus][1], unit: '%', color: 'text-aurora-green' },
                    { label: '抖动', value: netMetrics[networkStatus][2], unit: 'ms', color: 'text-starlight-light' }].map((m) => (
                    <div key={m.label} className="glass-panel p-3 text-center">
                      <div className="text-xs text-white/40 mb-1">{m.label}</div>
                      <div className={cn('title-font text-lg', m.color)}>{m.value}<span className="text-xs text-white/40 ml-1">{m.unit}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
