
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
