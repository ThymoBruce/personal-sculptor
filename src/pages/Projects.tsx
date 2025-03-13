
import { useState, useEffect } from "react";
import { getCategories, getProjects } from "@/lib/api";
import { Category, Project } from "@/lib/types";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectFilter from "@/components/projects/ProjectFilter";
import { Link } from "react-router-dom";

export default function Projects() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  
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
        setFilteredProjects(projectsResponse.data || []);
        setCategories(categoriesResponse.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleFilterChange = (categoryId: string | null) => {
    if (!categoryId) {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(project => project.category_id === categoryId));
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6 animate-fadeIn">
            My Projects
          </h1>
          <p className="text-muted-foreground mb-8 animate-slideUp animate-delay-100">
            Browse through my portfolio of projects spanning web development, mobile apps, and design work.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-lg overflow-hidden">
                <div className="h-48 bg-secondary"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-secondary rounded w-2/3"></div>
                  <div className="h-3 bg-secondary rounded w-full"></div>
                  <div className="h-3 bg-secondary rounded w-4/5"></div>
                </div>
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
          <>
            <ProjectFilter 
              categories={categories} 
              onFilterChange={handleFilterChange} 
            />
            
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No projects found with the selected filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {filteredProjects.map((project, index) => (
                  <div 
                    key={project.id} 
                    className="animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
