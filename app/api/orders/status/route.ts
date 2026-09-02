import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Polled by the post-payment success screen until the webhook lands and
// flips status to "completed". Only exposes status — never license/download
// data — so knowing an order id (a UUID the browser already holds from
// create-order) can't be used to pull anything sensitive.
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ status: data.status });
  } catch (error) {
    console.error("[orders/status]", error);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
