
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories, deleteCategory } from "@/lib/api-supabase";
import { Category } from "@/lib/types";
import CategoryForm from "@/components/admin/CategoryForm";

export default function CategoriesManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });
  
  const handleAddNew = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };
  
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories Manager</h1>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus size={16} />
          Add New Category
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-500">
          Error loading categories. Please try again.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.map((category: Category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex justify-between items-center">
                  {category.name}
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil size={16} />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(category.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                    >
                      <Trash size={16} />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category.description || "No description"}
                </p>
              </CardContent>
            </Card>
          ))}
          
          {data?.data?.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No categories found. Create your first category.</p>
            </div>
          )}
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm 
            category={selectedCategory || undefined} 
            onSuccess={() => setDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
