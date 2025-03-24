
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link as LinkType } from "@/lib/types";
import { PlusCircle, Pencil, Trash, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getLinksFromSupabase, createLink, updateLink, deleteLink } from "@/lib/api-supabase";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import WebsiteForm from "./WebsiteForm";

export default function WebsiteList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [websites, setWebsites] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<LinkType | null>(null);

  const fetchWebsites = async () => {
    if (!user) return;
    
    setLoading(true);
    const response = await getLinksFromSupabase();
    
    if (response.data) {
      setWebsites(response.data);
    } else if (response.error) {
      toast({
        title: "Error",
        description: response.error.message,
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchWebsites();
  }, [user]);

  const handleAddWebsite = () => {
    setEditingWebsite(null);
    setOpenForm(true);
  };

  const handleEditWebsite = (website: LinkType) => {
    setEditingWebsite(website);
    setOpenForm(true);
  };

  const handleDeleteWebsite = async (id: string) => {
    if (!confirm("Are you sure you want to delete this website?")) return;
    
    const response = await deleteLink(id);
    
    if (!response.error) {
      setWebsites(websites.filter(site => site.id !== id));
      toast({
        title: "Website deleted",
        description: "The website has been removed from your list."
      });
    } else {
      toast({
        title: "Error",
        description: response.error.message,
        variant: "destructive"
      });
    }
  };

  const handleFormSubmit = async (data: Omit<LinkType, 'id'>) => {
    if (editingWebsite) {
      // Update existing website
      const response = await updateLink(editingWebsite.id, data);
      
      if (response.data) {
        setWebsites(websites.map(site => 
          site.id === editingWebsite.id ? response.data! : site
        ));
        toast({
          title: "Website updated",
          description: "Your changes have been saved."
        });
      } else if (response.error) {
        toast({
          title: "Error",
          description: response.error.message,
          variant: "destructive"
        });
      }
    } else {
      // Create new website
      const response = await createLink(data);
      
      if (response.data) {
        setWebsites([...websites, response.data]);
        toast({
          title: "Website added",
          description: "The website has been added to your list."
        });
      } else if (response.error) {
        toast({
          title: "Error",
          description: response.error.message,
          variant: "destructive"
        });
      }
    }
    
    setOpenForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Favorite Websites</h2>
        <Button onClick={handleAddWebsite} className="flex items-center gap-2">
          <PlusCircle size={16} />
          <span>Add Website</span>
        </Button>
      </div>

      {websites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-center text-muted-foreground mb-4">
              You don't have any websites saved yet.
            </p>
            <Button onClick={handleAddWebsite} variant="outline" className="flex items-center gap-2">
              <PlusCircle size={16} />
              <span>Add your first website</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map(website => (
            <Card key={website.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="truncate mr-2">{website.title}</span>
                  <a 
                    href={website.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink size={18} />
                  </a>
                </CardTitle>
                {website.description && (
                  <CardDescription>{website.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground truncate">
                  {website.url}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditWebsite(website)}
                >
                  <Pencil size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteWebsite(website.id)}
                >
                  <Trash size={16} />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={openForm} onOpenChange={setOpenForm}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editingWebsite ? "Edit Website" : "Add Website"}
            </SheetTitle>
            <SheetDescription>
              {editingWebsite 
                ? "Update this website's details below." 
                : "Add a new website to your collection."
              }
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <WebsiteForm 
              initialData={editingWebsite || undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => setOpenForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
