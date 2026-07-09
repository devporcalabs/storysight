import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyToken } from "@/lib/auth";
import { uploadToR2, isR2Configured } from "@/lib/r2";

export async function POST(request) {
  try {
    // Authorization check
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user || user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type"); // "pdf", "video", "thumbnail"

    if (!file || !type) {
      return NextResponse.json(
        { error: "File and type parameters are required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();

    // Validations based on type
    let subfolder = "";
    if (type === "pdf") {
      if (ext !== ".pdf") {
        return NextResponse.json({ error: "Only .pdf files are allowed" }, { status: 400 });
      }
      subfolder = "pdfs";
    } else if (type === "video") {
      if (![".mp4", ".mov", ".webm"].includes(ext)) {
        return NextResponse.json({ error: "Only .mp4, .mov, or .webm videos are allowed" }, { status: 400 });
      }
      subfolder = "videos";
    } else if (type === "thumbnail" || type === "quiz") {
      if (ext !== ".webp") {
        return NextResponse.json({ error: "Only .webp images are allowed" }, { status: 400 });
      }
      subfolder = type === "quiz" ? "quizzes" : "thumbnails";
    } else {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
    }

    // Size limits: Max 15MB for PDFs, Max 100MB for videos, Max 1MB for images
    const sizeInMB = file.size / (1024 * 1024);
    let maxSize = 1;
    if (type === "pdf") {
      maxSize = 15;
    } else if (type === "video") {
      maxSize = 100;
    }

    if (sizeInMB > maxSize) {
      return NextResponse.json({ error: `File must be smaller than ${maxSize}MB` }, { status: 400 });
    }

    // Generate unique file name
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    // Upload to Cloudflare R2 if configured
    if (isR2Configured) {
      const key = `uploads/${subfolder}/${uniqueName}`;
      
      // Determine Content-Type header for S3
      let contentType = file.type;
      if (!contentType) {
        if (ext === ".pdf") contentType = "application/pdf";
        else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        else if (ext === ".png") contentType = "image/png";
        else if (ext === ".webp") contentType = "image/webp";
        else if (ext === ".mp4") contentType = "video/mp4";
        else if (ext === ".webm") contentType = "video/webm";
        else if (ext === ".mov") contentType = "video/quicktime";
        else contentType = "application/octet-stream";
      }

      console.log(`Uploading file ${originalName} to R2 with key: ${key} and type: ${contentType}`);
      const publicUrl = await uploadToR2(buffer, key, contentType);

      return NextResponse.json({
        message: "Uploaded successfully to Cloudflare R2",
        url: publicUrl,
      });
    }

    // Fallback: Local filesystem upload
    console.log(`R2 is not fully configured. Falling back to local storage for ${originalName}`);
    const targetDir = path.join(process.cwd(), "public", "uploads", subfolder);
    
    // Create folders
    await fs.mkdir(targetDir, { recursive: true });
    
    const targetPath = path.join(targetDir, uniqueName);
    await fs.writeFile(targetPath, buffer);

    const relativeUrl = `/uploads/${subfolder}/${uniqueName}`;
    return NextResponse.json({
      message: "Uploaded successfully to local storage",
      url: relativeUrl,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

