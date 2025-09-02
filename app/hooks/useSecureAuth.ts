"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SecurityService from '../services/securityService';
import SecurityMonitoringService from '../services/securityMonitoringService';

export const useSecureAuth = () => {
  const { user, dbUser, logout } = useAuth();
  const [isSessionValid, setIsSessionValid] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const securityService = SecurityService.getInstance();
  const securityMonitoring = SecurityMonitoringService.getInstance();

  // Session timeout (30 minutes of inactivity)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  useEffect(() => {
    if (!user) return;

    // Track user activity
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check session validity every minute
    const sessionCheck = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;

      if (timeSinceActivity > SESSION_TIMEOUT) {
        setIsSessionValid(false);
        securityMonitoring.logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'low',
          userId: user.uid,
          email: user.email || undefined,
          details: { reason: 'session_timeout' }
        });
        logout();
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(sessionCheck);
    };
  }, [user, lastActivity, logout]);

  // Validate user permissions
  const hasPermission = (permission: string): boolean => {
    if (!dbUser) return false;
    
    const userRoles = dbUser.userRole || [];
    
    const permissions = {
      'admin': ['admin', 'administrador'],
      'create_project': ['admin', 'administrador', 'user'],
      'view_logs': ['admin', 'administrador'],
      'manage_users': ['admin', 'administrador'],
      'upload_files': ['admin', 'administrador', 'user'],
      'view_reports': ['admin', 'administrador']
    };

    const requiredRoles = permissions[permission as keyof typeof permissions] || [];
    return requiredRoles.some(role => userRoles.includes(role));
  };

  // Secure logout with cleanup
  const secureLogout = async () => {
    try {
      if (user) {
        await securityMonitoring.logSecurityEvent({
          type: 'login_attempt',
          severity: 'low',
          userId: user.uid,
          email: user.email || undefined,
          details: { action: 'logout', method: 'manual' }
        });
      }
      
      // Clear sensitive data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user_preferences');
      
      // Clear session storage
      sessionStorage.clear();
      
      await logout();
    } catch (error) {
      console.error('Error during secure logout:', error);
    }
  };

  // Check if current session is from a trusted device
  const isTrustedDevice = (): boolean => {
    const deviceFingerprint = securityService.generateSecureToken();
    const storedFingerprint = localStorage.getItem('device_fingerprint');
    
    if (!storedFingerprint) {
      localStorage.setItem('device_fingerprint', deviceFingerprint);
      return false; // New device
    }
    
    return storedFingerprint === deviceFingerprint;
  };

  return {
    user,
    dbUser,
    isSessionValid,
    hasPermission,
    secureLogout,
    isTrustedDevice,
    lastActivity: new Date(lastActivity)
  };
};
