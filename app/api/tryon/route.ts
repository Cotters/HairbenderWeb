import { NextResponse } from "next/server";
import { generateTryOn } from "@/lib/tryon/xai";

export const runtime = "nodejs";

const STYLE_DESCRIPTIONS: Record<string, string> = {
  // Paris Collection
  "paris-01":
    "a chic jaw-length bob cut bluntly to fall precisely at the jawline. The hair is sleek, smooth, and has a high-gloss mirror-like shine. The ends are perfectly straight and sharp.",
  "paris-02":
    "an ultra-blunt glass cut where the hair falls in one razor-sharp, perfectly even horizontal line. The surface is pin-straight, intensely glossy, and reflects light like polished glass.",
  "paris-03":
    "a mid-length Italian lob (long bob) sitting just below the shoulders. Soft, airy layers create gentle outward movement. The ends are subtly feathered for a breezy, effortless flow.",
  "paris-04":
    "a close-cropped French pixie cut with a micro fringe of short straight bangs that lightly graze the forehead. Hair is very short on the sides and back with slightly more length on top.",
  // Grunge Issue
  "grunge-01":
    "a heavily layered shag cut with dense, choppy layers from roots to ends. The hair has an intentionally undone, lived-in texture with visible volume, movement, and deliberate messiness throughout.",
  "grunge-02":
    "a razor-cut wave with aggressive, uneven layers that create deep textural contrast. The ends are raw and jagged with a deliberately rough edge, creating a high-contrast, dimensional look.",
  "grunge-03":
    "a modern soft mullet with cropped, textured hair on the crown and sides that gradually extends into longer lengths at the back and nape. The top has loose, effortless texture.",
  "grunge-04":
    "choppy, broken bangs cut asymmetrically across the forehead with deliberately uneven, raw-edged fringe. The bangs are thick, textured, and fall in irregular segments across the brow.",
  // The Executive
  "exec-01":
    "a clean professional boardroom taper with tight, gradual skin fade on the sides and back blending into short, neatly combed hair on top. The overall look is polished, controlled, and corporate.",
  "exec-02":
    "a sharp contour fade with precisely defined, crisp edges along the entire hairline and temple. The fade drops to nearly skin-bare at the lowest point and blends to a short, neat top.",
  "exec-03":
    "a classic side part with a hard, sharply defined part line. Hair on both sides is neatly combed flat, smooth, and polished. The look is clean, structured, and timeless.",
  "exec-04":
    "an executive crop with a tidy top section featuring subtle controlled texture and soft volume. The sides are short and clean-cut, blending smoothly up into the textured crown.",
};

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
