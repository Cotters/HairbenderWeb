import { generateImage } from "ai";
import { xai } from "@ai-sdk/xai";

const DEFAULT_MODEL = "grok-imagine-image";

type GenerateArgs = {
  imageBase64: string;
  mimeType: string;
  prompt: string;
};

export async function generateTryOn({
  imageBase64,
  mimeType,
  prompt,
}: GenerateArgs) {
  if (!process.env.XAI_API_KEY) {
    throw new Error("Missing XAI_API_KEY.");
  }

  const modelName = process.env.XAI_IMAGE_MODEL || DEFAULT_MODEL;
  const { image } = await generateImage({
    model: xai.image(modelName),
    prompt,
    providerOptions: {
      xai: {
        image: `data:${mimeType};base64,${imageBase64}`,
      },
    },
  });

  if (!image?.base64) {
    throw new Error("No image returned by xAI.");
  }

  return {
    imageUrl: `data:${mimeType};base64,${image.base64}`,
  };
}
