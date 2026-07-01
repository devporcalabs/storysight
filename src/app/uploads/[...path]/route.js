import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const pathParts = resolvedParams?.path;
  
  if (!pathParts || pathParts.length < 2) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const [subfolder, filename] = pathParts;
  
  // Resolve path to the upload file
  const filePath = path.join(process.cwd(), "public", "uploads", subfolder, filename);
  
  try {
    const fileBuffer = await fs.readFile(filePath);
    
    // Determine content type based on extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".mp4") contentType = "video/mp4";
    else if (ext === ".webm") contentType = "video/webm";
    else if (ext === ".mov") contentType = "video/quicktime";
    
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Not Found", { status: 404 });
  }
}
