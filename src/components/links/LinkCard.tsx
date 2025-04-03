
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from '@/lib/types';

interface LinkCardProps {
  link: Link;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{link.title}</CardTitle>
        <a 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
          aria-label={`Visit ${link.title}`}
        >
          <ExternalLink size={18} />
        </a>
      </CardHeader>
      <CardContent className="flex-grow">
        {link.description && <CardDescription>{link.description}</CardDescription>}
      </CardContent>
    </Card>
  );
};

export default LinkCard;
