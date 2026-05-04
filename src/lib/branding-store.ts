// School branding stored in school_settings table on Supabase.
// Logo lives in the school-assets storage bucket.
import { supabase } from "@/integrations/supabase/client";
import { schoolInfo as defaults } from "@/lib/demo-data";

export interface SchoolBranding {
  id?: string;
  name: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
}

const FALLBACK: SchoolBranding = {
  name: defaults.name,
  motto: defaults.motto,
  address: defaults.address,
  phone: defaults.phone,
  email: defaults.email,
  website: defaults.website,
};

function fromRow(r: any): SchoolBranding {
  return {
    id: r.id,
    name: r.school_name || FALLBACK.name,
    motto: r.motto || FALLBACK.motto,
    address: r.address || FALLBACK.address,
    phone: r.phone || FALLBACK.phone,
    email: r.email || FALLBACK.email,
    website: r.website || FALLBACK.website,
    logoUrl: r.logo_url || undefined,
    primaryColor: r.primary_color || undefined,
    accentColor: r.accent_color || undefined,
  };
}

export async function fetchBranding(): Promise<SchoolBranding> {
  const { data } = await supabase.from("school_settings").select("*").limit(1).maybeSingle();
  if (!data) return FALLBACK;
  return fromRow(data);
}

export async function saveBranding(b: Partial<SchoolBranding>): Promise<SchoolBranding> {
  const { data: existing } = await supabase.from("school_settings").select("id").limit(1).maybeSingle();
  const payload: any = {
    school_name: b.name,
    motto: b.motto,
    address: b.address,
    phone: b.phone,
    email: b.email,
    website: b.website,
    logo_url: b.logoUrl,
    primary_color: b.primaryColor,
    accent_color: b.accentColor,
  };
  Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
  if (existing?.id) {
    const { data, error } = await supabase.from("school_settings").update(payload).eq("id", existing.id).select().single();
    if (error) throw error;
    return fromRow(data);
  }
  const { data, error } = await supabase.from("school_settings").insert(payload).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function uploadLogo(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `logo-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("school-assets").upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) throw error;
  const { data: pub } = supabase.storage.from("school-assets").getPublicUrl(path);
  return pub.publicUrl;
}

export async function clearLogo(): Promise<void> {
  await saveBranding({ logoUrl: undefined } as any);
  // also explicitly null in DB
  const { data: existing } = await supabase.from("school_settings").select("id").limit(1).maybeSingle();
  if (existing?.id) await supabase.from("school_settings").update({ logo_url: null }).eq("id", existing.id);
}
