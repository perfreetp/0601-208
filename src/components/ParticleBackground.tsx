import { cn } from '@/lib/utils';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

const generateStars = (count: number): Star[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
    opacity: Math.random() * 0.5 + 0.3,
  }));
};

const stars = generateStars(80);

interface ParticleBackgroundProps {
  className?: string;
}

export default function ParticleBackground({ className }: ParticleBackgroundProps) {
  return (
    <div className={cn('fixed inset-0 overflow-hidden pointer-events-none z-0', className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-deep-ocean via-ocean-dark to-ocean-mid" />

      <div
        className="absolute top-0 left-1/4 w-1/2 h-1/3 opacity-30 animate-aurora"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.4) 0%, rgba(0, 255, 163, 0.2) 40%, transparent 70%)',
          filter: 'blur(40px)',
          backgroundSize: '200% 200%',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-1/3 h-1/4 opacity-25 animate-aurora"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(123, 44, 191, 0.4) 0%, rgba(0, 240, 255, 0.2) 40%, transparent 70%)',
          filter: 'blur(50px)',
          backgroundSize: '200% 200%',
          animationDelay: '3s',
        }}
      />
      <div
        className="absolute top-1/3 left-1/3 w-1/4 h-1/4 opacity-20 animate-aurora"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255, 107, 107, 0.3) 0%, rgba(0, 240, 255, 0.15) 40%, transparent 70%)',
          filter: 'blur(60px)',
          backgroundSize: '200% 200%',
          animationDelay: '6s',
        }}
      />

      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            boxShadow: `0 0 ${star.size * 3}px rgba(0, 240, 255, 0.8)`,
          }}
        />
      ))}

      <div
        className="absolute top-10 left-10 w-1 h-1 bg-neon-cyan rounded-full animate-float"
        style={{ boxShadow: '0 0 10px rgba(0, 240, 255, 0.8)' }}
      />
      <div
        className="absolute top-1/4 right-20 w-1.5 h-1.5 bg-aurora-green rounded-full animate-float-slow"
        style={{ boxShadow: '0 0 12px rgba(0, 255, 163, 0.8)', animationDelay: '2s' }}
      />
      <div
        className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-coral-orange rounded-full animate-float"
        style={{ boxShadow: '0 0 10px rgba(255, 107, 107, 0.8)', animationDelay: '4s' }}
      />
      <div
        className="absolute bottom-20 right-1/3 w-1.5 h-1.5 bg-starlight-light rounded-full animate-float-slow"
        style={{ boxShadow: '0 0 12px rgba(157, 78, 221, 0.8)', animationDelay: '1s' }}
      />
    </div>
  );
}
