'use client';

import { useEffect, useState } from 'react';

interface ViewportInfo {
  height: number;
  browserUIHeight: number;
  isStandalone: boolean;
}

export function useViewportHeight() {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    browserUIHeight: 0,
    isStandalone: false,
  });

  useEffect(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    const calculateViewportHeight = () => {
      const windowHeight = window.innerHeight;
      const screenHeight = window.screen.height;
      
      // Calculate browser UI height (address bar, etc.)
      // This is approximate and varies by browser
      const browserUIHeight = screenHeight - windowHeight;
      
      // Update CSS custom properties
      const vh = windowHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--app-height', `${windowHeight}px`);
      document.documentElement.style.setProperty('--browser-ui-height', `${Math.max(0, browserUIHeight * 0.1)}px`);
      
      setViewportInfo({
        height: windowHeight,
        browserUIHeight: browserUIHeight,
        isStandalone,
      });
    };

    // Initial calculation
    calculateViewportHeight();

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateViewportHeight, 100);
    };

    // Orientation change handler
    const handleOrientationChange = () => {
      // Wait for orientation change to complete
      setTimeout(calculateViewportHeight, 500);
    };

    // Visual viewport API for more accurate measurements on mobile
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', calculateViewportHeight);
      window.visualViewport?.addEventListener('scroll', calculateViewportHeight);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', calculateViewportHeight);
        window.visualViewport?.removeEventListener('scroll', calculateViewportHeight);
      }
    };
  }, []);

  return viewportInfo;
}