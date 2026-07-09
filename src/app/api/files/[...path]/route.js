import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getFileFromR2, isR2Configured } from "@/lib/r2";

export async function GET(request, { params }) {
  try {
    // Authorization check — any logged-in user can access files
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build the R2 key from the URL path segments
    const { path } = await params;
    if (!path || path.length === 0) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 });
    }

    const key = path.join("/");

    if (!isR2Configured) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
    }

    const { body, contentType, contentLength } = await getFileFromR2(key);

    // Stream the file body back to the browser
    const readableStream = body.transformToWebStream
      ? body.transformToWebStream()
      : body;

    const headers = {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    };

    if (contentLength) {
      headers["Content-Length"] = String(contentLength);
    }

    return new Response(readableStream, { status: 200, headers });
  } catch (error) {
    console.error("File proxy error:", error);

    // Handle R2 NoSuchKey error
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to retrieve file" }, { status: 500 });
  }
}
