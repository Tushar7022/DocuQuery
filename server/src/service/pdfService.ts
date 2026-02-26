// DOMMatrix polyfill for Node environments (required by pdfjs-dist internally)
if (!(globalThis as any).DOMMatrix) {
    class NodeDOMMatrix {
        constructor(_init?: any) { }
        multiplySelf(_other?: any) { return this; }
        preMultiplySelf(_other?: any) { return this; }
        translateSelf(_x?: number, _y?: number) { return this; }
        scaleSelf(_scaleX?: number, _scaleY?: number) { return this; }
        rotateSelf(_rotZ?: number, _rotX?: number, _rotY?: number) { return this; }
        invertSelf() { return this; }
        clone() { return new NodeDOMMatrix(); }
        transformPoint(point: { x: number; y: number }) { return { x: point.x, y: point.y }; }
    }
    (globalThis as any).DOMMatrix = NodeDOMMatrix;
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
    // pdf-parse v2 uses a class-based API
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return (result.text || "").trim();
}
