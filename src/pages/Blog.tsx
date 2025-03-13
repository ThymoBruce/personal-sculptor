
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBlogPosts } from "@/lib/api";
import { BlogPost } from "@/lib/types";
import { BookOpen, ArrowRight } from "lucide-react";

export default function Blog() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await getBlogPosts();
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        setPosts(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 animate-fadeIn">
              Blog
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto animate-slideUp animate-delay-100">
              Thoughts, insights, and experiences from my journey as a developer and music producer.
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
                  <div className="h-40 bg-secondary/50"></div>
                  <div className="p-6">
                    <div className="h-6 bg-secondary/50 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-secondary/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-secondary/50 rounded w-2/3 mb-4"></div>
                    <div className="h-4 bg-secondary/50 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-destructive mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No posts available</h2>
              <p className="text-muted-foreground">Check back soon for new content.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {posts.map((post) => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.slug}`} 
                  className="group"
                >
                  <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm transition-all group-hover:shadow-md h-full flex flex-col">
                    {post.coverImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={post.coverImage} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                        <div className="flex space-x-2">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span 
                              key={tag} 
                              className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(post.publishedDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="mt-16">
            <div className="p-6 border border-border rounded-lg bg-secondary/10">
              <h2 className="text-xl font-semibold mb-4">Newsletter</h2>
              <p className="text-muted-foreground mb-4">
                Subscribe to receive updates when I publish new blog posts or release new music.
              </p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
