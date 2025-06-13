'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Eye, Clock, Share2, BarChart3 } from 'lucide-react';

interface TrendingVideo {
  id: string;
  title: string;
  views: number;
  viewsChange: number;
  shares: number;
  avgWatchTime: number;
  trendingRank: number;
  previousRank: number;
  thumbnail?: string;
}

export default function TrendingPage() {
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchTrendingVideos();
  }, [timeRange]);
  
  const fetchTrendingVideos = async () => {
    setIsLoading(true);
    try {
      // Mock data
      const mockVideos: TrendingVideo[] = [
        {
          id: '1',
          title: 'Trending Video 1',
          views: 125432,
          viewsChange: 45.2,
          shares: 3421,
          avgWatchTime: 0.92,
          trendingRank: 1,
          previousRank: 3,
        },
        {
          id: '2',
          title: 'Viral Video 2',
          views: 98234,
          viewsChange: 38.7,
          shares: 2893,
          avgWatchTime: 0.88,
          trendingRank: 2,
          previousRank: 5,
        },
        {
          id: '3',
          title: 'Popular Video 3',
          views: 87654,
          viewsChange: -12.3,
          shares: 2145,
          avgWatchTime: 0.76,
          trendingRank: 3,
          previousRank: 1,
        },
        {
          id: '4',
          title: 'Rising Video 4',
          views: 76543,
          viewsChange: 28.9,
          shares: 1876,
          avgWatchTime: 0.84,
          trendingRank: 4,
          previousRank: 8,
        },
        {
          id: '5',
          title: 'Hot Video 5',
          views: 65432,
          viewsChange: 15.4,
          shares: 1543,
          avgWatchTime: 0.79,
          trendingRank: 5,
          previousRank: 6,
        },
      ];
      setVideos(mockVideos);
    } catch (error) {
      console.error('Failed to fetch trending videos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  const getRankChange = (current: number, previous: number) => {
    if (current === previous) return { icon: null, color: 'text-gray-400', text: '-' };
    if (current < previous) {
      return { 
        icon: <TrendingUp className="w-4 h-4" />, 
        color: 'text-green-400', 
        text: `+${previous - current}` 
      };
    }
    return { 
      icon: <TrendingDown className="w-4 h-4" />, 
      color: 'text-red-400', 
      text: `-${current - previous}` 
    };
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading trending videos...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Trending Now</h1>
          <p className="text-gray-400 mt-1">Top performing videos in real-time</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-pink-500"
        >
          <option value="1h">Last hour</option>
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
        </select>
      </div>
      
      {/* Trending Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-pink-500 to-red-500 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-white/80" />
            <span className="text-white/80 text-sm">+23.5%</span>
          </div>
          <h3 className="text-white/80 text-sm font-medium">Total Trending Views</h3>
          <p className="text-3xl font-bold text-white mt-1">2.4M</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Share2 className="w-8 h-8 text-blue-500" />
            <span className="text-green-400 text-sm">+15.2%</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Total Shares</h3>
          <p className="text-3xl font-bold text-white mt-1">18.7K</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-purple-500" />
            <span className="text-green-400 text-sm">+8.9%</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Avg Watch Time</h3>
          <p className="text-3xl font-bold text-white mt-1">85%</p>
        </div>
      </div>
      
      {/* Trending Videos List */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Top Trending Videos</h2>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {videos.map((video) => {
            const rankChange = getRankChange(video.trendingRank, video.previousRank);
            
            return (
              <div key={video.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                      video.trendingRank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                      video.trendingRank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                      video.trendingRank === 3 ? 'bg-gradient-to-br from-orange-600 to-orange-800 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {video.trendingRank}
                    </div>
                    <div className={`flex items-center gap-1 mt-2 justify-center ${rankChange.color}`}>
                      {rankChange.icon}
                      <span className="text-xs font-medium">{rankChange.text}</span>
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-lg mb-2">{video.title}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          Views
                        </p>
                        <p className="text-white font-medium">{formatNumber(video.views)}</p>
                        <p className={`text-sm ${video.viewsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {video.viewsChange >= 0 ? '+' : ''}{video.viewsChange}%
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <Share2 className="w-4 h-4" />
                          Shares
                        </p>
                        <p className="text-white font-medium">{formatNumber(video.shares)}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Watch Time
                        </p>
                        <p className="text-white font-medium">{Math.round(video.avgWatchTime * 100)}%</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm">Performance</p>
                        <div className="mt-1">
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-pink-500 to-red-500 h-full rounded-full"
                              style={{ width: `${video.avgWatchTime * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}