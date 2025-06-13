'use client';

import { useState, useEffect } from 'react';
import { Eye, Users, TrendingUp, Clock, Play, BarChart, Activity } from 'lucide-react';

interface VideoStats {
  id: string;
  title: string;
  views: number;
  viewsToday: number;
  viewsChange: number;
  avgWatchTime: number;
}

interface DashboardStats {
  totalViews: number;
  totalViewsToday: number;
  activeUsers: number;
  avgSessionDuration: number;
  topVideos: VideoStats[];
  recentActivity: Array<{
    time: string;
    action: string;
    details: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);
  
  const fetchStats = async () => {
    try {
      // In production, this would fetch from your API
      // For now, using mock data
      const mockStats: DashboardStats = {
        totalViews: 125847,
        totalViewsToday: 8432,
        activeUsers: 342,
        avgSessionDuration: 485, // seconds
        topVideos: [
          { id: '1', title: 'Sample Video 1', views: 45821, viewsToday: 2341, viewsChange: 15.2, avgWatchTime: 0.85 },
          { id: '2', title: 'Sample Video 2', views: 38294, viewsToday: 1892, viewsChange: -5.3, avgWatchTime: 0.72 },
          { id: '3', title: 'Sample Video 3', views: 29473, viewsToday: 1576, viewsChange: 8.7, avgWatchTime: 0.91 },
          { id: '4', title: 'Sample Video 4', views: 24918, viewsToday: 1423, viewsChange: 12.1, avgWatchTime: 0.68 },
          { id: '5', title: 'Sample Video 5', views: 18247, viewsToday: 892, viewsChange: -2.8, avgWatchTime: 0.79 },
        ],
        recentActivity: [
          { time: '2 min ago', action: 'Video viewed', details: 'Sample Video 1' },
          { time: '5 min ago', action: 'New user', details: 'User from United States' },
          { time: '8 min ago', action: 'Video shared', details: 'Sample Video 3' },
          { time: '12 min ago', action: 'Video viewed', details: 'Sample Video 2' },
          { time: '15 min ago', action: 'Session started', details: '5 new sessions' },
        ],
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load analytics</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Analytics Overview</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-pink-500"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Eye className="w-8 h-8 text-pink-500" />
            <span className="text-green-400 text-sm font-medium">+12.5%</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Total Views</h3>
          <p className="text-2xl font-bold text-white mt-1">{formatNumber(stats.totalViews)}</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-green-400 text-sm font-medium">+8.3%</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Views Today</h3>
          <p className="text-2xl font-bold text-white mt-1">{formatNumber(stats.totalViewsToday)}</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-500" />
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Active Users</h3>
          <p className="text-2xl font-bold text-white mt-1">{stats.activeUsers}</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-purple-500" />
            <span className="text-gray-400 text-sm">avg</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Session Duration</h3>
          <p className="text-2xl font-bold text-white mt-1">{formatDuration(stats.avgSessionDuration)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Videos */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Top Performing Videos</h2>
            <BarChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats.topVideos.map((video, index) => (
              <div key={video.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{video.title}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-gray-400 text-sm">
                        <Eye className="w-4 h-4 inline mr-1" />
                        {formatNumber(video.views)}
                      </span>
                      <span className="text-gray-400 text-sm">
                        <Play className="w-4 h-4 inline mr-1" />
                        {Math.round(video.avgWatchTime * 100)}% watched
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{formatNumber(video.viewsToday)}</p>
                  <p className={`text-sm ${video.viewsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {video.viewsChange >= 0 ? '+' : ''}{video.viewsChange}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.action}</p>
                  <p className="text-gray-400 text-xs mt-1">{activity.details}</p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}