import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { URL } from "node:url";

type GenerateArgs = {
  imageBase64: string;
  mimeType: string;
  prompt: string;
};

function postJson(
  url: string,
  apiKey: string,
  body: string
): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === "https:";
    const requestFn = isHttps ? httpsRequest : httpRequest;
    const bodyBuf = Buffer.from(body, "utf8");

    const req = requestFn(
      {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          "Content-Length": bodyBuf.length,
        },
        timeout: 90_000,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk: Buffer) => (raw += chunk.toString()));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode ?? 0, data: JSON.parse(raw) });
          } catch {
            reject(new Error(`Non-JSON response (${res.statusCode}): ${raw}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request to hairbender-api timed out after 90s."));
    });
    req.write(bodyBuf);
    req.end();
  });
}

export async function generateTryOn({
  imageBase64,
  mimeType,
  prompt,
}: GenerateArgs) {
  const apiUrl = process.env.TRYON_API_URL?.trim();
  const apiKey = process.env.TRYON_API_KEY?.trim();

  if (!apiUrl) throw new Error("Missing TRYON_API_URL.");
  if (!apiKey) throw new Error("Missing TRYON_API_KEY.");

  const { status, data } = await postJson(
    `${apiUrl}/tryon`,
    apiKey,
    JSON.stringify({ image_b64: imageBase64, mime_type: mimeType, prompt })
  );

  const d = data as Record<string, unknown>;

  if (status < 200 || status >= 300) {
    throw new Error(
      String(d?.detail ?? d?.error ?? `API error ${status}`)
    );
  }

  return { imageUrl: d.result_image_url as string };
}
