import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug } from "@/lib/api-supabase";
import { BlogPost } from "@/lib/types";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!slug) {
          throw new Error("Slug is missing");
        }
        const response = await getBlogPostBySlug(slug);
        if (response.error) {
          setError(response.error.message);
        } else {
          setPost(response.data || null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch blog post");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link to="/blog" className="inline-flex items-center">
            <Button>
              Return to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog" className="inline-flex items-center">
            <Button>
              Return to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
          <Link to="/blog" className="text-muted-foreground hover:text-foreground flex items-center">
            <ArrowLeft size={16} className="mr-2" />
            Back to Blog
          </Link>
        </div>
      
        <article className="mx-auto max-w-3xl">
          <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <time dateTime={post.published_date}>
                Published on {new Date(post.published_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        
          {post.cover_image && (
            <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-lg">
              <img 
                src={post.cover_image}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
