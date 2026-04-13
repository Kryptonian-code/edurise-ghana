import { Card, CardContent } from "@/components/ui/card";
import { newsArticles } from "@/lib/demo-data";

export default function NewsPage() {
  return (
    <div>
      <section className="relative py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container-wide mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-4">News & Updates</h1>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container-narrow mx-auto space-y-6">
          {newsArticles.map((a) => (
            <Card key={a.id} className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground mb-2">{new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                <h2 className="text-xl font-bold text-foreground mb-2">{a.title}</h2>
                <p className="text-muted-foreground">{a.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
