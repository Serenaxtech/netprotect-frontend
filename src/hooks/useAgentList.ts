import { useState, useEffect } from 'react';
import { AgentApiService, AgentListItem, AgentDetails, AgentUpdateData } from '@/services/api/agentApi';

export function useAgentList() {
  const [agents, setAgents] = useState<AgentDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const agentList = await AgentApiService.getAllAgents();
      const detailedAgents = await Promise.all(
        agentList.map(agent => AgentApiService.getAgentDetails(agent.agent_id))
      );
      setAgents(detailedAgents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const updateAgent = async (agentId: string, data: AgentUpdateData) => {
    try {
      await AgentApiService.updateAgent(agentId, data);
      await fetchAgents(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update agent');
      throw err;
    }
  };

  const deleteAgent = async (agentId: string) => {
    try {
      await AgentApiService.deleteAgent(agentId);
      await fetchAgents(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete agent');
      throw err;
    }
  };

  const revokeAgentToken = async (agentId: string) => {
    try {
      await AgentApiService.revokeAgentToken(agentId);
      await fetchAgents(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke agent token');
      throw err;
    }
  };

  return {
    agents,
    loading,
    error,
    updateAgent,
    deleteAgent,
    revokeAgentToken,
    refreshAgents: fetchAgents,
  };
}