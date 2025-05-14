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
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const data = await AuthService.checkAuth();
        if (!isMounted) return;

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
        if (isMounted) {
          router.push('/login');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array since we only want this to run once

  return { isAuthorized, isLoading, userData };
}