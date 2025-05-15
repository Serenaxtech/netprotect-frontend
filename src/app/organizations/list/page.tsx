'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOrganizationList } from '@/hooks/useOrganizationList';
import { Organization } from '@/services/api/organizationApi';

interface ListOrganizationsPageProps {
  onSelectOrg?: (orgId: string) => void;
}

export default function ListOrganizationsPage({ onSelectOrg }: ListOrganizationsPageProps) {
  const { isAuthorized, isLoading: authLoading } = useAuthCheck({ allowedRoles: ['root'] });
  const { organizations, loading, error, updateOrganization, deleteOrganization } = useOrganizationList();
  const router = useRouter();
  
  const [editOrg, setEditOrg] = useState<Organization | null>(null);
  const [editForm, setEditForm] = useState({
    organization_name: '',
    admin_email: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEdit = (org: Organization) => {
    setEditOrg(org);
    setEditForm({
      organization_name: org.organizationName,
      admin_email: org.adminEmail
    });
  };

  const handleUpdate = async () => {
    if (!editOrg) return;
    
    try {
      setIsProcessing(true);
      await updateOrganization(editOrg._id, {
        organization_name: editForm.organization_name,
        admin_email: editForm.admin_email
      });
      setEditOrg(null);
      toast.success('Organization updated successfully');
    } catch (error) {
      toast.error('Failed to update organization');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;
    
    try {
      setIsProcessing(true);
      await deleteOrganization(orgId);
      toast.success('Organization deleted successfully');
    } catch (error) {
      toast.error('Failed to delete organization');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || loading) {
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
          <CardTitle className="text-2xl font-bold text-white">Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Admin Email</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org._id}>
                  <TableCell>{org.organizationName}</TableCell>
                  <TableCell>{org.adminEmail}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => onSelectOrg?.(org._id)}
                    >
                      {org.agentIds.length} Agents
                    </Button>
                  </TableCell>
                  <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(org)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(org._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Dialog open={!!editOrg} onOpenChange={() => setEditOrg(null)}>
            <DialogContent className="bg-[#111] border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Organization</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Organization Name</label>
                  <Input
                    value={editForm.organizationName}
                    onChange={(e) => setEditForm({ ...editForm, organizationName: e.target.value })}
                    className="bg-[#1A1A1A] border-gray-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Admin Email</label>
                  <Input
                    value={editForm.adminEmail}
                    onChange={(e) => setEditForm({ ...editForm, adminEmail: e.target.value })}
                    className="bg-[#1A1A1A] border-gray-800 text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setEditOrg(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isProcessing}
                >
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}