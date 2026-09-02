import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { verifyDownloadToken, markGrantConsumed } from "@/lib/download-token";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const DELIVERABLE_PATH = path.join(
  process.cwd(),
  "private",
  "downloads",
  "ai-image-generation-pipeline.zip"
);
const DELIVERABLE_FILENAME = "ai-image-generation-pipeline.zip";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Downloads aren't configured yet." }, { status: 503 });
  }

  const rateLimit = await checkRateLimit(`download:${getClientIp(request)}`, {
    windowSeconds: 300,
    maxHits: 20,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const validation = await verifyDownloadToken(token);

  if (!validation.valid) {
    const messages: Record<typeof validation.reason, string> = {
      "not-found": "This download link is invalid.",
      expired: "This download link has expired. Get a new one from your dashboard.",
      "order-not-completed": "This download link is no longer valid.",
    };
    return NextResponse.json({ error: messages[validation.reason] }, { status: 403 });
  }

  try {
    const file = await readFile(DELIVERABLE_PATH);
    await markGrantConsumed(validation.grantId).catch(() => {
      // Non-critical bookkeeping — never block the download over it.
    });

    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${DELIVERABLE_FILENAME}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/download]", error);
    return NextResponse.json(
      { error: "Download package is temporarily unavailable." },
      { status: 500 }
    );
  }
}
