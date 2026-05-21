import { apiClient } from './axios';
import { ApiRoute } from '@/services/api';

export interface Exam {
  id:          string;
  code:        string;
  label:       string;
  description: string | null;
  isActive:    boolean;
  archivedAt:  string | null;
  createdAt:   string;
  users:       number;
  subjects:    number;
  topics:      number;
}

export interface CreateExamDto {
  code:         string;
  label:        string;
  description?: string;
  isActive?:    boolean;
}

export interface UpdateExamDto {
  label?:       string;
  description?: string;
  isActive?:    boolean;
}

export const examsApi = {
  list: async (includeArchived = false): Promise<Exam[]> => {
    const { data } = await apiClient.get<Exam[]>(ApiRoute.EXAMS, { params: { includeArchived } });
    return data;
  },
  detail: async (id: string): Promise<Exam & { counts: { userExams: number; subjectExams: number; topicExams: number; questionExams: number } }> => {
    const { data } = await apiClient.get(`${ApiRoute.EXAMS}/${id}`);
    return data;
  },
  create:    (dto: CreateExamDto)                    => apiClient.post<Exam>(ApiRoute.EXAMS, dto).then(r => r.data),
  update:    (id: string, dto: UpdateExamDto)        => apiClient.patch<Exam>(`${ApiRoute.EXAMS}/${id}`, dto).then(r => r.data),
  archive:   (id: string)                            => apiClient.delete(`${ApiRoute.EXAMS}/${id}`).then(r => r.data),
  unarchive: (id: string)                            => apiClient.post(`${ApiRoute.EXAMS}/${id}/unarchive`).then(r => r.data),
};
