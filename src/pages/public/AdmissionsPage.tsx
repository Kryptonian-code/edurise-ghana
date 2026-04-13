import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdmissionsPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Application submitted successfully! We will contact you soon.");
  };

  return (
    <div>
      <section className="relative py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container-wide mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-4">Admissions</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Join the Prestige Academy family. Admissions are open for the 2025/2026 academic year.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Process */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-foreground mb-6">Admission Process</h2>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Submit Application", desc: "Complete the online form with all required information." },
                  { step: "2", title: "Document Review", desc: "Our admissions team reviews your application and documents." },
                  { step: "3", title: "Assessment", desc: "Student attends an entrance assessment appropriate to their level." },
                  { step: "4", title: "Interview", desc: "Parent and student meet with the admissions team." },
                  { step: "5", title: "Offer", desc: "Successful applicants receive an admission offer letter." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">{s.step}</div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="font-bold text-foreground mb-3">Required Documents</h3>
                <ul className="space-y-2">
                  {["Birth certificate", "Previous school report", "Passport photographs (2)", "Medical report", "Guardian's ID"].map(d => (
                    <li key={d} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />{d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <Card className="border-success/30 bg-success/5">
                  <CardContent className="p-12 text-center">
                    <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
                    <p className="text-muted-foreground mb-4">Thank you for applying. Our admissions team will review your application and contact you within 5 working days.</p>
                    <Button variant="outline" onClick={() => setSubmitted(false)}>Submit Another Application</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Online Application Form</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><Label>Child's First Name *</Label><Input required placeholder="e.g. Kwame" className="mt-1" /></div>
                        <div><Label>Child's Last Name *</Label><Input required placeholder="e.g. Asante" className="mt-1" /></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><Label>Date of Birth *</Label><Input required type="date" className="mt-1" /></div>
                        <div>
                          <Label>Gender *</Label>
                          <Select required><SelectTrigger className="mt-1"><SelectValue placeholder="Select gender" /></SelectTrigger>
                            <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Class Applying For *</Label>
                        <Select required><SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger>
                          <SelectContent>
                            {["Crèche", "Nursery 1", "Nursery 2", "KG 1", "KG 2", "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JHS 1", "JHS 2", "JHS 3", "SHS 1"].map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Previous School</Label><Input placeholder="Name of previous school" className="mt-1" /></div>

                      <hr className="border-border" />
                      <h3 className="font-bold text-foreground">Parent / Guardian Information</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><Label>Guardian's Full Name *</Label><Input required placeholder="e.g. Mr. Kofi Asante" className="mt-1" /></div>
                        <div><Label>Relationship *</Label>
                          <Select required><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent><SelectItem value="father">Father</SelectItem><SelectItem value="mother">Mother</SelectItem><SelectItem value="guardian">Guardian</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><Label>Phone Number *</Label><Input required placeholder="+233 24 XXX XXXX" className="mt-1" /></div>
                        <div><Label>Email Address</Label><Input type="email" placeholder="email@example.com" className="mt-1" /></div>
                      </div>
                      <div><Label>Residential Address *</Label><Input required placeholder="House number, street, city" className="mt-1" /></div>
                      <div><Label>Medical Notes (if any)</Label><Textarea placeholder="Any medical conditions or allergies we should be aware of" className="mt-1" /></div>
                      <div><Label>Additional Information</Label><Textarea placeholder="Any other information you'd like to share" className="mt-1" /></div>

                      <Button type="submit" size="lg" className="w-full font-bold">
                        Submit Application <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
