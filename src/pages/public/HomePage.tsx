import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, Award, BookOpen, Star, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { schoolInfo, stats, programmes, testimonials, newsArticles, events } from "@/lib/demo-data";
import heroImage from "@/assets/hero-school.jpg";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center" style={{ background: "var(--hero-gradient)" }}>
        <div className="absolute inset-0 opacity-20">
          <img src={heroImage} alt="Prestige Academy campus" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
        <div className="relative container-wide mx-auto px-4 py-24">
          <div className="max-w-2xl">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4 animate-fade-in">Welcome to {schoolInfo.name}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 animate-fade-in">
              Building Future Leaders Through{" "}
              <span className="text-accent">Excellence</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl animate-fade-in">
              A premier private school in Accra offering quality education from Crèche to SHS. 
              We nurture young minds to become confident, responsible, and globally competitive citizens.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-in">
              <Link to="/admissions">
                <Button variant="secondary" size="lg" className="font-bold text-base">
                  Apply for Admission <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-bold text-base">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-card border-b border-border">
        <div className="container-wide mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "Students", value: `${stats.totalStudents}+` },
              { icon: GraduationCap, label: "Qualified Teachers", value: `${stats.totalTeachers}+` },
              { icon: Award, label: "BECE Pass Rate", value: `${stats.passRate}%` },
              { icon: Star, label: "Years of Excellence", value: `${new Date().getFullYear() - schoolInfo.founded}+` },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About summary */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Choose <span className="text-primary">Prestige Academy?</span>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                At Prestige Academy, we believe every child has the potential to achieve greatness. Our holistic approach 
                to education combines rigorous academics with character development, sports, arts, and technology to produce 
                well-rounded graduates ready to lead in the 21st century.
              </p>
              <ul className="space-y-3">
                {[
                  "Experienced and dedicated teaching staff",
                  "Modern ICT and science laboratories",
                  "Small class sizes for personalised attention",
                  "Strong BECE and WASSCE track record",
                  "Safe and nurturing learning environment",
                  "Co-curricular activities and leadership programmes",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
              <img src={heroImage} alt="Students at Prestige Academy" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="section-padding bg-muted">
        <div className="container-wide mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Programmes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer comprehensive educational programmes from early childhood through senior high school, 
              all following the Ghana Education Service curriculum.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programmes.slice(0, 5).map((prog, i) => (
              <Card key={prog.id} className="hover:shadow-lg transition-shadow border-border bg-card">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{prog.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{prog.description}</p>
                  <p className="text-xs font-medium text-accent-foreground bg-accent/30 inline-block px-2 py-1 rounded">{prog.ageRange}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/programmes">
              <Button variant="outline" className="font-semibold">View All Programmes <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Latest News</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {newsArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow border-border">
                <CardContent className="p-6">
                  <p className="text-xs text-muted-foreground mb-2">{new Date(article.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <h3 className="text-base font-bold text-foreground mb-2">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="section-padding bg-muted">
        <div className="container-wide mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Upcoming Events</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {events.slice(0, 4).map((event) => (
              <Card key={event.id} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex gap-4">
                  <div className="shrink-0 bg-primary text-primary-foreground rounded-xl p-3 text-center min-w-[70px]">
                    <p className="text-2xl font-bold">{new Date(event.date).getDate()}</p>
                    <p className="text-xs">{new Date(event.date).toLocaleDateString("en-GB", { month: "short" })}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{event.title}</h3>
                    <p className="text-xs text-muted-foreground mb-1"><Calendar className="inline h-3 w-3 mr-1" />{event.time} • {event.venue}</p>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Parents Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.id} className="border-border">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-warning text-warning" />)}
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-4">"{t.text}"</p>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding" style={{ background: "var(--hero-gradient)" }}>
        <div className="container-wide mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Give Your Child the Best Education?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Admissions are currently open for the 2025/2026 academic year. Secure your child's place today.
          </p>
          <Link to="/admissions">
            <Button variant="secondary" size="lg" className="font-bold text-base">
              Start Application <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
