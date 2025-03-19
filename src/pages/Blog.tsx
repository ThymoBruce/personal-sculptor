import { useState, useEffect } from "react";
import { getBlogPosts } from "@/lib/api";
import { BlogPost as BlogPostType } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      const response = await getBlogPosts();
      if (response.error) {
        throw new Error(response.error.message);
      }
      setPosts(response.data || []);
    } catch (error: any) {
      setError(error.message || "Failed to fetch blog posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleTagChange = (value: string) => {
    setSelectedTag(value);
    setCurrentPage(1); // Reset to first page when filtering by tag
  };

  const filteredPosts = posts.filter((post) => {
    const searchMatch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const tagMatch = selectedTag ? post.tags.includes(selectedTag) : true;
    return searchMatch && tagMatch;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const allTags = [...new Set(posts.map((post) => post.tags).flat())];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-6">
            Blog
          </h1>
          <p className="text-muted-foreground mx-auto max-w-[700px]">
            Thoughts, stories and ideas about music, technology and creativity.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex-shrink-0">
            <Select onValueChange={handleTagChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading blog posts...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium mb-2">Oops! Something went wrong.</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium mb-2">No posts found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedTag
                  ? "Try adjusting your search or filter options."
                  : "Check back later for new content."}
              </p>
            </div>
          ) : (
            paginatedPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <div className="group flex flex-col h-full overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent/20">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={post.cover_image || "/placeholder.svg"}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col space-y-2 p-6">
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <p className="line-clamp-2 text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{post.tags.length - 2} more
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(post.published_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
