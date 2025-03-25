
import React, { useEffect, useState } from 'react';
import { getSongs } from "@/lib/api";
import { Song } from "@/lib/types";
import { Music, PlayCircle, PauseCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

const MusicPage = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const { data: songs, isLoading, error } = useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const response = await getSongs();
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    }
  });
  
  useEffect(() => {
    // Clean up audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlayback = (songId: string, audioUrl: string) => {
    if (currentlyPlaying === songId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentlyPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audio.play();
      audioRef.current = audio;
      setCurrentlyPlaying(songId);
      
      audio.onended = () => {
        setCurrentlyPlaying(null);
      };
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold mb-6">Music</h1>
      <p className="text-gray-600 mb-8">
        Check out my latest music releases and projects.
      </p>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load music tracks. Please try again later.</p>
        </div>
      ) : songs && songs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {songs.map((song: Song) => (
            <Card key={song.id} className="overflow-hidden">
              <div className="flex items-stretch h-full">
                <div className="aspect-square w-32 flex-shrink-0 relative">
                  <img 
                    src={song.cover_image || '/placeholder.svg'} 
                    alt={song.title} 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    onClick={() => togglePlayback(song.id, song.audio_url)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/50"
                  >
                    {currentlyPlaying === song.id ? (
                      <PauseCircle size={40} className="text-white" />
                    ) : (
                      <PlayCircle size={40} className="text-white" />
                    )}
                  </button>
                </div>
                <CardContent className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{song.title}</h3>
                    <p className="text-muted-foreground text-sm">{song.producer}</p>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(song.duration)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(song.release_date).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <Music size={40} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No music available yet</h3>
          <p className="text-muted-foreground">Check back soon for new releases</p>
        </div>
      )}

      {songs && songs.length > 0 && (
        <div className="mt-12">
          <Separator className="my-8" />
          <h2 className="text-2xl font-bold mb-4">About My Music</h2>
          <p className="text-gray-600">
            I create music that blends electronic and acoustic elements. My compositions 
            aim to create atmospheric soundscapes that evoke emotion and tell stories 
            without words. Feel free to listen to my tracks and share your thoughts!
          </p>
        </div>
      )}
    </div>
  );
};

export default MusicPage;
