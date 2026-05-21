import { apiClient } from './axios';
import { ApiRoute } from '@/services/api';

export interface Subject {
  id:         string;
  code:       string;
  label:      string;
  short:      string;
  colorHex:   string;
  sortOrder:  number;
  archivedAt: string | null;
  createdAt:  string;
  topics:     number;
  questions:  number;
  exams:      number;
}

export interface CreateSubjectDto {
  code:       string;
  label:      string;
  short:      string;
  colorHex:   string;
  sortOrder?: number;
}

export interface UpdateSubjectDto {
  label?:     string;
  short?:     string;
  colorHex?:  string;
  sortOrder?: number;
}

export const subjectsApi = {
  list: async (includeArchived = false): Promise<Subject[]> => {
    const { data } = await apiClient.get<Subject[]>(ApiRoute.SUBJECTS, { params: { includeArchived } });
    return data;
  },
  create:    (dto: CreateSubjectDto)                  => apiClient.post<Subject>(ApiRoute.SUBJECTS, dto).then(r => r.data),
  update:    (id: string, dto: UpdateSubjectDto)      => apiClient.patch<Subject>(`${ApiRoute.SUBJECTS}/${id}`, dto).then(r => r.data),
  archive:   (id: string)                             => apiClient.delete(`${ApiRoute.SUBJECTS}/${id}`).then(r => r.data),
  unarchive: (id: string)                             => apiClient.post(`${ApiRoute.SUBJECTS}/${id}/unarchive`).then(r => r.data),
};
