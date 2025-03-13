
import { useState } from "react";
import { Link } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface LinkFormProps {
  initialData?: Link;
  onSubmit: (data: Omit<Link, "id">) => Promise<void>;
  onCancel: () => void;
}

export default function LinkForm({ initialData, onSubmit, onCancel }: LinkFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [order, setOrder] = useState(initialData?.order.toString() || "0");
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate URL
      try {
        new URL(url);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Invalid URL",
          description: "Please enter a valid URL including http:// or https://",
        });
        setIsLoading(false);
        return;
      }
      
      await onSubmit({
        title,
        url,
        description,
        order: parseInt(order) || 0,
        is_active: isActive,
      });
      
      toast({
        title: `Link ${initialData ? "Updated" : "Created"}`,
        description: `Successfully ${initialData ? "updated" : "created"} link: ${title}`,
      });
    } catch (error) {
      console.error("Error submitting link form:", error);
      toast({
        variant: "destructive",
        title: `Failed to ${initialData ? "update" : "create"} link`,
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-background border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {initialData ? "Edit Link" : "Add New Link"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X size={18} />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="GitHub"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="url">URL *</Label>
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/username"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description || ""}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Check out my code repositories"
            rows={2}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="is_active" className="block mb-2">Active Status</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                {isActive ? "Active" : "Inactive"}
              </Label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Link" : "Add Link"}
          </Button>
        </div>
      </form>
    </div>
  );
}
