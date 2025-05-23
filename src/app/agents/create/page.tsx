'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAgentCreation } from '@/hooks/useAgentCreation';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { OrganizationApiService } from '@/services/api/organizationApi';
import { Copy } from 'lucide-react';

interface Organization {
  _id: string;
  organizationName: string;
}

export default function CreateAgentPage() {
  const { isAuthorized, isLoading, userData } = useAuthCheck({ allowedRoles: ['root', 'integrator'] });
  const { createAgent, isLoading: isCreatingAgent, error } = useAgentCreation();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [agentToken, setAgentToken] = useState('');
  const [formData, setFormData] = useState({
    agent_name: '',
    accept_remote_config: false,
    agent_organization: ''
  });

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const organizations = await OrganizationApiService.getAllOrganizations();
        //console.log('Organizations:', organizations);
        setOrganizations(organizations || []);
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
        toast.error('Error', {
          description: 'Failed to fetch organizations'
        });
      }
    };

    if (isAuthorized) {
      fetchOrganizations();
    }
  }, [isAuthorized]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(agentToken);
    toast.success('Token copied to clipboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createAgent(formData);
      if (result.success) {
        toast.success('Agent created', {
          description: 'The agent has been created successfully.'
        });
        setAgentToken(result.data.agent_token);
        setShowTokenDialog(true);
        setFormData({ agent_name: '', accept_remote_config: false, agent_organization: '' });
      } else {
        toast.error('Error', {
          description: error || 'Failed to create agent'
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <>
      <Card className="bg-[#111] max-w-2xl mx-auto border-gray-800 shadow-lg">
        <CardHeader className="space-y-4">
          <div className="text-gray-400 text-center text-sm">[ Create New Agent ]</div>
          <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white">
            Create Agent
          </CardTitle>
          <p className="text-gray-400 text-center text-sm md:text-base">
            Create a new agent to monitor your Active Directory
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200" htmlFor="agent_name">
                Agent Name
              </label>
              <Input
                id="agent_name"
                name="agent_name"
                value={formData.agent_name}
                onChange={(e) => setFormData(prev => ({ ...prev, agent_name: e.target.value }))}
                className="bg-[#1A1A1A] border-gray-800"
                placeholder="Enter agent name"
                required
              />
            </div>
  
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-200">
                Accept Remote Configuration
              </label>
              <Switch
                checked={formData.accept_remote_config}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, accept_remote_config: checked }))}
              />
            </div>
  
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Organization
              </label>
              <Select
                value={formData.agent_organization}
                onValueChange={(value) => setFormData(prev => ({ ...prev, agent_organization: value }))}
              >
                <SelectTrigger className="bg-[#1A1A1A] border-gray-800">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org._id} value={org._id}>
                      {org.organizationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isCreatingAgent}
            >
              {isCreatingAgent ? 'Creating...' : 'Create Agent'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent className="bg-[#111] text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Important: Save Your Agent Token</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-yellow-400">
              ⚠️ This token will only be shown once. Please copy and save it in a secure location.
              You will need this token to authenticate your agent.
            </p>
            <div className="bg-[#1A1A1A] p-4 rounded-md font-mono relative group">
              <p className="break-all">{agentToken}</p>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleCopyToken}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setShowTokenDialog(false)}
            >
              I Have Saved The Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}