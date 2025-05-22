"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../config/firebaseconfig";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import { UserProfile } from "../utils/interfaces";

interface AuthContextType {
  user: User | null;
  dbUser: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateCityId: (newCityId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          const fullUserData = { ...userData, id: firebaseUser.uid };
          setDbUser(fullUserData);
        }
      } else {
        setUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const updateCityId = async (newCityId: string) => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, {
        cityId: newCityId,
        updatedAt: new Date(),
        updatedBy: dbUser?.id,
      });

      const updatedDoc = await getDoc(userDocRef);
      if (updatedDoc.exists()) {
        const updatedData = updatedDoc.data() as UserProfile;
        const fullUserData = { ...updatedData, id: user.uid };
        setDbUser(fullUserData);
      }
    } catch (error) {
      console.error("Failed to update cityId", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, dbUser, loading, logout, updateCityId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
