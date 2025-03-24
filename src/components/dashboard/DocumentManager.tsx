
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus, Trash, Download, Eye, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface Document {
  id: string;
  name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

export default function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Failed to load documents",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // 1. Upload file to storage
      const fileExt = fileName.split('.').pop();
      const filePath = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (uploadError) throw uploadError;
      
      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      // 3. Save document in database
      const { data, error } = await supabase.from('documents').insert({
        name: fileName,
        file_url: urlData.publicUrl,
        file_size: fileSize,
        file_type: fileType,
      }).select().single();
      
      if (error) throw error;
      
      setDocuments([data, ...documents]);
      toast({
        title: "Document Uploaded",
        description: "Your document has been successfully uploaded",
      });
      
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload document";
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: errorMessage,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteDocument = async (id: string, filePath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    try {
      // Extract the filename from the URL
      const filePathParts = filePath.split('/');
      const fileName = filePathParts[filePathParts.length - 1];
      
      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([fileName]);
      
      if (storageError) throw storageError;
      
      // 2. Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setDocuments(documents.filter(doc => doc.id !== id));
      toast({
        title: "Document Deleted",
        description: "The document has been successfully deleted",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete document";
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: errorMessage,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isPdf = (doc: Document) => {
    return doc.file_type === 'application/pdf' || doc.name.toLowerCase().endsWith('.pdf');
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-32 animate-pulse">
            <CardContent className="flex items-center justify-center h-full bg-secondary/40">
              <FileText className="h-8 w-8 text-muted" />
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
          onClick={() => fetchDocuments()}
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
        <h2 className="text-xl font-semibold">Important Documents</h2>
        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={uploadDocument}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
          disabled={uploading}
        >
          <Plus size={16} />
          Upload Document
        </Button>
      </div>

      {uploading && (
        <div className="mb-6 p-4 border rounded-lg bg-background">
          <p className="text-sm mb-2">Uploading document... {Math.round(uploadProgress)}%</p>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-secondary/20 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No documents found. Upload your first document to get started.</p>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Upload Document
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="relative group">
              <CardContent className="p-4 flex items-start space-x-4">
                <div className="bg-secondary/30 p-3 rounded">
                  <File className="h-8 w-8 text-primary" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium line-clamp-1">{doc.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                  
                  <div className="flex items-center mt-3 space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-3"
                      asChild
                    >
                      <a 
                        href={doc.file_url} 
                        download={doc.name}
                        className="flex items-center gap-1"
                      >
                        <Download size={14} />
                        Download
                      </a>
                    </Button>
                    
                    {isPdf(doc) && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 px-3"
                        onClick={() => setPreviewDocument(doc)}
                      >
                        <Eye size={14} className="mr-1" />
                        Preview
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-destructive ml-auto"
                      onClick={() => deleteDocument(doc.id, doc.file_url)}
                    >
                      <Trash size={14} />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!previewDocument} onOpenChange={(open) => !open && setPreviewDocument(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewDocument?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {previewDocument && (
              <iframe 
                src={previewDocument.file_url} 
                className="w-full h-full border-0"
                title={previewDocument.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
