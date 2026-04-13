import { Link } from "react-router-dom";
import { GraduationCap, Phone, Mail, MapPin } from "lucide-react";
import { schoolInfo } from "@/lib/demo-data";

export default function PublicFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-wide mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-7 w-7 text-accent" />
              <span className="text-lg font-bold">{schoolInfo.name}</span>
            </div>
            <p className="text-sm text-primary-foreground/70 mb-4">
              Providing quality education and building future leaders since {schoolInfo.founded}.
            </p>
            <p className="text-xs text-accent font-medium italic">"{schoolInfo.motto}"</p>
          </div>

          <div>
            <h4 className="font-semibold text-accent mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {["/about", "/admissions", "/programmes", "/news", "/contact"].map((p) => (
                <li key={p}>
                  <Link to={p} className="hover:text-accent transition-colors capitalize">
                    {p.replace("/", "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-accent mb-4">Programmes</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>Early Years</li>
              <li>Kindergarten</li>
              <li>Primary School</li>
              <li>Junior High School</li>
              <li>Senior High School</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-accent mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" />{schoolInfo.address}</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" />{schoolInfo.phone}</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" />{schoolInfo.email}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sidebar-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} {schoolInfo.name}. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link to="/faq" className="hover:text-accent">FAQ</Link>
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
