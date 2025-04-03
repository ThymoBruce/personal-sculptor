import { supabase } from "@/integrations/supabase/client";

// Categories API
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) throw error;
    
    return { data };
  } catch (error) {
    return { 
      error: { 
        message: 'Failed to fetch categories', 
        status: 500 
      } 
    };
  }
};

// Projects API
export const getProjects = async (): Promise<ApiResponse<Project[]>> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, categories(*)');
    
    if (error) throw error;
    
    // Process the data to match our types
    const typedData = data?.map(project => {
      return {
        ...project,
        status: project.status as 'draft' | 'published',
        category: project.categories as unknown as Category // Safe casting
      };
    }) as Project[];
    
    return { data: typedData };
  } catch (error) {
    return { 
      error: { 
        message: 'Failed to fetch projects', 
        status: 500 
      } 
    };
  }
};

export const getProjectById = async (id: string): Promise<ApiResponse<Project>> => {
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
      category: data.categories as unknown as Category // Safe casting
    } as Project;
    
    return { data: typedData };
  } catch (error) {
    if (error instanceof Error && error.message.includes('No rows found')) {
      return { 
        error: { 
          message: 'Project not found', 
          status: 404 
        } 
      };
    }
    
    return { 
      error: { 
        message: 'Failed to fetch project', 
        status: 500 
      } 
    };
  }
};

// Links API
export const getLinks = async (): Promise<ApiResponse<Link[]>> => {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    
    return { data: data as Link[] };
  } catch (error) {
    return { 
      error: { 
        message: 'Failed to fetch links', 
        status: 500 
      } 
    };
  }
};

// Songs API
export const getSongs = async (): Promise<ApiResponse<Song[]>> => {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('release_date', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as Song[] };
  } catch (error) {
    return { 
      error: { 
        message: 'Failed to fetch songs', 
        status: 500 
      } 
    };
  }
};

// Blog API
export const getBlogPosts = async (): Promise<ApiResponse<BlogPost[]>> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_date', { ascending: false });
    
    if (error) throw error;
    
    const publishedPosts = data?.filter(post => post.is_published) || [];
    
    return { data: publishedPosts as BlogPost[] };
  } catch (error) {
    return { 
      error: { 
        message: 'Failed to fetch blog posts', 
        status: 500 
      } 
    };
  }
};

export const getBlogPostBySlug = async (slug: string): Promise<ApiResponse<BlogPost>> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    
    if (error) throw error;
    
    return { data: data as BlogPost };
  } catch (error) {
    if (error instanceof Error && error.message.includes('No rows found')) {
      return { 
        error: { 
          message: 'Blog post not found', 
          status: 404 
        } 
      };
    }
    
    return { 
      error: { 
        message: 'Failed to fetch blog post', 
        status: 500 
      } 
    };
  }
};

// This will be replaced with actual authentication logic from Supabase
export const isAuthenticated = (): boolean => {
  return supabase.auth.getSession() !== null;
}

// Helper to check if user is admin
export const isAdmin = async (): Promise<boolean> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return false;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sessionData.session.user.id)
      .single();
    
    return profile?.role === 'admin';
  } catch (error) {
    return false;
  }
}

export async function getSpotifyTracks(): Promise<ApiResponse<SpotifyTrack[]>> {
  try {
    const { data, error } = await supabase.functions.invoke('spotify', {
      body: JSON.stringify({ action: 'get-tracks' })
    });

    if (error) throw error;
    
    return { data: data.tracks as SpotifyTrack[] };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to fetch Spotify tracks',
        status: error.status || 500
      }
    };
  }
}

export async function syncSpotifyTracks(): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase.functions.invoke('spotify', {
      body: JSON.stringify({ action: 'sync' })
    });
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to sync tracks',
        status: error.status || 500
      }
    };
  }
}

export async function addSpotifyArtist(artistId: string): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase.functions.invoke('spotify', {
      body: JSON.stringify({ 
        action: 'add-artist', 
        artistId 
      })
    });
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to add artist',
        status: error.status || 500
      }
    };
  }
}

export async function removeSpotifyArtist(artistId: string): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase.functions.invoke('spotify', {
      method: 'POST',
      body: JSON.stringify({ 
        action: 'remove-artist', 
        artistId 
      })
    });
    
    if (error) throw error;
    
    return { data };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to remove artist',
        status: error.status || 500
      }
    };
  }
}

export async function getSpotifyPlaybackToken(): Promise<ApiResponse<string>> {
  try {
    const { data, error } = await supabase.functions.invoke('spotify', {
      body: JSON.stringify({ action: 'get-playback-token' })
    });
    
    if (error) throw error;
    
    return { data: data.token };
  } catch (error: any) {
    return { 
      error: { 
        message: error.message || 'Failed to get playback token',
        status: error.status || 500
      }
    };
  }
}
