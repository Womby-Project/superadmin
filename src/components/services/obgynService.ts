// src/services/obgynService.ts
import { supabase } from "@/lib/supabaseClient";

export type ObgynUser = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    prc_license_number: string | null;
    profile_picture_url: string | null; // stored in obgyn_profiles bucket
    created_at: string | null;
    is_verified: boolean | null;
};



/** Resolve avatar from obgyn_profiles bucket */
// src/services/obgynService.ts
export const resolveAvatarUrl = (value?: string | null): string => {
    const fallback = "/doctor.png";

    if (!value) return fallback;
    if (/^https?:\/\//i.test(value)) return value;

    // Try to resolve from obgyn_profiles bucket
    const { data } = supabase.storage.from("obgyn_profiles").getPublicUrl(value);
    return data?.publicUrl ?? fallback;
};


/** Fetch pending OBGYNs */
export async function fetchPendingObgyns(limit = 5, offset = 0) {
    const { data, error } = await supabase
        .from("obgyn_users")
        .select(
            `
      id,
      first_name,
      last_name,
      email,
      prc_license_number,
      profile_picture_url,
      created_at,
      is_verified
    `
        )
        .or("is_verified.is.null,is_verified.eq.false")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;

    const { count, error: countErr } = await supabase
        .from("obgyn_users")
        .select("id", { count: "exact", head: true })
        .or("is_verified.is.null,is_verified.eq.false");

    if (countErr) throw countErr;

    return {
        items: (data ?? []) as ObgynUser[],
        total: count ?? 0,
    };
}

/** Approve (verify) an OB-GYN */
export async function approveObgyn(obgynId: string) {
    const { data, error } = await supabase
        .from("obgyn_users")
        .update({ is_verified: true, updated_at: new Date().toISOString() })
        .eq("id", obgynId)
        .select("id")
        .single();

    if (error) throw error;
    return data;
}
