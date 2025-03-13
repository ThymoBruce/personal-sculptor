
import { useState, useEffect } from "react";
import { getProjects, getCategories } from "@/lib/api";
import { Category, Project } from "@/lib/types";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProjectsManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center mb-8">
          <Link to="/admin" className="mr-4 p-2 hover:bg-secondary/50 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Manage Projects</h1>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Add, edit, or remove projects from your portfolio
          </p>
          <button 
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => alert("This would open a form to add a new project in the real implementation.")}
          >
            <Plus size={16} className="mr-2" />
            Add Project
          </button>
        </div>
        
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
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-4">{project.name}</td>
                    <td className="py-3 px-4">{getCategoryName(project.category_id)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.status === 'published' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="text-primary hover:text-primary/80 transition-colors"
                          onClick={() => alert(`This would edit project ${project.id} in the real implementation.`)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-destructive hover:text-destructive/80 transition-colors"
                          onClick={() => alert(`This would delete project ${project.id} in the real implementation.`)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-12 p-6 bg-secondary/30 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Note</h2>
          <p className="text-sm text-muted-foreground">
            This is a demo version of the projects manager. In the full implementation, 
            this would connect to Supabase backend for CRUD operations.
          </p>
        </div>
      </div>
    </div>
  );
}
