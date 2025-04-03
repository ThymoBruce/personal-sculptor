
import { useState, useRef, useEffect } from "react";
import { Play, Pause, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getSpotifyPlaybackToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  const [isFullPlayback, setIsFullPlayback] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [spotifyPlayer, setSpotifyPlayer] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  
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
    if (!trackId) return;

    // Load Spotify Web Playback SDK script
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    // Initialize Spotify Player when script loads
    window.onSpotifyWebPlaybackSDKReady = () => {
      setIsFullPlayback(true);
    };

    // Clean up
    return () => {
      document.body.removeChild(script);
      if (spotifyPlayer) {
        spotifyPlayer.disconnect();
      }
    };
  }, [trackId]);

  // Handle Preview URL playback
  const togglePreviewPlay = () => {
    if (!previewUrl) return;
    
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

  // Only show preview playback option
  return (
    <div className="flex gap-4 p-3 rounded-lg hover:bg-accent/10 transition-colors">
      <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden group">
        <img 
          src={coverImage || '/placeholder.svg'} 
          alt={album}
          className="w-full h-full object-cover" 
        />
        {previewUrl ? (
          <button 
            onClick={togglePreviewPlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="text-white" size={20} />
            ) : (
              <Play className="text-white" size={20} />
            )}
          </button>
        ) : (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-white px-2 py-1 bg-black/50 rounded">No preview</span>
          </div>
        )}
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
      
      {/* Hidden div to hold Spotify Web Playback SDK Player */}
      <div ref={playerContainerRef} style={{ display: 'none' }}></div>
    </div>
  );
}
