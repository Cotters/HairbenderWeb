import { NextResponse } from "next/server";
import { generateTryOn } from "@/lib/tryon/xai";
import { STYLE_DESCRIPTIONS } from "@/lib/styles/descriptions";

export const runtime = "nodejs";

function buildPrompt(styleId: string, _collection: string) {
  const description =
    STYLE_DESCRIPTIONS[styleId] ?? `a ${styleId.replace(/-/g, " ")} hairstyle`;

  return (
    `Edit ONLY the hair of the person in this photo. Apply exactly: ${description}. ` +
    `CRITICAL COMPOSITION RULES — these override everything else: ` +
    `The output image must be pixel-for-pixel identical in framing and composition to the input. ` +
    `The subject must remain in the exact same position within the frame — same horizontal placement, same vertical placement, same distance from camera, same crop. ` +
    `Do not shift, pan, zoom, reframe, or recompose the scene in any way. ` +
    `The background must be identical — same colours, same objects, same spatial layout, unchanged. ` +
    `Preserve the person's exact face, skin tone, eye colour, facial structure, expression, and clothing completely unchanged. ` +
    `Keep lighting, shadows, and camera angle identical to the input photo. ` +
    `The new hair must look photorealistic — render individual strands, realistic highlight and shadow, natural depth and weight. ` +
    `Do not change anything except the hairstyle.`
  );
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
