
import ContactForm from "@/components/contact/ContactForm";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 animate-fadeIn">
              Get in Touch
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto animate-slideUp animate-delay-100">
              Have a project in mind or want to discuss a potential collaboration? 
              Feel free to reach out and I'll get back to you as soon as possible.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="animate-fadeIn animate-delay-200">
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Mail size={20} className="text-primary" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">Email</h3>
                    <a href="mailto:hello@example.com" className="text-muted-foreground hover:text-primary transition-colors">
                      hello@example.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Phone size={20} className="text-primary" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">Phone</h3>
                    <a href="tel:+11234567890" className="text-muted-foreground hover:text-primary transition-colors">
                      +1 (123) 456-7890
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <MapPin size={20} className="text-primary" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">Location</h3>
                    <p className="text-muted-foreground">
                      San Francisco, California
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">Office Hours</h2>
                <p className="text-muted-foreground">
                  Monday - Friday: 9:00 AM - 5:00 PM<br />
                  Saturday - Sunday: Closed
                </p>
              </div>
            </div>
            
            <div className="bg-background border border-border p-6 rounded-lg shadow-sm animate-fadeIn animate-delay-300">
              <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
