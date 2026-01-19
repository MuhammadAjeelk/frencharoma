import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { saveFile, saveMultipleFiles, validateFile } from "@/lib/upload";

export async function POST(request) {
  try {
    // Check admin auth
    await requireAdmin();

    const formData = await request.formData();
    const files = formData.getAll("files");
    const single = formData.get("file");

    if (single) {
      // Single file upload
      const validation = validateFile(single);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const url = await saveFile(single);
      return NextResponse.json({ url });
    }

    if (files && files.length > 0) {
      // Multiple files upload
      const validFiles = [];
      for (const file of files) {
        const validation = validateFile(file);
        if (!validation.valid) {
          return NextResponse.json(
            { error: `File "${file.name}": ${validation.error}` },
            { status: 400 }
          );
        }
        validFiles.push(file);
      }

      const urls = await saveMultipleFiles(validFiles);
      return NextResponse.json({ urls });
    }

    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  } catch (error) {
    console.error("Upload error:", error);
    if (
      error.message === "Unauthorized" ||
      error.message.includes("Admin access")
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
