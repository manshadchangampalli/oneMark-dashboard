import { apiClient } from './axios';
import { ApiRoute } from '@/services/api';

export interface QuestionListItem {
  id:            string;
  prompt:        string;
  version:       number | null;
  subject:       { id: string; label: string; colorHex: string };
  topic:         { id: string; label: string };
  difficulty:    'easy' | 'medium' | 'hard';
  status:        'draft' | 'published' | 'archived';
  xpReward:      number;
  successRate:   number | null;
  totalAttempts: number;
  createdAt:     string;
}

export interface QuestionListPage {
  data:       QuestionListItem[];
  nextCursor: string | null;
}

export interface QuestionDetail {
  id:             string;
  difficulty:     'easy' | 'medium' | 'hard';
  type:           string;
  status:         'draft' | 'published' | 'archived';
  xpReward:       number;
  successRate:    number | null;
  avgTimeSeconds: number | null;
  createdAt:      string;
  updatedAt:      string;
  subject:        { id: string; label: string; colorHex: string };
  topic:          { id: string; label: string };
  currentRevision: {
    id:                  string;
    version:             number;
    prompt:              string;
    correctOptionLabel:  string;
    officialExplanation: { steps: string[] } | null;
    difficulty:          string;
    xpReward:            number;
    createdAt:           string;
  } | null;
  options: { id: string; label: string; text: string; sub: string | null; sortOrder: number }[];
  exams:   { id: string; code: string; label: string }[];
  totalAttempts: number;
  revisionCount: number;
}

export interface ListQuestionsParams {
  subjectId?:  string;
  topicId?:    string;
  status?:     'draft' | 'published' | 'archived';
  difficulty?: 'easy' | 'medium' | 'hard';
  search?:     string;
  limit?:      number;
  cursor?:     string;
}

export interface CreateQuestionDto {
  subjectId:           string;
  topicId:             string;
  examIds:             string[];
  difficulty:          'easy' | 'medium' | 'hard';
  type?:               'mcq';
  status?:             'draft' | 'published';
  xpReward?:           number;
  prompt:              string;
  options:             { label: string; text: string; sub?: string | null }[];
  correctOptionLabel:  string;
  officialExplanation?: { steps: string[] } | null;
}

export interface BulkRowInput {
  subjectId?:           string;
  subjectCode?:         string;
  topicId?:             string;
  topicCode?:           string;
  examIds?:             string[];
  examCodes?:           string[];
  difficulty?:          'easy' | 'medium' | 'hard';
  type?:                'mcq';
  status?:              'draft' | 'published';
  xpReward?:            number;
  prompt?:              string;
  options?:             { label: string; text: string; sub?: string | null }[];
  correctOptionLabel?:  string;
  officialExplanation?: { steps: string[] } | null;
}

export interface BulkImportResult {
  total:     number;
  succeeded: number;
  failed:    number;
  rows: Array<
    | { index: number; ok: true;  questionId: string }
    | { index: number; ok: false; error: string }
  >;
}

export const questionsApi = {
  list: async (params: ListQuestionsParams = {}): Promise<QuestionListPage> => {
    const { data } = await apiClient.get<QuestionListPage>(ApiRoute.QUESTIONS, { params });
    return data;
  },
  detail: async (id: string): Promise<QuestionDetail> => {
    const { data } = await apiClient.get<QuestionDetail>(`${ApiRoute.QUESTIONS}/${id}`);
    return data;
  },
  create: async (dto: CreateQuestionDto): Promise<QuestionDetail> => {
    const { data } = await apiClient.post<QuestionDetail>(ApiRoute.QUESTIONS, dto);
    return data;
  },
  bulkCreate: async (rows: BulkRowInput[]): Promise<BulkImportResult> => {
    const { data } = await apiClient.post<BulkImportResult>(
      `${ApiRoute.QUESTIONS}/bulk`,
      { questions: rows },
    );
    return data;
  },
};
