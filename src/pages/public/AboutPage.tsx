import { CheckCircle2, Award, Users, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { schoolInfo } from "@/lib/demo-data";
import heroImage from "@/assets/hero-school.jpg";
import { useCMS } from "@/lib/cms-store";

export default function AboutPage() {
  const { getSection } = useCMS();
  const about = getSection("about");
  const icons = [CheckCircle2, Award, Users, BookOpen];

  return (
    <div>
      <section className="relative py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container-wide mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-4">About Our School</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Founded in {schoolInfo.founded}, {schoolInfo.name} has been a beacon of educational excellence in Greater Accra.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {about.history}
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {about.historyPara2}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {about.historyPara3}
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
              <img src={heroImage} alt="Prestige Academy" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted">
        <div className="container-wide mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {about.mission}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {about.vision}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(about.values || []).map((v: any, index: number) => {
              const Icon = icons[index] || CheckCircle2;
              return <Card key={v.title} className="border-border text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </CardContent>
              </Card>;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
