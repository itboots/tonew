'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker 注册成功:', registration.scope);

          // 检查更新
          registration.update();

          // 监听更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 新的 Service Worker 可用
                  console.log('新版本可用，请刷新页面');

                  // 可选：自动刷新
                  // window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker 注册失败:', error);
        });
    }
  }, []);

  return null;
}
