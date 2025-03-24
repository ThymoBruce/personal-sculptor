
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, FileText, CheckSquare, LayoutDashboard } from "lucide-react";
import WebsiteList from "@/components/dashboard/WebsiteList";
import DocumentManager from "@/components/dashboard/DocumentManager";
import TodoList from "@/components/dashboard/TodoList";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Personal Dashboard
            </h1>
            <p className="text-muted-foreground">
              Keep everything important in one place
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="websites" className="flex items-center gap-2">
              <Globe size={16} />
              <span className="hidden sm:inline">Websites</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText size={16} />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="todos" className="flex items-center gap-2">
              <CheckSquare size={16} />
              <span className="hidden sm:inline">To-Do List</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DashboardCard 
                title="Websites" 
                description="Manage your favorite external websites"
                icon={<Globe className="h-6 w-6" />}
                linkTo={() => setActiveTab("websites")}
              />
              <DashboardCard 
                title="Documents" 
                description="Upload and manage your documents"
                icon={<FileText className="h-6 w-6" />}
                linkTo={() => setActiveTab("documents")}
              />
              <DashboardCard 
                title="To-Do List" 
                description="Manage your tasks and stay organized"
                icon={<CheckSquare className="h-6 w-6" />}
                linkTo={() => setActiveTab("todos")}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="websites">
            <WebsiteList />
          </TabsContent>
          
          <TabsContent value="documents">
            <DocumentManager />
          </TabsContent>
          
          <TabsContent value="todos">
            <TodoList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkTo: () => void;
}

function DashboardCard({ title, description, icon, linkTo }: DashboardCardProps) {
  return (
    <div 
      className="bg-card border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={linkTo}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="p-2 bg-primary/10 rounded-full text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-medium">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
