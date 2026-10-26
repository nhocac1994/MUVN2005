'use client';

import { useEffect, useRef, useState } from 'react';

interface MouseParallaxProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export default function MouseParallax({ 
  children, 
  strength = 0.03,
  className = '' 
}: MouseParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current || !isHovered) return;
      
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      
      setTransform({ x: deltaX, y: deltaY });
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setTransform({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    const element = ref.current;
    if (element) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (element) {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [strength, isHovered]);

  return (
    <div
      ref={ref}
      className={`cursor-pointer ${className}`}
      style={{
        transform: `perspective(1000px) rotateY(${transform.x * 2}deg) rotateX(${-transform.y * 2}deg) translateZ(${(Math.abs(transform.x) + Math.abs(transform.y)) * 0.5}px)`,
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        display: 'inline-block'
      }}
    >
      {children}
    </div>
  );
}

