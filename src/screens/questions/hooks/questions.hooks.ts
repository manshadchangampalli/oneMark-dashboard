import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { questionsApi, type ListQuestionsParams, type CreateQuestionDto, type BulkRowInput } from '@/api/questions.api';

export function useQuestions(params: ListQuestionsParams) {
  return useQuery({
    queryKey: ['admin-questions', params],
    queryFn:  () => questionsApi.list(params),
    staleTime: 30 * 1000,
  });
}

export function useQuestion(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-question', id],
    queryFn:  () => questionsApi.detail(id!),
    enabled:  !!id,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateQuestionDto) => questionsApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-questions'] });
    },
  });
}

export function useBulkCreateQuestions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: BulkRowInput[]) => questionsApi.bulkCreate(rows),
    onSuccess: (result) => {
      if (result.succeeded > 0) {
        qc.invalidateQueries({ queryKey: ['admin-questions'] });
      }
    },
  });
}
