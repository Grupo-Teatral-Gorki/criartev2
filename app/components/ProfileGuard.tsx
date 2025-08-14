"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { isProfileComplete } from '../utils/profileUtils';

interface ProfileGuardProps {
  children: React.ReactNode;
}

const ProfileGuard: React.FC<ProfileGuardProps> = ({ children }) => {
  const { dbUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Pages that don't require profile completion check
  const excludedPaths = [
    '/',
    '/login',
    '/register',
    '/profile'
  ];

  useEffect(() => {
    if (loading) return;

    // Skip check for excluded paths
    if (excludedPaths.includes(pathname)) {
      setIsChecking(false);
      return;
    }

    // If user has been redirected to profile page before, don't redirect again
    // This prevents infinite redirects after profile completion
    if (hasRedirected) {
      setIsChecking(false);
      return;
    }

    // If user is logged in but profile is incomplete, redirect to profile
    if (dbUser && !isProfileComplete(dbUser)) {
      router.push('/profile?required=true');
      setHasRedirected(true);
      return;
    }

    setIsChecking(false);
  }, [dbUser, loading, pathname, router, hasRedirected]);

  // Reset redirect flag when user changes or profile becomes complete
  useEffect(() => {
    if (dbUser && isProfileComplete(dbUser)) {
      setHasRedirected(false);
    }
  }, [dbUser]);

  // Show loading while checking profile completeness
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando Dados...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProfileGuard;
