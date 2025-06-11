'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VideoContextType {
  isMuted: boolean;
  toggleMute: () => void;
  currentVideoIndex: number;
  setCurrentVideoIndex: (index: number) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    const savedMuteState = localStorage.getItem('video-muted');
    if (savedMuteState) {
      setIsMuted(savedMuteState === 'true');
    }
  }, []);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('video-muted', newMutedState.toString());
  };

  return (
    <VideoContext.Provider value={{ 
      isMuted, 
      toggleMute,
      currentVideoIndex,
      setCurrentVideoIndex
    }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
}