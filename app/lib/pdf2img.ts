export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  pageCount: number;
  error?: string;
}

// Bundled with the app rather than fetched from a CDN: `?url` resolves against
// the installed pdfjs-dist, so the worker can never drift out of version sync
// with the API (a mismatch makes pdf.js throw), and it costs no network round
// trip to an origin we don't control.
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    pdfjsLib = lib;
    return lib;
  });

  return loadPromise;
}

// Parsing a PDF is not cheap, and every analysis needs the same document twice
// (once for its text, once to render the thumbnail). Memoise the most recent
// one so those two calls share a single parse.
let cachedSource: Blob | null = null;
let cachedDoc: Promise<any> | null = null;

async function getDocument(blob: Blob): Promise<any> {
  if (cachedSource === blob && cachedDoc) return cachedDoc;

  releasePdfDocument();
  cachedSource = blob;
  cachedDoc = loadPdfJs().then(async (lib) => {
    const arrayBuffer = await blob.arrayBuffer();
    return lib.getDocument({ data: arrayBuffer }).promise;
  });

  return cachedDoc;
}

/** Drop the memoised document once an analysis is done with it. */
export function releasePdfDocument(): void {
  const pending = cachedDoc;
  cachedSource = null;
  cachedDoc = null;
  pending?.then((doc) => doc?.destroy?.()).catch(() => {});
}

export async function extractPdfText(blob: Blob): Promise<string> {
  const pdf = await getDocument(blob);
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: { str?: string }) => item.str ?? "")
      .join(" ");
    pages.push(pageText);
  }
  return pages.join("\n\n");
}

export async function convertPdfToImage(
  file: File,
): Promise<PdfConversionResult> {
  try {
    const pdf = await getDocument(file);
    const pageCount: number = pdf.numPages;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    }

    await page.render({ canvasContext: context!, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a File from the blob with the same name as the pdf
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.jpg`, {
              type: "image/jpeg",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
              pageCount,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              pageCount,
              error: "Failed to create image blob",
            });
          }
        },
        "image/jpeg",
        0.85,
      );
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      pageCount: 0,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}
