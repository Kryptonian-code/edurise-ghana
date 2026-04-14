import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2, Edit, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { newsArticles as defaultNews } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";

export default function NewsCMS() {
  const [articles, setArticles] = useState(defaultNews.map(a => ({ ...a, status: "Published" as string })));
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setEditing(null); toast.success("News articles updated!"); }, 600);
  };

  const update = (index: number, field: string, value: string) => {
    const updated = [...articles];
    updated[index] = { ...updated[index], [field]: value };
    setArticles(updated);
  };

  const addArticle = () => {
    const newArticle = { id: Date.now().toString(), title: "", date: new Date().toISOString().split("T")[0], excerpt: "", image: "", status: "Draft" };
    setArticles([newArticle, ...articles]);
    setEditing(newArticle.id);
  };

  const remove = (index: number) => setArticles(articles.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/cms"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="dashboard-header">News & Blog</h1>
          <p className="text-sm text-muted-foreground">Publish news articles and updates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addArticle}><Plus className="h-4 w-4 mr-2" />New Article</Button>
          <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save All"}</Button>
        </div>
      </div>

      <div className="space-y-4">
        {articles.map((article, i) => (
          <Card key={article.id} className="border-border">
            <CardContent className="p-6">
              {editing === article.id ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>Title</Label><Input value={article.title} onChange={e => update(i, "title", e.target.value)} className="mt-1" /></div>
                    <div><Label>Date</Label><Input type="date" value={article.date} onChange={e => update(i, "date", e.target.value)} className="mt-1" /></div>
                  </div>
                  <div><Label>Excerpt / Summary</Label><Textarea value={article.excerpt} onChange={e => update(i, "excerpt", e.target.value)} className="mt-1" rows={3} /></div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setEditing(null)}>Done Editing</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(i)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground">{article.title || "Untitled Article"}</h3>
                      <Badge variant={article.status === "Published" ? "default" : "secondary"} className="text-xs">{article.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(article.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setEditing(article.id)}><Edit className="h-4 w-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
