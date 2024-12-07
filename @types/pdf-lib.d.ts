// @types/pdf-lib.d.ts
declare module "pdf-lib" {
  export class PDFDocument {
    static create(): Promise<PDFDocument>;
    addPage(size: [number, number]): PDFPage;
    save(): Promise<Uint8Array>;
  }

  export class PDFPage {
    drawText(
      text: string,
      options?: {
        x?: number;
        y?: number;
        size?: number;
        color?: { r: number; g: number; b: number; a?: number };
        align?: "left" | "center" | "right";
      }
    ): void;
  }

  export const rgb: (
    r: number,
    g: number,
    b: number
  ) => { r: number; g: number; b: number };
}
