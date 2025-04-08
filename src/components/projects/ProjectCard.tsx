
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github } from 'lucide-react';
import { Project } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Card className="bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      {project.image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={project.image_url} 
            alt={project.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>
          <Link to={`/projects/${project.id}`} className="hover:text-primary transition-colors duration-200">
            {project.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
        
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {project.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex gap-2">
        <Link to={`/projects/${project.id}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
        
        <div className="flex ml-auto gap-2">
          {project.website_url && (
            <a href={project.website_url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink size={16} />
                <span className="sr-only">Visit website</span>
              </Button>
            </a>
          )}
          
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Github size={16} />
                <span className="sr-only">GitHub repository</span>
              </Button>
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
