
import { Project } from "@/lib/types";
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const formattedDate = new Date(project.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });

  return (
    <Card className="h-full" hoverEffect>
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium bg-secondary/50 text-secondary-foreground px-2.5 py-0.5 rounded">
            {project.category?.name}
          </span>
          <div className="flex items-center text-muted-foreground text-xs">
            <Calendar size={12} className="mr-1" />
            {formattedDate}
          </div>
        </div>
        <CardTitle className="line-clamp-1">{project.name}</CardTitle>
        <CardDescription className="line-clamp-2 mt-1">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-primary/5 text-primary-foreground px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link 
          to={`/projects/${project.id}`}
          className="inline-flex items-center text-sm font-medium text-primary mt-2 hover:underline"
        >
          View Project <ArrowRight size={14} className="ml-1" />
        </Link>
      </CardContent>
    </Card>
  );
}
