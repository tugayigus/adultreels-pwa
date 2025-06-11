'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VideoProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}

export default function VideoProgressBar({
  currentTime,
  duration,
  onSeek,
  onScrubStart,
  onScrubEnd,
}: VideoProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const progress = isDragging ? localProgress : (currentTime / duration) * 100 || 0;

  const handleInteractionStart = useCallback((clientX: number) => {
    if (!progressBarRef.current) return;
    
    setIsDragging(true);
    onScrubStart();
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const seekTime = (percentage / 100) * duration;
    
    setLocalProgress(percentage);
    onSeek(seekTime);
  }, [duration, onSeek, onScrubStart]);

  const handleInteractionMove = useCallback((clientX: number) => {
    if (!isDragging || !progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const seekTime = (percentage / 100) * duration;
    
    setLocalProgress(percentage);
    onSeek(seekTime);
  }, [isDragging, duration, onSeek]);

  const handleInteractionEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onScrubEnd();
    }
  }, [isDragging, onScrubEnd]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent mute toggle
    handleInteractionStart(e.clientX);
  }, [handleInteractionStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleInteractionMove(e.clientX);
  }, [handleInteractionMove]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent mute toggle
    const touch = e.touches[0];
    handleInteractionStart(touch.clientX);
  }, [handleInteractionStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleInteractionMove(touch.clientX);
  }, [handleInteractionMove]);

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handleInteractionEnd();
      const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e);
      const handleGlobalTouchEnd = () => handleInteractionEnd();

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('touchmove', handleGlobalTouchMove);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleInteractionEnd]);

  if (!duration) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div
        ref={progressBarRef}
        className="relative w-full h-12 flex items-center cursor-pointer"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        style={{ touchAction: 'none' }}
      >
        {/* Touch area (invisible, larger for easier interaction) */}
        <div className="absolute inset-0 z-10" />
        
        {/* Progress bar background */}
        <div className="relative w-full h-1 mx-4">
          <div className="absolute inset-0 bg-white/30 rounded-full" />
          
          {/* Progress fill */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full origin-left"
            style={{
              width: `${progress}%`,
            }}
            transition={{
              duration: isDragging ? 0 : 0.1,
              ease: 'linear'
            }}
          />
          
          {/* Drag handle (visible when dragging) */}
          {isDragging && (
            <motion.div
              className="absolute top-1/2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2 shadow-lg border-2 border-pink-500"
              style={{
                left: `${progress}%`,
                marginLeft: '-8px'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}