import { CheckCircle2, Award, Users, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { schoolInfo } from "@/lib/demo-data";
import heroImage from "@/assets/hero-school.jpg";

export default function AboutPage() {
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
                {schoolInfo.name} was established with a singular vision: to create a world-class educational 
                institution that nurtures the intellectual, moral, and physical development of every child. 
                From humble beginnings with just 35 pupils, we have grown into one of the most respected 
                private schools in Accra.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Our school community is built on the values of integrity, discipline, hard work, and respect. 
                We believe that education is the most powerful tool for transforming lives and building 
                prosperous communities.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we serve over 800 students from Crèche to Senior High School, guided by more than 
                60 dedicated teachers and support staff. Our graduates consistently excel in national 
                examinations and go on to attend top secondary schools and universities.
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
                  To provide quality, holistic education that develops confident, responsible, and 
                  innovative young people who are prepared to contribute meaningfully to their 
                  communities and the world.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To be the leading private school in Ghana, recognised for academic excellence, 
                  character development, and the production of future leaders who make a positive 
                  impact in society.
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
            {[
              { icon: CheckCircle2, title: "Integrity", desc: "We uphold honesty and strong moral principles in all we do." },
              { icon: Award, title: "Excellence", desc: "We strive for the highest standards in academics and character." },
              { icon: Users, title: "Community", desc: "We foster a sense of belonging, respect, and teamwork." },
              { icon: BookOpen, title: "Innovation", desc: "We embrace modern teaching methods and technology." },
            ].map((v) => (
              <Card key={v.title} className="border-border text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
