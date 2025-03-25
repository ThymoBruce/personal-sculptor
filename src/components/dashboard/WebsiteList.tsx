import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, ExternalLink, Edit, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import WebsiteForm from "./WebsiteForm";
import { getLinksFromSupabase, updateLink, deleteLink } from "@/lib/api-supabase";
import { Link } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function WebsiteList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const queryClient = useQueryClient();

  const { data: linksData, isLoading, isError } = useQuery({
    queryKey: ["links"],
    queryFn: getLinksFromSupabase,
  });

  const updateMutation = useMutation(
    (link: { id: string; link: Partial<Link> }) => updateLink(link.id, link.link),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["links"] });
        toast({
          title: "Link updated",
          description: "The link has been updated successfully.",
        });
        setIsDialogOpen(false);
        setSelectedLink(null);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update link",
          variant: "destructive",
        });
      },
    }
  );

  const deleteMutation = useMutation(deleteLink, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast({
        title: "Link deleted",
        description: "The link has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete link",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = () => {
    setSelectedLink(null);
    setIsDialogOpen(true);
  };

  const handleEditLink = (link: Link) => {
    setSelectedLink(link);
    setIsDialogOpen(true);
  };

  const handleDeleteLink = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={handleOpenDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Website
        </Button>
      </div>

      {isLoading ? (
        <p>Loading websites...</p>
      ) : isError ? (
        <p>Error loading websites.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {linksData?.data?.map((link) => (
            <Card key={link.id}>
              <CardHeader>
                <CardTitle>{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Visit <ExternalLink className="inline-block h-4 w-4 ml-1" />
                  </a>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditLink(link)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteLink(link.id)}
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedLink ? "Edit Website" : "Add Website"}</DialogTitle>
            <DialogDescription>
              {selectedLink ? "Edit the details for the selected website." : "Enter the details for the new website."}
            </DialogDescription>
          </DialogHeader>
          <WebsiteForm
            link={selectedLink}
            onClose={() => {
              setIsDialogOpen(false);
              setSelectedLink(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
