
import { useState, useEffect } from "react";
import { getSongs } from "@/lib/api";
import { Song } from "@/lib/types";
import AudioPlayer from "@/components/music/AudioPlayer";
import { Disc3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Music() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  
  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
      try {
        const response = await getSongs();
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        setSongs(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSongs();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Disc3 size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No music available yet</h3>
          <p className="text-muted-foreground">Check back soon for new releases!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-6">
            Music
          </h1>
          <p className="text-muted-foreground mx-auto max-w-[700px]">
            Listen to my latest tracks and productions. All available for licensing and collaboration.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {songs.map((song) => (
            <div
              key={song.id}
              className="group relative bg-card rounded-lg overflow-hidden border"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105" 
                style={{ 
                  backgroundImage: `url(${song.cover_image})`,
                  filter: 'blur(10px)',
                  opacity: 0.2,
                }}
              />
              <div className="relative p-6 flex flex-col h-full">
                <div className="flex gap-4 mb-4">
                  <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                    <img 
                      src={song.cover_image} 
                      alt={song.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{song.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{song.producer}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(song.release_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <AudioPlayer 
                    audioUrl={song.audio_url}
                    title={song.title}
                    duration={song.duration}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            Like what you hear? Get in touch for collaborations, licensing, or custom music production.
          </p>
          <Link to="/contact">
            <Button>
              Contact Me
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
