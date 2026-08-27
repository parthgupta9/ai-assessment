import sharp from "sharp";

export const MAX_ALLOWED_PAGES = 15;
export const MAX_IMAGE_EDGE_PX = 2048;

export async function processAndNormalizePageImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ base64: string; mimeType: "image/png" | "image/jpeg" }> {
  const image = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await image.metadata();

  const width = metadata.width ?? MAX_IMAGE_EDGE_PX;
  const height = metadata.height ?? MAX_IMAGE_EDGE_PX;
  const longestEdge = Math.max(width, height);

  let pipeline = image;
  if (longestEdge > MAX_IMAGE_EDGE_PX) {
    pipeline = pipeline.resize({
      width: width >= height ? MAX_IMAGE_EDGE_PX : undefined,
      height: height > width ? MAX_IMAGE_EDGE_PX : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  if (mimeType.includes("png") && (metadata.hasAlpha ?? false)) {
    const pngBuffer = await pipeline.png({ compressionLevel: 8 }).toBuffer();
    return { base64: pngBuffer.toString("base64"), mimeType: "image/png" };
  }

  const jpegBuffer = await pipeline
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return { base64: jpegBuffer.toString("base64"), mimeType: "image/jpeg" };
}

export function validatePageLimit(count: number, documentName: string): void {
  if (count < 1) {
    throw new Error(`${documentName} must contain at least one page.`);
  }
  if (count > MAX_ALLOWED_PAGES) {
    throw new Error(
      `${documentName} exceeds the maximum limit of ${MAX_ALLOWED_PAGES} pages.`
    );
  }
}
