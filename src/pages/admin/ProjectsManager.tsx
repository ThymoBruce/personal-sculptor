import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash, Pencil, BookOpen, Link as LinkIcon, Image as ImageIcon, Upload, Trash2, Github } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getProjects, 
  getCategories,
  createProject, 
  updateProject, 
  deleteProject
} from "@/lib/api-supabase";
import { Project, Category } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    status: "draft" as "draft" | "published",
    tags: [] as string[],
    image_url: "",
    website_url: "",
    github_url: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login");
    } else if (!loading) {
      fetchData();
    }
  }, [user, loading, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const projectsResponse = await getProjects();
      if (projectsResponse.error) {
        throw new Error(projectsResponse.error.message);
      }
      setProjects(projectsResponse.data || []);

      const categoriesResponse = await getCategories();
      if (categoriesResponse.error) {
        throw new Error(categoriesResponse.error.message);
      }
      setCategories(categoriesResponse.data || []);
      
      if (categoriesResponse.data && categoriesResponse.data.length > 0 && !formData.category_id) {
        setFormData(prev => ({
          ...prev,
          category_id: categoriesResponse.data[0].id
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category_id: value }));
  };

  const handleStatusChange = (value: "draft" | "published") => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, tags: value.split(",").map(tag => tag.trim()) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fileType = file.type.split('/')[0];
    if (fileType !== 'image') {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should not exceed 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setUploadingImage(true);
    
    try {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('project-images')
        .getPublicUrl(uploadData.path);
        
      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  const resetForm = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFormData({
      name: "",
      description: "",
      category_id: categories.length > 0 ? categories[0].id : "",
      status: "draft",
      tags: [],
      image_url: "",
      website_url: "",
      github_url: "",
    });
    setSelectedProject(null);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await deleteProject(id);
        if (response.error) {
          throw new Error(response.error.message);
        }
        toast({
          title: "Success",
          description: "Project deleted successfully",
        });
        fetchData();
      } catch (error) {
        toast({
          title: "Error",
          description: 
            error instanceof Error 
              ? error.message 
              : "Failed to delete project",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    if (project.image_url) {
      setPreviewUrl(project.image_url);
    }
    setFormData({
      name: project.name,
      description: project.description,
      category_id: project.category_id || (categories.length > 0 ? categories[0].id : ""),
      status: project.status,
      tags: project.tags || [],
      image_url: project.image_url || "",
      website_url: project.website_url || "",
      github_url: project.github_url || "",
    });
    const tabTrigger = document.querySelector('[data-value="form"]');
    if (tabTrigger instanceof HTMLElement) {
      tabTrigger.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userId = user?.id || "unknown";
      
      if (!formData.category_id) {
        throw new Error("A category must be selected. Please create a category first if none exist.");
      }
      
      const projectData = {
        ...formData,
        author_id: userId,
        created_by: userId,
        modified_by: userId,
        is_deleted: false
      };

      let response;
      if (selectedProject) {
        response = await updateProject(selectedProject.id, projectData);
      } else {
        response = await createProject(projectData);
      }

      if (response.error) throw new Error(response.error.message);

      toast({
        title: "Success",
        description: `Project ${selectedProject ? "updated" : "created"} successfully`,
      });

      resetForm();
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderImageUploadField = () => (
    <div className="md:col-span-2">
      <Label>Project Image</Label>
      <div className="mt-2 border rounded-lg p-4 relative">
        {formData.image_url || previewUrl ? (
          <div className="relative">
            <img 
              src={previewUrl || formData.image_url} 
              alt="Project preview" 
              className="max-h-60 rounded-md mx-auto"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={handleRemoveImage}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground mb-4">
              Upload a project image (max 5MB)
            </div>
            <label htmlFor="image-upload">
              <div className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md cursor-pointer flex items-center">
                {uploadingImage ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Upload Image
                  </>
                )}
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center mb-8">
          <Link to="/admin" className="mr-4 p-2 hover:bg-secondary/50 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Manage Projects</h1>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">Projects List</TabsTrigger>
            <TabsTrigger value="form" data-value="form">{selectedProject ? 'Edit Project' : 'Add Project'}</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-secondary/50 p-4 rounded-lg">
                    <div className="h-6 bg-secondary rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-secondary rounded w-full mb-2"></div>
                    <div className="h-4 bg-secondary rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-secondary/30 rounded-lg">
                <BookOpen size={40} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">Start creating your first project</p>
                <Button onClick={() => {
                  const tabTrigger = document.querySelector('[data-value="form"]');
                  if (tabTrigger instanceof HTMLElement) {
                    tabTrigger.click();
                  }
                }}>
                  <Plus size={16} className="mr-2" />
                  Create Your First Project
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>
                          {project.category?.name || 
                           (project.category_id ? "Unknown Category" : "Uncategorized")}
                        </TableCell>
                        <TableCell>{project.status}</TableCell>
                        <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {project.website_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(project.website_url, '_blank')}
                                className="text-muted-foreground"
                              >
                                <LinkIcon size={16} />
                              </Button>
                            )}
                            {project.github_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(project.github_url, '_blank')}
                                className="text-muted-foreground"
                              >
                                <Github size={16} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(project)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(project.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="form" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{selectedProject ? 'Edit Project' : 'Add New Project'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category_id">Category {categories.length === 0 && "(Please create a category first)"}</Label>
                      <Select 
                        onValueChange={handleSelectChange} 
                        value={formData.category_id} 
                        disabled={categories.length === 0}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {categories.length === 0 && (
                        <p className="text-sm text-destructive mt-1">
                          You need to create at least one category before creating a project.
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select onValueChange={handleStatusChange} value={formData.status}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        name="tags"
                        value={formData.tags.join(", ")}
                        onChange={handleTagsChange}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>
                    
                    {renderImageUploadField()}
                  
                    <div>
                      <Label htmlFor="website_url">Website URL</Label>
                      <Input
                        id="website_url"
                        name="website_url"
                        value={formData.website_url}
                        onChange={handleInputChange}
                        placeholder="Optional project website URL"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="github_url">GitHub URL</Label>
                      <Input
                        id="github_url"
                        name="github_url"
                        value={formData.github_url}
                        onChange={handleInputChange}
                        placeholder="Optional GitHub repository URL"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || categories.length === 0}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : selectedProject ? (
                        'Update Project'
                      ) : (
                        'Add Project'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
