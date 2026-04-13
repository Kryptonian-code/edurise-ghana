import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { events } from "@/lib/demo-data";

export default function EventsPage() {
  return (
    <div>
      <section className="relative py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container-wide mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-4">Events</h1>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container-narrow mx-auto space-y-6">
          {events.map((ev) => (
            <Card key={ev.id} className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex gap-4">
                <div className="shrink-0 bg-primary text-primary-foreground rounded-xl p-3 text-center min-w-[70px]">
                  <p className="text-2xl font-bold">{new Date(ev.date).getDate()}</p>
                  <p className="text-xs">{new Date(ev.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1">{ev.title}</h2>
                  <p className="text-xs text-muted-foreground mb-2"><Calendar className="inline h-3 w-3 mr-1" />{ev.time} • {ev.venue}</p>
                  <p className="text-sm text-muted-foreground">{ev.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
