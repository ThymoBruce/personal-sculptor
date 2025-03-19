
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash, Pencil, FileUp, Tag, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    status: "draft" as "draft" | "published",
  });

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
      const [projectsResponse, categoriesResponse] = await Promise.all([
        getProjects(),
        getCategories()
      ]);
      
      if (projectsResponse.error) {
        throw new Error(projectsResponse.error.message);
      }
      
      if (categoriesResponse.error) {
        throw new Error(categoriesResponse.error.message);
      }
      
      setProjects(projectsResponse.data || []);
      setCategories(categoriesResponse.data || []);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "status" ? (value as "draft" | "published") : value 
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category_id: "",
      status: "draft",
    });
    setTags([]);
    setTagInput("");
    setSelectedProject(null);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      category_id: project.category_id,
      status: project.status,
    });
    setTags(project.tags || []);
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await deleteProject(id);
      if (response.error) throw new Error(response.error.message);
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.category_id) {
        throw new Error("Please fill out all required fields");
      }

      const userId = user?.id || "unknown";
      const projectData = {
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id,
        status: formData.status,
        tags,
        is_deleted: false,
        author_id: userId,
        created_by: userId,
        modified_by: userId
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

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

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
            <TabsTrigger value="add">{selectedProject ? 'Edit Project' : 'Add New Project'}</TabsTrigger>
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
                <FileUp size={40} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">Start adding your portfolio projects</p>
                <Button onClick={() => {
                  const tabTrigger = document.querySelector('[data-value="add"]');
                  if (tabTrigger instanceof HTMLElement) {
                    tabTrigger.click();
                  }
                }}>
                  <Plus size={16} className="mr-2" />
                  Add Your First Project
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
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{getCategoryName(project.category_id)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'published' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                          }`}>
                            {project.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(project.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleEditProject(project);
                                document.querySelector('[data-value="add"]')?.click();
                              }}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProject(project.id)}
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

          <TabsContent value="add" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{selectedProject ? 'Edit Project' : 'Add New Project'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Project Name*
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Project name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="category_id" className="block text-sm font-medium mb-1">
                        Category*
                      </label>
                      <select
                        id="category_id"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Description*
                      </label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Project description"
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium mb-1">
                        Tags
                      </label>
                      <div className="flex">
                        <Input
                          id="tags"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add a tag"
                          className="mr-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={handleAddTag}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map((tag, index) => (
                            <div
                              key={index}
                              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center"
                            >
                              <Tag size={12} className="mr-1" />
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 text-muted-foreground hover:text-foreground"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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
                    <Button type="submit" disabled={isSubmitting}>
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
