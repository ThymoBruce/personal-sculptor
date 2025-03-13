
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Loader2, FileCheck, Trash, Download } from "lucide-react";
import { uploadResume, getResumeUrl } from "@/lib/api-supabase";

export default function ResumeUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Fetch current resume URL if available
  useState(() => {
    const fetchResumeUrl = async () => {
      const { data, error } = await getResumeUrl();
      if (data && !error) {
        setResumeUrl(data);
      }
    };
    
    fetchResumeUrl();
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      // Check if file is PDF
      if (selectedFile.type !== 'application/pdf') {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PDF file only",
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Resume file must be less than 5MB",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const { data, error } = await uploadResume(file);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setResumeUrl(data);
      setFile(null);
      
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been successfully uploaded",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload resume",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const clearSelectedFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h3 className="text-lg font-medium mb-4">Resume Management</h3>
      
      <div className="space-y-4">
        {resumeUrl && (
          <div className="flex items-center justify-between bg-secondary/30 rounded-md p-3">
            <div className="flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-sm">Current resume uploaded</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(resumeUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-1" /> View
            </Button>
          </div>
        )}
        
        <div className="border-2 border-dashed border-secondary rounded-lg p-6 text-center">
          <input
            type="file"
            id="resumeUpload"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          
          {!file ? (
            <>
              <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload your resume (PDF only, max 5MB)
              </p>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <FileCheck className="h-5 w-5 mr-2 text-green-500" />
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {file.name}
                </span>
              </div>
              
              <div className="flex justify-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearSelectedFile}
                >
                  <Trash className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4 mr-1" /> Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          This resume will be available for download on the contact page
        </p>
      </div>
    </div>
  );
}
