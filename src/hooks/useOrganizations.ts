import { useState, useEffect } from 'react';
import { Organization, OrganizationApiService } from '@/services/api/organizationApi';

export function useOrganizations(isRoot: boolean = false) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await OrganizationApiService.getAllOrganizations(isRoot);
        setOrganizations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [isRoot]);

  return { organizations, isLoading, error };
}