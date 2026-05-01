// School branding stored in localStorage. Logo is a data URL so it survives refresh and prints cleanly.
import { schoolInfo as defaults } from "@/lib/demo-data";

export interface SchoolBranding {
  name: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoDataUrl?: string;
}

const KEY = "pa_school_info";

export function getBranding(): SchoolBranding {
  try {
    const raw = localStorage.getItem(KEY);
    const stored = raw ? JSON.parse(raw) : {};
    return { ...defaults, ...stored };
  } catch {
    return { ...defaults };
  }
}

export function saveBranding(b: Partial<SchoolBranding>) {
  const merged = { ...getBranding(), ...b };
  localStorage.setItem(KEY, JSON.stringify(merged));
  return merged;
}

export function clearLogo() {
  const b = getBranding();
  delete b.logoDataUrl;
  localStorage.setItem(KEY, JSON.stringify(b));
}
