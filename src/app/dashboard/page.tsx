'use client';

import Link from 'next/link';

// Icons
const AdIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

// Mock statistics data
const stats = [
  {
    title: 'Active Ads',
    value: '12',
    change: '+2 this month',
    changeType: 'positive',
    icon: AdIcon,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    href: '/dashboard/my-ads?status=active',
  },
  {
    title: 'Pending Ads',
    value: '3',
    change: 'Awaiting approval',
    changeType: 'neutral',
    icon: ClockIcon,
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    href: '/dashboard/my-ads?status=pending',
  },
  {
    title: 'Sold Ads',
    value: '28',
    change: '+5 this month',
    changeType: 'positive',
    icon: CheckCircleIcon,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    href: '/dashboard/my-ads?status=sold',
  },
  {
    title: 'Total Messages',
    value: '45',
    change: '12 unread',
    changeType: 'warning',
    icon: MessageIcon,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    href: '/dashboard/messages',
  },
  {
    title: 'Total Favorites',
    value: '18',
    change: '3 new this week',
    changeType: 'positive',
    icon: HeartIcon,
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    href: '/dashboard/favorites',
  },
];

// Quick actions
const quickActions = [
  {
    title: 'Post New Ad',
    description: 'List your item for sale',
    href: '/dashboard/post-ad',
    icon: PlusIcon,
    buttonText: 'Create Ad',
    buttonVariant: 'primary',
  },
  {
    title: 'View Messages',
    description: 'Check your inbox',
    href: '/dashboard/messages',
    icon: MessageIcon,
    buttonText: 'Open Messages',
    buttonVariant: 'outline',
  },
  {
    title: 'Manage Ads',
    description: 'Edit or delete listings',
    href: '/dashboard/my-ads',
    icon: AdIcon,
    buttonText: 'View All Ads',
    buttonVariant: 'outline',
  },
];

// Recent activity mock data
const recentActivity = [
  {
    id: 1,
    type: 'message',
    title: 'New message about iPhone 13 Pro',
    description: 'John Smith asked about the condition',
    time: '2 hours ago',
    icon: MessageIcon,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: 2,
    type: 'ad_approved',
    title: 'Your ad has been approved',
    description: 'MacBook Pro 2021 is now live',
    time: '5 hours ago',
    icon: CheckCircleIcon,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 3,
    type: 'view',
    title: 'Your ad got 50 new views',
    description: 'Samsung Galaxy S21 Ultra',
    time: '1 day ago',
    icon: EyeIcon,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 4,
    type: 'favorite',
    title: 'Someone saved your ad',
    description: 'Sony PlayStation 5',
    time: '2 days ago',
    icon: HeartIcon,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 sm:p-8 text-white">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, John!</h2>
        <p className="text-primary-100">Here's what's happening with your listings today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Link
            key={index}
            href={stat.href}
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className={`text-xs ${
              stat.changeType === 'positive' ? 'text-green-600' :
              stat.changeType === 'warning' ? 'text-yellow-600' :
              'text-gray-500'
            }`}>
              {stat.change}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {quickActions.map((action, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gray-100">
                <action.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </div>
            <Link
              href={action.href}
              className={`inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                action.buttonVariant === 'primary'
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              {action.buttonText}
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${activity.iconBg}`}>
                <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</p>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <Link
            href="/dashboard/notifications"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all activity →
          </Link>
        </div>
      </div>
    </div>
  );
}