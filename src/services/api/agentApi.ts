const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface Agent {
  agent_id: string;
  agent_name: string;
  agent_state: string;
  remote_config: boolean;
  agent_last_connection: string;
}

export interface AgentCreateData {
  agent_name: string;
  accept_remote_config: boolean;
  agent_organization: string;
}

export class AgentApiService {
  static async createAgent(data: AgentCreateData): Promise<{ agent_id: string; agent_name: string; agent_token: string }> {
    const response = await fetch(`${API_BASE_URL}/agent/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create agent');
    }

    const result = await response.json();
    return result.data;
  }

  static async addAgentToOrganization(organizationId: string, agentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/organization/${organizationId}/agent/${agentId}`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to add agent to organization');
    }
  }
}