
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, signIn, signOut, signUp, subscribeToAuthChanges } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initial user fetch
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const { data: authListener } = subscribeToAuthChanges((updatedUser) => {
      setUser(updatedUser);
    });

    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
        return { success: false, error: error.message };
      }
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      return { success: true };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An unexpected error occurred",
      });
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout Successful",
        description: "You have been logged out",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message || "An unexpected error occurred",
      });
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const { data, error } = await signUp(email, password);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: error.message,
        });
        return { success: false, error: error.message };
      }
      
      toast({
        title: "Registration Successful",
        description: "Please check your email to confirm your account",
      });
      return { success: true };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred",
      });
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
