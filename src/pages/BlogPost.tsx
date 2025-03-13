
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getBlogPostBySlug } from "@/lib/api";
import { BlogPost } from "@/lib/types";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<BlogPost | null>(null);
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      try {
        const response = await getBlogPostBySlug(slug);
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        setPost(response.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [slug]);
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to all posts
          </Link>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-secondary/50 rounded w-3/4"></div>
              <div className="flex space-x-4 mb-6">
                <div className="h-4 bg-secondary/50 rounded w-32"></div>
                <div className="h-4 bg-secondary/50 rounded w-32"></div>
              </div>
              {post?.coverImage && (
                <div className="aspect-video bg-secondary/50 rounded mb-8"></div>
              )}
              <div className="space-y-3">
                <div className="h-4 bg-secondary/50 rounded w-full"></div>
                <div className="h-4 bg-secondary/50 rounded w-full"></div>
                <div className="h-4 bg-secondary/50 rounded w-2/3"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Link 
                to="/blog"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md inline-block"
              >
                Return to Blog
              </Link>
            </div>
          ) : post ? (
            <article className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  <time dateTime={post.publishedDate}>{formatDate(post.publishedDate)}</time>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tag size={16} />
                  {post.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="bg-secondary/50 px-2 py-0.5 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {post.coverImage && (
                <div className="mb-8">
                  <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              )}
              
              <div className="mt-8">
                {post.content}
              </div>
            </article>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-2">Post not found</h2>
              <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist or has been removed.</p>
              <Link 
                to="/blog"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md inline-block"
              >
                Return to Blog
              </Link>
            </div>
          )}
          
          {post && (
            <div className="mt-16 pt-8 border-t border-border">
              <h2 className="text-xl font-semibold mb-4">Share this post</h2>
              <div className="flex space-x-4">
                <button className="px-4 py-2 bg-secondary/50 rounded-md text-sm hover:bg-secondary/70 transition-colors">
                  Share on Twitter
                </button>
                <button className="px-4 py-2 bg-secondary/50 rounded-md text-sm hover:bg-secondary/70 transition-colors">
                  Share on LinkedIn
                </button>
                <button 
                  className="px-4 py-2 bg-secondary/50 rounded-md text-sm hover:bg-secondary/70 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
