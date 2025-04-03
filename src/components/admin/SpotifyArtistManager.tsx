import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addSpotifyArtist, removeSpotifyArtist, syncSpotifyTracks } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { RefreshCw, Trash, Music, Plus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SpotifyArtist } from "@/lib/types";

export default function SpotifyArtistManager() {
  const [artistId, setArtistId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch artists
  const { data: artists, isLoading, error } = useQuery({
    queryKey: ["spotify-artists"],
    queryFn: async () => {
      // Use type casting for now
      const { data, error } = await supabase
        .from('spotify_artists')
        .select('*')
        .order('artist_name') as any;
      
      if (error) throw error;
      return data as SpotifyArtist[];
    }
  });

  // Mutation to add an artist
  const addArtistMutation = useMutation({
    mutationFn: (artistId: string) => addSpotifyArtist(artistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spotify-artists"] });
      queryClient.invalidateQueries({ queryKey: ["spotify-tracks"] });
      setArtistId("");
      toast({
        title: "Artist Added",
        description: "Artist and tracks have been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add artist",
        variant: "destructive",
      });
    },
  });

  // Mutation to remove an artist
  const removeArtistMutation = useMutation({
    mutationFn: (artistId: string) => removeSpotifyArtist(artistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spotify-artists"] });
      queryClient.invalidateQueries({ queryKey: ["spotify-tracks"] });
      toast({
        title: "Artist Removed",
        description: "Artist and tracks have been removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove artist",
        variant: "destructive",
      });
    },
  });

  // Mutation to sync tracks
  const syncTracksMutation = useMutation({
    mutationFn: () => syncSpotifyTracks(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spotify-tracks"] });
      toast({
        title: "Sync Complete",
        description: "Tracks have been synchronized successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sync tracks",
        variant: "destructive",
      });
    },
  });

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!artistId) {
      toast({
        title: "Error",
        description: "Please enter a Spotify artist ID",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addArtistMutation.mutateAsync(artistId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveArtist = async (artistId: string) => {
    if (!window.confirm("Are you sure you want to remove this artist and all their tracks?")) {
      return;
    }

    await removeArtistMutation.mutateAsync(artistId);
  };

  const handleSyncTracks = async () => {
    await syncTracksMutation.mutateAsync();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Error Loading Artists</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Failed to load Spotify artists."}
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Spotify Artists
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSyncTracks}
            disabled={syncTracksMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncTracksMutation.isPending ? 'animate-spin' : ''}`} />
            Sync All Tracks
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddArtist} className="mb-6 flex gap-2">
          <Input
            placeholder="Enter Spotify Artist ID"
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" disabled={isSubmitting || !artistId}>
            <Plus className="h-4 w-4 mr-2" />
            Add Artist
          </Button>
        </form>

        {artists && artists.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artist Name</TableHead>
                <TableHead>Artist ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artists.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell className="font-medium">{artist.artist_name}</TableCell>
                  <TableCell>{artist.artist_id}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveArtist(artist.artist_id)}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 bg-muted/20 rounded-lg">
            <Music className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">No Spotify Artists Added</h3>
            <p className="text-muted-foreground">
              Add a Spotify artist ID to display their tracks on your music page.
            </p>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            To get an artist ID, go to their Spotify profile and copy the ID from the URL.
            <br />
            Example: https://open.spotify.com/artist/<strong>4Z8W4fKeB5YxbusRsdQVPb</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
