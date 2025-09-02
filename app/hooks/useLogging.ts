"use client";
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebaseconfig';
import LoggingService from '../services/loggingService';

export const useLogging = () => {
  const [user, setUser] = useState<User | null>(null);
  const loggingService = LoggingService.getInstance();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        loggingService.setCurrentUser(currentUser.email);
      } else {
        loggingService.setCurrentUser('');
      }
    });

    return () => unsubscribe();
  }, [loggingService]);

  return loggingService;
};
