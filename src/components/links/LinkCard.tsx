
import React from "react";
import { Link } from "@/lib/types";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface LinkCardProps {
  link: Link;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg">
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center hover:text-primary transition-colors"
          >
            {link.title}
            <ExternalLink size={18} className="ml-2" />
          </a>
        </CardTitle>
        {link.description && (
          <CardDescription>{link.description}</CardDescription>
        )}
      </CardHeader>
    </Card>
  );
};

export default LinkCard;
