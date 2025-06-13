'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onVerify: (verified: boolean) => void;
}

export default function AgeVerificationModal({ isOpen, onVerify }: AgeVerificationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleVerify = (verified: boolean) => {
    if (verified) {
      // Kalıcı cookie için localStorage kullan
      localStorage.setItem('age-verified', 'true');
      onVerify(true);
    } else {
      // No tıklandığında hiçbir şey kaydetme, sadece yönlendir
      window.location.href = 'https://www.google.com';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="max-w-md mx-4 p-8 bg-gray-900 rounded-2xl border border-gray-800 text-center"
          >
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">AdultReels</h1>
              <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto rounded-full" />
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Age Verification Required</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                This website contains adult content. You must be 18 years or older to continue.
                By clicking &quot;Yes, I am 18+&quot;, you confirm that you are of legal age in your jurisdiction.
              </p>
            </div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVerify(true)}
                className="w-full py-4 px-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-pink-500/25 flex items-center justify-center space-x-2"
              >
                <Check className="w-5 h-5" />
                <span>Yes, I am 18+</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVerify(false)}
                className="w-full py-4 px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <X className="w-5 h-5" />
                <span>No, I am under 18</span>
              </motion.button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              By continuing, you agree to our terms of service and privacy policy.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}