import heroImage from "@/assets/hero-school.jpg";

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <img
                  src={heroImage}
                  alt={`School gallery image ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
