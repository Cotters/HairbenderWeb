import { NextResponse } from "next/server";
import { generateTryOn } from "@/lib/tryon/xai";
import { STYLE_DESCRIPTIONS } from "@/lib/styles/descriptions";
import { generateText } from "ai";
import { xai } from "@ai-sdk/xai";
import type { MoodboardCategory, AuxOptions } from "@/lib/styles/types";

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

const MAINTENANCE_PROMPTS: Record<string, string> = {
  "wash-and-go":
    "Style should be extremely low-maintenance — air-dry friendly, minimal product, works with the hair's natural pattern. No heat styling required.",
  "styled-daily":
    "Style requires moderate daily effort — some blow-drying, light product, and basic shaping each morning.",
  "high-maintenance":
    "Style is high-maintenance and editorial — requires precision styling, multiple products, heat tools, and professional upkeep.",
};

const DENSITY_PROMPTS: Record<string, string> = {
  fine: "The subject has fine, thin hair — render with less volume, finer individual strands, and lighter weight. Avoid overly voluminous looks.",
  medium:
    "The subject has medium-density hair — render with balanced volume and natural strand thickness.",
  thick:
    "The subject has thick, full hair — render with substantial volume, dense strand coverage, and visible weight and body.",
};

const VOLUME_PROMPTS: Record<string, string> = {
  flat: "Style the hair flat and sleek against the head — minimal lift, smooth silhouette, polished finish.",
  natural:
    "Give the hair natural body and movement — moderate lift at the roots, relaxed shape.",
  big: "Maximize volume — big, full hair with lift at the roots, expanded silhouette, dramatic body.",
};

const HAIR_TYPE_PROMPTS: Record<string, string> = {
  "1a": "Hair type 1A: pin-straight, very fine, no wave or curl whatsoever. Render as completely flat, silky strands.",
  "1b": "Hair type 1B: straight with slight body and gentle bends, medium texture.",
  "1c": "Hair type 1C: straight but with coarse strands and subtle waves at the ends.",
  "2a": "Hair type 2A: loose, gentle S-shaped waves starting mid-length, fine to medium texture.",
  "2b": "Hair type 2B: defined S-waves starting closer to the roots, medium texture with some frizz tendency.",
  "2c": "Hair type 2C: well-defined waves bordering on curls, coarse texture with volume.",
  "3a": "Hair type 3A: loose, springy curls about the diameter of sidewalk chalk, shiny with defined loops.",
  "3b": "Hair type 3B: tighter springy curls about marker-width, voluminous with a defined spiral pattern.",
  "3c": "Hair type 3C: tight corkscrew curls, pencil-width, densely packed with significant volume.",
  "4a": "Hair type 4A: tightly coiled S-pattern curls, visible curl definition, dense with shrinkage.",
  "4b": "Hair type 4B: tightly coiled Z-pattern hair, less defined curl pattern, cotton-like texture with sharp angles.",
  "4c": "Hair type 4C: extremely tight coils with minimal curl definition, very dense, significant shrinkage, fragile texture.",
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
  moodboardCaptions?: MoodboardCaption[],
  auxOptions?: Partial<AuxOptions>
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

  let auxClause = "";
  if (auxOptions) {
    const parts: string[] = [];
    if (auxOptions.hairType && HAIR_TYPE_PROMPTS[auxOptions.hairType]) {
      parts.push(HAIR_TYPE_PROMPTS[auxOptions.hairType]);
    }
    if (auxOptions.density && DENSITY_PROMPTS[auxOptions.density]) {
      parts.push(DENSITY_PROMPTS[auxOptions.density]);
    }
    if (auxOptions.volume && VOLUME_PROMPTS[auxOptions.volume]) {
      parts.push(VOLUME_PROMPTS[auxOptions.volume]);
    }
    if (auxOptions.maintenance && MAINTENANCE_PROMPTS[auxOptions.maintenance]) {
      parts.push(MAINTENANCE_PROMPTS[auxOptions.maintenance]);
    }
    if (parts.length > 0) {
      auxClause = `Hair profile constraints: ${parts.join(" ")} `;
    }
  }

  return (
    `Edit ONLY the hair of the person in this photo. Apply exactly: ${description}. ` +
    auxClause +
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

    // Parse aux options
    const auxOptions: Partial<AuxOptions> = {};
    const maintenance = formData.get("maintenance");
    const density = formData.get("density");
    const volume = formData.get("volume");
    const hairType = formData.get("hairType");
    if (maintenance) auxOptions.maintenance = String(maintenance) as AuxOptions["maintenance"];
    if (density) auxOptions.density = String(density) as AuxOptions["density"];
    if (volume) auxOptions.volume = String(volume) as AuxOptions["volume"];
    if (hairType) auxOptions.hairType = String(hairType) as AuxOptions["hairType"];

    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const result = await generateTryOn({
      imageBase64: base64,
      mimeType: image.type,
      prompt: buildPrompt(styleId, collection || "editorial", moodboardCaptions, auxOptions),
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
