import { supabase } from "@/integrations/supabase/client";

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  audience: string;
  classId?: string | null;
  published: boolean;
  createdAt: string;
}

function fromRow(r: any): AnnouncementRow {
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    audience: r.audience,
    classId: r.class_id,
    published: r.published,
    createdAt: r.created_at,
  };
}

export async function listAnnouncements(): Promise<AnnouncementRow[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createAnnouncement(input: { title: string; body: string; audience: string; published?: boolean }): Promise<AnnouncementRow> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title: input.title,
      body: input.body,
      audience: input.audience,
      published: input.published ?? true,
      created_by: user?.id ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}
