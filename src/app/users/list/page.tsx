'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserApi, User } from '@/services/api/userApi';
import { useAuthCheck } from '@/hooks/useAuthCheck';

export default function UsersListPage() {
  const { isAuthorized, isLoading: authLoading } = useAuthCheck({ allowedRoles: ['root'] });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await UserApi.getAllUsers();
        if (!result.success) {
          throw new Error(result.error);
        }
        setUsers(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
          <CardTitle className="text-2xl font-bold text-white">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-gray-300">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left">Username</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email} className="border-b border-gray-800 hover:bg-[#1A1A1A]">
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">{`${user.firstName} ${user.lastName}`}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.phoneNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getRoleColor(role: string): string {
  switch (role.toLowerCase()) {
    case 'root':
      return 'bg-red-500/10 text-red-500';
    case 'admin':
      return 'bg-yellow-500/10 text-yellow-500';
    case 'integrator':
      return 'bg-blue-500/10 text-blue-500';
    default:
      return 'bg-green-500/10 text-green-500';
  }
}