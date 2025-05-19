const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface AgentConfig {
  agentId: string;
  rawConfig: string;
  createdAt: string;
  updatedAt: string;
}

export class ConfigApiService {
  static async getAgentConfig(agentId: string): Promise<AgentConfig> {
    const response = await fetch(`${API_BASE_URL}/agent/${agentId}/config`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch agent config');
    }

    const result = await response.json();
    return result.agent_config_file;
  }

  static async createAgentConfig(agentId: string, rawConfig: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/agent/${agentId}/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ raw_config: rawConfig }),
    });

    if (!response.ok) {
      throw new Error('Failed to create agent config');
    }
  }

  static async updateAgentConfig(agentId: string, rawConfig: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/agent/${agentId}/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ raw_config: rawConfig }),
    });

    if (!response.ok) {
      throw new Error('Failed to update agent config');
    }
  }

  static async getAgentToken(agentId: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/agent/${agentId}/token`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch agent token');
    }

    const result = await response.json();
    return result.token;
  }
}