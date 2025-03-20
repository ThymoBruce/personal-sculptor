
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Link as LinkType } from "@/lib/types";

interface LinkCardProps {
  link: LinkType;
}

export default function LinkCard({ link }: LinkCardProps) {
  const isExternal = link.url.startsWith("http");

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{link.title}</CardTitle>
        {link.description && <CardDescription>{link.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isExternal ? (
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Visit Link <ExternalLink size={14} className="ml-1" />
          </a>
        ) : (
          <RouterLink
            to={link.url}
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Visit Page
          </RouterLink>
        )}
      </CardContent>
    </Card>
  );
}
