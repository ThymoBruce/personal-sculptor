
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  producer: string;
  coverImage: string;
  duration: number;
}

export default function AudioPlayer({ audioUrl, title, producer, coverImage, duration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    
    const current = audioRef.current.currentTime;
    setCurrentTime(current);
    
    // Calculate progress as percentage
    const progressPercentage = (current / audioRef.current.duration) * 100;
    setProgress(progressPercentage);
  };
  
  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = (value[0] / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${title} - ${producer}`,
        text: `Check out this track: ${title} by ${producer}`,
        url: window.location.href,
      })
      .catch((error) => {
        console.error('Error sharing:', error);
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Share this link with your friends.",
    });
  };
  
  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  useEffect(() => {
    // Initialize audio
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', () => {});
        audioRef.current = null;
      }
    };
  }, [audioUrl]);
  
  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="p-4 md:p-6">
        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            
            <div className="flex-1">
              <Slider
                defaultValue={[0]} 
                value={[progress]}
                max={100}
                step={0.1}
                onValueChange={handleSliderChange}
                className="mb-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            <button 
              onClick={handleShare}
              className="p-2 text-muted-foreground hover:text-foreground"
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
