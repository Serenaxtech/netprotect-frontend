import { useState } from 'react';
import { AuthService } from '@/services/authService';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await AuthService.login(email, password);
      router.push('/dashboard');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
  };
}