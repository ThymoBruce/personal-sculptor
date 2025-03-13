
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
  order: number;
  is_active: boolean;
}

export interface Song {
  id: string;
  title: string;
  producer: string;
  coverImage: string;
  audioUrl: string;
  releaseDate: string;
  duration: number; // in seconds
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string | null;
  publishedDate: string;
  tags: string[];
  isPublished: boolean;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
