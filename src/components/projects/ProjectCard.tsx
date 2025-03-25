
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // Get category name safely
  const categoryName = project.category?.name || 
                       (project.category_id ? "Unknown Category" : "Uncategorized");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{categoryName}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.tags?.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
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
