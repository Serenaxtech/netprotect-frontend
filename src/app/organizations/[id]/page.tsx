'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Pencil, Trash2, ArrowLeft, Loader2, Key } from 'lucide-react';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useOrganizationList } from '@/hooks/useOrganizationList';
import { Organization } from '@/services/api/organizationApi';
import { AgentApiService } from '@/services/api/agentApi';
import { AgentDetails } from '@/services/api/agentApi';

export default function OrganizationDetailsPage({ organizationId, onAgentSelect }: { organizationId: string; onAgentSelect?: (agentId: string) => void; }) {
  const router = useRouter();
  const { isAuthorized, isLoading: authLoading } = useAuthCheck({ allowedRoles: ['root'] });
  const { organizations, loading, error, updateOrganization, deleteOrganization } = useOrganizationList();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [agents, setAgents] = useState<AgentDetails[]>([]);
  const [editForm, setEditForm] = useState({
    organization_name: '',
    admin_email: ''
  });
  
  // Agent management states
  const [editingAgent, setEditingAgent] = useState<AgentDetails | null>(null);
  const [editAgentForm, setEditAgentForm] = useState({
    agent_name: '',
    agent_state: 'inactive',
    agent_remote_config: false
  });
  const [deleteConfirmAgent, setDeleteConfirmAgent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (organizations.length > 0) {
      const org = organizations.find(o => o._id === organizationId);
      if (org) {
        setOrganization(org);
        setEditForm({
          organization_name: org.organizationName,
          admin_email: org.adminEmail
        });
        fetchAgents(org.agentIds);
      }
    }
  }, [organizationId, organizations]);

  const fetchAgents = async (agentIds: string[]) => {
    try {
      const agentDetails = await Promise.all(
        agentIds.map(agentId => AgentApiService.getAgentDetails(agentId))
      );
      setAgents(agentDetails);
    } catch (error) {
      toast.error('Failed to fetch agent details');
    }
  };

  const handleUpdate = async () => {
    if (!organization) return;
    
    try {
      setIsProcessing(true);
      await updateOrganization(organization._id, {
        organization_name: editForm.organization_name,
        admin_email: editForm.admin_email
      });
      toast.success('Organization updated successfully');
    } catch (error) {
      toast.error('Failed to update organization');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!organization || !confirm('Are you sure you want to delete this organization?')) return;
    
    try {
      setIsProcessing(true);
      await deleteOrganization(organization._id);
      toast.success('Organization deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to delete organization');
    } finally {
      setIsProcessing(false);
    }
  };

  // Agent management functions
  const handleEditAgent = (agent: AgentDetails) => {
    setEditingAgent(agent);
    setEditAgentForm({
      agent_name: agent.agent_name,
      agent_state: agent.agent_state,
      agent_remote_config: agent.remote_config
    });
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent) return;
    
    try {
      setIsProcessing(true);
      await AgentApiService.updateAgent(editingAgent.agent_id, editAgentForm);
      await fetchAgents(organization?.agentIds || []);
      setEditingAgent(null);
      toast.success('Agent updated successfully');
    } catch (error) {
      toast.error('Failed to update agent');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      setIsProcessing(true);
      await AgentApiService.deleteAgent(agentId);
      await fetchAgents(organization?.agentIds || []);
      setDeleteConfirmAgent(null);
      toast.success('Agent deleted successfully');
    } catch (error) {
      toast.error('Failed to delete agent');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevokeAgent = async (agentId: string) => {
    try {
      setIsProcessing(true);
      await AgentApiService.revokeAgentToken(agentId);
      await fetchAgents(organization?.agentIds || []);
      toast.success('Agent token revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke agent token');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!organization) {
    return (
      <Card className="bg-[#111] border-gray-800 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-red-500">Organization not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-x-2">
          <Button
            variant="ghost"
            onClick={handleUpdate}
            className="text-gray-400 hover:text-white"
            disabled={isProcessing}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Pencil className="mr-2 h-4 w-4" />
            Update
          </Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300"
            disabled={isProcessing}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="bg-[#111] border-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">{organization.organizationName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Organization Name</label>
              <Input
                value={editForm.organization_name}
                onChange={(e) => setEditForm({ ...editForm, organization_name: e.target.value })}
                className="bg-[#1A1A1A] border-gray-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Admin Email</label>
              <Input
                value={editForm.admin_email}
                onChange={(e) => setEditForm({ ...editForm, admin_email: e.target.value })}
                className="bg-[#1A1A1A] border-gray-800 text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Agents</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-gray-300">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Remote Config</th>
                    <th className="px-4 py-3 text-left">Last Connection</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr 
                      key={agent.agent_id} 
                      className="border-b border-gray-800 hover:bg-[#1A1A1A] cursor-pointer"
                      onClick={() => onAgentSelect?.(agent.agent_id)}
                    >
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
                        <div className="flex justify-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAgent(agent)}
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
                            onClick={() => handleRevokeAgent(agent.agent_id)}
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
          </div>
        </CardContent>
      </Card>

      {/* Edit Agent Dialog */}
      <Dialog open={!!editingAgent} onOpenChange={() => setEditingAgent(null)}>
        <DialogContent className="bg-[#111] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Agent Name</label>
              <Input
                value={editAgentForm.agent_name}
                onChange={(e) => setEditAgentForm({ ...editAgentForm, agent_name: e.target.value })}
                className="bg-[#1A1A1A] border-gray-800 text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Status</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {editAgentForm.agent_state === 'active' ? 'Active' : 'Inactive'}
                </span>
                <Switch
                  checked={editAgentForm.agent_state === 'active'}
                  onCheckedChange={(checked) => 
                    setEditAgentForm({ 
                      ...editAgentForm, 
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
                  {editAgentForm.agent_remote_config ? 'Enabled' : 'Disabled'}
                </span>
                <Switch
                  checked={editAgentForm.agent_remote_config}
                  onCheckedChange={(checked) => setEditAgentForm({ ...editAgentForm, agent_remote_config: checked })}
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
              onClick={handleUpdateAgent}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Agent Confirmation Dialog */}
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
              onClick={() => deleteConfirmAgent && handleDeleteAgent(deleteConfirmAgent)}
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