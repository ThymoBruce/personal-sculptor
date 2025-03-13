
import { ArrowRight, User, Briefcase, GraduationCap, Award, Music, Download, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-block animate-fadeIn">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Welcome to my portfolio
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-slideUp animate-delay-100 text-balance">
              I'm <span className="text-primary">Thymo Bruce</span>,<br /> 
              Full Stack Developer
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl animate-slideUp animate-delay-200 text-balance">
              I specialize in building modern, responsive web applications with attention to detail
              and focus on user experience. Based in The Netherlands.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4 animate-slideUp animate-delay-300">
              <Link
                to="/projects"
                className="inline-flex items-center justify-center px-6 py-3 font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                View Projects
                <ArrowRight size={16} className="ml-2" />
              </Link>
              
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                Contact Me
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">About Me</h2>
              <p className="text-muted-foreground">
                I'm a dedicated full-stack developer from The Netherlands with a passion for creating clean, efficient, and user-friendly applications. 
                Besides programming, I'm also passionate about music production.
              </p>
              <p className="text-muted-foreground">
                I'm fluent in Dutch and English, and my approach to development focuses on writing maintainable code that solves real problems. 
                I believe in continuous learning and staying updated with the latest technologies and best practices.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="/resume.pdf" 
                  className="inline-flex items-center text-primary hover:underline font-medium"
                  download
                >
                  Download Resume
                  <Download size={16} className="ml-2" />
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background p-6 rounded-lg shadow-sm">
                <User size={24} className="text-primary mb-4" />
                <h3 className="font-medium mb-2">Personal Touch</h3>
                <p className="text-sm text-muted-foreground">Building with empathy and understanding user needs</p>
              </div>
              
              <div className="bg-background p-6 rounded-lg shadow-sm">
                <Briefcase size={24} className="text-primary mb-4" />
                <h3 className="font-medium mb-2">Professional</h3>
                <p className="text-sm text-muted-foreground">Delivering high-quality solutions on time</p>
              </div>
              
              <div className="bg-background p-6 rounded-lg shadow-sm">
                <Music size={24} className="text-primary mb-4" />
                <h3 className="font-medium mb-2">Music Producer</h3>
                <p className="text-sm text-muted-foreground">Creating electronic music in my free time</p>
              </div>
              
              <div className="bg-background p-6 rounded-lg shadow-sm">
                <BookOpen size={24} className="text-primary mb-4" />
                <h3 className="font-medium mb-2">Content Creator</h3>
                <p className="text-sm text-muted-foreground">Sharing knowledge through my blog</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Skills Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">My Skills</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Here are some technologies and tools I work with regularly.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {["React", "TypeScript", "Node.js", "Next.js", "Tailwind CSS", "PostgreSQL", 
              "GraphQL", "AWS", "Docker", "Git", "Redux", "Express"].map((skill) => (
              <div key={skill} className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-lg hover-lift">
                <span className="font-medium">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Sections */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Featured</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Check out my music production and latest blog posts.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-background p-8 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold">Music Production</h3>
                <Link to="/music" className="text-primary hover:underline inline-flex items-center">
                  View all
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center p-4 border border-border rounded-lg hover:bg-secondary/20 transition-colors">
                  <div className="w-12 h-12 bg-secondary/50 rounded-md flex items-center justify-center mr-4">
                    <Music size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Midnight Dreams</h4>
                    <p className="text-sm text-muted-foreground">Electronic • 2023</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 border border-border rounded-lg hover:bg-secondary/20 transition-colors">
                  <div className="w-12 h-12 bg-secondary/50 rounded-md flex items-center justify-center mr-4">
                    <Music size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Coastal Waves</h4>
                    <p className="text-sm text-muted-foreground">Ambient • 2023</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-background p-8 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold">Latest Blog Posts</h3>
                <Link to="/blog" className="text-primary hover:underline inline-flex items-center">
                  View all
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
              
              <div className="space-y-4">
                <Link to="/blog/journey-into-full-stack-development" className="block p-4 border border-border rounded-lg hover:bg-secondary/20 transition-colors">
                  <h4 className="font-medium">My Journey into Full-Stack Development</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    A reflection on my path to becoming a Full-Stack Developer and the lessons learned along the way.
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-muted-foreground">November 15, 2023</span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full">Career</span>
                  </div>
                </Link>
                
                <Link to="/blog/intersection-music-production-coding" className="block p-4 border border-border rounded-lg hover:bg-secondary/20 transition-colors">
                  <h4 className="font-medium">The Intersection of Music Production and Coding</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    How my background in music production has influenced my approach to software development.
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-muted-foreground">January 5, 2024</span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full">Music</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to Work Together?</h2>
            <p className="mb-8 opacity-90">
              I'm currently available for freelance projects and collaborations.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 font-medium bg-primary-foreground text-primary rounded-md hover:bg-primary-foreground/90 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
