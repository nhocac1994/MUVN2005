'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Chỉ render sau khi component đã mount để tránh hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Chỉ chạy khi đã mount
    if (!isMounted) return;
    // Disable scroll khi đang loading
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    // Đợi tất cả các effects load xong
    const loadTimer = setTimeout(() => {
      setProgress(100);
      
      // Thêm delay nhỏ để đảm bảo animations đã sẵn sàng
      setTimeout(() => {
        setIsLoading(false);
        // Enable scroll sau khi loading xong
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        onLoadingComplete?.();
      }, 300);
    }, 2500); // Tăng thời gian lên 2.5s để đảm bảo load đủ

    return () => {
      clearTimeout(loadTimer);
      clearInterval(progressInterval);
      // Đảm bảo enable scroll khi component unmount
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [onLoadingComplete, isMounted]);

  // Không render gì trên server để tránh hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center"
          style={{ touchAction: 'none' }} // Prevent touch events during loading
        >
          <div className="text-center px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/MU-DAUTRUONG.PNG"
                alt="Loading"
                width={400}
                height={200}
                className="w-64 md:w-80 lg:w-96 h-auto mx-auto"
                priority
              />
            </motion.div>

            {/* Loading Dots - Đơn giản */}
            <motion.div
              className="flex justify-center space-x-2 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-3 h-3 bg-blue-400 rounded-full"
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

