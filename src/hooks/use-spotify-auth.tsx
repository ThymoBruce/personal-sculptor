
import { useState } from 'react';
import { useToast } from './use-toast';

// Export a simplified version of the interface for compatibility
export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// This hook is now simplified as we've removed Spotify playback functionality
export function useSpotifyAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Simplified logout function
  const logout = () => {
    setTokens(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    tokens,
    isLoading,
    logout
  };
}
