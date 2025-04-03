
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createSong, updateSong, uploadSongAudio, uploadSongCover } from "@/lib/api-supabase";
import { Song } from "@/lib/types";
import { Loader2 } from "lucide-react";

const songSchema = z.object({
  title: z.string().min(1, "Title is required"),
  producer: z.string().min(1, "Producer name is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 second"),
  release_date: z.string().min(1, "Release date is required"),
  streaming_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type SongFormValues = z.infer<typeof songSchema>;

interface SongFormProps {
  song?: Song;
  onSuccess: () => void;
}

export default function SongForm({ song, onSuccess }: SongFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SongFormValues>({
    resolver: zodResolver(songSchema),
    defaultValues: song
      ? {
          title: song.title,
          producer: song.producer,
          duration: song.duration,
          release_date: new Date(song.release_date).toISOString().split("T")[0],
          streaming_url: song.streaming_url || "",
        }
      : {
          title: "",
          producer: "",
          duration: 0,
          release_date: new Date().toISOString().split("T")[0],
          streaming_url: "",
        },
  });

  const onSubmit = async (data: SongFormValues) => {
    setIsSubmitting(true);
    
    try {
      let audioUrl = song?.audio_url;
      let coverImageUrl = song?.cover_image;
      
      // Handle audio upload if provided
      if (audioFile) {
        const audioResponse = await uploadSongAudio(audioFile);
        if (audioResponse.error) throw new Error(audioResponse.error.message);
        audioUrl = audioResponse.data;
      }
      
      // Handle cover image upload if provided
      if (coverFile) {
        const coverResponse = await uploadSongCover(coverFile);
        if (coverResponse.error) throw new Error(coverResponse.error.message);
        coverImageUrl = coverResponse.data;
      }
      
      if (!audioUrl && !audioFile) {
        throw new Error("Audio file is required");
      }
      
      if (!coverImageUrl && !coverFile) {
        throw new Error("Cover image is required");
      }
      
      // Process streaming URL
      const streaming_url = data.streaming_url?.trim() ? data.streaming_url : null;
      
      // Prepare song data
      const songData = {
        title: data.title,
        producer: data.producer,
        duration: data.duration,
        release_date: new Date(data.release_date).toISOString(),
        audio_url: audioUrl!,
        cover_image: coverImageUrl!,
        streaming_url
      };
      
      const response = song
        ? await updateSong(song.id, songData)
        : await createSong(songData);
      
      if (response.error) throw new Error(response.error.message);
      
      toast({
        title: song ? "Song Updated" : "Song Created",
        description: song ? "The song has been updated successfully" : "The song has been created successfully",
      });
      
      // Reset form and state
      if (!song) {
        reset();
        setAudioFile(null);
        setCoverFile(null);
      }
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save song",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{song ? "Edit Song" : "Add New Song"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="producer">Producer / Artist</Label>
            <Input id="producer" {...register("producer")} />
            {errors.producer && (
              <p className="text-sm text-destructive">
                {errors.producer.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="release_date">Release Date</Label>
            <Input
              id="release_date"
              type="date"
              {...register("release_date")}
            />
            {errors.release_date && (
              <p className="text-sm text-destructive">
                {errors.release_date.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              {...register("duration")}
            />
            {errors.duration && (
              <p className="text-sm text-destructive">
                {errors.duration.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="streaming_url">Streaming URL (optional)</Label>
            <Input 
              id="streaming_url" 
              type="url" 
              placeholder="https://open.spotify.com/track/..." 
              {...register("streaming_url")} 
            />
            {errors.streaming_url && (
              <p className="text-sm text-destructive">
                {errors.streaming_url.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Link to the song on a streaming platform like Spotify, Apple Music, etc.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio">Audio File {!song && "(required)"}</Label>
            <Input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            />
            {song && !audioFile && (
              <p className="text-xs text-muted-foreground">
                Leave empty to keep current audio
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image {!song && "(required)"}</Label>
            <Input
              id="cover"
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />
            {song && !coverFile && (
              <p className="text-xs text-muted-foreground">
                Leave empty to keep current cover image
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {song ? "Update Song" : "Create Song"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
