import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Card className="bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle>
          <Link to={`/projects/${project.id}`} className="hover:text-primary transition-colors duration-200">
            {project.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{project.description}</p>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
