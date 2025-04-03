
import React, { useEffect, useState } from 'react';
import { getSongs, getSpotifyTracks } from "@/lib/api";
import { Song, SpotifyTrack } from "@/lib/types";
import { Music, PlayCircle, PauseCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import SpotifyTrackItem from "@/components/music/SpotifyTrack";
import { Badge } from "@/components/ui/badge";

// Create a unified type for both local and Spotify tracks
type UnifiedTrack = {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  duration: number;
  releaseDate: string;
  previewUrl: string | null;
  externalUrl?: string;
  type: 'local' | 'spotify';
  originalData: Song | SpotifyTrack;
};

const MusicPage = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allTracks, setAllTracks] = useState<UnifiedTrack[]>([]);
  
  // Query to fetch local songs
  const { data: songs, isLoading: loadingLocal } = useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const response = await getSongs();
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    }
  });
  
  // Query to fetch Spotify tracks
  const { data: spotifyData, isLoading: loadingSpotify } = useQuery({
    queryKey: ['spotify-tracks'],
    queryFn: async () => {
      const response = await getSpotifyTracks();
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    }
  });
  
  // Create unified track list when data is loaded
  useEffect(() => {
    const localTracks: UnifiedTrack[] = (songs || []).map((song: Song) => ({
      id: `local-${song.id}`,
      title: song.title,
      artist: song.producer,
      coverImage: song.cover_image,
      duration: song.duration * 1000, // Convert seconds to ms for consistency
      releaseDate: song.release_date,
      previewUrl: song.audio_url,
      externalUrl: song.streaming_url,
      type: 'local',
      originalData: song
    }));

    const spotifyTracks: UnifiedTrack[] = (spotifyData || []).map((track: SpotifyTrack) => ({
      id: `spotify-${track.id}`,
      title: track.title,
      artist: track.spotify_artists?.artist_name || "Unknown Artist",
      coverImage: track.cover_image_url,
      duration: track.duration_ms,
      releaseDate: track.release_date,
      previewUrl: track.preview_url,
      externalUrl: track.spotify_url,
      type: 'spotify',
      originalData: track
    }));

    // Combine and sort by release date (newest first)
    const combined = [...localTracks, ...spotifyTracks].sort((a, b) => 
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );
    
    setAllTracks(combined);
  }, [songs, spotifyData]);

  useEffect(() => {
    // Clean up audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlayback = (trackId: string, audioUrl: string | null) => {
    if (!audioUrl) return;
    
    if (currentlyPlaying === trackId) {
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
      setCurrentlyPlaying(trackId);
      
      audio.onended = () => {
        setCurrentlyPlaying(null);
      };
    }
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Filter tracks based on search query
  const filteredTracks = searchQuery 
    ? allTracks.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allTracks;
  
  const isLoading = loadingLocal || loadingSpotify;
  const hasTracks = filteredTracks.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold mb-6">Music</h1>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <p className="text-gray-600 max-w-2xl">
          Check out my latest music releases and favorite tracks from Spotify.
        </p>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Search by title or artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      ) : !hasTracks ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <Music size={40} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No music available yet</h3>
          <p className="text-muted-foreground">Check back soon for new releases</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTracks.map((track) => (
            track.type === 'spotify' ? (
              <SpotifyTrackItem
                key={track.id}
                id={track.id}
                title={track.title}
                artist={track.artist}
                album={(track.originalData as SpotifyTrack).album_name || ""}
                coverImage={track.coverImage}
                previewUrl={track.previewUrl}
                spotifyUrl={track.externalUrl || ""}
                releaseDate={track.releaseDate}
                duration={track.duration}
              />
            ) : (
              <Card key={track.id} className="overflow-hidden">
                <div className="flex items-stretch h-full">
                  <div className="aspect-square w-20 md:w-24 flex-shrink-0 relative">
                    <img 
                      src={track.coverImage || '/placeholder.svg'} 
                      alt={track.title} 
                      className="w-full h-full object-cover"
                    />
                    {track.previewUrl && (
                      <button 
                        onClick={() => togglePlayback(track.id, track.previewUrl)}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/50"
                        aria-label={currentlyPlaying === track.id ? "Pause" : "Play"}
                      >
                        {currentlyPlaying === track.id ? (
                          <PauseCircle size={36} className="text-white" />
                        ) : (
                          <PlayCircle size={36} className="text-white" />
                        )}
                      </button>
                    )}
                  </div>
                  <CardContent className="p-3 md:p-4 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-base md:text-lg mb-1 pr-10">{track.title}</h3>
                          <p className="text-muted-foreground text-sm">{track.artist}</p>
                        </div>
                        <Badge variant={track.type === 'local' ? 'default' : 'secondary'} className="ml-2 mt-1">
                          {track.type === 'local' ? 'My Music' : 'Spotify'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
                      <span>{formatDuration(track.duration)}</span>
                      <div className="flex items-center gap-2">
                        <span>{new Date(track.releaseDate).toLocaleDateString()}</span>
                        {track.externalUrl && (
                          <a 
                            href={track.externalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Open on streaming platform"
                            title="Listen on streaming platform"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )
          ))}
        </div>
      )}

      {hasTracks && (
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
