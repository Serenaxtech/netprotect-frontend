'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Settings } from 'lucide-react';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useAgentDetails } from '@/hooks/useAgentDetails';
import { useState } from 'react';
import { ConfigEditor } from '@/components/ConfigEditor';

export default function AgentDetailsPage() {
  const params = useParams();
  const agentId = params.id as string;
  
  const { isAuthorized, isLoading: authLoading } = useAuthCheck({ allowedRoles: ['root', 'integrator'] });
  const { agent, loading, error } = useAgentDetails(agentId);
  const [showConfigEditor, setShowConfigEditor] = useState(false);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!agent) {
    return (
      <Card className="bg-[#111] border-gray-800 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-red-500">Agent not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#111] border-gray-800 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-white">{agent.agent_name}</CardTitle>
          <Button
            variant="outline"
            className="bg-[#222] text-white hover:bg-[#333]"
            onClick={() => setShowConfigEditor(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure Agent
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Agent ID</label>
              <div className="font-mono text-white">{agent.agent_id}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Status</label>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs ${agent.agent_state === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {agent.agent_state}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Remote Configuration</label>
              <div>
                <span className={agent.remote_config ? 'text-green-400' : 'text-red-400'}>
                  {agent.remote_config ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Last Connection</label>
              <div className="text-white">
                {new Date(agent.agent_last_connection).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showConfigEditor && (
        <ConfigEditor
          agentId={agent.agent_id}
          agentName={agent.agent_name}
          onClose={() => setShowConfigEditor(false)}
        />
      )}
    </div>
  );
}