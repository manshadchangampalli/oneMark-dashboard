import { apiClient } from './axios';
import { ApiRoute } from '@/services/api';

export interface UserListItem {
  id:            string;
  email:         string | null;
  name:          string;
  targetExam:    string | null;
  totalXp:       number;
  totalAttempts: number;
  totalCorrect:  number;
  accuracy:      number | null;
  isSuspended:   boolean;
  createdAt:     string;
  lastActiveAt:  string | null;
}

export interface UserListPage {
  data:       UserListItem[];
  nextCursor: string | null;
}

export interface UserDetail {
  id:              string;
  email:           string | null;
  name:            string;
  avatarInitial:   string | null;
  school:          string | null;
  grade:           string | null;
  targetExam:      string | null;
  state:           string | null;
  district:        string | null;
  totalXp:         number;
  totalAttempts:   number;
  totalCorrect:    number;
  accuracy:        number | null;
  lastActiveAt:    string | null;
  emailVerifiedAt: string | null;
  isSuspended:     boolean;
  role:            string;
  createdAt:       string;
  exams:           { id: string; code: string; label: string; isPrimary: boolean }[];
}

export interface ListUsersParams {
  search?:    string;
  suspended?: boolean;
  limit?:     number;
  cursor?:    string;
}

export const usersApi = {
  list: async (params: ListUsersParams = {}): Promise<UserListPage> => {
    const { data } = await apiClient.get<UserListPage>(ApiRoute.USERS, { params });
    return data;
  },
  detail: async (id: string): Promise<UserDetail> => {
    const { data } = await apiClient.get<UserDetail>(`${ApiRoute.USERS}/${id}`);
    return data;
  },
};
