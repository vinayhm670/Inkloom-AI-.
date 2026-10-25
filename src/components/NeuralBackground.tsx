import React, { useEffect, useRef } from 'react';

interface NeuralBackgroundProps {
  theme?: 'dark' | 'light';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  pulsePhase: number;
  pulseSpeed: number;
}

export const NeuralBackground: React.FC<NeuralBackgroundProps> = ({ theme = 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle color palettes based on theme
    const isDark = theme === 'dark';
    const colors = isDark
      ? ['rgba(14, 165, 233, 0.75)', 'rgba(16, 185, 129, 0.75)', 'rgba(139, 92, 246, 0.75)', 'rgba(6, 182, 212, 0.8)']
      : ['rgba(14, 165, 233, 0.35)', 'rgba(99, 102, 241, 0.35)', 'rgba(16, 185, 129, 0.35)', 'rgba(71, 85, 105, 0.25)'];

    const lineColor = isDark ? 'rgba(14, 165, 233, ' : 'rgba(99, 102, 241, ';
    const maxDistance = width < 768 ? 95 : 135;
    const particleCount = width < 768 ? 38 : 75;

    // Initialize particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 2 + 1.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isDark ? 0.65 : 0.45),
        vy: (Math.random() - 0.5) * (isDark ? 0.65 : 0.45),
        radius,
        baseRadius: radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
      });
    }

    // Gentle cursor interaction
    let mouse = { x: -1000, y: -1000, radius: 140 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render gradient background glow
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.3,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75
      );
      if (isDark) {
        grad.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
        grad.addColorStop(0.5, 'rgba(10, 15, 30, 0.7)');
        grad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
      } else {
        grad.addColorStop(0, 'rgba(241, 245, 249, 0.3)');
        grad.addColorStop(0.5, 'rgba(248, 250, 252, 0.5)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Connect nodes with lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (isDark ? 0.28 : 0.12);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `${lineColor}${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          // Bounce off walls
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          // Gentle mouse attraction
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < mouse.radius && mDist > 0) {
            const force = (mouse.radius - mDist) / mouse.radius;
            p.x += (mdx / mDist) * force * 0.8;
            p.y += (mdy / mDist) * force * 0.8;
          }

          p.pulsePhase += p.pulseSpeed;
          p.radius = p.baseRadius + Math.sin(p.pulsePhase) * 0.6;
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.radius), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = isDark ? 8 : 2;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.95 }}
      aria-hidden="true"
    />
  );
};
