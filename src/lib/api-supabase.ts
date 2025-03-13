
import { supabase } from "@/integrations/supabase/client";
import { Link, ApiResponse } from "./types";

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
