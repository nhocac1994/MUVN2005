'use client';

import { useEffect, useRef, useState } from 'react';

interface NetworkOverlayProps {
  className?: string;
}

export default function NetworkOverlay({ className = '' }: NetworkOverlayProps) {
  const [isMounted, setIsMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef({ x: -1000, y: -1000 }); // Bắt đầu ở vị trí xa để không ảnh hưởng ban đầu

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Hàm để xác định số lượng nodes dựa trên kích thước màn hình
    const getNodeCount = () => {
      const width = window.innerWidth;
      // Giảm nodes trên mobile để tối ưu performance
      if (width <= 480) return 100; // Mobile nhỏ: 25 nodes
      if (width <= 768) return 50; // Mobile: 35 nodes
      return 200; // PC: 200 nodes
    };
    
    // Detect mobile
    const isMobile = window.innerWidth <= 768;
    
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Lưu transform hiện tại
      ctx.save();
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      // Reset transform sau khi resize
      ctx.restore();
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    
    let nodeCount = getNodeCount();
    const nodes: Array<{ x: number; y: number; vx: number; vy: number }> = [];

    // Khởi tạo nodes - tối ưu cho mobile
    const initNodes = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const newNodeCount = getNodeCount();
      
      // Clear và resize array
      nodes.length = 0;
      nodeCount = newNodeCount;
      
      // Khởi tạo nodes với vị trí và vận tốc ngẫu nhiên - Tăng tốc độ ban đầu
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 20, // Tăng từ 10.5 lên 20
          vy: (Math.random() - 0.5) * 20
        });
      }
    };
    
    initNodes();
    
    // Update nodes khi resize - xử lý tốt hơn cho mobile
    let lastIsMobile = window.innerWidth <= 768;
    let resizeTimeout: NodeJS.Timeout | null = null;
    
    const handleResize = () => {
      // Debounce resize để tránh quá nhiều lần re-init
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        const currentIsMobile = window.innerWidth <= 768;
        
        // Re-init nodes nếu chuyển giữa mobile và desktop hoặc khi resize lớn
        if (currentIsMobile !== lastIsMobile) {
          initNodes();
          lastIsMobile = currentIsMobile;
        } else {
          // Nếu vẫn cùng loại thiết bị, chỉ cập nhật vị trí nodes nếu cần
          const width = window.innerWidth;
          const height = window.innerHeight;
          
          // Đảm bảo nodes không ra ngoài màn hình
          nodes.forEach(node => {
            if (node.x > width) node.x = width;
            if (node.y > height) node.y = height;
            if (node.x < 0) node.x = 0;
            if (node.y < 0) node.y = 0;
          });
        }
      }, 150); // Debounce 150ms
    };
    
    window.addEventListener('resize', handleResize, { passive: true });

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mousePosRef.current = { x: -1000, y: -1000 }; // Đẩy mouse ra xa khi rời khỏi window
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    let animationFrame: number;
    // Giảm FPS trên mobile để tối ưu performance
    const currentIsMobile = window.innerWidth <= 768;
    const targetFPS = currentIsMobile ? 30 : 30; // Giảm từ 20 xuống 15 trên mobile
    const frameInterval = 1000 / targetFPS;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastTime;

      if (elapsed < frameInterval) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      lastTime = currentTime - (elapsed % frameInterval);

      // Đảm bảo context vẫn còn tồn tại
      if (!ctx) return;

      // Clear canvas hoàn toàn mỗi frame để không có trail effect
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.clearRect(0, 0, width, height);
      const mouseX = mousePosRef.current.x;
      const mouseY = mousePosRef.current.y;

      // Repulsion effect - nodes tránh chuột
      const repulsionDistance = 120; // Khoảng cách tối thiểu từ chuột
      const repulsionStrength = 0.4; // Tăng từ 0.25 lên 0.4 để phản ứng nhanh và mạnh hơn

      // Update nodes với repulsion effect
      nodes.forEach((node) => {
        // Tính khoảng cách đến chuột
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Nếu chuột quá gần, đẩy node ra xa
        if (distance < repulsionDistance && distance > 0) {
          const force = (repulsionDistance - distance) / repulsionDistance;
          const angle = Math.atan2(dy, dx);
          
          node.vx += Math.cos(angle) * force * repulsionStrength;
          node.vy += Math.sin(angle) * force * repulsionStrength;
        }

        // Giảm damping xuống tối thiểu để giữ tốc độ cao - gần như không giảm
        node.vx *= 0.999; // Giảm damping xuống 0.999 để giữ tốc độ tốt hơn
        node.vy *= 0.999;

        // Đảm bảo nodes luôn có vận tốc tối thiểu để không đứng yên
        const minSpeed = 3; // Tốc độ tối thiểu
        const currentSpeed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (currentSpeed < minSpeed && currentSpeed > 0) {
          // Nếu tốc độ quá chậm, tăng lại
          const angle = Math.atan2(node.vy, node.vx);
          node.vx = Math.cos(angle) * minSpeed;
          node.vy = Math.sin(angle) * minSpeed;
        } else if (currentSpeed === 0) {
          // Nếu đứng yên, cho vận tốc ngẫu nhiên
          node.vx = (Math.random() - 0.5) * 15;
          node.vy = (Math.random() - 0.5) * 15;
        }

        // Giới hạn vận tốc tối đa - tăng lên để nhanh hơn
        const maxSpeed = 25; // Tăng từ 16 lên 25
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed > maxSpeed) {
          node.vx = (node.vx / speed) * maxSpeed;
          node.vy = (node.vy / speed) * maxSpeed;
        }

        // Di chuyển nodes
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around edges - Giữ nguyên vận tốc để không bị chậm
        if (node.x < 0) {
          node.x = width;
          // Không giảm vận tốc khi wrap để giữ tốc độ
        }
        if (node.x > width) {
          node.x = 0;
        }
        if (node.y < 0) {
          node.y = height;
        }
        if (node.y > height) {
          node.y = 0;
        }
      });

      // Draw connections - rõ ràng hơn
      ctx.lineWidth = 1.5;

      nodes.forEach((nodeA, i) => {
        nodes.slice(i + 1).forEach((nodeB) => {
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distanceSq = dx * dx + dy * dy;

          // Giảm connection distance trên mobile để tối ưu
          const connectionDistance = currentIsMobile ? 120 : 150;
          if (distanceSq < connectionDistance * connectionDistance) {
            const distance = Math.sqrt(distanceSq);
            const opacity = (1 - distance / connectionDistance) * (currentIsMobile ? 0.3 : 0.5);

            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.forEach((node) => {
        // Tính độ sáng dựa trên khoảng cách đến chuột
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
        const brightness = distanceToMouse < repulsionDistance ? 1.0 : 0.8; // Tăng độ sáng tối đa

        // Outer glow - rõ hơn
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.12})`;
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Middle glow
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
        ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core node - rõ ràng hơn
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.9})`;
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    // Pause animation when tab is not visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
      } else {
        lastTime = performance.now();
        animationFrame = requestAnimationFrame(animate);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{
        zIndex: 1,
        mixBlendMode: 'screen',
        opacity: 0.4,
        visibility: isMounted ? 'visible' : 'hidden'
      }}
    />
  );
}

