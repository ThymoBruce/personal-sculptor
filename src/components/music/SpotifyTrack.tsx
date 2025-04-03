
import { useState, useRef, useEffect } from "react";
import { Play, Pause, ExternalLink, Music } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getSpotifyPlaybackToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSpotifyAuth } from "@/hooks/use-spotify-auth";
import { Button } from "@/components/ui/button";

interface SpotifyTrackProps {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverImage: string;
  previewUrl: string | null;
  spotifyUrl: string;
  releaseDate: string;
  duration: number;
  trackId?: string; // Spotify track ID for full playback
}

export default function SpotifyTrack({
  id,
  title,
  artist,
  album,
  coverImage,
  previewUrl,
  spotifyUrl,
  releaseDate,
  duration,
  trackId
}: SpotifyTrackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlaybackReady, setIsPlaybackReady] = useState(false);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, tokens, login } = useSpotifyAuth();
  
  // Format helpers
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const formatReleaseDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return dateStr;
    }
  };

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!trackId || !isAuthenticated || !tokens) return;
    
    // Load Spotify Web Playback SDK script
    if (!document.getElementById('spotify-player')) {
      const script = document.createElement('script');
      script.id = 'spotify-player';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
      
      window.onSpotifyWebPlaybackSDKReady = () => {
        initializePlayer(tokens.accessToken);
      };
    } else if (window.Spotify) {
      initializePlayer(tokens.accessToken);
    }
    
    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [trackId, isAuthenticated, tokens]);
  
  const initializePlayer = (token: string) => {
    const spotifyPlayer = new window.Spotify.Player({
      name: 'Web Playback SDK',
      getOAuthToken: cb => { cb(token); },
      volume: 0.5
    });
    
    // Error handling
    spotifyPlayer.addListener('initialization_error', ({ message }) => {
      console.error('Failed to initialize:', message);
      toast({
        title: "Playback Error",
        description: "Failed to initialize Spotify player",
        variant: "destructive"
      });
    });
    
    spotifyPlayer.addListener('authentication_error', ({ message }) => {
      console.error('Failed to authenticate:', message);
      toast({
        title: "Authentication Error",
        description: "Spotify session expired. Please login again.",
        variant: "destructive"
      });
    });
    
    spotifyPlayer.addListener('account_error', ({ message }) => {
      console.error('Failed to validate account:', message);
      toast({
        title: "Premium Required",
        description: "Spotify Connect requires a Premium subscription",
        variant: "destructive"
      });
    });
    
    spotifyPlayer.addListener('playback_error', ({ message }) => {
      console.error('Failed to perform playback:', message);
    });
    
    // Playback status updates
    spotifyPlayer.addListener('player_state_changed', state => {
      console.log(state);
      if (state && state.track_window.current_track.id === trackId) {
        setIsPlaying(!state.paused);
      }
    });
    
    // Ready
    spotifyPlayer.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      setDeviceId(device_id);
      setIsPlaybackReady(true);
      setPlayer(spotifyPlayer);
    });
    
    // Not Ready
    spotifyPlayer.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
      setIsPlaybackReady(false);
    });
    
    // Connect to the player!
    spotifyPlayer.connect();
  };
  
  // Play track with Spotify Connect
  const playTrackWithSpotify = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please connect to Spotify to play full tracks",
      });
      login();
      return;
    }
    
    if (!isPlaybackReady || !deviceId || !tokens) {
      toast({
        title: "Playback Not Ready",
        description: "The Spotify player is still initializing",
      });
      return;
    }
    
    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`
        },
        body: JSON.stringify({
          uris: [`spotify:track:${trackId}`]
        })
      });
    } catch (error) {
      console.error('Error playing track:', error);
      toast({
        title: "Playback Error",
        description: "Failed to play track. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Pause track with Spotify Connect
  const pauseTrackWithSpotify = async () => {
    if (!player) return;
    player.pause();
  };
  
  // Toggle play/pause for preview or full track
  const togglePlayback = () => {
    // If authenticated and full playback is available
    if (isAuthenticated && trackId && isPlaybackReady) {
      if (isPlaying) {
        pauseTrackWithSpotify();
      } else {
        playTrackWithSpotify();
      }
      return;
    }
    
    // Fallback to preview URL playback
    if (!previewUrl) {
      toast({
        title: "No Preview Available",
        description: isAuthenticated 
          ? "There was an issue playing this track" 
          : "Login to Spotify to play full tracks",
      });
      return;
    }
    
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      // Stop any other playing tracks
      document.querySelectorAll('audio').forEach(audio => {
        if (audio !== audioRef.current) audio.pause();
      });
      
      if (!audioRef.current) {
        audioRef.current = new Audio(previewUrl);
        audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      }
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex gap-4 p-3 rounded-lg hover:bg-accent/10 transition-colors">
      <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden group">
        <img 
          src={coverImage || '/placeholder.svg'} 
          alt={album}
          className="w-full h-full object-cover" 
        />
        <button 
          onClick={togglePlayback}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="text-white" size={20} />
          ) : (
            <Play className="text-white" size={20} />
          )}
        </button>
      </div>
      
      <div className="flex-grow min-w-0">
        <h3 className="font-semibold text-foreground truncate">{title}</h3>
        <p className="text-sm text-muted-foreground truncate">{artist}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">{formatReleaseDate(releaseDate)}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{formatDuration(duration)}</span>
            <a 
              href={spotifyUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
              aria-label="Open in Spotify"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
      
      {!isAuthenticated && trackId && (
        <div className="flex items-center ml-auto pl-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1" 
            onClick={login}
          >
            <Music size={12} />
            <span className="hidden sm:inline">Full Track</span>
          </Button>
        </div>
      )}
      
      {/* Hidden div to hold Spotify Web Playback SDK Player */}
      <div ref={playerContainerRef} style={{ display: 'none' }}></div>
    </div>
  );
}
