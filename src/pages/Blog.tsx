
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { getBlogPosts } from '@/lib/api-supabase';
import { BlogPost } from '@/lib/types';

const Blog = () => {
  const { data: blogPosts, isLoading, error } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: getBlogPosts
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-40 mb-4 rounded-lg"></div>
          <div className="bg-gray-200 h-40 mb-4 rounded-lg"></div>
          <div className="bg-gray-200 h-40 mb-4 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        <div className="text-red-500">Error loading blog posts.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <p className="text-gray-600 mb-8">
        Check out my latest blog posts and thoughts.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts?.data?.map((post: BlogPost) => (
          <Card key={post.id} className="overflow-hidden">
            {post.cover_image && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.cover_image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{post.title}</CardTitle>
              <CardDescription>
                {new Date(post.published_date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{post.excerpt}</p>
              <a
                href={`/blog/${post.slug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Read more
              </a>
            </CardContent>
          </Card>
        ))}
        
        {blogPosts?.data?.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No blog posts available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
