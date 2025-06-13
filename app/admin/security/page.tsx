'use client';

import { useState } from 'react';
import { Shield, Key, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface SecurityLog {
  id: string;
  timestamp: string;
  event: string;
  ip: string;
  status: 'success' | 'warning' | 'error';
  details: string;
}

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const [logs] = useState<SecurityLog[]>([
    {
      id: '1',
      timestamp: '2024-01-15 14:32:21',
      event: 'Admin Login',
      ip: '192.168.1.1',
      status: 'success',
      details: 'Successful admin authentication',
    },
    {
      id: '2',
      timestamp: '2024-01-15 13:45:10',
      event: 'Failed Login Attempt',
      ip: '203.45.67.89',
      status: 'error',
      details: 'Invalid password attempt',
    },
    {
      id: '3',
      timestamp: '2024-01-15 12:20:34',
      event: 'Directory Scan Blocked',
      ip: '45.67.89.123',
      status: 'warning',
      details: 'Attempted access to /wp-admin',
    },
    {
      id: '4',
      timestamp: '2024-01-15 11:15:45',
      event: 'API Rate Limit',
      ip: '123.45.67.89',
      status: 'warning',
      details: 'Exceeded API rate limit',
    },
  ]);
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // In production, make API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const getStatusIcon = (status: SecurityLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Security Settings</h1>
      
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-green-500" />
            <span className="text-green-400 text-sm font-medium">Secure</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Security Status</h3>
          <p className="text-2xl font-bold text-white mt-1">Protected</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <span className="text-yellow-400 text-sm font-medium">3 attempts</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Failed Logins (24h)</h3>
          <p className="text-2xl font-bold text-white mt-1">3</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
            <span className="text-red-400 text-sm font-medium">12 blocked</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Blocked Requests (24h)</h3>
          <p className="text-2xl font-bold text-white mt-1">12</p>
        </div>
      </div>
      
      {/* Change Password */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-bold text-white">Change Admin Password</h2>
        </div>
        
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
              required
              minLength={8}
            />
          </div>
          
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
              required
              minLength={8}
            />
          </div>
          
          {passwordError && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
              <p className="text-red-500 text-sm">{passwordError}</p>
            </div>
          )}
          
          {passwordSuccess && (
            <div className="bg-green-500/10 border border-green-500 rounded-lg p-3">
              <p className="text-green-500 text-sm">{passwordSuccess}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isChangingPassword && <RefreshCw className="w-4 h-4 animate-spin" />}
            {isChangingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
      
      {/* Security Logs */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Security Events</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-left border-b border-gray-700">
              <tr>
                <th className="pb-3 text-gray-400 font-medium">Time</th>
                <th className="pb-3 text-gray-400 font-medium">Event</th>
                <th className="pb-3 text-gray-400 font-medium">IP Address</th>
                <th className="pb-3 text-gray-400 font-medium">Status</th>
                <th className="pb-3 text-gray-400 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-3 text-white text-sm">{log.timestamp}</td>
                  <td className="py-3 text-white">{log.event}</td>
                  <td className="py-3 text-gray-300 font-mono text-sm">{log.ip}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className={`text-sm capitalize ${
                        log.status === 'success' ? 'text-green-400' :
                        log.status === 'warning' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-400 text-sm">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}