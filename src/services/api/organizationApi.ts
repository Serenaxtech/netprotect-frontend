const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Organization {
  _id: string;
  adminEmail: string;
  organizationName: string;
  agentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationUpdateData {
  organization_name: string;
  admin_email: string;
}

export interface OrganizationCreateData {
  organizationName: string;
  adminEmail: string;
}

export class OrganizationApiService {
  static async getAllOrganizations(isRoot: boolean = false): Promise<Organization[]> {
    const endpoint = isRoot ? '/organization/all' : '/user/organizations';
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { credentials: 'include' } );
    if (!response.ok) {
      throw new Error('Failed to fetch organizations');
    }
    const data = await response.json();
    return isRoot ? data.organizations : data;
  }

  static async createOrganization(orgData: OrganizationCreateData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/organization/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        "organization_name": orgData.organizationName,
        "admin_email": orgData.adminEmail
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create organization');
    }
  }

  static async updateOrganization(orgId: string, updateData: OrganizationUpdateData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/organization/${orgId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update organization');
    }
  }

  static async deleteOrganization(orgId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/organization/${orgId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete organization');
    }
  }
}