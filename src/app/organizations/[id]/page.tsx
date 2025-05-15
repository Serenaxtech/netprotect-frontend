'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Pencil, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useOrganizationList } from '@/hooks/useOrganizationList';
import { Organization } from '@/services/api/organizationApi';
import { AgentApiService } from '@/services/api/agentApi';

export default function OrganizationDetailsPage({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const { isAuthorized, isLoading: authLoading } = useAuthCheck({ allowedRoles: ['root'] });
  const { organizations, loading, error, updateOrganization, deleteOrganization } = useOrganizationList();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  // Update the editForm state to match backend format
  const [editForm, setEditForm] = useState({
    organization_name: '',
    admin_email: ''
  });
  
  // Update the useEffect to use the correct property names
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
  
  // Update the Input fields to use the new property names
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Remote Config</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.agent_id}>
                    <TableCell>{agent.agent_name}</TableCell>
                    <TableCell className="font-mono text-sm">{agent.agent_id}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.agent_state === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {agent.agent_state}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={agent.remote_config ? 'text-green-500' : 'text-red-500'}>
                        {agent.remote_config ? 'Enabled' : 'Disabled'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}