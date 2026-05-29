export function safeArray<T>(value: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(value)) return value;
  return fallback;
}

export function safeObject<T extends Record<string, unknown>>(value: unknown, fallback: T = {} as T): T {
  if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)) {
    return value as T;
  }
  return fallback;
}

export function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  return fallback;
}

export function safeBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

export function apiData<T = unknown>(response: unknown): T | null {
  if (!response || typeof response !== 'object') return null;
  const res = response as Record<string, unknown>;
  if ('data' in res) {
    const innerData = res.data;
    if (innerData !== null && innerData !== undefined && typeof innerData === 'object' && 'data' in (innerData as Record<string, unknown>)) {
      return (innerData as Record<string, unknown>).data as T;
    }
    return innerData as T;
  }
  return null;
}

export function apiDataArray<T = unknown>(response: unknown): T[] {
  const d = apiData<T[]>(response);
  return safeArray(d);
}

export function unwrapResponse<T = unknown>(response: unknown): { data: T | null; status: number } {
  if (!response || typeof response !== 'object') return { data: null, status: 500 };
  const res = response as Record<string, unknown>;
  const status = typeof res.status === 'number' ? res.status : 200;
  const data = apiData<T>(response);
  return { data, status };
}

export function normalizeNotification(item: unknown) {
  const obj = safeObject(item as Record<string, unknown>);
  return {
    id: safeNumber(obj.id),
    type: safeString(obj.type),
    title: safeString(obj.title),
    message: safeString(obj.message),
    data: obj.data ?? null,
    is_read: safeBoolean(obj.is_read as boolean, !obj.read_at),
    read_at: safeString(obj.read_at as string) || null,
    created_at: safeString(obj.created_at as string),
    user_id: safeString(obj.user_id as string),
  };
}

export function normalizeNotificationArray(items: unknown) {
  let arr = items;
  if (arr && typeof arr === 'object' && !Array.isArray(arr)) {
    const obj = arr as Record<string, unknown>;
    if ('data' in obj) {
      const inner = obj.data;
      if (Array.isArray(inner)) arr = inner;
      else if (inner && typeof inner === 'object' && 'data' in (inner as Record<string, unknown>)) {
        arr = (inner as Record<string, unknown>).data;
      }
    }
  }
  return safeArray(arr).map(normalizeNotification);
}

export function safeSlice<T>(arr: T[] | undefined | null, start: number, end?: number): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.slice(start, end ?? arr.length);
}

export function safeMap<T, R>(arr: T[] | undefined | null, fn: (item: T, index: number) => R): R[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(fn);
}

export function safeFilter<T>(arr: T[] | undefined | null, fn: (item: T, index: number) => boolean): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter(fn);
}

export function safeReduce<T, R>(arr: T[] | undefined | null, fn: (acc: R, item: T, index: number) => R, initial: R): R {
  if (!Array.isArray(arr)) return initial;
  return arr.reduce(fn, initial);
}
