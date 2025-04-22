"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"; // your custom AuthContext that provides dbUser
import { useAuth } from "./AuthContext";

const db = getFirestore();

type CityContextType = {
  city: any | null;
  loading: boolean;
};

const CityConfigContext = createContext<CityContextType>({
  city: null,
  loading: true,
});

export const useCity = () => useContext(CityConfigContext);

export const CityProvider = ({ children }: { children: React.ReactNode }) => {
  const { dbUser } = useAuth(); // grab your custom user
  const [city, setCity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCity = async () => {
      if (!dbUser?.cityId) {
        setCity(null);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "cities"),
        where("idCidade", "==", dbUser.cityId)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setCity({ id: doc.id, ...doc.data() } as any);
      } else {
        setCity(null);
      }

      setLoading(false);
    };

    fetchCity();
  }, [dbUser?.cityId]);

  return (
    <CityConfigContext.Provider value={{ city, loading }}>
      {children}
    </CityConfigContext.Provider>
  );
};
