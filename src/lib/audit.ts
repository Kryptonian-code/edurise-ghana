// Lightweight audit log helper (best-effort; failures are silent)
import { supabase } from "@/integrations/supabase/client";

export async function logAudit(action: string, entity: string, entityId?: string, metadata?: Record<string, any>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_events" as any).insert({
      actor_id: user?.id || null,
      action,
      entity,
      entity_id: entityId || null,
      metadata: metadata || {},
    });
  } catch {
    // silent
  }
}
