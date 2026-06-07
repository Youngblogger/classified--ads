
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface HttpClientResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('user-auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token || null;
    }
  } catch {}
  const token = localStorage.getItem('authToken');
  if (token) return token;
  return document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1') || null;
}

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token') || null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function request<T = any>(
  method: HttpMethod,
  pathOrUrl: string,
  body?: any,
  config?: RequestConfig,
): Promise<HttpClientResponse<T>> {
  const isFullUrl = pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://');
  let url = isFullUrl ? pathOrUrl : `${BASE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;

  if (config?.params) {
    const qs = Object.entries(config.params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...config?.headers,
  };

  const token = pathOrUrl.includes('secure-control-9ja') ? getAdminToken() : getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    signal: config?.signal,
  };

  if (body !== undefined) {
    if (body instanceof FormData) {
      fetchOptions.body = body;
    } else {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    }
  }

  const controller = new AbortController();
  const timeoutId = config?.timeout
    ? setTimeout(() => controller.abort(), config.timeout)
    : null;

  if (config?.signal) {
    config.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });

    clearTimeout(timeoutId as any);

    let data: any;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => { headersObj[key] = value; });

    if (response.status === 401 && !url.includes('notifications')) {
      // Don't clear auth here — the AuthProvider and Zustand persist handle
      // token validity via JWT expiry validation. Destructive logout on every
      // 401 creates an auth bounce cycle (dashboard loads -> API 401 -> clear
      // auth -> guest page -> reload -> same cycle). Just let the error
      // propagate to the caller and let the auth system decide what to do.
    }

    return {
      data: data ?? null,
      status: response.status,
      statusText: response.statusText,
      headers: headersObj,
    };
  } catch (error: any) {
    clearTimeout(timeoutId as any);
    if (error.name === 'AbortError') {
      return { data: null as T, status: 0, statusText: 'Request aborted', headers: {} };
    }
    return {
      data: (error?.response || null) as T,
      status: error?.status || 0,
      statusText: error?.message || 'Network error',
      headers: {},
    };
  }
}

export const http = {
  get<T = any>(url: string, config?: RequestConfig): Promise<HttpClientResponse<T>> {
    return request<T>('GET', url, undefined, config);
  },

  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<HttpClientResponse<T>> {
    return request<T>('POST', url, data, config);
  },

  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<HttpClientResponse<T>> {
    return request<T>('PUT', url, data, config);
  },

  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<HttpClientResponse<T>> {
    return request<T>('PATCH', url, data, config);
  },

  delete<T = any>(url: string, config?: RequestConfig): Promise<HttpClientResponse<T>> {
    return request<T>('DELETE', url, undefined, config);
  },

  async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (pct: number) => void,
    timeoutOverride?: number,
  ): Promise<HttpClientResponse<T>> {
    if (typeof XMLHttpRequest !== 'undefined') {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`);

        const token = url.includes('secure-control-9ja') ? getAdminToken() : getAuthToken();
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({ data: data as T, status: xhr.status, statusText: xhr.statusText, headers: {} });
          } catch {
            resolve({ data: xhr.responseText as T, status: xhr.status, statusText: xhr.statusText, headers: {} });
          }
        };

        xhr.onerror = () => {
          resolve({ data: null as T, status: 0, statusText: 'Network error', headers: {} });
        };

        xhr.timeout = timeoutOverride || 30000;
        xhr.ontimeout = () => {
          resolve({ data: null as T, status: 0, statusText: 'Timeout', headers: {} });
        };

        xhr.send(formData);
      });
    }

    return request<T>('POST', url, formData, { timeout: timeoutOverride || 30000 });
  },
};

export default http;
