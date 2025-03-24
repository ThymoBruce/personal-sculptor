
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, FileText, CheckSquare } from "lucide-react";
import WebsiteList from "@/components/dashboard/WebsiteList";
import DocumentManager from "@/components/dashboard/DocumentManager";
import TodoList from "@/components/dashboard/TodoList";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("websites");

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
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
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
