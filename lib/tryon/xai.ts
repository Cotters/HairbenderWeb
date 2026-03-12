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
  const apiUrl = process.env.TRYON_API_URL;
  const apiKey = process.env.TRYON_API_KEY;

  if (!apiUrl) throw new Error("Missing TRYON_API_URL.");
  if (!apiKey) throw new Error("Missing TRYON_API_KEY.");

  const buf = Buffer.from(imageBase64, "base64");
  const blob = new Blob([buf], { type: mimeType });

  const form = new FormData();
  form.append(
    "image",
    blob,
    mimeType === "image/png" ? "upload.png" : "upload.jpg"
  );
  form.append("prompt", prompt);

  const res = await fetch(`${apiUrl}/tryon`, {
    method: "POST",
    headers: { "X-API-Key": apiKey },
    body: form,
    signal: AbortSignal.timeout(90_000),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error ?? `API error ${res.status}`);
  }

  return { imageUrl: data.result_image_url as string };
}
