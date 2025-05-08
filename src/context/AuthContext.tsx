import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { authAPI } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check for token in localStorage on mount
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        // Ensure the user object has an id
        if (!parsedUser.id) {
          console.error("User object in localStorage is missing id", parsedUser);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "User data is invalid. Please log in again.",
          });
          // Clear invalid data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
        // Clear corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to restore your session. Please log in again.",
        });
      }
    }
    
    setIsLoading(false);
  }, [toast]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      
      // Store auth data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.username}!`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Failed to login",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register({ username, email, password });
      
      // Store auth data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      
      toast({
        title: "Registration successful",
        description: `Welcome to Quiz Master, ${response.user.username}!`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to register",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
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
