
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { getResumeUrl } from "@/lib/api-supabase";
import { useToast } from "@/hooks/use-toast";

export default function ResumeDownload() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchResumeUrl = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getResumeUrl();
        
        if (error) {
          throw new Error(error.message);
        }
        
        setResumeUrl(data || null);
      } catch (error) {
        console.error("Error fetching resume URL:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResumeUrl();
  }, []);
  
  const handleDownload = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
      toast({
        title: "Downloading Resume",
        description: "Your download should begin shortly",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Resume is not available for download",
      });
    }
  };
  
  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-full">
        <FileText className="mr-2 h-4 w-4" />
        Loading resume...
      </Button>
    );
  }
  
  if (!resumeUrl) {
    return null;
  }
  
  return (
    <Button 
      variant="outline" 
      onClick={handleDownload}
      className="w-full"
    >
      <Download className="mr-2 h-4 w-4" />
      Download Resume
    </Button>
  );
}
