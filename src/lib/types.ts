
export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category_id: string;
  tags: string[];
  is_deleted: boolean;
  status: 'draft' | 'published';
  author_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  modified_by: string;
  category?: Category;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  project_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Document {
  id: string;
  name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  user_id: string;
  created_at: string;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
  user_id: string;
  created_at: string;
}

export interface Song {
  id: string;
  title: string;
  producer: string;
  cover_image: string;
  audio_url: string;
  release_date: string;
  duration: number; // in seconds
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  published_date: string;
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
