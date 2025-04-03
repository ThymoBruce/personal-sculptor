
import { useState, useRef } from "react";
import { Play, Pause, ExternalLink, Music } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
  duration
}: SpotifyTrackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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

  // Toggle play/pause for preview
  const togglePlayback = () => {
    // Check for preview URL 
    if (!previewUrl) {
      toast({
        title: "No Preview Available",
        description: "This track doesn't have a preview available"
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
    </div>
  );
}
