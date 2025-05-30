// app/api/fetch-pdf/route.ts
//export const runtime = "node"; // Ensures Node.js runtime for fetch().arrayBuffer()

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get("fileId");
  if (!fileId)
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });

  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  try {
    const pdfRes = await fetch(downloadUrl);
    if (!pdfRes.ok) throw new Error("Failed to fetch PDF");

    console.log(pdfRes.headers.get("content-type"));

    const buffer = await pdfRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    console.log("Base64 Length:", base64.length);

    return NextResponse.json({ base64 }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
