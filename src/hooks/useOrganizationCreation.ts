import { useState } from 'react';
import { OrganizationApiService, OrganizationUpdateData as OrganizationCreateData } from '@/services/api/organizationApi';

interface UseOrganizationCreationReturn {
  isLoading: boolean;
  error: string | null;
  createOrganization: (data: OrganizationCreateData) => Promise<boolean>;
  clearError: () => void;
}

export function useOrganizationCreation(): UseOrganizationCreationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrganization = async (data: OrganizationCreateData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await OrganizationApiService.updateOrganization(data);
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
    createOrganization,
    clearError,
  };
}