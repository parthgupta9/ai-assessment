import { MAX_ALLOWED_PAGES } from "./image-processor";

export async function convertPdfOrImageToBlobs(file: File): Promise<Blob[]> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    return convertPdfToBlobs(file);
  }

  if (
    fileType.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif)$/i.test(fileName)
  ) {
    return [file];
  }

  throw new Error(
    `Unsupported file format "${file.name}". Please upload PDF files or standard images (PNG, JPG, WebP).`
  );
}

async function convertPdfToBlobs(file: File): Promise<Blob[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) })
    .promise;

  if (pdfDoc.numPages > MAX_ALLOWED_PAGES) {
    throw new Error(
      `PDF "${file.name}" exceeds maximum allowed ${MAX_ALLOWED_PAGES} pages.`
    );
  }

  const pageBlobs: Blob[] = [];
  for (let p = 1; p <= pdfDoc.numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not initialize canvas context for PDF rendering.");

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) =>
          b
            ? resolve(b)
            : reject(new Error(`Failed to render PDF page ${p}`)),
        "image/jpeg",
        0.85
      );
    });
    pageBlobs.push(blob);
  }

  return pageBlobs;
}

export function convertBlobsToPageFiles(
  blobs: Blob[],
  prefixLabel: string
): File[] {
  return blobs.map(
    (blob, index) =>
      new File([blob], `${prefixLabel}-page-${index + 1}.jpg`, {
        type: blob.type || "image/jpeg",
      })
  );
}
