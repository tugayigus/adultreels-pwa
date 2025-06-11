'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export default function PWAInstallPrompt() {
  const { shouldShowInstallPrompt, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success || !success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!shouldShowInstallPrompt() || isDismissed) return null;

  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
      >
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              AR
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm">Install AdultReels</h3>
              <p className="text-gray-300 text-xs mt-1">
                Get the full app experience with offline access and native performance.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Install</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Later</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}