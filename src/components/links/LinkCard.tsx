
import { Link as LinkType } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface LinkCardProps {
  link: LinkType;
}

export default function LinkCard({ link }: LinkCardProps) {
  return (
    <a 
      href={link.url} 
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="h-full transition-all" hoverEffect>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              {link.title}
              <ExternalLink size={16} className="ml-2 opacity-70" />
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {link.description && (
            <CardDescription>{link.description}</CardDescription>
          )}
        </CardContent>
      </Card>
    </a>
  );
}
