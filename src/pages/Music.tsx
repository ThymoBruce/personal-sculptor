
import React, { useEffect, useState } from 'react';
import { getSongs, getSpotifyTracks } from "@/lib/api";
import { Song } from "@/lib/types";
import { Music, PlayCircle, PauseCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import SpotifyTrack from "@/components/music/SpotifyTrack";

const MusicPage = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState("local"); // "local" or "spotify"

  // Query to fetch local songs
  const { data: songs, isLoading: loadingLocal, error: localError } = useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const response = await getSongs();
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    }
  });
  
  // Query to fetch Spotify tracks
  const { data: spotifyData, isLoading: loadingSpotify, error: spotifyError } = useQuery({
    queryKey: ['spotify-tracks'],
    queryFn: async () => {
      const response = await getSpotifyTracks();
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
  
  const isLoading = activeTab === "local" ? loadingLocal : loadingSpotify;
  const error = activeTab === "local" ? localError : spotifyError;
  const hasLocalContent = songs && songs.length > 0;
  const hasSpotifyContent = spotifyData && spotifyData.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold mb-6">Music</h1>
      <p className="text-gray-600 mb-8">
        Check out my latest music releases and favorite tracks.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="local" className="flex items-center gap-2">
            <Music size={16} />
            <span>My Music</span>
          </TabsTrigger>
          <TabsTrigger value="spotify" className="flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span>Spotify</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="local">
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
          ) : hasLocalContent ? (
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
        </TabsContent>
        
        <TabsContent value="spotify">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="bg-gray-200 w-16 h-16 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load Spotify tracks. Please try again later.</p>
            </div>
          ) : hasSpotifyContent ? (
            <div className="space-y-1">
              {spotifyData.map((track: any) => (
                <SpotifyTrack
                  key={track.id}
                  id={track.id}
                  title={track.title}
                  artist={track.spotify_artists?.artist_name || "Unknown Artist"}
                  album={track.album_name}
                  coverImage={track.cover_image_url}
                  previewUrl={track.preview_url}
                  spotifyUrl={track.spotify_url}
                  releaseDate={track.release_date}
                  duration={track.duration_ms}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <svg className="h-10 w-10 mx-auto mb-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <h3 className="text-lg font-medium mb-2">No Spotify tracks available</h3>
              <p className="text-muted-foreground">Add Spotify artists in the admin dashboard</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {((activeTab === "local" && hasLocalContent) || (activeTab === "spotify" && hasSpotifyContent)) && (
        <div className="mt-12">
          <Separator className="my-8" />
          <h2 className="text-2xl font-bold mb-4">About My Music</h2>
          <p className="text-gray-600">
            I create and curate music that blends different styles and influences. My compositions 
            aim to create atmospheric soundscapes that evoke emotion and tell stories. 
            Feel free to listen to my tracks and explore my favorite artists!
          </p>
        </div>
      )}
    </div>
  );
};

export default MusicPage;
