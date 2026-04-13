import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { schoolInfo } from "@/lib/demo-data";
import { toast } from "sonner";

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We will respond within 24 hours.");
  };

  return (
    <div>
      <section className="relative py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container-wide mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-4">Contact Us</h1>
          <p className="text-primary-foreground/80">We'd love to hear from you.</p>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              {[
                { icon: MapPin, title: "Address", text: schoolInfo.address },
                { icon: Phone, title: "Phone", text: schoolInfo.phone },
                { icon: Mail, title: "Email", text: schoolInfo.email },
                { icon: Clock, title: "Office Hours", text: "Mon - Fri: 7:30 AM - 4:00 PM" },
              ].map((item) => (
                <Card key={item.title} className="border-border">
                  <CardContent className="p-4 flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><Label>Full Name *</Label><Input required placeholder="Your full name" className="mt-1" /></div>
                      <div><Label>Email *</Label><Input required type="email" placeholder="your@email.com" className="mt-1" /></div>
                    </div>
                    <div><Label>Phone Number</Label><Input placeholder="+233 XX XXX XXXX" className="mt-1" /></div>
                    <div><Label>Subject *</Label><Input required placeholder="What is your enquiry about?" className="mt-1" /></div>
                    <div><Label>Message *</Label><Textarea required rows={5} placeholder="Type your message here..." className="mt-1" /></div>
                    <Button type="submit" size="lg" className="w-full font-bold">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
