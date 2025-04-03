import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash } from "lucide-react";
import { getLinks } from "@/lib/api";
import { Link as LinkType } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const linkSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  description: z.string().optional(),
  display_order: z.number().optional(),
  is_active: z.boolean().default(true),
});

type LinkFormValues = z.infer<typeof linkSchema>;

interface LinkFormProps {
  initialData?: LinkType;
  onSubmit: (values: LinkFormValues, id?: string) => Promise<void>;
  onCancel: () => void;
}

const LinkForm: React.FC<LinkFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: initialData || {
      title: "",
      url: "",
      description: "",
      display_order: 0,
      is_active: true,
    },
  });

  const submitHandler = async (values: LinkFormValues) => {
    await onSubmit(values, initialData?.id);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandler)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Website Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of the website"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="display_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Order in which the link will be displayed"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Whether the link is active and visible on the website.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update Link" : "Create Link"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    className="text-sm text-muted-foreground"
    ref={ref}
    {...props}
  />
));
FormDescription.displayName = "FormDescription";

const WebsiteList = () => {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkType | null>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login");
    } else if (!loading) {
      fetchLinks();
    }
  }, [user, loading, navigate]);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const response = await getLinks();
      if (response.error) {
        throw new Error(response.error.message);
      }
      setLinks(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch links",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdateLink = async (values: LinkFormValues, id?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await (id
        ? supabase
            .from("links")
            .update({ ...values, display_order: values.display_order || 0 })
            .eq("id", id)
            .select()
            .single()
        : supabase
            .from("links")
            .insert({ ...values, display_order: values.display_order || 0 })
            .select()
            .single());

      if (error) throw error;

      toast({
        title: "Success",
        description: `Link ${id ? "updated" : "created"} successfully`,
      });

      fetchLinks();
      setShowForm(false);
      setSelectedLink(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("links").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Link deleted successfully",
      });

      fetchLinks();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLink = (link: LinkType) => {
    setSelectedLink(link);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Card className="col-span-4 md:col-span-3">
      <CardHeader>
        <CardTitle>Website Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Manage website links that will be displayed on your links page.
        </p>
        <Separator />
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Link
        </Button>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-sm text-muted-foreground">
              No links added yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.title}</TableCell>
                    <TableCell>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {link.url}
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLink(link)}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLink(link.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedLink ? 'Edit Link' : 'Add New Link'}</DialogTitle>
            <DialogDescription>
              Add or edit website links that will be displayed on your links page.
            </DialogDescription>
          </DialogHeader>
          {selectedLink ? (
            <LinkForm 
              initialData={selectedLink} 
              onSubmit={handleCreateOrUpdateLink} 
              onCancel={() => setShowForm(false)} 
            />
          ) : (
            <LinkForm 
              onSubmit={handleCreateOrUpdateLink}
              onCancel={() => setShowForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WebsiteList;
