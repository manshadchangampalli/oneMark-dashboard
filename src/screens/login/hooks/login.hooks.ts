import { useMutation } from '@tanstack/react-query';
import { adminAuthApi } from '@/api/admin-auth.api';
import { useAuthStore } from '@/store/useAuthStore';
import type { LoginDto } from '@/types/auth';

export function useLogin() {
  const setAuth = useAuthStore(s => s.setAuth);
  return useMutation({
    mutationFn: async (dto: LoginDto) => {
      const { accessToken } = await adminAuthApi.login(dto);
      // Set token first so getMe's interceptor includes it
      useAuthStore.getState().setToken(accessToken);
      const me = await adminAuthApi.getMe();
      setAuth(me, accessToken);
      return me;
    },
  });
}
