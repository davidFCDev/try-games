import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Construir URL absoluta usando el origen de la petición para funcionar en Vercel/Local
  const origin = new URL(req.url).origin;
  const redirectUrl = new URL(
    "/auth/login",
    process.env.NEXT_PUBLIC_SITE_URL || origin
  );

  return NextResponse.redirect(redirectUrl);
}
