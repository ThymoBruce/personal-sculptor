
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Plus, Edit, Trash, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WebsiteForm from "./WebsiteForm";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/types";

export default function WebsiteList() {
  const [websites, setWebsites] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingWebsite, setIsAddingWebsite] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Link | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setWebsites(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Failed to load websites",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWebsite = async (websiteData: Omit<Link, "id">) => {
    try {
      const { data, error } = await supabase
        .from("links")
        .insert([websiteData])
        .select()
        .single();

      if (error) throw error;
      setWebsites([...websites, data]);
      setIsAddingWebsite(false);
      toast({
        title: "Website Added",
        description: "The website has been successfully added",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add website";
      toast({
        variant: "destructive",
        title: "Failed to add website",
        description: errorMessage,
      });
    }
  };

  const handleUpdateWebsite = async (websiteData: Omit<Link, "id">) => {
    if (!editingWebsite) return;
    
    try {
      const { data, error } = await supabase
        .from("links")
        .update(websiteData)
        .eq("id", editingWebsite.id)
        .select()
        .single();

      if (error) throw error;
      setWebsites(websites.map(website => 
        website.id === editingWebsite.id ? data : website
      ));
      setEditingWebsite(null);
      toast({
        title: "Website Updated",
        description: "The website has been successfully updated",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update website";
      toast({
        variant: "destructive",
        title: "Failed to update website",
        description: errorMessage,
      });
    }
  };

  const handleDeleteWebsite = async (id: string) => {
    if (!confirm("Are you sure you want to delete this website?")) return;
    
    try {
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setWebsites(websites.filter(website => website.id !== id));
      toast({
        title: "Website Deleted",
        description: "The website has been successfully deleted",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete website";
      toast({
        variant: "destructive",
        title: "Failed to delete website",
        description: errorMessage,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-32 animate-pulse">
            <CardContent className="flex items-center justify-center h-full bg-secondary/40">
              <Globe className="h-8 w-8 text-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button 
          onClick={() => fetchWebsites()}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Frequently Used Websites</h2>
        <Button 
          onClick={() => {
            setIsAddingWebsite(true);
            setEditingWebsite(null);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Website
        </Button>
      </div>

      {(isAddingWebsite || editingWebsite) && (
        <div className="mb-6 bg-card p-4 rounded-lg border">
          <WebsiteForm
            initialData={editingWebsite || undefined}
            onSubmit={editingWebsite ? handleUpdateWebsite : handleAddWebsite}
            onCancel={() => {
              setIsAddingWebsite(false);
              setEditingWebsite(null);
            }}
          />
        </div>
      )}

      {websites.length === 0 ? (
        <div className="text-center py-12 bg-secondary/20 rounded-lg">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No websites found. Add your first website to get started.</p>
          <Button 
            onClick={() => {
              setIsAddingWebsite(true);
              setEditingWebsite(null);
            }}
          >
            Add Website
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {websites.map((website) => (
            <Card key={website.id} className="relative group">
              <CardContent className="p-4 flex flex-col h-32">
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setEditingWebsite(website);
                      setIsAddingWebsite(false);
                    }}
                  >
                    <Edit size={14} />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => handleDeleteWebsite(website.id)}
                  >
                    <Trash size={14} />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
                
                <h3 className="font-medium mb-1 truncate pr-16">{website.title}</h3>
                {website.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{website.description}</p>
                )}
                
                <div className="mt-auto">
                  <a 
                    href={website.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Visit Website <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
