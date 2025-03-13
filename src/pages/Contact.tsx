
import ContactForm from "@/components/contact/ContactForm";
import ResumeDownload from "@/components/contact/ResumeDownload";
import { Button } from "@/components/ui/button";
import { Github, Instagram, Mail } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 animate-fadeIn">
            Get in Touch
          </h1>
          <p className="text-muted-foreground mb-12 animate-slideUp animate-delay-100">
            I'm always open to new opportunities and collaborations. Feel free to reach out!
          </p>
          
          <div className="grid md:grid-cols-5 gap-8 md:gap-12">
            <div className="md:col-span-3">
              <ContactForm />
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a 
                        href="mailto:info@thymobruce.nl" 
                        className="text-primary hover:underline"
                      >
                        info@thymobruce.nl
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Github className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">GitHub</p>
                      <a 
                        href="https://github.com/ThymoBruce" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        github.com/ThymoBruce
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Instagram className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Instagram</p>
                      <a 
                        href="https://instagram.com/thymobruce" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        instagram.com/thymobruce
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">Resume</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download my resume to learn more about my skills and experience
                </p>
                <ResumeDownload />
              </div>
              
              <div className="bg-secondary/30 rounded-lg p-6">
                <h3 className="text-base font-medium mb-2">Location</h3>
                <p className="text-sm text-muted-foreground">
                  Based in The Netherlands<br />
                  Languages: Dutch, English
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
