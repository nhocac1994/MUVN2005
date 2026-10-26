'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Tile3DEffectProps {
  children: React.ReactNode;
  className?: string;
  tileSize?: number;
}

export default function Tile3DEffect({ 
  children, 
  className = '',
  tileSize = 50 
}: Tile3DEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-visible ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        minHeight: '100%',
        minWidth: '100%'
      }}
    >
      {/* 3D Tile Grid Overlay - Hiển thị PHÍA SAU */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.15) 2px, transparent 2px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 2px, transparent 2px)
          `,
          backgroundSize: `${tileSize}px ${tileSize}px`,
          transform: isHovered 
            ? `translate(${mousePos.x * 0.05}px, ${mousePos.y * 0.05}px) scale(1.05) perspective(1000px) rotateY(${(mousePos.x / 10) * 0.05}deg) rotateX(${(mousePos.y / 10) * -0.05}deg)`
            : 'translate(0, 0) scale(1)',
          transition: 'all 0.2s ease-out',
          opacity: isHovered ? 0.8 : 0.4,
          willChange: 'transform, opacity',
          zIndex: 1,
          top: '-10px',
          left: '-10px',
          right: '-10px',
          bottom: '-10px',
          padding: '10px'
        }}
      />
      
      {/* Grid Border Glow - Vàng */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,215,0,0.3) 2px, transparent 2px),
            linear-gradient(90deg, rgba(255,215,0,0.3) 2px, transparent 2px)
          `,
          backgroundSize: `${tileSize}px ${tileSize}px`,
          transform: isHovered 
            ? `translate(${mousePos.x * 0.03}px, ${mousePos.y * 0.03}px)`
            : 'translate(0, 0)',
          transition: 'transform 0.25s ease-out',
          opacity: isHovered ? 0.6 : 0,
          filter: 'blur(1px)',
          mixBlendMode: 'screen',
          zIndex: 2,
          top: '-10px',
          left: '-10px',
          right: '-10px',
          bottom: '-10px',
          padding: '10px'
        }}
      />
      
      {/* Content - Phía trên */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
      
      {/* 3D Shadow/Glow Effect - Theo chuột */}
      {isHovered && (
        <>
          <motion.div
            className="absolute pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              width: '200px',
              height: '200px',
              marginLeft: '-100px',
              marginTop: '-100px',
              background: `radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,165,0,0.2) 30%, transparent 60%)`,
              filter: 'blur(40px)',
              mixBlendMode: 'screen',
              zIndex: 3
            }}
          />
          <motion.div
            className="absolute pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              width: '150px',
              height: '150px',
              marginLeft: '-75px',
              marginTop: '-75px',
              background: `radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 50%)`,
              filter: 'blur(30px)',
              zIndex: 3
            }}
          />
        </>
      )}
    </div>
  );
}

