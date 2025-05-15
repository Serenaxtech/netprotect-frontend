import { useState, useEffect } from 'react';
import { Organization, OrganizationApiService, OrganizationUpdateData } from '@/services/api/organizationApi';

export function useOrganizationList() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await OrganizationApiService.getAllOrganizations();
      setOrganizations(data);
    } catch (err) {
      setError('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (orgId: string, updateData: OrganizationUpdateData) => {
    try {
      await OrganizationApiService.updateOrganization(orgId, updateData);
      await fetchOrganizations(); // Refresh the list
    } catch (err) {
      throw new Error('Failed to update organization');
    }
  };

  const deleteOrganization = async (orgId: string) => {
    try {
      await OrganizationApiService.deleteOrganization(orgId);
      await fetchOrganizations(); // Refresh the list
    } catch (err) {
      throw new Error('Failed to delete organization');
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    organizations,
    loading,
    error,
    updateOrganization,
    deleteOrganization,
    refreshOrganizations: fetchOrganizations
  };
}