import { apiClient } from './axios';
import { ApiRoute } from '@/services/api';
import type { AdminUser, AuthTokens, LoginDto } from '@/types/auth';

export const adminAuthApi = {
  login: async (dto: LoginDto): Promise<AuthTokens> => {
    const { data } = await apiClient.post<AuthTokens>(ApiRoute.LOGIN, dto);
    return data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post(ApiRoute.LOGOUT);
  },
  getMe: async (): Promise<AdminUser> => {
    const { data } = await apiClient.get<AdminUser>(ApiRoute.ME);
    return data;
  },
};
