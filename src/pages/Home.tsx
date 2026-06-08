import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, Users, Gamepad2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';


interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export default function Home() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = ['#00F0FF', '#FF6B6B', '#7B2CBF', '#00FFA3', '#FFD700'];

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2,
    });

    particlesRef.current = Array.from({ length: 80 }, createParticle);

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 22, 40, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        particlesRef.current.forEach((other, j) => {
          if (i === j) return;
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (120 - dist) / 120 * 0.15;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleStart = () => {
    navigate('/lobby');
  };

  const features = [
    { icon: <Users className="w-8 h-8" />, title: '多人协作', desc: '8人组队，默契配合' },
    { icon: <Gamepad2 className="w-8 h-8" />, title: '丰富玩法', desc: '拼图、寻物、问答、投票' },
    { icon: <Trophy className="w-8 h-8" />, title: '成就系统', desc: '解锁荣誉，见证成长' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-deep-ocean">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />

      <div className="absolute inset-0 z-0 bg-aurora animate-aurora opacity-40" />

      <div className="absolute inset-0 z-0 bg-stars opacity-30" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div
          className={cn(
            'flex flex-col items-center transition-all duration-1000',
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          )}
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-neon-cyan/30 blur-3xl rounded-full animate-pulse-glow" />
            <div className="relative glass-panel p-8 rounded-3xl animate-float">
              <div className="flex items-center gap-3">
                <Sparkles className="w-12 h-12 text-neon-cyan" />
                <div>
                  <h1 className="title-font text-4xl md:text-6xl text-gradient">
                    METAVERSE
                  </h1>
                  <p className="title-font text-lg md:text-xl text-neon-cyan tracking-widest">
                    元宇宙团建平台
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'max-w-2xl text-center mb-12 transition-all duration-1000 delay-300',
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
          >
            <p className="text-xl md:text-2xl text-white/90 mb-4 font-medium">
              沉浸式虚拟团建新体验
            </p>
            <p className="text-base md:text-lg text-white/60 leading-relaxed">
              在元宇宙世界中与团队成员一起探索、协作、成长。
              通过趣味任务挑战，增进团队默契，激发无限潜能。
            </p>
          </div>

          <div
            className={cn(
              'grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 w-full max-w-3xl transition-all duration-1000 delay-500',
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-panel-hover p-6 text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-neon-cyan mb-3 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="title-font text-lg text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleStart}
            className={cn(
              'group relative px-12 py-5 rounded-full font-orbitron font-bold text-xl transition-all duration-1000 delay-700',
              isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90'
            )}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-cyan via-starlight-purple to-coral-orange opacity-80 group-hover:opacity-100 transition-opacity blur-sm group-hover:blur-md" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-cyan via-starlight-purple to-coral-orange" />
            <span className="relative flex items-center gap-3 text-white">
              <Play className="w-6 h-6 fill-current" />
              开始游戏
            </span>
          </button>

          <div
            className={cn(
              'mt-8 text-white/40 text-sm transition-all duration-1000 delay-900',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
          >
            按 Enter 键快速开始
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs">
          v1.0.0 · Powered by React + TypeScript
        </div>
      </div>
    </div>
  );
}
