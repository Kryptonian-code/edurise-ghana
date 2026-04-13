import { Card, CardContent } from "@/components/ui/card";
import { teachers } from "@/lib/demo-data";
import { Mail, Phone } from "lucide-react";

export default function StaffPage() {
  return (
    <div>
      <section className="relative py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container-wide mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-4">Our Staff</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Meet our dedicated team of educators committed to your child's success.
          </p>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => (
              <Card key={t.id} className="border-border hover:shadow-lg transition-shadow text-center">
                <CardContent className="p-6">
                  <div className="h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                    {t.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{t.name}</h3>
                  <p className="text-sm text-accent-foreground font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground mb-3">{t.qualification}</p>
                  <div className="flex justify-center gap-4 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <Phone className="h-4 w-4" />
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
