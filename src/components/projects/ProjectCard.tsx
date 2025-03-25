
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/lib/types";
import { Link as LinkIcon, Github } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // Get category name safely
  const categoryName = project.category?.name || 
                       (project.category_id ? "Unknown Category" : "Uncategorized");
  
  return (
    <Card>
      {project.image_url && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img 
            src={project.image_url} 
            alt={`${project.name} project image`} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{categoryName}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags?.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        {(project.website_url || project.github_url) && (
          <div className="flex items-center space-x-2">
            {project.website_url && (
              <a 
                href={project.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <LinkIcon size={16} className="mr-1" /> Visit Website
              </a>
            )}
            {project.github_url && (
              <a 
                href={project.github_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <Github size={16} className="mr-1" /> GitHub Repo
              </a>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-sm text-muted-foreground">
          {new Date(project.created_at).toLocaleDateString()}
        </span>
        <Badge variant={project.status === "published" ? "default" : "outline"}>
          {project.status}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
