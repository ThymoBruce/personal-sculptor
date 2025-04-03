
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSongs, deleteSong } from "@/lib/api-supabase";
import { Song } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash, Plus, ExternalLink, Music } from "lucide-react";
import SongForm from "@/components/admin/SongForm";
import { formatDistanceToNow } from "date-fns";
import SpotifyArtistManager from "@/components/admin/SpotifyArtistManager";
import { useToast } from "@/hooks/use-toast";

export default function MusicManager() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isAddingSong, setIsAddingSong] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch songs
  const { data: songs, isLoading, error } = useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const response = await getSongs();
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    }
  });

  // Delete song mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSong(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      toast({
        title: "Song Deleted",
        description: "The song has been deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete song",
        variant: "destructive"
      });
    }
  });

  const handleDeleteSong = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSongSuccess = () => {
    setSelectedSong(null);
    setIsAddingSong(false);
    queryClient.invalidateQueries({ queryKey: ['songs'] });
  };

  // Render different view based on state
  const renderContent = () => {
    if (selectedSong) {
      return (
        <div>
          <Button 
            variant="ghost" 
            onClick={() => setSelectedSong(null)} 
            className="mb-4"
          >
            ← Back to Songs
          </Button>
          <SongForm song={selectedSong} onSuccess={handleSongSuccess} />
        </div>
      );
    }

    if (isAddingSong) {
      return (
        <div>
          <Button 
            variant="ghost" 
            onClick={() => setIsAddingSong(false)} 
            className="mb-4"
          >
            ← Back to Songs
          </Button>
          <SongForm onSuccess={handleSongSuccess} />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Your Songs</h3>
          <Button onClick={() => setIsAddingSong(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Song
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-destructive">
            <p>Error loading songs: {error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        ) : songs && songs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {songs.map((song) => (
              <Card key={song.id} className="overflow-hidden">
                <div className="flex">
                  <div className="w-20 h-20 flex-shrink-0">
                    <img 
                      src={song.cover_image} 
                      alt={song.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <CardContent className="flex-grow p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div>
                        <h4 className="font-bold">{song.title}</h4>
                        <p className="text-sm text-muted-foreground">{song.producer}</p>
                        <div className="flex flex-wrap items-center mt-1 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>{formatDuration(song.duration)}</span>
                          <span>{formatDistanceToNow(new Date(song.release_date), { addSuffix: true })}</span>
                          {song.streaming_url && (
                            <a 
                              href={song.streaming_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center"
                            >
                              <ExternalLink size={12} className="mr-1" /> Streaming Link
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-2 sm:mt-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedSong(song)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Song</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{song.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteSong(song.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-muted/20 rounded-lg">
            <Music className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Songs Added Yet</h3>
            <p className="text-muted-foreground mb-4">Add your first song to showcase your music</p>
            <Button onClick={() => setIsAddingSong(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Song
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Music Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="songs" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="songs">Your Songs</TabsTrigger>
              <TabsTrigger value="spotify">Spotify Artists</TabsTrigger>
            </TabsList>
            <TabsContent value="songs" className="space-y-6">
              {renderContent()}
            </TabsContent>
            <TabsContent value="spotify" className="space-y-6">
              <SpotifyArtistManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

