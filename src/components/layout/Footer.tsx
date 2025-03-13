
import { Link } from "react-router-dom";
import { Github, Instagram, Linkedin, Mail, Music, BookOpen } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { icon: Github, href: "https://github.com/ThymoBruce", label: "GitHub" },
    { icon: Instagram, href: "https://instagram.com/thymobruce", label: "Instagram" },
    { icon: Mail, href: "mailto:info@thymobruce.nl", label: "Email" },
  ];

  return (
    <footer className="border-t border-border mt-24 pt-16 pb-12 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <Link to="/" className="text-xl font-medium tracking-tight mb-4 block">
              Thymo Bruce
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              Full-Stack Developer from The Netherlands with a passion for creating elegant solutions to complex problems.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/projects" className="text-muted-foreground hover:text-primary transition-colors">Projects</Link>
              </li>
              <li>
                <Link to="/music" className="text-muted-foreground hover:text-primary transition-colors">Music</Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
              </li>
              <li>
                <Link to="/links" className="text-muted-foreground hover:text-primary transition-colors">Links</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Featured</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/music" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                  <Music size={16} className="mr-2" />
                  <span>Music Production</span>
                </Link>
              </li>
              <li>
                <Link to="/blog" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                  <BookOpen size={16} className="mr-2" />
                  <span>Blog</span>
                </Link>
              </li>
              <li>
                <a 
                  href="/resume.pdf" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  download
                >
                  Download Resume
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Thymo Bruce. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm mt-4 md:mt-0">
            Made with <span className="text-primary">♥</span> in The Netherlands
          </p>
        </div>
      </div>
    </footer>
  );
}
