
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, ExternalLink, Github } from "lucide-react";
import { getProjectById } from "@/lib/api";
import { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const response = await getProjectById(id);
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        setProject(response.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-4 mb-8 animate-pulse">
            <div className="w-10 h-10 bg-secondary rounded-full"></div>
            <div className="h-8 bg-secondary rounded w-1/3"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-secondary rounded-lg"></div>
            <div className="space-y-3">
              <div className="h-6 bg-secondary rounded w-3/4"></div>
              <div className="h-4 bg-secondary rounded w-full"></div>
              <div className="h-4 bg-secondary rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || "Project not found"}
          </h1>
          <Link to="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
          <Link to="/projects" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} className="mr-2" />
            Back to Projects
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              {project.category && (
                <Badge variant="secondary">
                  {project.category.name}
                </Badge>
              )}
              
              {project.created_at && (
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                </div>
              )}
              
              <Badge variant={project.status === 'published' ? 'default' : 'outline'}>
                {project.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {project.website_url && (
                <a href={project.website_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ExternalLink size={14} />
                    Visit Website
                  </Button>
                </a>
              )}
              
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Github size={14} />
                    View on GitHub
                  </Button>
                </a>
              )}
            </div>
          </header>

          {project.image_url && (
            <div className="mb-8">
              <img
                src={project.image_url}
                alt={project.name}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}
          
          <Card>
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                
                {project.content && (
                  <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-4">Details</h2>
                    <div className="whitespace-pre-wrap">{project.content}</div>
                  </div>
                )}
              </div>
              
              {project.tags && project.tags.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Technologies</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <Badge key={index}>{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
