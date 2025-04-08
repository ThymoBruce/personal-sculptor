
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Contact from "./pages/Contact";
import Links from "./pages/Links";
import MusicPage from "./pages/Music";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Dashboard from "./pages/Dashboard";
import ProjectsManager from "./pages/admin/ProjectsManager";
import LinksManager from "./pages/admin/LinksManager";
import MusicManager from "./pages/admin/MusicManager";
import BlogManager from "./pages/admin/BlogManager";
import CategoriesManager from "./pages/admin/CategoriesManager";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/links" element={<Links />} />
                <Route path="/music" element={<MusicPage />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/projects" element={<ProjectsManager />} />
                <Route path="/admin/links" element={<LinksManager />} />
                <Route path="/admin/music" element={<MusicManager />} />
                <Route path="/admin/blog" element={<BlogManager />} />
                <Route path="/admin/categories" element={<CategoriesManager />} />
                <Route path="/admin/documents" element={<Dashboard />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
