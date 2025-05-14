'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';

interface UseAuthCheckProps {
  allowedRoles?: string[];
}

export function useAuthCheck({ allowedRoles = [] }: UseAuthCheckProps = {}) {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await AuthService.checkAuth();
        if (!data) {
          router.push('/login');
          return;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(data.role)) {
          router.push('/dashboard');
          return;
        }

        setUserData(data);
        setIsAuthorized(true);
      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, allowedRoles]);

  return { isAuthorized, isLoading, userData };
}