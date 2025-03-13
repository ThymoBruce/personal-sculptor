
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, FileText, Link2 } from "lucide-react";
import { isAuthenticated } from "@/lib/api";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function Dashboard() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const auth = isAuthenticated();
      setIsAuthorized(auth);
    };
    
    checkAuth();
  }, []);
  
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in as an admin to access this page.
            </p>
            <div className="p-6 bg-secondary/30 rounded-lg">
              <p className="mb-4 text-sm">
                This is a demo version. In the full implementation, this would connect to Supabase Auth.
              </p>
              <button 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                onClick={() => alert("This would open a login form in the real implementation.")}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your content and website settings
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button 
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md"
              onClick={() => alert("This would log you out in the real implementation.")}
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FileText size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">
                3 published this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <BarChart3 size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground mt-1">
                1 added this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Links</CardTitle>
              <Link2 size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-1">
                2 added this month
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/admin/projects">
            <Card className="h-full hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText size={18} className="mr-2" />
                  Manage Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Add, edit, or delete your portfolio projects
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/links">
            <Card className="h-full hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Link2 size={18} className="mr-2" />
                  Manage Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Update your social media and professional links
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        <div className="mt-12 p-6 bg-secondary/30 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Note</h2>
          <p className="text-sm text-muted-foreground">
            This is a demo version of the admin dashboard. In the full implementation, 
            this would connect to Supabase backend for authentication and data management.
          </p>
        </div>
      </div>
    </div>
  );
}
