import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';

export function useAuth() {
  const router = useRouter();
  const locale = useLocale();
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } =
    useAuthStore();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { accessToken, user } = await authApi.login({ email, password });
      setAuth(user, accessToken);

      const redirectMap = {
        STUDENT:  `/${locale}/dashboard`,
        LECTURER: `/${locale}/dashboard`,
        ADMIN:    `/${locale}/admin/users`
      };
      router.push(redirectMap[user.role]);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      router.push(`/${locale}/login`);
    }
  };

  const refreshUser = async () => {
    try {
      const user = await authApi.getMe();
      const token = localStorage.getItem('access_token') ?? '';
      setAuth(user, token);
    } catch {
      clearAuth();
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    setAuth,
    setLoading,
    login,
    logout,
    refreshUser
  };
}