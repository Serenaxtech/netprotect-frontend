import { useState } from 'react';
import { AgentApiService, AgentCreateData } from '@/services/api/agentApi';

export function useAgentCreation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAgent = async (data: AgentCreateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AgentApiService.createAgent(data);
      setIsLoading(false);
      return { success: true, data: response };
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create agent';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return { createAgent, isLoading, error };
}