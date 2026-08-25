import { NextResponse } from "next/server";

export async function GET() {
  const v = process.env.DATABASE_URL;
  const d = process.env.DIRECT_URL;
  return NextResponse.json({
    hasDbUrl: typeof v === "string",
    dbUrlLength: v?.length ?? -1,
    dbUrlPrefix: v ? v.slice(0, 15) : null,
    hasDirectUrl: typeof d === "string",
    directUrlLength: d?.length ?? -1,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });
}
