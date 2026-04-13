import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { programmes } from "@/lib/demo-data";

export default function ProgrammesPage() {
  return (
    <div>
      <section className="relative py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container-wide mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-4">Our Programmes</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Comprehensive education from early childhood through senior high school.
          </p>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="space-y-8">
            {programmes.map((prog, i) => (
              <Card key={prog.id} className="border-border hover:shadow-lg transition-shadow overflow-hidden">
                <CardContent className="p-8 flex flex-col md:flex-row gap-6 items-start">
                  <div className="h-16 w-16 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{prog.name}</h3>
                    <p className="text-xs font-semibold text-accent-foreground bg-accent/30 inline-block px-2 py-1 rounded mb-3">{prog.ageRange}</p>
                    <p className="text-muted-foreground leading-relaxed">{prog.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
