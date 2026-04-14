import heroImage from "@/assets/hero-school.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const galleryItems = [
  { caption: "Students during morning assembly", album: "School Life" },
  { caption: "Science laboratory practical session", album: "Academics" },
  { caption: "Inter-house sports competition", album: "Sports" },
  { caption: "Annual Speech and Prize Giving Day", album: "Events" },
  { caption: "ICT laboratory in use", album: "Facilities" },
  { caption: "Students in the library", album: "Academics" },
  { caption: "School entrance and reception area", album: "Facilities" },
  { caption: "Creative arts class in session", album: "Academics" },
  { caption: "Football match on school field", album: "Sports" },
];

const albums = ["All", ...Array.from(new Set(galleryItems.map(g => g.album)))];

export default function GalleryPage() {
  return (
    <div>
      <section className="relative py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container-wide mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-4">Gallery</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Capturing moments of learning, growth, and celebration at Prestige Academy.
          </p>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <Tabs defaultValue="All" className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              {albums.map(a => (
                <TabsTrigger key={a} value={a} className="text-xs">{a}</TabsTrigger>
              ))}
            </TabsList>
            {albums.map(album => (
              <TabsContent key={album} value={album}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryItems
                    .filter(g => album === "All" || g.album === album)
                    .map((item, i) => (
                      <Card key={i} className="overflow-hidden border-border hover:shadow-lg transition-shadow group">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={heroImage}
                            alt={item.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium text-foreground">{item.caption}</p>
                          <p className="text-xs text-muted-foreground">{item.album}</p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </div>
  );
}
