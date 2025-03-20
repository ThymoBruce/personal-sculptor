import { supabase } from "@/integrations/supabase/client";
import { Link, ApiResponse, Song, BlogPost, Project, Category, Attachment, Profile } from "./types";

// Links Management
export async function getLinksFromSupabase(): Promise<ApiResponse<Link[]>> {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('display_order');
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch links', 
        status: error.status || 500 
      } 
    };
  }
}

export async function createLink(link: Omit<Link, 'id'>): Promise<ApiResponse<Link>> {
  try {
    const { data, error } = await supabase
      .from('links')
      .insert([link])
      .select()
      .single();
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to create link', 
        status: error.status || 500 
      } 
    };
  }
}

export async function updateLink(id: string, link: Partial<Link>): Promise<ApiResponse<Link>> {
  try {
    const { data, error } = await supabase
      .from('links')
      .update(link)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to update link', 
        status: error.status || 500 
      } 
    };
  }
}

export async function deleteLink(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { data: null };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to delete link', 
        status: error.status || 500 
      } 
    };
  }
}

// Resume Management
export async function uploadResume(file: File): Promise<ApiResponse<string>> {
  try {
    const fileName = `resume-${Date.now()}.pdf`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const publicUrl = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);
    
    // Save the reference to the resume in the settings table
    await supabase
      .from('settings')
      .upsert({ key: 'resume_url', value: publicUrl.data.publicUrl });
    
    return { data: publicUrl.data.publicUrl };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to upload resume', 
        status: error.status || 500 
      } 
    };
  }
}

export async function getResumeUrl(): Promise<ApiResponse<string>> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'resume_url')
      .single();
    
    if (error) throw error;
    
    return { data: data.value };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch resume URL', 
        status: error.status || 500 
      } 
    };
  }
}

// Projects Management
export async function getProjects(): Promise<ApiResponse<Project[]>> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, categories(*)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Process the data to match our types
    const typedData = data?.map(project => {
      return {
        ...project,
        status: project.status as 'draft' | 'published',
        category: project.categories as Category
      };
    }) as Project[];
    
    return { data: typedData };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch projects', 
        status: error.status || 500 
      } 
    };
  }
}

export async function getProjectById(id: string): Promise<ApiResponse<Project>> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, categories(*), attachments(*)')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();
    
    if (error) throw error;
    
    const typedData = {
      ...data,
      status: data.status as 'draft' | 'published',
      category: data.categories as Category
    } as Project;
    
    return { data: typedData };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch project', 
        status: error.status || 500 
      } 
    };
  }
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Project>> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    
    if (error) throw error;
    
    const typedData = {
      ...data,
      status: data.status as 'draft' | 'published'
    } as Project;
    
    return { data: typedData };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to create project', 
        status: error.status || 500 
      } 
    };
  }
}

export async function updateProject(id: string, project: Partial<Project>): Promise<ApiResponse<Project>> {
  try {
    // Add updated_at timestamp
    const updatedProject = {
      ...project,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('projects')
      .update(updatedProject)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    const typedData = {
      ...data,
      status: data.status as 'draft' | 'published'
    } as Project;
    
    return { data: typedData };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to update project', 
        status: error.status || 500 
      } 
    };
  }
}

export async function deleteProject(id: string): Promise<ApiResponse<null>> {
  try {
    // Use soft delete by setting is_deleted to true
    const { error } = await supabase
      .from('projects')
      .update({ is_deleted: true })
      .eq('id', id);
    
    if (error) throw error;
    
    return { data: null };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to delete project', 
        status: error.status || 500 
      } 
    };
  }
}

// Project Categories Management
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch categories', 
        status: error.status || 500 
      } 
    };
  }
}

// Music Management
export async function getSongs(): Promise<ApiResponse<Song[]>> {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('release_date', { ascending: false });
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch songs', 
        status: error.status || 500 
      } 
    };
  }
}

export async function getSongById(id: string): Promise<ApiResponse<Song>> {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch song', 
        status: error.status || 500 
      } 
    };
  }
}

