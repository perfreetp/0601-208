import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AREAS, MOCK_PLAYERS } from '@/data/mockData';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { cn, getAreaIcon } from '@/lib/utils';
import type { AreaInfo, GameArea } from '@/types';

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

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function Island() {
  const { setCurrentArea, teamScore } = useGameStore();
  const { players } = usePlayerStore();
  const navigate = useNavigate();
  const [hoveredArea, setHoveredArea] = useState<GameArea | null>(null);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 4 + 4,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  const handleAreaClick = (area: AreaInfo) => {
    setCurrentArea(area.id);
    navigate(AREA_ROUTES[area.id]);
  };

  const getPlayersInArea = (areaId: GameArea) => {
    return players.filter((p) => p.currentArea === areaId);
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes particle-float {
        0%, 100% { transform: translateY(0) translateX(0); opacity: var(--op); }
        25% { transform: translateY(-30px) translateX(10px); opacity: calc(var(--op) * 1.5); }
        50% { transform: translateY(-60px) translateX(-5px); opacity: var(--op); }
        75% { transform: translateY(-30px) translateX(10px); opacity: calc(var(--op) * 0.8); }
      }
      @keyframes glow-pulse {
        0%, 100% { filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 16px currentColor); }
        50% { filter: drop-shadow(0 0 16px currentColor) drop-shadow(0 0 32px currentColor); }
      }
      @keyframes island-float {
        0%, 100% { transform: translateY(0) rotateX(15deg) rotateY(-5deg); }
        50% { transform: translateY(-10px) rotateX(15deg) rotateY(-5deg); }
      }
      @keyframes ring-expand {
        0% { transform: scale(0.8); opacity: 0.8; }
        100% { transform: scale(2); opacity: 0; }
      }
      .particle-anim {
        animation: particle-float var(--dur) ease-in-out infinite;
        animation-delay: var(--delay);
      }
      .glow-pulse-anim {
        animation: glow-pulse 2s ease-in-out infinite;
      }
      .island-3d {
        animation: island-float 6s ease-in-out infinite;
        transform-style: preserve-3d;
      }
      .ring-expand {
        animation: ring-expand 2s ease-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen bg-deep-ocean overflow-hidden">
      <div className="absolute inset-0 bg-stars opacity-40" />
      <div className="absolute inset-0 bg-aurora animate-aurora opacity-30" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-neon-cyan particle-anim"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              '--dur': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              '--op': p.opacity,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <div className="glass-panel px-8 py-3 flex items-center gap-4">
          <span className="text-3xl">🏝️</span>
          <div>
            <h1 className="title-font text-2xl text-gradient">神秘岛屿</h1>
            <p className="text-sm text-white/60">点击发光节点探索各区域</p>
          </div>
          <div className="w-px h-10 bg-white/20 mx-2" />
          <div className="text-right">
            <p className="text-xs text-white/50">团队积分</p>
            <p className="title-font text-xl text-glow">{teamScore}</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pt-20 pb-10">
        <div
          className="island-3d relative"
          style={{
            perspective: '1000px',
            width: 'min(90vw, 700px)',
            height: 'min(70vh, 500px)',
          }}
        >
          <svg
            viewBox="0 0 600 450"
            className="w-full h-full drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))' }}
          >
            <defs>
              <radialGradient id="islandGradient" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#2d5a3d" />
                <stop offset="40%" stopColor="#1e4a2e" />
                <stop offset="70%" stopColor="#0d3320" />
                <stop offset="100%" stopColor="#061a10" />
              </radialGradient>
              <radialGradient id="sandGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e8d4a0" />
                <stop offset="100%" stopColor="#a89060" />
              </radialGradient>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0A1628" stopOpacity="0.1" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <ellipse cx="300" cy="400" rx="280" ry="30" fill="url(#waterGradient)" opacity="0.5" />
            <ellipse cx="300" cy="400" rx="250" ry="25" fill="url(#waterGradient)" opacity="0.3" />

            <path
              d="M80 320 Q60 280 80 230 Q100 180 150 160 Q180 120 250 110 Q300 80 360 100 Q430 90 480 140 Q540 170 530 240 Q540 300 500 340 Q460 380 380 380 Q300 400 220 380 Q140 380 80 320 Z"
              fill="url(#sandGradient)"
              opacity="0.6"
            />

            <path
              d="M100 300 Q85 265 100 220 Q120 175 165 155 Q195 120 260 110 Q305 85 365 105 Q425 95 470 145 Q525 175 515 235 Q525 290 485 325 Q450 360 375 360 Q300 378 230 360 Q155 360 100 300 Z"
              fill="url(#islandGradient)"
            />

            <path
              d="M180 200 Q200 170 240 165 Q260 145 290 155 Q320 140 350 160 Q390 150 410 180"
              fill="none"
              stroke="#4a8f5e"
              strokeWidth="2"
              opacity="0.4"
            />
            <circle cx="200" cy="250" r="8" fill="#3d7a4e" opacity="0.5" />
            <circle cx="400" cy="230" r="10" fill="#3d7a4e" opacity="0.5" />
            <circle cx="300" cy="290" r="6" fill="#3d7a4e" opacity="0.5" />
          </svg>

          {AREAS.map((area) => {
            const playersHere = getPlayersInArea(area.id);
            const isHovered = hoveredArea === area.id;
            const posX = (area.position.x / 100) * 600;
            const posY = (area.position.y / 100) * 450;

            return (
              <div
                key={area.id}
                className="absolute group cursor-pointer"
                style={{
                  left: `${area.position.x}%`,
                  top: `${area.position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isHovered ? 30 : 10,
                }}
                onClick={() => handleAreaClick(area)}
                onMouseEnter={() => setHoveredArea(area.id)}
                onMouseLeave={() => setHoveredArea(null)}
              >
                <div
                  className="absolute inset-0 rounded-full ring-expand"
                  style={{
                    width: '60px',
                    height: '60px',
                    marginLeft: '-30px',
                    marginTop: '-30px',
                    border: `2px solid ${area.color}`,
                    left: '50%',
                    top: '50%',
                  }}
                />
                <div
                  className={cn(
                    'relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300',
                    isHovered && 'scale-125'
                  )}
                  style={{
                    backgroundColor: `${area.color}33`,
                    border: `2px solid ${area.color}`,
                    color: area.color,
                    boxShadow: isHovered
                      ? `0 0 30px ${area.color}80, 0 0 60px ${area.color}40, inset 0 0 20px ${area.color}40`
                      : `0 0 15px ${area.color}60, inset 0 0 10px ${area.color}30`,
                  }}
                >
                  <span className="text-2xl glow-pulse-anim" style={{ color: area.color }}>
                    {area.icon}
                  </span>
                </div>

                {playersHere.length > 0 && (
                  <div className="absolute -top-1 -right-1 flex -space-x-2">
                    {playersHere.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-deep-ocean"
                        style={{ backgroundColor: p.color }}
                        title={p.name}
                      >
                        {p.avatarEmoji}
                      </div>
                    ))}
                    {playersHere.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs border-2 border-deep-ocean text-white">
                        +{playersHere.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={cn(
                    'absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap transition-all duration-300',
                    isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                  )}
                >
                  <div
                    className="glass-panel px-4 py-2 text-center"
                    style={{ borderColor: `${area.color}40` }}
                  >
                    <p className="title-font text-sm font-bold" style={{ color: area.color }}>
                      {area.name}
                    </p>
                    <p className="text-xs text-white/60 mt-0.5 max-w-[160px]">{area.description}</p>
                    {playersHere.length > 0 && (
                      <p className="text-xs text-neon-cyan/80 mt-1">
                        {playersHere.length} 人在此
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="glass-panel px-6 py-3">
          <div className="flex items-center gap-6">
            {AREAS.map((area) => (
              <div
                key={area.id}
                className="flex items-center gap-2 cursor-pointer transition-all hover:scale-110"
                onClick={() => handleAreaClick(area)}
              >
                <span className="text-xl">{area.icon}</span>
                <span className="text-sm text-white/70">{area.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-20">
        <div className="glass-panel p-3">
          <p className="text-xs text-white/50 mb-2">在线玩家</p>
          <div className="flex -space-x-2">
            {MOCK_PLAYERS.map((p) => (
              <div
                key={p.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-deep-ocean relative"
                style={{ backgroundColor: p.color }}
                title={`${p.name} - ${getAreaIcon(p.currentArea)}`}
              >
                {p.avatarEmoji}
                {p.isSpeaking && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-aurora-green rounded-full animate-pulse border border-deep-ocean" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
