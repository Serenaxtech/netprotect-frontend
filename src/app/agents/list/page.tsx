'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentList } from '@/hooks/useAgentList';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Key, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AgentDetails } from '@/services/api/agentApi';

export default function ListAgentsPage() {
  const { isAuthorized, isLoading: authLoading } = useAuthCheck({ allowedRoles: ['root', 'integrator'] });
  const { agents, loading, error, updateAgent, deleteAgent, revokeAgentToken } = useAgentList();
  
  const [editingAgent, setEditingAgent] = useState<AgentDetails | null>(null);
  const [editForm, setEditForm] = useState({
    agent_name: '',
    agent_state: '',
    agent_remote_config: false
  });
  const [deleteConfirmAgent, setDeleteConfirmAgent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEdit = (agent: AgentDetails) => {
    setEditingAgent(agent);
    setEditForm({
      agent_name: agent.agent_name,
      agent_state: agent.agent_state,
      agent_remote_config: agent.remote_config
    });
  };

  const handleUpdate = async () => {
    try {
      setIsProcessing(true);
      await updateAgent(editingAgent!.agent_id, editForm);
      setEditingAgent(null);
      toast.success('Agent updated successfully');
    } catch (error) {
      toast.error('Failed to update agent');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (agentId: string) => {
    try {
      setIsProcessing(true);
      await deleteAgent(agentId);
      setDeleteConfirmAgent(null);
      toast.success('Agent deleted successfully');
    } catch (error) {
      toast.error('Failed to delete agent');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevoke = async (agentId: string) => {
    try {
      setIsProcessing(true);
      await revokeAgentToken(agentId);
      toast.success('Agent token revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke agent token');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-[#111] border-gray-800 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#111] border-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">All Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-gray-300">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left">Agent Name</th>
                  <th className="px-4 py-3 text-left">Agent ID</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Remote Config</th>
                  <th className="px-4 py-3 text-left">Last Connection</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.agent_id} className="border-b border-gray-800 hover:bg-[#1A1A1A]">
                    <td className="px-4 py-3">{agent.agent_name}</td>
                    <td className="px-4 py-3 font-mono text-sm">{agent.agent_id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${agent.agent_state === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {agent.agent_state}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={agent.remote_config ? 'text-green-400' : 'text-red-400'}>
                        {agent.remote_config ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(agent.agent_last_connection).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(agent)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmAgent(agent.agent_id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(agent.agent_id)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <Key size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingAgent} onOpenChange={() => setEditingAgent(null)}>
        <DialogContent className="bg-[#111] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Agent Name</label>
              <Input
                value={editForm.agent_name}
                onChange={(e) => setEditForm({ ...editForm, agent_name: e.target.value })}
                className="bg-[#1A1A1A] border-gray-800 text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Status</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {editForm.agent_state === 'active' ? 'Active' : 'Inactive'}
                </span>
                <Switch
                  checked={editForm.agent_state === 'active'}
                  onCheckedChange={(checked) => 
                    setEditForm({ 
                      ...editForm, 
                      agent_state: checked ? 'active' : 'inactive' 
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Remote Configuration</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {editForm.agent_remote_config ? 'Enabled' : 'Disabled'}
                </span>
                <Switch
                  checked={editForm.agent_remote_config}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, agent_remote_config: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditingAgent(null)}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmAgent} onOpenChange={() => setDeleteConfirmAgent(null)}>
        <AlertDialogContent className="bg-[#111] border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirm Deletion</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-gray-400">Are you sure you want to delete this agent? This action cannot be undone.</p>
          <AlertDialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirmAgent(null)}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirmAgent && handleDelete(deleteConfirmAgent)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Agent
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}