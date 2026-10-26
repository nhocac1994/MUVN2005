'use client';

import { useEffect, useRef, useState } from 'react';

export default function Network3D() {
  const [isMounted, setIsMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMousePosRef = useRef({ x: 0.5, y: 0.5 });
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Tắt alpha để tối ưu
    if (!ctx) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // Tắt animation nếu user muốn giảm motion

    // Set canvas size với device pixel ratio
    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Giới hạn DPR để tối ưu
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    setCanvasSize();
    
    const resizeHandler = () => {
      setCanvasSize();
    };
    window.addEventListener('resize', resizeHandler, { passive: true });

    // Visibility API - dừng animation khi tab không active
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Throttled mouse tracking để giảm tải
    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          mousePosRef.current = {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight
          };
          rafId = null;
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Giảm số nodes để tối ưu performance
    const nodeCount = prefersReducedMotion ? 20 : 30; // Giảm từ 50 xuống 30
    const nodes: Array<{ x: number; y: number; z: number; vx: number; vy: number }> = [];

    // Lấy kích thước canvas sau khi scale
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }

    let animationFrame: number;
    const targetFPS = 30; // Giới hạn FPS để tiết kiệm pin
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      // Skip frame nếu tab không visible hoặc quá sớm
      if (!isVisibleRef.current) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const elapsed = currentTime - lastTimeRef.current;
      if (elapsed < frameInterval) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      lastTimeRef.current = currentTime - (elapsed % frameInterval);

      frameCountRef.current++;

      // Smooth interpolation for mouse position (lerp)
      const lerpSpeed = 0.05;
      smoothMousePosRef.current.x += (mousePosRef.current.x - smoothMousePosRef.current.x) * lerpSpeed;
      smoothMousePosRef.current.y += (mousePosRef.current.y - smoothMousePosRef.current.y) * lerpSpeed;

      // Clear canvas với alpha thấp để tạo trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

      // Update and draw nodes với mouse influence
      const mouseInfluenceX = (smoothMousePosRef.current.x - 0.5) * 60;
      const mouseInfluenceY = (smoothMousePosRef.current.y - 0.5) * 60;

      // Batch operations để tối ưu
      ctx.save();
      
      nodes.forEach((node) => {
        // Update position
        node.x += node.vx + mouseInfluenceX * 0.004;
        node.y += node.vy + mouseInfluenceY * 0.004;

        // Wrap around
        const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
        
        if (node.x < 0) node.x = canvasWidth;
        if (node.x > canvasWidth) node.x = 0;
        if (node.y < 0) node.y = canvasHeight;
        if (node.y > canvasHeight) node.y = 0;
      });

      // Draw connections trước (ở dưới)
      ctx.beginPath();
      let hasConnections = false;
      nodes.forEach((nodeA, i) => {
        nodes.slice(i + 1).forEach((nodeB) => {
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 180 * 180) { // Sử dụng distSq thay vì sqrt để tối ưu
            const distance = Math.sqrt(distSq);
            const opacity = (1 - distance / 180) * 0.3;
            
            if (!hasConnections) {
              ctx.beginPath();
              hasConnections = true;
            }
            
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            
            // Draw với stroke style tối ưu
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        });
      });

      // Draw nodes sau (ở trên)
      nodes.forEach((node) => {
        const size = 1.2 + (1 - node.z / 1000) * 2;
        const alpha = 0.3 + (1 - node.z / 1000) * 0.4;
        
        // Chỉ vẽ node, bỏ outer glow để giảm draw calls
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (rafId !== null) cancelAnimationFrame(rafId);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        opacity: 0.8,
        willChange: 'contents', // GPU acceleration hint
        transform: 'translateZ(0)' // Force GPU layer
      }}
    />
  );
}

