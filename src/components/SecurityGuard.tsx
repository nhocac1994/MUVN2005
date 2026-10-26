'use client';

import { useEffect } from 'react';

const SecurityGuard = () => {
  useEffect(() => {
    // Chống injection attacks - Kiểm tra URL parameters
    const preventInjection = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /eval\s*\(/i,
          /expression\s*\(/i,
          /vbscript:/i,
          /data:text\/html/i
        ];

        urlParams.forEach((value, key) => {
          if (suspiciousPatterns.some(pattern => pattern.test(value))) {
            console.warn('Suspicious parameter detected:', key, value);
            window.location.href = '/?security=blocked';
          }
        });
      } catch (error) {
        console.warn('Error in injection prevention:', error);
      }
    };

    // Chống clickjacking
    const protectClickjacking = () => {
      try {
        if (window.top !== window.self) {
          console.warn('Page is being loaded in iframe - potential clickjacking');
          if (window.top) {
            window.top.location.href = window.self.location.href;
          }
        }
      } catch (error) {
        console.warn('Error in clickjacking protection:', error);
      }
    };

    // Chống iframe injection đơn giản
    const protectIframe = () => {
      try {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (element.tagName === 'IFRAME') {
                  const src = element.getAttribute('src');
                  if (src && !src.startsWith('/') && !src.startsWith('http://localhost') && !src.startsWith('https://localhost')) {
                    console.warn('Blocked suspicious iframe:', src);
                    element.remove();
                  }
                }
              }
            });
          });
        });

        if (document.body) {
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
      } catch (error) {
        console.warn('Error in iframe protection:', error);
      }
    };

    // Chống form hijacking
    const protectForms = () => {
      try {
        document.addEventListener('submit', (e) => {
          const form = e.target as HTMLFormElement;
          const action = form.action;
          
          if (action && !action.startsWith('/') && !action.startsWith('http://localhost') && !action.startsWith('https://localhost')) {
            console.warn('Blocked suspicious form action:', action);
            e.preventDefault();
          }
        });
      } catch (error) {
        console.warn('Error in form protection:', error);
      }
    };

    // Khởi tạo các biện pháp bảo mật cơ bản
    preventInjection();
    protectClickjacking();
    protectIframe();
    protectForms();

  }, []);

  return null; // Component không render gì
};

export default SecurityGuard;
