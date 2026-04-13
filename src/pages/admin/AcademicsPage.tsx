import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { classStructure } from "@/lib/demo-data";
import { BookOpen, Calendar, Plus } from "lucide-react";

export default function AcademicsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="dashboard-header">Academic Management</h1>
          <p className="text-sm text-muted-foreground">Manage academic years, terms, classes, and subjects</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Current Academic Year</h3>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Academic Year</span>
                <span className="font-medium text-foreground">2024/2025</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Current Term</span>
                <span className="font-medium text-foreground">Term 1</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Term Start</span>
                <span className="font-medium text-foreground">9th September 2024</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Term End</span>
                <span className="font-medium text-foreground">20th December 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />Subjects Offered</h3>
              <Button variant="outline" size="sm"><Plus className="h-3 w-3 mr-1" />Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Mathematics", "English Language", "Integrated Science", "Social Studies", "ICT", "French", "Religious & Moral Education", "Creative Arts", "Physical Education", "Ghanaian Language (Twi)"].map(s => (
                <span key={s} className="px-3 py-1 rounded-full bg-accent/20 text-xs font-medium text-accent-foreground">{s}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardContent className="p-6">
          <h3 className="font-bold text-foreground mb-4">Class Structure</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classStructure.map(level => (
              <div key={level.level} className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">{level.level}</h4>
                <div className="space-y-1">
                  {level.classes.map(c => (
                    <div key={c} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
