
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js"
pdfjsLib.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.js";

export async function extractTextFromPdfBuffer(buffer: Uint8Array): Promise<string> {
  try {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
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
    throw error; // Let the outer route.ts handler deal with it
  }
}
