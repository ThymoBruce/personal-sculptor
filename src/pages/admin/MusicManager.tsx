import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash, Pencil, Music, PlayCircle, PauseCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSongs, createSong, updateSong, deleteSong, uploadSongAudio, uploadSongCover } from "@/lib/api-supabase";
import { Song } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import SpotifyArtistManager from "@/components/admin/SpotifyArtistManager";

export default function MusicManager() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const audioRef = useState<HTMLAudioElement | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    producer: "",
    duration: 0,
  });

  const [activeTab, setActiveTab] = useState("local");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login");
    } else if (!loading) {
      fetchSongs();
    }
  }, [user, loading, navigate]);

  const fetchSongs = async () => {
    setIsLoading(true);
    try {
      const response = await getSongs();
      if (response.error) {
        throw new Error(response.error.message);
      }
      setSongs(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch songs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "duration" ? parseInt(value) || 0 : value }));
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));

      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        setFormData(prev => ({ ...prev, duration: Math.round(audio.duration) }));
      };
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      producer: "",
      duration: 0,
    });
    setAudioFile(null);
    setCoverFile(null);
    setAudioPreview(null);
    setCoverPreview(null);
    setSelectedSong(null);
  };

  const handleEditSong = (song: Song) => {
    setSelectedSong(song);
    setFormData({
      title: song.title,
      producer: song.producer,
      duration: song.duration,
    });
    setAudioPreview(song.audio_url);
    setCoverPreview(song.cover_image);
  };

  const handleDeleteSong = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this song?")) return;

    try {
      const response = await deleteSong(id);
      if (response.error) throw new Error(response.error.message);
      
      toast({
        title: "Success",
        description: "Song deleted successfully",
      });
      
      fetchSongs();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete song",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let audio_url = selectedSong?.audio_url || "";
      let cover_image = selectedSong?.cover_image || "";

      if (audioFile) {
        const audioResponse = await uploadSongAudio(audioFile);
        if (audioResponse.error) throw new Error(audioResponse.error.message);
        audio_url = audioResponse.data || "";
      }

      if (coverFile) {
        const coverResponse = await uploadSongCover(coverFile);
        if (coverResponse.error) throw new Error(coverResponse.error.message);
        cover_image = coverResponse.data || "";
      }

      if (!formData.title || !formData.producer || !audio_url || !cover_image) {
        throw new Error("Please fill out all required fields");
      }

      const songData = {
        title: formData.title,
        producer: formData.producer,
        audio_url,
        cover_image,
        duration: formData.duration,
        release_date: new Date().toISOString(),
      };

      let response;
      if (selectedSong) {
        response = await updateSong(selectedSong.id, songData);
      } else {
        response = await createSong(songData);
      }

      if (response.error) throw new Error(response.error.message);

      toast({
        title: "Success",
        description: `Song ${selectedSong ? "updated" : "created"} successfully`,
      });

      resetForm();
      fetchSongs();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save song",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayback = (songId: string, audioUrl: string) => {
    if (currentlyPlaying === songId) {
      if (audioRef[0]) {
        audioRef[0].pause();
      }
      setCurrentlyPlaying(null);
    } else {
      if (audioRef[0]) {
        audioRef[0].pause();
      }
      const audio = new Audio(audioUrl);
      audio.play();
      audioRef[0] = audio;
      setCurrentlyPlaying(songId);
      
      audio.onended = () => {
        setCurrentlyPlaying(null);
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center mb-8">
          <Link to="/admin" className="mr-4 p-2 hover:bg-secondary/50 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Manage Music</h1>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="local">My Music</TabsTrigger>
            <TabsTrigger value="list">Music List</TabsTrigger>
            <TabsTrigger value="add">{selectedSong ? 'Edit Song' : 'Add New Song'}</TabsTrigger>
            <TabsTrigger value="spotify">Spotify Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="mt-6">
            <Tabs defaultValue="list">
              <TabsList className="mb-6">
                <TabsTrigger value="list">Music List</TabsTrigger>
                <TabsTrigger value="add">{selectedSong ? 'Edit Song' : 'Add New Song'}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-secondary/50 p-4 rounded-lg">
                        <div className="h-6 bg-secondary rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-secondary rounded w-full mb-2"></div>
                        <div className="h-4 bg-secondary rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : songs.length === 0 ? (
                  <div className="text-center py-12 bg-secondary/30 rounded-lg">
                    <Music size={40} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No songs yet</h3>
                    <p className="text-muted-foreground mb-4">Start adding your music tracks</p>
                    <Button onClick={() => {
                      setActiveTab("add");
                    }}>
                      <Plus size={16} className="mr-2" />
                      Add Your First Song
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Producer</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Release Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {songs.map((song) => (
                          <TableRow key={song.id} className="hover:bg-secondary/20 transition-colors">
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => togglePlayback(song.id, song.audio_url)}
                                aria-label={currentlyPlaying === song.id ? "Pause" : "Play"}
                              >
                                {currentlyPlaying === song.id ? (
                                  <PauseCircle size={20} />
                                ) : (
                                  <PlayCircle size={20} />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">{song.title}</TableCell>
                            <TableCell>{song.producer}</TableCell>
                            <TableCell>{formatDuration(song.duration)}</TableCell>
                            <TableCell>
                              {new Date(song.release_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    handleEditSong(song);
                                    setActiveTab("add");
                                  }}
                                >
                                  <Pencil size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSong(song.id)}
                                  className="text-destructive hover:text-destructive/80"
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="add">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedSong ? 'Edit Song' : 'Add New Song'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-1">
                              Title*
                            </label>
                            <Input
                              id="title"
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              placeholder="Song title"
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="producer" className="block text-sm font-medium mb-1">
                              Producer/Artist*
                            </label>
                            <Input
                              id="producer"
                              name="producer"
                              value={formData.producer}
                              onChange={handleInputChange}
                              placeholder="Producer or artist name"
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="duration" className="block text-sm font-medium mb-1">
                              Duration (seconds)
                            </label>
                            <Input
                              id="duration"
                              name="duration"
                              type="number"
                              value={formData.duration}
                              onChange={handleInputChange}
                              placeholder="Duration in seconds"
                              min="1"
                              required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDuration(formData.duration)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label htmlFor="audio" className="block text-sm font-medium mb-1">
                              Audio File {!selectedSong && '*'}
                            </label>
                            <Input
                              id="audio"
                              type="file"
                              accept="audio/*"
                              onChange={handleAudioChange}
                              className="mb-2"
                              required={!selectedSong}
                            />
                            {audioPreview && (
                              <div className="mt-2 p-3 bg-secondary/30 rounded-md">
                                <audio 
                                  controls 
                                  src={audioPreview} 
                                  className="w-full h-10" 
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <label htmlFor="cover" className="block text-sm font-medium mb-1">
                              Cover Image {!selectedSong && '*'}
                            </label>
                            <Input
                              id="cover"
                              type="file"
                              accept="image/*"
                              onChange={handleCoverChange}
                              className="mb-2"
                              required={!selectedSong}
                            />
                            {coverPreview && (
                              <div className="mt-2 aspect-square w-32 rounded-md overflow-hidden">
                                <img
                                  src={coverPreview}
                                  alt="Cover preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              Saving...
                            </>
                          ) : selectedSong ? (
                            'Update Song'
                          ) : (
                            'Add Song'
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="list" className="mt-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-secondary/50 p-4 rounded-lg">
                    <div className="h-6 bg-secondary rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-secondary rounded w-full mb-2"></div>
                    <div className="h-4 bg-secondary rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : songs.length === 0 ? (
              <div className="text-center py-12 bg-secondary/30 rounded-lg">
                <Music size={40} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No songs yet</h3>
                <p className="text-muted-foreground mb-4">Start adding your music tracks</p>
                <Button onClick={() => {
                  const tabTrigger = document.querySelector('[data-value="add"]');
                  if (tabTrigger instanceof HTMLElement) {
                    tabTrigger.click();
                  }
                }}>
                  <Plus size={16} className="mr-2" />
                  Add Your First Song
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Producer</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Release Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {songs.map((song) => (
                      <TableRow key={song.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePlayback(song.id, song.audio_url)}
                            aria-label={currentlyPlaying === song.id ? "Pause" : "Play"}
                          >
                            {currentlyPlaying === song.id ? (
                              <PauseCircle size={20} />
                            ) : (
                              <PlayCircle size={20} />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{song.title}</TableCell>
                        <TableCell>{song.producer}</TableCell>
                        <TableCell>{formatDuration(song.duration)}</TableCell>
                        <TableCell>
                          {new Date(song.release_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleEditSong(song);
                                const tabTrigger = document.querySelector('[data-value="add"]');
                                if (tabTrigger instanceof HTMLElement) {
                                  tabTrigger.click();
                                }
                              }}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSong(song.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{selectedSong ? 'Edit Song' : 'Add New Song'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-1">
                          Title*
                        </label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Song title"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="producer" className="block text-sm font-medium mb-1">
                          Producer/Artist*
                        </label>
                        <Input
                          id="producer"
                          name="producer"
                          value={formData.producer}
                          onChange={handleInputChange}
                          placeholder="Producer or artist name"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="duration" className="block text-sm font-medium mb-1">
                          Duration (seconds)
                        </label>
                        <Input
                          id="duration"
                          name="duration"
                          type="number"
                          value={formData.duration}
                          onChange={handleInputChange}
                          placeholder="Duration in seconds"
                          min="1"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDuration(formData.duration)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="audio" className="block text-sm font-medium mb-1">
                          Audio File {!selectedSong && '*'}
                        </label>
                        <Input
                          id="audio"
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioChange}
                          className="mb-2"
                          required={!selectedSong}
                        />
                        {audioPreview && (
                          <div className="mt-2 p-3 bg-secondary/30 rounded-md">
                            <audio 
                              controls 
                              src={audioPreview} 
                              className="w-full h-10" 
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="cover" className="block text-sm font-medium mb-1">
                          Cover Image {!selectedSong && '*'}
                        </label>
                        <Input
                          id="cover"
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="mb-2"
                          required={!selectedSong}
                        />
                        {coverPreview && (
                          <div className="mt-2 aspect-square w-32 rounded-md overflow-hidden">
                            <img
                              src={coverPreview}
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : selectedSong ? (
                        'Update Song'
                      ) : (
                        'Add Song'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="spotify" className="mt-6">
            <SpotifyArtistManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
