
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash, Pencil, BookOpen, Eye, EyeOff } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getBlogPosts, 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost,
  uploadBlogCover
} from "@/lib/api-supabase";
import { BlogPost } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    is_published: false,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login");
    } else if (!loading) {
      fetchPosts();
    }
  }, [user, loading, navigate]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await getBlogPosts();
      if (response.error) {
        throw new Error(response.error.message);
      }
      setPosts(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch blog posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate slug from title if slug field is empty
    if (name === 'title' && (!formData.slug || formData.slug === generateSlug(formData.title))) {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        slug: generateSlug(value) 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      is_published: false,
    });
    setCoverFile(null);
    setCoverPreview(null);
    setTags([]);
    setTagInput("");
    setSelectedPost(null);
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      is_published: post.is_published,
    });
    setCoverPreview(post.cover_image || null);
    setTags(post.tags || []);
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const response = await deleteBlogPost(id);
      if (response.error) throw new Error(response.error.message);
      
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
      
      fetchPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.slug || !formData.content || !formData.excerpt) {
        throw new Error("Please fill out all required fields");
      }

      let cover_image = selectedPost?.cover_image || null;

      // Upload cover image if provided
      if (coverFile) {
        const coverResponse = await uploadBlogCover(coverFile);
        if (coverResponse.error) throw new Error(coverResponse.error.message);
        cover_image = coverResponse.data || null;
      }

      const userId = user?.id || "unknown";
      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        cover_image,
        is_published: formData.is_published,
        tags,
        published_date: new Date().toISOString(),
        author_id: userId
      };

      let response;
      if (selectedPost) {
        response = await updateBlogPost(selectedPost.id, postData);
      } else {
        response = await createBlogPost(postData);
      }

      if (response.error) throw new Error(response.error.message);

      toast({
        title: "Success",
        description: `Blog post ${selectedPost ? "updated" : "created"} successfully`,
      });

      resetForm();
      fetchPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save blog post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center mb-8">
          <Link to="/admin" className="mr-4 p-2 hover:bg-secondary/50 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Manage Blog Posts</h1>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">Blog Posts</TabsTrigger>
            <TabsTrigger value="add">{selectedPost ? 'Edit Post' : 'Add New Post'}</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-secondary/50 p-4 rounded-lg">
                    <div className="h-6 bg-secondary rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-secondary rounded w-full mb-2"></div>
                    <div className="h-4 bg-secondary rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-secondary/30 rounded-lg">
                <BookOpen size={40} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No blog posts yet</h3>
                <p className="text-muted-foreground mb-4">Start writing your first blog post</p>
                <Button onClick={() => document.querySelector('[data-value="add"]')?.click()}>
                  <Plus size={16} className="mr-2" />
                  Create Your First Post
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Published Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{post.slug}</TableCell>
                        <TableCell>
                          <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                            post.is_published 
                              ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                          }`}>
                            {post.is_published ? (
                              <>
                                <Eye size={12} />
                                Published
                              </>
                            ) : (
                              <>
                                <EyeOff size={12} />
                                Draft
                              </>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(post.published_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleEditPost(post);
                                document.querySelector('[data-value="add"]')?.click();
                              }}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{selectedPost ? 'Edit Blog Post' : 'Add New Blog Post'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium mb-1">
                        Title*
                      </label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Blog post title"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="slug" className="block text-sm font-medium mb-1">
                        Slug*
                      </label>
                      <Input
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="url-friendly-slug"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="excerpt" className="block text-sm font-medium mb-1">
                        Excerpt*
                      </label>
                      <Textarea
                        id="excerpt"
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleInputChange}
                        placeholder="Short description of your blog post"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="content" className="block text-sm font-medium mb-1">
                        Content*
                      </label>
                      <Textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Write your blog post content here"
                        rows={10}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="cover" className="block text-sm font-medium mb-1">
                        Cover Image
                      </label>
                      <Input
                        id="cover"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="mb-2"
                      />
                      {coverPreview && (
                        <div className="mt-2 aspect-video w-full rounded-md overflow-hidden">
                          <img
                            src={coverPreview}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium mb-1">
                        Tags
                      </label>
                      <div className="flex">
                        <Input
                          id="tags"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add a tag"
                          className="mr-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={handleAddTag}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map((tag, index) => (
                            <div
                              key={index}
                              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 text-muted-foreground hover:text-foreground"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_published"
                        name="is_published"
                        checked={formData.is_published}
                        onChange={handleCheckboxChange}
                        className="rounded border-input h-4 w-4"
                      />
                      <label htmlFor="is_published" className="text-sm font-medium">
                        Publish immediately
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : selectedPost ? (
                        'Update Post'
                      ) : (
                        'Add Post'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
