'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthService } from '@/services/authService';

export function AgentNavItem() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userData = await AuthService.checkAuth();
        if (userData && ['root', 'integrator'].includes(userData.role)) {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, []);

  if (isLoading || !isAuthorized) {
    return null;
  }

  return (
    <Link 
      href="/agents/create"
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-200 transition-all hover:text-white"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
      Create Agent
    </Link>
  );
}