
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@/lib/types";
import { createCategory, updateCategory } from "@/lib/api-supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
}

export default function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  });
  
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Category created",
        description: "The category has been created successfully.",
      });
      reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: (data: {id: string, category: Partial<Category>}) => 
      updateCategory(data.id, data.category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Category updated",
        description: "The category has been updated successfully.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          category: data
        });
      } else {
        await createMutation.mutateAsync(data);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="name"
          placeholder="Category Name"
          {...register("name", { required: "Category name is required" })}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message as string}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Textarea
          id="description"
          placeholder="Description (optional)"
          {...register("description")}
          rows={3}
        />
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : category ? "Update Category" : "Create Category"}
      </Button>
    </form>
  );
}
