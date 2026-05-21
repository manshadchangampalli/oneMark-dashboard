import { apiClient } from './axios';
import { ApiRoute } from '@/services/api';

export interface Topic {
  id:            string;
  code:          string;
  label:         string;
  sortOrder:     number;
  questionCount: number;
  archivedAt:    string | null;
  createdAt:     string;
  subject:       { id: string; label: string; colorHex: string };
  questions:     number;
  exams:         number;
}

export interface CreateTopicDto {
  subjectId:  string;
  code:       string;
  label:      string;
  sortOrder?: number;
}

export interface UpdateTopicDto {
  label?:     string;
  sortOrder?: number;
}

export const topicsApi = {
  list: async (params: { subjectId?: string; includeArchived?: boolean } = {}): Promise<Topic[]> => {
    const { data } = await apiClient.get<Topic[]>(ApiRoute.TOPICS, { params });
    return data;
  },
  detail: async (id: string): Promise<Topic & { counts: any }> => {
    const { data } = await apiClient.get(`${ApiRoute.TOPICS}/${id}`);
    return data;
  },
  create:    (dto: CreateTopicDto)                => apiClient.post<Topic>(ApiRoute.TOPICS, dto).then(r => r.data),
  update:    (id: string, dto: UpdateTopicDto)    => apiClient.patch<Topic>(`${ApiRoute.TOPICS}/${id}`, dto).then(r => r.data),
  archive:   (id: string)                         => apiClient.delete(`${ApiRoute.TOPICS}/${id}`).then(r => r.data),
  unarchive: (id: string)                         => apiClient.post(`${ApiRoute.TOPICS}/${id}/unarchive`).then(r => r.data),
};
