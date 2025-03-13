
import { useState, useEffect } from "react";
import { getLinksFromSupabase, createLink, updateLink, deleteLink } from "@/lib/api-supabase";
import { Link as LinkType } from "@/lib/types";
import { ArrowLeft, Plus, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LinkForm from "@/components/admin/LinkForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function LinksManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Check if user is authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login");
    }
  }, [user, loading, navigate]);
  
  // Fetch links
  useEffect(() => {
    const fetchLinks = async () => {
      setIsLoading(true);
      try {
        const response = await getLinksFromSupabase();
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        setLinks(response.data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Failed to load links",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchLinks();
    }
  }, [user, toast]);

  const handleAddLink = async (linkData: Omit<LinkType, "id">) => {
    try {
      const response = await createLink(linkData);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setLinks([...links, response.data!]);
      setIsAddingLink(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add link';
      toast({
        variant: "destructive",
        title: "Failed to add link",
        description: errorMessage,
      });
    }
  };

  const handleUpdateLink = async (linkData: Omit<LinkType, "id">) => {
    if (!editingLink) return;
    
    try {
      const response = await updateLink(editingLink.id, linkData);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setLinks(links.map(link => 
        link.id === editingLink.id ? response.data! : link
      ));
      setEditingLink(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update link';
      toast({
        variant: "destructive",
        title: "Failed to update link",
        description: errorMessage,
      });
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    
    try {
      const response = await deleteLink(id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setLinks(links.filter(link => link.id !== id));
      toast({
        title: "Link Deleted",
        description: "The link has been successfully deleted",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete link';
      toast({
        variant: "destructive",
        title: "Failed to delete link",
        description: errorMessage,
      });
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
          <h1 className="text-2xl font-bold">Manage Links</h1>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Add, edit, or remove links from your profile
          </p>
          <Button 
            className="inline-flex items-center"
            onClick={() => {
              setIsAddingLink(true);
              setEditingLink(null);
            }}
            disabled={isAddingLink || !!editingLink}
          >
            <Plus size={16} className="mr-2" />
            Add Link
          </Button>
        </div>
        
        {(isAddingLink || editingLink) && (
          <div className="mb-6">
            <LinkForm
              initialData={editingLink || undefined}
              onSubmit={editingLink ? handleUpdateLink : handleAddLink}
              onCancel={() => {
                setIsAddingLink(false);
                setEditingLink(null);
              }}
            />
          </div>
        )}
        
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
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try Again
            </Button>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-12 bg-secondary/20 rounded-lg">
            <p className="text-muted-foreground mb-4">No links found. Add your first link to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">URL</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-4">{link.order}</td>
                    <td className="py-3 px-4">{link.title}</td>
                    <td className="py-3 px-4 truncate max-w-[200px]">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {link.url}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        link.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                      }`}>
                        {link.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-primary"
                          onClick={() => {
                            setEditingLink(link);
                            setIsAddingLink(false);
                          }}
                          disabled={isAddingLink || !!editingLink}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteLink(link.id)}
                          disabled={isAddingLink || !!editingLink}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-12 p-6 bg-secondary/30 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Note</h2>
          <p className="text-sm text-muted-foreground">
            Links added here will be displayed on your public links page. Make sure to set the correct order to arrange them as desired.
          </p>
        </div>
      </div>
    </div>
  );
}
