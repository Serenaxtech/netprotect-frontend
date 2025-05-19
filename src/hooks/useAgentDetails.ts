import { useState, useEffect } from 'react';
import { AgentApiService, AgentDetails } from '@/services/api/agentApi';

export function useAgentDetails(agentId: string) {
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AgentApiService.getAgentDetails(agentId);
        setAgent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch agent details');
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchAgentDetails();
    }
  }, [agentId]);

  return { agent, loading, error };
}