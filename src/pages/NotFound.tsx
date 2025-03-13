
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
          <div className="rounded-full bg-primary/10 p-3">
            <AlertCircle size={28} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-muted-foreground">
            The page at <code className="bg-secondary/50 px-1 py-0.5 rounded">{location.pathname}</code> couldn't be found.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
