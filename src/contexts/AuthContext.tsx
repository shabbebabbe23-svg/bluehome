import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userType: "admin" | "moderator" | "user" | "maklare" | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<"admin" | "moderator" | "user" | "maklare" | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch user type after auth state changes
        if (session?.user) {
          setTimeout(() => {
            supabase
              .from("user_roles")
              .select("user_type")
              .eq("user_id", session.user.id)
              .single()
              .then(({ data, error }) => {
                if (error) {
                  console.error('Failed to fetch user type:', error);
                }
                setUserType(data?.user_type ?? null);
              });
          }, 0);
        } else {
          setUserType(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Fetch user type for existing session
      if (session?.user) {
        supabase
          .from("user_roles")
          .select("user_type")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Failed to fetch user type:', error);
            }
            setUserType(data?.user_type ?? null);
          });
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
