import { useState, useEffect } from 'react';
import { Organization, OrganizationApiService } from '@/services/api/organizationApi';

export function useOrganizations(page = 1, limit = 10) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await OrganizationApiService.getAllOrganizations(page, limit);
        setOrganizations(result.organizations);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [page, limit]);

  return { organizations, total, totalPages, isLoading, error };
}