import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// GANTI dua nilai ini dengan Project URL dan Publishable Key dari Supabase.
const SUPABASE_URL = "PASTE_PROJECT_URL_DI_SINI";
const SUPABASE_PUBLISHABLE_KEY = "PASTE_PUBLISHABLE_KEY_DI_SINI";

if (SUPABASE_URL.includes("PASTE_") || SUPABASE_PUBLISHABLE_KEY.includes("PASTE_")) {
  console.warn("Isi SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY di js/supabase.js terlebih dahulu.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
