
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link } from "@/lib/types";

const websiteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL").min(1, "URL is required"),
  description: z.string().optional(),
  display_order: z.number().default(0),
  is_active: z.boolean().default(true),
});

type WebsiteFormData = z.infer<typeof websiteSchema>;

interface WebsiteFormProps {
  initialData?: Link;
  onSubmit: (data: Omit<Link, "id">) => void;
  onCancel: () => void;
}

export default function WebsiteForm({ initialData, onSubmit, onCancel }: WebsiteFormProps) {
  const form = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteSchema),
    defaultValues: {
      title: initialData?.title || "",
      url: initialData?.url || "",
      description: initialData?.description || "",
      display_order: initialData?.display_order || 0,
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    },
  });

  const handleSubmit = (data: WebsiteFormData) => {
    onSubmit({
      title: data.title,
      url: data.url,
      description: data.description || null,
      display_order: data.display_order,
      is_active: data.is_active,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter website title" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Short description of the website" 
                  {...field} 
                  value={field.value || ""}
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
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update" : "Add"} Website
          </Button>
        </div>
      </form>
    </Form>
  );
}
