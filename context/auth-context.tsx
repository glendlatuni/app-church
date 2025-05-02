"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { User } from "@supabase/supabase-js";

import { Jemaat } from "@/lib/interface";

import { getUser, getJemaatInfo } from "@/action/action";

type AuthContextType = {
  user: User | null;
  jemaat: Jemaat | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  jemaat: null,
  loading: true,
  refreshUser: async () => {},
});

export const AuthProvider = ({
  children,
  initialUser,
  initialJemaat,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialJemaat?: Jemaat | null;
}) => {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [jemaat, setJemaat] = useState<Jemaat | null>(initialJemaat || null);
  const [loading, setLoading] = useState(!initialUser);

  const fetchAuthUser = async () => {
    try {
      setLoading(true);
      const { user } = await getUser();

      setUser(user);

      console.log(user);

      if (user) {
        const { jemaat } = await getJemaatInfo(user.id);
        setJemaat(jemaat);
      } else {
        setJemaat(null);
      }
    } catch (error) {
      console.error("Unexpected error in fetchAuthUser:", error);
      setUser(null);
      setJemaat(null);
    } finally {
      setLoading(false);
    }
}

    const refreshUser = async () => {
      await fetchAuthUser();
    };

    useEffect(() => {
      // Gunakan initialUser jika tersedia, jika tidak, fetch data
      if (!initialUser) {
        fetchAuthUser();
      } else {
        setLoading(false); // Pastikan loading false jika initialUser sudah ada
      }
    }, [initialUser]);
    

    return (
      <AuthContext.Provider value={{ user, jemaat, loading, refreshUser }}>
        {children}
      </AuthContext.Provider>
    );
  };


export const useAuth = () => useContext(AuthContext);
