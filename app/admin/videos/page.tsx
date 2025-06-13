'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, Edit2, MoreVertical } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  src: string;
  uploadDate: string;
  views: number;
  duration: number;
  status: 'active' | 'inactive' | 'pending';
}

export default function VideosManagement() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchVideos();
  }, []);
  
  const fetchVideos = async () => {
    try {
      // Mock data for now
      const mockVideos: Video[] = [
        {
          id: '1',
          title: 'Sample Video 1',
          src: 'https://example.com/video1.mp4',
          uploadDate: '2024-01-15',
          views: 45821,
          duration: 120,
          status: 'active',
        },
        {
          id: '2',
          title: 'Sample Video 2',
          src: 'https://example.com/video2.mp4',
          uploadDate: '2024-01-14',
          views: 38294,
          duration: 95,
          status: 'active',
        },
        {
          id: '3',
          title: 'Sample Video 3',
          src: 'https://example.com/video3.mp4',
          uploadDate: '2024-01-13',
          views: 29473,
          duration: 180,
          status: 'inactive',
        },
      ];
      setVideos(mockVideos);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectVideo = (videoId: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };
  
  const handleSelectAll = () => {
    if (selectedVideos.size === filteredVideos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(filteredVideos.map(v => v.id)));
    }
  };
  
  const handleDeleteVideo = async (videoId: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      // In production, make API call to delete
      setVideos(videos.filter(v => v.id !== videoId));
    }
  };
  
  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedVideos.size} videos?`)) {
      // In production, make API call to delete multiple videos
      setVideos(videos.filter(v => !selectedVideos.has(v.id)));
      setSelectedVideos(new Set());
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
  
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || video.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading videos...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Video Management</h1>
      
      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            
            {selectedVideos.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedVideos.size})
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Videos Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedVideos.size === filteredVideos.length && filteredVideos.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-600 text-pink-500 focus:ring-pink-500"
                  />
                </th>
                <th className="p-4 text-left text-gray-400 font-medium">Title</th>
                <th className="p-4 text-left text-gray-400 font-medium">Status</th>
                <th className="p-4 text-left text-gray-400 font-medium">Views</th>
                <th className="p-4 text-left text-gray-400 font-medium">Duration</th>
                <th className="p-4 text-left text-gray-400 font-medium">Upload Date</th>
                <th className="p-4 text-left text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredVideos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-700 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedVideos.has(video.id)}
                      onChange={() => handleSelectVideo(video.id)}
                      className="rounded border-gray-600 text-pink-500 focus:ring-pink-500"
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{video.title}</p>
                      <p className="text-gray-400 text-sm mt-1 truncate max-w-xs">{video.src}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      video.status === 'active' 
                        ? 'bg-green-500/20 text-green-400'
                        : video.status === 'inactive'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {video.status}
                    </span>
                  </td>
                  <td className="p-4 text-white">{formatNumber(video.views)}</td>
                  <td className="p-4 text-white">{formatDuration(video.duration)}</td>
                  <td className="p-4 text-white">{video.uploadDate}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}