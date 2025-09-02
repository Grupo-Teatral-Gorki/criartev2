"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoggingService from '../services/loggingService';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user?.email) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const loggingService = LoggingService.getInstance();
      const adminStatus = await loggingService.isUserAdmin(user.email);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading, checkAdminStatus };
};
