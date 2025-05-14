const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface Organization {
  _id: string;
  organizationName: string;
  adminEmail: string;
  agentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationCreateData {
  admin_email: string;
  organization_name: string;
}

export class OrganizationApiService {
  static async createOrganization(data: OrganizationCreateData): Promise<Organization> {
    const response = await fetch(`${API_BASE_URL}/organization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create organization');
    }

    const result = await response.json();
    return result.organization;
  }

  static async getAllOrganizations(page = 1, limit = 10): Promise<{ organizations: Organization[]; total: number; totalPages: number }> {
    const response = await fetch(`${API_BASE_URL}/organization/all?page=${page}&limit=${limit}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch organizations');
    }

    return response.json();
  }

  static async getOrganizationById(orgId: string): Promise<Organization> {
    const response = await fetch(`${API_BASE_URL}/organization/${orgId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch organization');
    }

    const result = await response.json();
    return result.organization;
  }

  static async updateOrganization(orgId: string, data: Partial<OrganizationCreateData>): Promise<Organization> {
    const response = await fetch(`${API_BASE_URL}/organization/${orgId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update organization');
    }

    const result = await response.json();
    return result.organization;
  }

  static async deleteOrganization(orgId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/organization/${orgId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete organization');
    }
  }
}