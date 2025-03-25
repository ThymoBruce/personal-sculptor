import React, { useState, Fragment } from "react";
import { PlusCircle, ExternalLink, Pencil, Trash, AlertCircle } from "lucide-react";
import { Link } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getLinksFromSupabase, updateLink, deleteLink } from "@/lib/api-supabase";
import { useToast } from "@/hooks/use-toast";
import WebsiteForm from "./WebsiteForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function WebsiteList() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: links, isLoading, error } = useQuery({
    queryKey: ['links'],
    queryFn: async () => {
      const response = await getLinksFromSupabase();
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    }
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, link }: { id: string; link: Partial<Link> }) => {
      const response = await updateLink(id, link);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({
        title: "Success",
        description: "Link updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update link",
        variant: "destructive",
      });
    }
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteLink(id);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete link",
        variant: "destructive",
      });
    }
  });

  const handleEditLink = (link: Link) => {
    setSelectedLink(link);
    setIsDialogOpen(true);
    setIsEditing(true);
  };

  const handleDeleteLink = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      deleteLinkMutation.mutate(id);
    }
  };

  const closeEditForm = () => {
    setIsEditing(false);
    setSelectedLink(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32 mb-2"></div>
              <div className="h-4 bg-muted rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load links. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Links</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedLink(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Link
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedLink ? "Edit Link" : "Add New Link"}</DialogTitle>
            </DialogHeader>
            {isEditing && selectedLink && (
              <WebsiteForm onClose={closeEditForm} initialData={selectedLink} />
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <Separator />
      
      {links && links.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link: Link) => (
            <Card key={link.id}>
              <CardHeader>
                <CardTitle>{link.title}</CardTitle>
                <CardDescription>{link.url}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {link.description || "No description provided"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit
                  </a>
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditLink(link)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDeleteLink(link.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Links Yet</CardTitle>
            <CardDescription>Add your first link to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Use the "Add New Link" button to add your favorite websites and resources.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Link
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
