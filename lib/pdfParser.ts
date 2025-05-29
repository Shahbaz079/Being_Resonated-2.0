import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

// No need to set workerSrc for server environments
// Avoid requiring 'canvas' (which causes build to fail)

export async function extractTextFromPdfBuffer(buffer: Uint8Array): Promise<string> {
  try {
   const pdf = await pdfjsLib.getDocument({
  data: buffer,
  useWorkerFetch: false,
  disableFontFace: true,
  isEvalSupported: false,
  cMapPacked: true,
  // @ts-ignore - `fakeWorker` is not typed but works in Node environments
  fakeWorker: true,
} as any).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      text += pageText + "\n";
    }

    return text;
  } catch (error) {
    console.error("extractTextFromPdfBuffer failed:", error);
    throw error;
  }
}
