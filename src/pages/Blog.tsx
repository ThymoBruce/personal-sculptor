
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BlogPost } from '@/lib/types';
import { getBlogPosts } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Blog() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      const response = await getBlogPosts();
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto pt-24 px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-col h-full">
              <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto pt-24 px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Blog</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>Failed to load blog posts. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-24 px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: BlogPost) => (
            <Card key={post.id} className="flex flex-col h-full">
              {post.cover_image && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={post.cover_image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-1 h-4 w-4" />
                  <time dateTime={post.published_date}>
                    {new Date(post.published_date).toLocaleDateString()}
                  </time>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/blog/${post.slug}`}>Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/20 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No blog posts yet</h3>
          <p className="text-muted-foreground mb-4">Check back soon for new content</p>
        </div>
      )}
    </div>
  );
}
