
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, FileText, Link2, FileUp, LogOut, Music, Book } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ResumeUploader from "@/components/admin/ResumeUploader";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login");
    }
  }, [user, loading, navigate]);
  
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
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
            <Button 
              variant="destructive"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Moved welcome section to the top */}
        <div className="p-6 bg-secondary/30 rounded-lg mb-12">
          <h2 className="text-lg font-medium mb-4">Welcome to the Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            This dashboard allows you to manage your portfolio content, including projects, 
            links, music, blog posts, and your downloadable resume. Use the cards below to navigate to specific 
            management pages or update your resume directly from this screen.
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6 mb-12">
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
              <CardTitle className="text-sm font-medium">Resume</CardTitle>
              <FileUp size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">Manage your downloadable resume</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date().toLocaleDateString()}
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Music Tracks</CardTitle>
              <Music size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-1">
                1 added this month
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/admin/projects">
            <Card className="h-full hover:shadow-md hover:translate-y-[-2px] transition-transform">
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
            <Card className="h-full hover:shadow-md hover:translate-y-[-2px] transition-transform">
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

          <Link to="/admin/music">
            <Card className="h-full hover:shadow-md hover:translate-y-[-2px] transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Music size={18} className="mr-2" />
                  Manage Music
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Upload, edit, or delete your music tracks
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/blog">
            <Card className="h-full hover:shadow-md hover:translate-y-[-2px] transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book size={18} className="mr-2" />
                  Manage Blog
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Create, edit, or delete your blog posts
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        <div className="mb-12">
          <ResumeUploader />
        </div>
      </div>
    </div>
  );
}
