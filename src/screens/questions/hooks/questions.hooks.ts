import { useQuery } from '@tanstack/react-query';
import { questionsApi, type ListQuestionsParams } from '@/api/questions.api';

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
