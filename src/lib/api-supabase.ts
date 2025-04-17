
import { ApiResponse, Project, Category, Link, Song, BlogPost } from './types';
import { supabase } from "@/integrations/supabase/client";

// Project API Functions
export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Project>> {
  try {
    // Ensure category_id is valid before creating the project
    if (!project.category_id) {
      throw new Error("Category ID is required");
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    
    if (error) throw error;
    
    const typedData = {
      ...data,
      status: data.status as 'draft' | 'published',
      image_url: data.image_url,
      website_url: data.website_url,
      github_url: data.github_url
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
      status: data.status as 'draft' | 'published',
      image_url: data.image_url,
      website_url: data.website_url,
      github_url: data.github_url
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
    // We use soft delete by setting is_deleted to true
    const { error } = await supabase
      .from('projects')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
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
        category: project.categories as unknown as Category,
        image_url: project.image_url,
        website_url: project.website_url,
        github_url: project.github_url
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

// Category API Functions
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return { data: data as Category[] };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch categories', 
        status: error.status || 500 
      } 
    };
  }
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Category>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as Category };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to create category', 
        status: error.status || 500 
      } 
    };
  }
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<ApiResponse<Category>> {
  try {
    // Add updated_at timestamp
    const updatedCategory = {
      ...category,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('categories')
      .update(updatedCategory)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as Category };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to update category', 
        status: error.status || 500 
      } 
    };
  }
}

export async function deleteCategory(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { data: null };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to delete category', 
        status: error.status || 500 
      } 
    };
  }
}

// Resume API Functions
export async function uploadResume(file: File): Promise<ApiResponse<string>> {
  try {
    // Upload to storage
    const fileName = 'resume.pdf';
    const filePath = `resumes/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file, {
        upsert: true,
        contentType: 'application/pdf'
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);
    
    // Store reference in settings table
    await supabase
      .from('settings')
      .upsert({ 
        key: 'resume_url', 
        value: data.publicUrl,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'key' 
      });
    
    return { data: data.publicUrl };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to upload resume', 
        status: error.status || 500 
      } 
    };
  }
}

export async function getResumeUrl(): Promise<ApiResponse<string | null>> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'resume_url')
      .maybeSingle();
    
    if (error) throw error;
    
    return { data: data?.value || null };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to get resume URL', 
        status: error.status || 500 
      } 
    };
  }
}

// Link API Functions
export async function getLinksFromSupabase(): Promise<ApiResponse<Link[]>> {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    
    return { data: data as Link[] };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch links', 
        status: error.status || 500 
      } 
    };
  }
}

export async function createLink(link: Omit<Link, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Link>> {
  try {
    const { data, error } = await supabase
      .from('links')
      .insert([link])
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as Link };
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
    const updatedLink = {
      ...link,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('links')
      .update(updatedLink)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as Link };
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

// Blog API Functions
export async function getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as BlogPost[] };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch blog posts', 
        status: error.status || 500 
      } 
    };
  }
}

export async function createBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<BlogPost>> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([post])
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as BlogPost };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to create blog post', 
        status: error.status || 500 
      } 
    };
  }
}

export async function updateBlogPost(id: string, post: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
  try {
    const updatedPost = {
      ...post,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updatedPost)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as BlogPost };
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

export async function uploadBlogCover(file: File): Promise<ApiResponse<string>> {
  try {
    const fileName = `cover-${Date.now()}.${file.name.split('.').pop()}`;
    const filePath = `/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file, {
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);
    
    return { data: data.publicUrl };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to upload blog cover', 
        status: error.status || 500 
      } 
    };
  }
}

// Music API Functions
export async function getSongs(): Promise<ApiResponse<Song[]>> {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('release_date', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as Song[] };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch songs', 
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
    
    return { data: data as Song };
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
    
    return { data: data as Song };
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

export async function uploadSongAudio(file: File): Promise<ApiResponse<string>> {
  try {
    const fileName = `audio-${Date.now()}.${file.name.split('.').pop()}`;
    const filePath = `music/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file, {
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);
    
    return { data: data.publicUrl };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to upload song audio', 
        status: error.status || 500 
      } 
    };
  }
}

export async function uploadSongCover(file: File): Promise<ApiResponse<string>> {
  try {
    const fileName = `cover-${Date.now()}.${file.name.split('.').pop()}`;
    const filePath = `music/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file, {
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);
    
    return { data: data.publicUrl };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to upload song cover', 
        status: error.status || 500 
      } 
    };
  }
}
