
import { useState, useEffect } from "react";
import { getLinks } from "@/lib/api";
import { Link } from "@/lib/types";
import LinkCard from "@/components/links/LinkCard";
import { ArrowUpRight } from "lucide-react";

export default function Links() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  
  useEffect(() => {
    const fetchLinks = async () => {
      setIsLoading(true);
      try {
        const response = await getLinks();
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        setLinks(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLinks();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 animate-fadeIn">
            Connect with Me
          </h1>
          <p className="text-muted-foreground animate-slideUp animate-delay-100">
            Find me on various platforms and check out my content across the web.
          </p>
        </div>
        
        {isLoading ? (
          <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-lg overflow-hidden">
                <div className="p-6 space-y-4 bg-secondary/50">
                  <div className="h-6 bg-secondary rounded w-1/2"></div>
                  <div className="h-4 bg-secondary rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
            {links.map((link, index) => (
              <div 
                key={link.id} 
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <LinkCard link={link} />
              </div>
            ))}
          </div>
        )}
        
        <div className="max-w-xl mx-auto mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-6">Want More?</h2>
          <p className="text-muted-foreground mb-8">
            Check out my blog where I share insights, tutorials, and thoughts on technology and development.
          </p>
          <a 
            href="https://example.com/blog" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Visit My Blog
            <ArrowUpRight size={16} className="ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
}
