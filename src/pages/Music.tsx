
import { useState, useEffect } from "react";
import { getSongs } from "@/lib/api";
import { Song } from "@/lib/types";
import AudioPlayer from "@/components/music/AudioPlayer";
import { Disc3 } from "lucide-react";

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

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 animate-fadeIn">
              My Music
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto animate-slideUp animate-delay-100">
              When I'm not coding, I produce electronic music. Check out some of my tracks below.
            </p>
          </div>
          
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background border border-border rounded-lg overflow-hidden shadow-sm h-[200px]">
                  <div className="flex h-full">
                    <div className="w-1/3 max-w-[200px] bg-secondary/50"></div>
                    <div className="flex-1 p-6">
                      <div className="h-6 bg-secondary/50 rounded w-1/3 mb-3"></div>
                      <div className="h-4 bg-secondary/50 rounded w-1/4 mb-6"></div>
                      <div className="h-10 flex items-center space-x-4">
                        <div className="rounded-full h-10 w-10 bg-secondary/50"></div>
                        <div className="h-4 bg-secondary/50 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Disc3 size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-destructive mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Try Again
              </button>
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-12">
              <Disc3 size={48} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No tracks available</h2>
              <p className="text-muted-foreground">Check back soon for new music.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {songs.map((song) => (
                <div key={song.id} className="animate-fadeIn">
                  <AudioPlayer 
                    audioUrl={song.audioUrl}
                    title={song.title}
                    producer={song.producer}
                    coverImage={song.coverImage}
                    duration={song.duration}
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-16 p-6 bg-secondary/30 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Looking for Collaboration?</h2>
            <p className="text-muted-foreground mb-4">
              I'm always open to collaborating with other musicians and producers. If you're interested in working together, 
              please reach out through the contact form.
            </p>
            <a href="/contact" className="text-primary hover:underline font-medium">
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
