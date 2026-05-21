import { apiClient } from './axios';

export interface AdminStats {
  totalQuestions: number;
  totalUsers:     number;
  totalExams:     number;
  totalSessions:  number;
}

export const statsApi = {
  get: async (): Promise<AdminStats> => {
    const { data } = await apiClient.get<AdminStats>('/admin/stats');
    return data;
  },
};
