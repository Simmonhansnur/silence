"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

interface UserState {
  isDeep: boolean;
  isLoading: boolean;
  userId: string | null;
}

const UserContext = createContext<UserState>({ 
  isDeep: false, 
  isLoading: true,
  userId: null
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>({ 
    isDeep: false, 
    isLoading: true,
    userId: null
  });

  useEffect(() => {
    const supabase = createClient();
    
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setState({ isDeep: false, isLoading: false, userId: null });
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("is_deep")
        .eq("id", user.id)
        .single();
        
      setState({ 
        isDeep: !!profile?.is_deep, 
        isLoading: false,
        userId: user.id
      });
    }

    fetchUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        fetchUser(); // Refetch on auth boundary changes
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={state}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserStatus = () => useContext(UserContext);
