import "server-only";
import { put } from "@vercel/blob";

// Zero-config-safe image storage: with a Vercel Blob store connected
// (BLOB_READ_WRITE_TOKEN set), images upload there and Note.imageUrl /
// MoodBoardImage.url hold a real hosted URL. Without one, storeImage falls
// back to a plain `data:` URI — the same "simplest thing that works"
// approach already used for Design/VideoProject media — so Notes and mood
// boards work immediately with no provider setup, and upgrade
// automatically the moment a Blob store is connected.
export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function storeImage(file: File): Promise<string> {
  if (isBlobConfigured()) {
    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob.url;
  }

  const buf = await file.arrayBuffer();
  const base64 = Buffer.from(buf).toString("base64");
  return `data:${file.type || "image/png"};base64,${base64}`;
}
