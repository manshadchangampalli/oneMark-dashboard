import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { ApiRoute } from '@/services/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single-flight refresh so concurrent 401s don't trigger multiple refresh calls
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const { data } = await axios.post<{ accessToken: string }>(
        `${BASE_URL}${ApiRoute.REFRESH}`,
        {},
        { withCredentials: true },
      );
      useAuthStore.getState().setToken(data.accessToken);
      return data.accessToken;
    } catch {
      useAuthStore.getState().clear();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't try to refresh on auth endpoints themselves
    const isAuthCall =
      original?.url?.includes(ApiRoute.LOGIN) ||
      original?.url?.includes(ApiRoute.REFRESH) ||
      original?.url?.includes(ApiRoute.LOGOUT);

    if (error.response?.status === 401 && !original._retry && !isAuthCall) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
    }
    return Promise.reject(error);
  },
);
