import { PDFParse } from "pdf-parse";

export async function extractPdfText(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer })
    const data = await parser.getText();
    await parser.destroy();

    const fullText = data.text || "";

    return fullText.trim();

}