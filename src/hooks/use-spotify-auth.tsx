
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { exchangeSpotifyCode, refreshSpotifyToken } from '@/lib/api';

// Define the Spotify tokens type
export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const SPOTIFY_AUTH_KEY = 'spotify_auth';
const SPOTIFY_CLIENT_ID = '1234567890'; // Replace with your actual client ID
const REDIRECT_URI = `${window.location.origin}/music`; // Redirect back to music page
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state'
];

export function useSpotifyAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Initialize authentication state from local storage
  useEffect(() => {
    const storedAuth = localStorage.getItem(SPOTIFY_AUTH_KEY);
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth) as SpotifyTokens & { timestamp: number };
        
        // Check if the token has expired
        const now = Date.now();
        const expiryTime = parsedAuth.timestamp + (parsedAuth.expiresIn * 1000);
        
        if (now < expiryTime) {
          // Token still valid
          setTokens({
            accessToken: parsedAuth.accessToken,
            refreshToken: parsedAuth.refreshToken,
            expiresIn: parsedAuth.expiresIn
          });
          setIsAuthenticated(true);
        } else {
          // Token expired, try to refresh
          refreshToken(parsedAuth.refreshToken);
        }
      } catch (error) {
        console.error('Error parsing stored Spotify auth:', error);
        localStorage.removeItem(SPOTIFY_AUTH_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Handle the authentication code when redirected back from Spotify
  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      // Clean URL without reloading the page
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      if (error) {
        toast({
          title: "Authentication Error",
          description: `Spotify auth failed: ${error}`,
          variant: "destructive"
        });
        return;
      }
      
      if (code) {
        setIsLoading(true);
        try {
          const result = await exchangeSpotifyCode(code);
          
          if (result.error) {
            throw new Error(result.error.message);
          }
          
          if (result.data) {
            // Store the tokens with a timestamp
            const authData = {
              ...result.data,
              timestamp: Date.now()
            };
            
            localStorage.setItem(SPOTIFY_AUTH_KEY, JSON.stringify(authData));
            setTokens(result.data);
            setIsAuthenticated(true);
            
            toast({
              title: "Connected to Spotify",
              description: "You can now play full tracks through Spotify Connect"
            });
          }
        } catch (error) {
          console.error('Error exchanging auth code:', error);
          toast({
            title: "Authentication Failed",
            description: error instanceof Error ? error.message : "Failed to connect to Spotify",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    handleAuthCallback();
  }, [toast]);

  // Function to refresh the access token
  const refreshToken = async (token: string) => {
    try {
      setIsLoading(true);
      const result = await refreshSpotifyToken(token);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      if (result.data) {
        // Store the refreshed tokens with a new timestamp
        const authData = {
          ...result.data,
          timestamp: Date.now()
        };
        
        localStorage.setItem(SPOTIFY_AUTH_KEY, JSON.stringify(authData));
        setTokens(result.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      setIsAuthenticated(false);
      setTokens(null);
      localStorage.removeItem(SPOTIFY_AUTH_KEY);
      
      toast({
        title: "Session Expired",
        description: "Please log in to Spotify again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to initiate the Spotify authentication flow
  const login = () => {
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('scope', SCOPES.join(' '));
    authUrl.searchParams.append('show_dialog', 'true');
    
    window.location.href = authUrl.toString();
  };

  // Function to log out and clear stored tokens
  const logout = () => {
    localStorage.removeItem(SPOTIFY_AUTH_KEY);
    setTokens(null);
    setIsAuthenticated(false);
    
    toast({
      title: "Logged Out",
      description: "You've been disconnected from Spotify"
    });
  };

  return {
    isAuthenticated,
    tokens,
    isLoading,
    login,
    logout,
    refreshToken
  };
}
