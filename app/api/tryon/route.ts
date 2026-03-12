import { NextResponse } from "next/server";
import { generateTryOn } from "@/lib/tryon/xai";

export const runtime = "nodejs";

function buildPrompt(styleId: string, collection: string) {
  return `Apply the hairstyle "${styleId}" from the ${collection} collection. Preserve the subject's identity, facial features, lighting, and background. Render photorealistic hair with realistic texture and shine. Output only the final edited image.`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const styleId = String(formData.get("styleId") || "").trim();
    const collection = String(formData.get("collection") || "").trim();

    if (!image || !(image instanceof File)) {
      return NextResponse.json(
        { error: "Missing image file." },
        { status: 400 }
      );
    }
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Please upload under 10MB." },
        { status: 400 }
      );
    }
    if (!styleId) {
      return NextResponse.json({ error: "Missing styleId." }, { status: 400 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const result = await generateTryOn({
      imageBase64: base64,
      mimeType: image.type,
      prompt: buildPrompt(styleId, collection || "editorial"),
    });

    return NextResponse.json({
      status: "complete",
      resultImageUrl: result.imageUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected processing error.",
      },
      { status: 500 }
    );
  }
}
