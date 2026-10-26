'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import siteConfig from '@/config/site.config.json';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showInstallPrompt || sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-gradient-to-r from-blue-900/95 to-purple-900/95 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3 sm:p-4 shadow-xl">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0">
            <Image 
              src="/favicon-96x96.png" 
              alt={`${siteConfig.serverName} Logo`} 
              width={40} 
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-xs sm:text-sm mb-1">
              Cài đặt {siteConfig.serverName}
            </h3>
            <p className="text-gray-300 text-[10px] sm:text-xs mb-2 sm:mb-3 leading-tight">
              Thêm vào màn hình chính để nhận thông báo sự kiện ngay cả khi đóng app!
            </p>
            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-3 py-1.5 sm:py-1 rounded text-[11px] sm:text-xs font-semibold transition-colors w-full sm:w-auto"
              >
                Cài đặt
              </button>
              <button
                onClick={handleDismiss}
                className="bg-gray-600 hover:bg-gray-700 text-white px-2.5 sm:px-3 py-1.5 sm:py-1 rounded text-[11px] sm:text-xs font-semibold transition-colors w-full sm:w-auto"
              >
                Không
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
