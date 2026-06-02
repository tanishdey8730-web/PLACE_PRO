import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import type { CoverLetterContent } from "@placepro/shared";

function paragraphsFromBody(body: string): Paragraph[] {
  return body.split(/\n\n+/).map(
    (text) =>
      new Paragraph({
        children: [new TextRun({ text: text.trim(), size: 24 })],
        spacing: { after: 200 },
      })
  );
}

export async function exportCoverLetterDocx(
  doc: CoverLetterContent,
  meta: { companyName: string; jobTitle: string }
): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: new Date().toLocaleDateString("en-US", { dateStyle: "long" }), size: 22 })],
    }),
    new Paragraph({ spacing: { after: 200 } }),
    new Paragraph({
      children: [new TextRun({ text: `Subject: ${doc.subject}`, bold: true, size: 24 })],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: doc.salutation, size: 24 })],
      spacing: { after: 200 },
    }),
    ...paragraphsFromBody(doc.body),
    new Paragraph({
      children: [new TextRun({ text: doc.closing, size: 24 })],
      spacing: { before: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: doc.signature, size: 24 })],
    }),
    new Paragraph({
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: `Re: ${meta.jobTitle} at ${meta.companyName}`,
          italics: true,
          size: 20,
          color: "666666",
        }),
      ],
    }),
  ];

  const document = new Document({ sections: [{ properties: {}, children }] });
  return Buffer.from(await Packer.toBuffer(document));
}

export async function exportCoverLetterPdf(
  doc: CoverLetterContent,
  meta: { companyName: string; jobTitle: string }
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([612, 792]);
  const margin = 56;
  let y = 720;
  const maxWidth = 500;
  const size = 11;

  const draw = (text: string, bold = false) => {
    const f = bold ? fontBold : font;
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (f.widthOfTextAtSize(test, size) > maxWidth) {
        if (y < margin) {
          page = pdf.addPage([612, 792]);
          y = 720;
        }
        page.drawText(line, { x: margin, y, size, font: f, color: rgb(0.1, 0.1, 0.1) });
        y -= 16;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      if (y < margin) {
        page = pdf.addPage([612, 792]);
        y = 720;
      }
      page.drawText(line, { x: margin, y, size, font: f, color: rgb(0.1, 0.1, 0.1) });
      y -= 16;
    }
  };

  draw(new Date().toLocaleDateString("en-US", { dateStyle: "long" }));
  y -= 12;
  draw(`Subject: ${doc.subject}`, true);
  y -= 8;
  draw(doc.salutation);
  y -= 8;
  for (const para of doc.body.split(/\n\n+/)) {
    draw(para.trim());
    y -= 8;
  }
  y -= 8;
  draw(doc.closing);
  draw(doc.signature);
  y -= 16;
  draw(`Re: ${meta.jobTitle} at ${meta.companyName}`);

  return Buffer.from(await pdf.save());
}
