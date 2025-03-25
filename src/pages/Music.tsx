import { useState, useEffect } from "react";
import { getSongs } from "@/lib/api";
import { Song } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AudioPlayer from "@/components/music/AudioPlayer";
import { Play, Calendar, Clock } from "lucide-react";

export default function Music() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSong, setActiveSong] = useState<Song | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const response = await getSongs();
        if (response.error) {
          throw new Error(response.error.message);
        }
        setSongs(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load songs");
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Switch to full player mode
  const handleExpandClick = () => {
    const fullPlayerTab = document.querySelector('[data-state="inactive"][data-value="full-player"]');
    if (fullPlayerTab instanceof HTMLElement) {
      fullPlayerTab.click();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
            Music
          </h1>
          <p className="text-muted-foreground">
            Listen to my latest releases and explore my musical journey.
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="all">All Releases</TabsTrigger>
            <TabsTrigger value="recent">Recent Releases</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="text-center py-20">
                <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading music...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <h3 className="text-xl font-medium mb-2">
                  Oops! Something went wrong.
                </h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : songs.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-xl font-medium mb-2">No music yet</h3>
                <p className="text-muted-foreground">
                  Check back soon for new releases.
                </p>
              </div>
            ) : (
              <>
                {activeSong && (
                  <Card className="bg-card/50 backdrop-blur mb-8">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-grow">
                          <h3 className="text-2xl font-bold mb-2">
                            {activeSong.title}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Producer: {activeSong.producer}
                          </p>
                          <AudioPlayer
                            audioUrl={activeSong.audio_url}
                            title={activeSong.title}
                            producer={activeSong.producer}
                            coverImage={activeSong.cover_image}
                            duration={activeSong.duration}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {songs.map((song) => (
                    <Card
                      key={song.id}
                      className={`transition-colors hover:bg-accent/20 cursor-pointer ${
                        activeSong?.id === song.id ? "border-primary" : ""
                      }`}
                      onClick={() => setActiveSong(song)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={song.cover_image}
                              alt={song.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-semibold">{song.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {song.producer}
                            </p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center text-muted-foreground text-sm">
                              <Calendar size={14} className="mr-1" />
                              {new Date(song.release_date).toLocaleDateString(
                                "en-US",
                                { year: "numeric", month: "short" }
                              )}
                            </div>
                            <div className="flex items-center text-muted-foreground text-sm">
                              <Clock size={14} className="mr-1" />
                              {formatDuration(song.duration)}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSong(song);
                              }}
                            >
                              <Play size={18} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {loading ? (
              <div className="text-center py-20">
                <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading music...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <h3 className="text-xl font-medium mb-2">
                  Oops! Something went wrong.
                </h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : songs.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-xl font-medium mb-2">No music yet</h3>
                <p className="text-muted-foreground">
                  Check back soon for new releases.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {songs
                    .slice(0, 4)
                    .map((song) => (
                      <Card
                        key={song.id}
                        className="transition-colors hover:bg-accent/20 cursor-pointer"
                        onClick={() => setActiveSong(song)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={song.cover_image}
                                alt={song.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-grow">
                              <h3 className="font-semibold">{song.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {song.producer}
                              </p>
                              <Button
                                variant="link"
                                size="sm"
                                className="px-0 h-6 mt-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSong(song);
                                }}
                              >
                                <Play size={12} className="mr-1" /> Play Now
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
                {songs.length > 4 && (
                  <div className="text-center mt-6">
                    <Button onClick={() => document.querySelector('[data-value="all"]')?.click()}>
                      View All Releases
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
