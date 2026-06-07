export const adKeys = {
  all: ['ads'] as const,
  lists: () => [...adKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...adKeys.lists(), filters] as const,
  details: () => [...adKeys.all, 'detail'] as const,
  detail: (slug: string) => [...adKeys.details(), slug] as const,
  infinite: (filters?: Record<string, any>) => ['ads', 'infinite', filters] as const,
  homepage: () => ['ads', 'homepage'] as const,
  trending: () => ['ads', 'trending'] as const,
  boosted: () => ['ads', 'boosted'] as const,
  search: (query?: string) => ['ads', 'search', query] as const,
  similar: (adId: string | number) => ['ads', 'similar', adId] as const,
  user: (userId: string | number) => ['ads', 'user', userId] as const,
  admin: (filters?: Record<string, any>) => ['ads', 'admin', filters] as const,
  dashboard: () => ['ads', 'dashboard'] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
  detail: (slug: string) => [...categoryKeys.all, 'detail', slug] as const,
};

export const locationKeys = {
  all: ['locations'] as const,
  list: () => [...locationKeys.all, 'list'] as const,
};

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
};

export const messageKeys = {
  all: ['messages'] as const,
  conversations: () => [...messageKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...messageKeys.all, 'conversation', id] as const,
};

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  users: (filters?: Record<string, any>) => [...adminKeys.all, 'users', filters] as const,
  payments: (filters?: Record<string, any>) => [...adminKeys.all, 'payments', filters] as const,
  boosts: (filters?: Record<string, any>) => [...adminKeys.all, 'boosts', filters] as const,
  reports: (filters?: Record<string, any>) => [...adminKeys.all, 'reports', filters] as const,
  moderation: (filters?: Record<string, any>) => [...adminKeys.all, 'moderation', filters] as const,
};

export const userKeys = {
  all: ['users'] as const,
  profile: (id: string | number) => [...userKeys.all, 'profile', id] as const,
  store: (id: string | number) => [...userKeys.all, 'store', id] as const,
  favorites: (userId: string | number) => [...userKeys.all, 'favorites', userId] as const,
};

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  analytics: () => [...dashboardKeys.all, 'analytics'] as const,
};
