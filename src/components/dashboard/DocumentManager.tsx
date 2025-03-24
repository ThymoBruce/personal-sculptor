
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Document } from "@/lib/types";
import { PlusCircle, FileText, Download, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { formatFileSize } from "@/lib/utils";

export default function DocumentManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setDocuments(data as Document[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !user) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600'
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      // Insert document record
      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            name: file.name,
            file_url: publicUrlData.publicUrl,
            file_size: file.size,
            file_type: file.type,
            user_id: user.id
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      setDocuments([data as Document, ...documents]);
      
      toast({
        title: "Upload complete",
        description: "Your document has been uploaded successfully."
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    try {
      // Extract file path from URL
      const url = new URL(fileUrl);
      const filePath = url.pathname.split('/').slice(2).join('/');
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);
      
      if (storageError) throw storageError;
      
      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setDocuments(documents.filter(doc => doc.id !== id));
      
      toast({
        title: "Document deleted",
        description: "The document has been removed."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const handleDownload = (document: Document) => {
    // For PDFs, open in new tab instead of downloading
    if (document.file_type === 'application/pdf') {
      window.open(document.file_url, '_blank');
      return;
    }
    
    // For other file types, create a download link
    const link = document.file_url;
    const a = document.createElement('a');
    a.href = link;
    a.download = document.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Helper function to get document icon
  const getDocumentIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText size={24} className="text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileText size={24} className="text-blue-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText size={24} className="text-blue-600" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <FileText size={24} className="text-green-600" />;
    } else {
      return <FileText size={24} className="text-gray-500" />;
    }
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
        <h2 className="text-2xl font-bold">Documents</h2>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          <span>Upload Document</span>
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {uploading && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="mb-2">Uploading document...</p>
            <Progress value={uploadProgress} />
          </CardContent>
        </Card>
      )}

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-center text-muted-foreground mb-4">
              You don't have any documents uploaded yet.
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <PlusCircle size={16} />
              <span>Upload your first document</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(document => (
            <Card key={document.id} className="flex flex-col h-full">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                {getDocumentIcon(document.file_type)}
                <CardTitle className="text-base font-medium line-clamp-1">
                  {document.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(document.file_size)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(document.created_at).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(document)}
                >
                  <Download size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(document.id, document.file_url)}
                >
                  <Trash size={16} />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
