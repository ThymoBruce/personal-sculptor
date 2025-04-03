export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    status: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at?: string;
}

export interface Project {
  id: string;
  created_at?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  status: 'draft' | 'published';
  category_id: string;
  category?: Category;
  cover_image: string;
  is_featured: boolean;
  is_deleted: boolean;
  attachments?: Attachment[];
}

export interface Link {
  id: string;
  created_at?: string;
  title: string;
  url: string;
  display_order: number;
  is_active: boolean;
}

export interface Song {
  id: string;
  created_at?: string;
  title: string;
  producer: string;
  audio_url: string;
  cover_image: string;
  release_date: string;
  duration: number;
}

export interface BlogPost {
  id: string;
  created_at?: string;
  title: string;
  slug: string;
  content: string;
  published_date: string;
  is_published: boolean;
  cover_image: string;
  excerpt: string;
}

export interface Attachment {
  id: string;
  created_at?: string;
  name: string;
  url: string;
  project_id: string;
}

export interface SpotifyTrack {
  id: string;
  track_id: string;
  artist_id: string;
  title: string;
  album_name: string;
  release_date: string;
  duration_ms: number;
  cover_image_url: string;
  preview_url: string | null;
  spotify_url: string;
  spotify_artists?: {
    artist_name: string;
  };
}

export interface SpotifyArtist {
  id: string;
  artist_id: string;
  artist_name: string;
  created_at: string;
  updated_at: string;
}

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
