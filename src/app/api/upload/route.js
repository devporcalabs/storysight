import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyToken } from "@/lib/auth";

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
    } else if (type === "thumbnail") {
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return NextResponse.json({ error: "Only .jpg, .jpeg, .png, or .webp images are allowed" }, { status: 400 });
      }
      subfolder = "thumbnails";
    } else {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
    }

    // Size limits: 100MB for video, 10MB for PDFs/images
    const sizeInMB = file.size / (1024 * 1024);
    if (type === "video" && sizeInMB > 100) {
      return NextResponse.json({ error: "Video must be smaller than 100MB" }, { status: 400 });
    }
    if (type !== "video" && sizeInMB > 10) {
      return NextResponse.json({ error: "File must be smaller than 10MB" }, { status: 400 });
    }

    // Generate unique file name
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const targetDir = path.join(process.cwd(), "public", "uploads", subfolder);
    
    // Create folders
    await fs.mkdir(targetDir, { recursive: true });
    
    const targetPath = path.join(targetDir, uniqueName);
    await fs.writeFile(targetPath, buffer);

    const relativeUrl = `/uploads/${subfolder}/${uniqueName}`;
    return NextResponse.json({
      message: "Uploaded successfully",
      url: relativeUrl,
    });
  } catch (error) {
    console.error("Local Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
