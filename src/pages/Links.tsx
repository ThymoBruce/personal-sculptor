
import { useState, useEffect } from "react";
import { getLinksFromSupabase } from "@/lib/api-supabase";
import { Link } from "@/lib/types";
import LinkCard from "@/components/links/LinkCard";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Links() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  
  useEffect(() => {
    const fetchLinks = async () => {
      setIsLoading(true);
      try {
        const response = await getLinksFromSupabase();
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        // Filter only active links for public display
        const activeLinks = (response.data || []).filter(link => link.is_active);
        setLinks(activeLinks);
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
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center"
            >
              <RefreshCw size={16} className="mr-2" />
              Try Again
            </Button>
          </div>
        ) : links.length === 0 ? (
          <div className="max-w-xl mx-auto text-center py-12">
            <p className="text-muted-foreground mb-4">No links available at the moment.</p>
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
          <Button asChild>
            <Link 
              to="/blog"
              className="inline-flex items-center"
            >
              Visit My Blog
              <ArrowUpRight size={16} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
