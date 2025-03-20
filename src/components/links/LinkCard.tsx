
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface LinkCardProps {
  title: string;
  url: string;
  description?: string;
}

export default function LinkCard({ title, url, description }: LinkCardProps) {
  const isExternal = url.startsWith("http");

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isExternal ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Visit Link <ExternalLink size={14} className="ml-1" />
          </a>
        ) : (
          <Link
            to={url}
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Visit Page
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
