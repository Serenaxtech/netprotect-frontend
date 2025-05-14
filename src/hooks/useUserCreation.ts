import { useState } from 'react';
import { UserApiService, UserCreateData } from '@/services/api/userApi';

interface UseUserCreationReturn {
  isLoading: boolean;
  error: string | null;
  createUser: (userData: UserCreateData, userType: 'normal' | 'integrator') => Promise<boolean>;
  clearError: () => void;
}

export function useUserCreation(): UseUserCreationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (userData: UserCreateData, userType: 'normal' | 'integrator'): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await UserApiService.createUser(userData, userType);

      if (!result.success) {
        setError(result.error);
        return false;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isLoading,
    error,
    createUser,
    clearError,
  };
}