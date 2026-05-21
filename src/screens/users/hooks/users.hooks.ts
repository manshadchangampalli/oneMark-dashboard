import { useQuery } from '@tanstack/react-query';
import { usersApi, type ListUsersParams } from '@/api/users.api';

export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn:  () => usersApi.list(params),
    staleTime: 30 * 1000,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn:  () => usersApi.detail(id!),
    enabled:  !!id,
  });
}
