import { useState } from 'react';
import { AgentApiService, AgentCreateData } from '@/services/api/agentApi';

interface UseAgentCreationReturn {
  isLoading: boolean;
  error: string | null;
  createAgent: (data: AgentCreateData) => Promise<boolean>;
  clearError: () => void;
}

export function useAgentCreation(): UseAgentCreationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAgent = async (data: AgentCreateData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const createdAgent = await AgentApiService.createAgent(data);
      await AgentApiService.addAgentToOrganization(data.agent_organization, createdAgent.agent_id);

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
    createAgent,
    clearError,
  };
}