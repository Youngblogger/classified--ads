'use client';

import { useState } from 'react';
import { Smartphone, Monitor, Globe, Clock, Shield, AlertTriangle, CheckCircle, XCircle, Trash2, LogOut } from 'lucide-react';

interface Session {
  id: string;
  device: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  ip: string;
  location: string;
  last_active: string;
  current: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  details: string;
  ip: string;
  device: string;
  timestamp: string;
  type: 'login' | 'logout' | 'password_change' | 'profile_update' | 'security_change' | 'suspicious';
}

const MOCK_SESSIONS: Session[] = [
  { id: '1', device: 'Windows PC', device_type: 'desktop', browser: 'Chrome 124', os: 'Windows 11', ip: '102.89.22.1', location: 'Lagos, NG', last_active: 'Now', current: true },
  { id: '2', device: 'iPhone 15', device_type: 'mobile', browser: 'Safari', os: 'iOS 17.4', ip: '102.89.22.1', location: 'Lagos, NG', last_active: '2 hours ago', current: false },
  { id: '3', device: 'MacBook Pro', device_type: 'desktop', browser: 'Firefox 125', os: 'macOS 14.4', ip: '197.210.28.4', location: 'Abuja, NG', last_active: '3 days ago', current: false },
];

const MOCK_AUDIT: AuditLog[] = [
  { id: 'a1', action: 'Login', details: 'Successful login from Chrome on Windows', ip: '102.89.22.1', device: 'Chrome / Windows', timestamp: '2 minutes ago', type: 'login' },
  { id: 'a2', action: 'Profile Update', details: 'Changed profile photo', ip: '102.89.22.1', device: 'Chrome / Windows', timestamp: '1 hour ago', type: 'profile_update' },
  { id: 'a3', action: 'Password Change', details: 'Password was changed', ip: '102.89.22.1', device: 'Chrome / Windows', timestamp: '1 week ago', type: 'password_change' },
  { id: 'a4', action: 'Login', details: 'Successful login from Safari on iPhone', ip: '102.89.22.1', device: 'Safari / iOS', timestamp: '2 weeks ago', type: 'login' },
  { id: 'a5', action: 'Suspicious Login', details: 'Login attempt from unrecognized device (Firefox, Abuja)', ip: '197.210.28.4', device: 'Firefox / macOS', timestamp: '3 days ago', type: 'suspicious' },
];

function getDeviceIcon(type: string) {
  if (type === 'mobile') return Smartphone;
  return Monitor;
}

function getAuditIcon(type: string) {
  switch (type) {
    case 'login': return LogOut;
    case 'logout': return LogOut;
    case 'password_change': return Shield;
    case 'profile_update': return CheckCircle;
    case 'security_change': return Shield;
    case 'suspicious': return AlertTriangle;
    default: return Clock;
  }
}

function getAuditColor(type: string) {
  switch (type) {
    case 'login': return 'text-blue-500 bg-blue-50';
    case 'logout': return 'text-gray-500 bg-gray-50';
    case 'password_change': return 'text-purple-500 bg-purple-50';
    case 'profile_update': return 'text-green-500 bg-green-50';
    case 'security_change': return 'text-amber-500 bg-amber-50';
    case 'suspicious': return 'text-red-500 bg-red-50';
    default: return 'text-gray-500 bg-gray-50';
  }
}

export function DeviceSessions() {
  const [sessions] = useState<Session[]>(MOCK_SESSIONS);
  const [showLogoutAll, setShowLogoutAll] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-card p-8" role="region" aria-label="Active sessions and devices">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-purple-100 rounded-xl">
          <Smartphone className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
          <p className="text-sm text-gray-500">Devices logged into your account</p>
        </div>
      </div>

      <div className="space-y-3" role="list" aria-label="Active sessions">
        {sessions.map((s) => {
          const DeviceIcon = getDeviceIcon(s.device_type);
          return (
            <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl" role="listitem">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <DeviceIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{s.device}</p>
                    {s.current && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">Current</span>}
                  </div>
                  <p className="text-xs text-gray-500">{s.browser} on {s.os}</p>
                  <p className="text-xs text-gray-400">IP: {s.ip} · {s.location} · {s.last_active}</p>
                </div>
              </div>
              {!s.current && (
                <button
                  className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  aria-label={`Logout from ${s.device}`}
                >
                  Logout
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setShowLogoutAll(true)}
          className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout from all devices
        </button>
        <p className="text-xs text-gray-400">{sessions.length} active session{sessions.length !== 1 ? 's' : ''}</p>
      </div>

      {showLogoutAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-label="Confirm logout all devices">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">Logout from all devices?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">This will sign out all sessions except your current one. You&apos;ll need to log in again on each device.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutAll(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowLogoutAll(false)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">Logout All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AuditLogs() {
  const [logs] = useState<AuditLog[]>(MOCK_AUDIT);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  return (
    <div className="bg-white rounded-2xl shadow-card p-8" role="region" aria-label="Security audit logs">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-amber-100 rounded-xl">
          <Shield className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Audit Log</h3>
          <p className="text-sm text-gray-500">Recent security events on your account</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto" role="tablist" aria-label="Audit log filters">
        {['all', 'login', 'password_change', 'profile_update', 'suspicious'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            role="tab"
            aria-selected={filter === f}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="space-y-2" role="list" aria-label="Audit log entries">
        {filtered.map((log) => {
          const Icon = getAuditIcon(log.type);
          const colorClass = getAuditColor(log.type);
          return (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors" role="listitem">
              <div className={`p-1.5 rounded-lg ${colorClass} flex-shrink-0 mt-0.5`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">{log.action}</p>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                    log.type === 'suspicious' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>{log.type.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{log.details}</p>
                <p className="text-xs text-gray-400 mt-0.5">IP: {log.ip} · {log.device} · {log.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Shield className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-medium">No events found</p>
        </div>
      )}
    </div>
  );
}

export function FingerprintInfo() {
  return (
    <div className="bg-white rounded-2xl shadow-card p-8" role="region" aria-label="Device fingerprinting information">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-indigo-100 rounded-xl">
          <Globe className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Device Fingerprinting</h3>
          <p className="text-sm text-gray-500">Your device is recognized for security</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">Browser</p>
          <p className="font-medium text-gray-900">{typeof navigator !== 'undefined' ? navigator.userAgent.match(/Chrome|Firefox|Safari|Edge/i)?.[0] || 'Unknown' : '—'}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">Platform</p>
          <p className="font-medium text-gray-900">{typeof navigator !== 'undefined' ? navigator.platform || '—' : '—'}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">Language</p>
          <p className="font-medium text-gray-900">{typeof navigator !== 'undefined' ? navigator.language || '—' : '—'}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">Timezone</p>
          <p className="font-medium text-gray-900">{typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || '—' : '—'}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">This information is used to detect unrecognized login attempts and protect your account.</p>
    </div>
  );
}