export async function createSong(song: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Song>> {
  try {
    const { data, error } = await supabase
      .from('songs')
      .insert([song])
      .select()
      .single();
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to create song', 
        status: error.status || 500 
      } 
    };
  }
}

export async function updateSong(id: string, song: Partial<Song>): Promise<ApiResponse<Song>> {
  try {
    // Add updated_at timestamp
    const updatedSong = {
      ...song,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('songs')
      .update(updatedSong)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to update song', 
        status: error.status || 500 
      } 
    };
  }
}

export async function deleteSong(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { data: null };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to delete song', 
        status: error.status || 500 
      } 
    };
  }
}

// Upload song audio file
export async function uploadSongAudio(file: File): Promise<ApiResponse<string>> {
  try {
    const fileName = `song-${Date.now()}.${file.name.split('.').pop()}`;
    
    const { data, error } = await supabase.storage
      .from('audio')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const publicUrl = supabase.storage
      .from('audio')
      .getPublicUrl(fileName);
    
    return { data: publicUrl.data.publicUrl };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to upload audio file', 
        status: error.status || 500 
      } 
    };
  }
}

// Upload song cover image
export async function uploadSongCover(file: File): Promise<ApiResponse<string>> {
  try {
    const fileName = `cover-${Date.now()}.${file.name.split('.').pop()}`;
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const publicUrl = supabase.storage
      .from('images')
      .getPublicUrl(fileName);
    
    return { data: publicUrl.data.publicUrl };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to upload cover image', 
        status: error.status || 500 
      } 
    };
  }
}

// Blog Posts Management
export async function getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_date', { ascending: false });
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch blog posts', 
        status: error.status || 500 
      } 
    };
  }
}

export async function getBlogPostById(id: string): Promise<ApiResponse<BlogPost>> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch blog post', 
        status: error.status || 500 
      } 
    };
  }
}

export async function getBlogPostBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch blog post', 
        status: error.status || 500 
      } 
    };
  }
}

export async function createBlogPost(blogPost: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<BlogPost>> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([blogPost])
      .select()
      .single();
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to create blog post', 
        status: error.status || 500 
      } 
    };
  }
}

export async function updateBlogPost(id: string, blogPost: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
  try {
    // Add updated_at timestamp
    const updatedBlogPost = {
      ...blogPost,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updatedBlogPost)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to update blog post', 
        status: error.status || 500 
      } 
    };
  }
}

export async function deleteBlogPost(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { data: null };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to delete blog post', 
        status: error.status || 500 
      } 
    };
  }
}

// Upload blog post cover image
export async function uploadBlogCover(file: File): Promise<ApiResponse<string>> {
  try {
    const fileName = `blog-cover-${Date.now()}.${file.name.split('.').pop()}`;
    
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const publicUrl = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);
    
    return { data: publicUrl.data.publicUrl };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to upload blog cover image', 
        status: error.status || 500 
      } 
    };
  }
}

// User Profile Management
export async function getProfile(userId?: string): Promise<ApiResponse<Profile>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no userId is provided, get the current user's profile
    const targetUserId = userId || session?.user?.id;
    
    if (!targetUserId) {
      throw new Error('User ID is required');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch profile', 
        status: error.status || 500 
      } 
    };
  }
}

export async function updateProfile(profile: Partial<Profile>): Promise<ApiResponse<Profile>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User must be logged in to update profile');
    }
    
    // Add updated_at timestamp
    const updatedProfile = {
      ...profile,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updatedProfile)
      .eq('id', session.user.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to update profile', 
        status: error.status || 500 
      } 
    };
  }
}

// Upload profile avatar
export async function uploadAvatar(file: File): Promise<ApiResponse<string>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User must be logged in to upload avatar');
    }
    
    const fileName = `avatar-${session.user.id}.${file.name.split('.').pop()}`;
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    const publicUrl = supabase.storage
      .from('images')
      .getPublicUrl(fileName);
    
    // Update the user's profile with the new avatar URL
    await updateProfile({ avatar_url: publicUrl.data.publicUrl });
    
    return { data: publicUrl.data.publicUrl };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to upload avatar', 
        status: error.status || 500 
      } 
    };
  }
}
