import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userType: "admin" | "moderator" | "user" | "maklare" | "superadmin" | "agency_admin" | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<"admin" | "moderator" | "user" | "maklare" | "superadmin" | "agency_admin" | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserType = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_type")
        .eq("user_id", userId)
        .single();
      
      if (error) {
        console.error('Failed to fetch user type:', error);
        setUserType(null);
        return;
      }
      
      console.log('User type fetched:', data?.user_type);
      setUserType(data?.user_type ?? null);
    } catch (err) {
      console.error('Error fetching user type:', err);
      setUserType(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch user type after auth state changes
        if (session?.user) {
          fetchUserType(session.user.id);
        } else {
          setUserType(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Fetch user type for existing session
      if (session?.user) {
        fetchUserType(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, session, userType, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
