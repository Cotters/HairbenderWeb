import { NextResponse } from "next/server";
import { generateTryOn } from "@/lib/tryon/xai";
import { STYLE_DESCRIPTIONS } from "@/lib/styles/descriptions";
import { generateText } from "ai";
import { xai } from "@ai-sdk/xai";
import type { MoodboardCategory } from "@/lib/styles/types";

export const runtime = "nodejs";

const VALID_CATEGORIES: MoodboardCategory[] = ["colour", "texture", "length-shape"];

const CATEGORY_PROMPTS: Record<MoodboardCategory, string> = {
  colour:
    "Describe ONLY the hair colour visible in this image. Be specific about tone, warmth, dimension, highlights, lowlights, and root-to-tip variation. Use professional colorist terminology. 2-3 sentences max.",
  texture:
    "Describe ONLY the hair texture visible in this image. Cover wave pattern, curl type, smoothness, frizz level, strand thickness, and surface finish. Use professional stylist terminology. 2-3 sentences max.",
  "length-shape":
    "Describe ONLY the hair length and overall shape/silhouette visible in this image. Cover where it falls relative to face and body landmarks, layering structure, volume distribution, and geometric silhouette. 2-3 sentences max.",
};

const CATEGORY_LABELS: Record<MoodboardCategory, string> = {
  colour: "COLOUR",
  texture: "TEXTURE",
  "length-shape": "LENGTH & SHAPE",
};

interface MoodboardCaption {
  category: MoodboardCategory;
  description: string;
}

async function captionMoodboardImage(
  imageBase64: string,
  mimeType: string,
  category: MoodboardCategory
): Promise<string> {
  const { text } = await generateText({
    model: xai("grok-2-vision-1212"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: `data:${mimeType};base64,${imageBase64}`,
          },
          {
            type: "text",
            text: CATEGORY_PROMPTS[category],
          },
        ],
      },
    ],
    maxOutputTokens: 200,
  });
  return text.trim();
}

function buildPrompt(
  styleId: string,
  _collection: string,
  moodboardCaptions?: MoodboardCaption[]
) {
  const description =
    STYLE_DESCRIPTIONS[styleId] ?? `a ${styleId.replace(/-/g, " ")} hairstyle`;

  let moodboardClause = "";
  if (moodboardCaptions && moodboardCaptions.length > 0) {
    const parts = moodboardCaptions.map(
      (mc) => `[${CATEGORY_LABELS[mc.category]} REFERENCE]: ${mc.description}`
    );
    moodboardClause =
      `Additionally, incorporate these specific attributes from the client's moodboard references: ` +
      parts.join(" ") +
      ` These moodboard references should modify the base style — ` +
      `use the referenced colour/texture/shape to adapt the base cut, not replace it entirely. `;
  }

  return (
    `Edit ONLY the hair of the person in this photo. Apply exactly: ${description}. ` +
    moodboardClause +
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

    // Parse moodboard entries
    const moodboardFiles = formData.getAll("moodboard_files") as File[];
    const moodboardCategories = formData.getAll(
      "moodboard_categories"
    ) as string[];

    if (moodboardFiles.length !== moodboardCategories.length) {
      return NextResponse.json(
        { error: "Moodboard files and categories must match." },
        { status: 400 }
      );
    }
    if (moodboardFiles.length > 3) {
      return NextResponse.json(
        { error: "Maximum 3 moodboard references allowed." },
        { status: 400 }
      );
    }

    // Validate moodboard entries
    for (let i = 0; i < moodboardFiles.length; i++) {
      const f = moodboardFiles[i];
      const cat = moodboardCategories[i];
      if (!VALID_CATEGORIES.includes(cat as MoodboardCategory)) {
        return NextResponse.json(
          { error: `Invalid moodboard category: ${cat}` },
          { status: 400 }
        );
      }
      if (f.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Moodboard images must be under 5MB each." },
          { status: 400 }
        );
      }
      if (!["image/jpeg", "image/png"].includes(f.type)) {
        return NextResponse.json(
          { error: "Moodboard images must be JPG or PNG." },
          { status: 400 }
        );
      }
    }

    // Caption moodboard images in parallel
    let moodboardCaptions: MoodboardCaption[] | undefined;
    if (moodboardFiles.length > 0) {
      moodboardCaptions = await Promise.all(
        moodboardFiles.map(async (f, i) => {
          const buf = await f.arrayBuffer();
          const b64 = Buffer.from(buf).toString("base64");
          const category = moodboardCategories[i] as MoodboardCategory;
          const description = await captionMoodboardImage(b64, f.type, category);
          return { category, description };
        })
      );
    }

    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const result = await generateTryOn({
      imageBase64: base64,
      mimeType: image.type,
      prompt: buildPrompt(styleId, collection || "editorial", moodboardCaptions),
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
