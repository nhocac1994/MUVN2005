'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  initialY: number;
  offsetX: number;
}

export default function FloatingParticles({ count = 15 }: { count?: number }) {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize particles
    const actualCount = Math.min(count, 20); // Giới hạn tối đa 20
    particlesRef.current = [];
    for (let i = 0; i < actualCount; i++) {
      particlesRef.current.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        duration: Math.random() * 4 + 5,
        delay: Math.random() * 2,
        initialY: Math.random() * 100,
        offsetX: (Math.random() - 0.5) * 20
      });
    }

    // CSS animation thay vì JS animation để GPU accelerate
    if (containerRef.current) {
      const style = document.createElement('style');
      style.id = 'floating-particles-style';
      
      // Tạo keyframe riêng cho mỗi particle để có offsetX khác nhau
      let keyframesCSS = '';
      particlesRef.current.forEach((particle, index) => {
        keyframesCSS += `
          @keyframes floatParticle${index} {
            0%, 100% {
              transform: translate(0, 0) translateZ(0);
              opacity: 0.3;
            }
            50% {
              transform: translate(${particle.offsetX}px, -30px) translateZ(0);
              opacity: 0.6;
            }
          }
        `;
      });
      
      style.textContent = keyframesCSS;
      
      if (!document.getElementById('floating-particles-style')) {
        document.head.appendChild(style);
      }

      particlesRef.current.forEach((particle, index) => {
        const element = document.createElement('div');
        element.className = 'particle';
        element.style.cssText = `
          position: absolute;
          left: ${particle.x}%;
          top: ${particle.y}%;
          width: ${particle.size}px;
          height: ${particle.size}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(147, 197, 253, 0.4), rgba(192, 132, 252, 0.2));
          filter: blur(2px);
          will-change: transform, opacity;
          transform: translateZ(0);
          animation: floatParticle${index} ${particle.duration}s ${particle.delay}s ease-in-out infinite;
          opacity: 0.3;
        `;
        containerRef.current?.appendChild(element);
      });

      return () => {
        // Cleanup
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        const existingStyle = document.getElementById('floating-particles-style');
        if (existingStyle) {
          existingStyle.remove();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [count, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{
        willChange: 'contents',
        transform: 'translateZ(0)'
      }}
    />
  );
}

