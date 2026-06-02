import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import type { ResumeContent, ResumeBuilderTemplateId } from "@placepro/shared";

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    border: {
      bottom: { color: "2563EB", size: 6, style: BorderStyle.SINGLE },
    },
  });
}

export async function exportResumeDocx(
  content: ResumeContent,
  template: ResumeBuilderTemplateId
): Promise<Buffer> {
  const { personal } = content;
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: personal.fullName || "Resume",
          bold: true,
          size: template === "modern" ? 36 : 32,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: [personal.email, personal.phone, personal.location].filter(Boolean).join(" | "),
          size: 20,
        }),
      ],
    }),
  ];

  if (personal.linkedin || personal.github) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: [personal.linkedin, personal.github].filter(Boolean).join(" | "),
            size: 18,
            color: "2563EB",
          }),
        ],
      })
    );
  }

  if (personal.summary) {
    children.push(sectionTitle("Summary"));
    children.push(new Paragraph({ text: personal.summary }));
  }

  if (content.skills.length) {
    children.push(sectionTitle("Skills"));
    children.push(new Paragraph({ text: content.skills.join(" • ") }));
  }

  if (content.education.length) {
    children.push(sectionTitle("Education"));
    for (const ed of content.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: ed.school, bold: true }),
            new TextRun({ text: ` — ${ed.degree} (${ed.year})${ed.gpa ? `, GPA: ${ed.gpa}` : ""}` }),
          ],
        })
      );
    }
  }

  const addBullets = (title: string, items: { header: string; sub?: string; bullets: string[] }[]) => {
    if (!items.length) return;
    children.push(sectionTitle(title));
    for (const item of items) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: item.header, bold: true }),
            ...(item.sub ? [new TextRun({ text: ` | ${item.sub}` })] : []),
          ],
        })
      );
      for (const b of item.bullets) {
        children.push(
          new Paragraph({
            text: b,
            bullet: { level: 0 },
          })
        );
      }
    }
  };

  addBullets(
    "Experience",
    content.experience.map((e) => ({
      header: `${e.role} @ ${e.company}`,
      sub: `${e.start} – ${e.end}`,
      bullets: e.bullets,
    }))
  );

  addBullets(
    "Internships",
    content.internships.map((i) => ({
      header: `${i.role} @ ${i.company}`,
      sub: `${i.start} – ${i.end}`,
      bullets: i.bullets,
    }))
  );

  addBullets(
    "Projects",
    content.projects.map((p) => ({
      header: p.name,
      sub: p.tech,
      bullets: p.bullets,
    }))
  );

  if (content.achievements.length) {
    children.push(sectionTitle("Achievements"));
    for (const a of content.achievements) {
      children.push(new Paragraph({ text: a, bullet: { level: 0 } }));
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export async function exportResumePdf(
  content: ResumeContent,
  _template: ResumeBuilderTemplateId
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([612, 792]);
  const margin = 50;
  let y = 750;
  const lineHeight = 14;
  const maxWidth = 512;

  const wrapText = (text: string, size: number, useBold = false) => {
    const f = useBold ? fontBold : font;
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (f.widthOfTextAtSize(test, size) > maxWidth) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const drawLine = (text: string, size: number, bold = false) => {
    const lines = wrapText(text, size, bold);
    for (const ln of lines) {
      if (y < margin + 20) {
        page = pdf.addPage([612, 792]);
        y = 750;
      }
      page.drawText(ln, {
        x: margin,
        y,
        size,
        font: bold ? fontBold : font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= lineHeight + (bold ? 4 : 0);
    }
  };

  const { personal } = content;
  drawLine(personal.fullName || "Resume", 18, true);
  drawLine([personal.email, personal.phone, personal.location].filter(Boolean).join(" | "), 10);
  if (personal.summary) {
    y -= 8;
    drawLine("SUMMARY", 11, true);
    drawLine(personal.summary, 10);
  }

  if (content.skills.length) {
    y -= 8;
    drawLine("SKILLS", 11, true);
    drawLine(content.skills.join(", "), 10);
  }

  for (const ed of content.education) {
    y -= 8;
    drawLine("EDUCATION", 11, true);
    drawLine(`${ed.school} — ${ed.degree} (${ed.year})`, 10, true);
    break;
  }
  for (const ed of content.education.slice(1)) {
    drawLine(`${ed.school} — ${ed.degree} (${ed.year})`, 10, true);
  }

  const sections: { title: string; blocks: { head: string; bullets: string[] }[] }[] = [
    {
      title: "EXPERIENCE",
      blocks: content.experience.map((e) => ({
        head: `${e.role}, ${e.company} (${e.start}–${e.end})`,
        bullets: e.bullets,
      })),
    },
    {
      title: "INTERNSHIPS",
      blocks: content.internships.map((i) => ({
        head: `${i.role}, ${i.company} (${i.start}–${i.end})`,
        bullets: i.bullets,
      })),
    },
    {
      title: "PROJECTS",
      blocks: content.projects.map((p) => ({
        head: `${p.name} — ${p.tech}`,
        bullets: p.bullets,
      })),
    },
  ];

  for (const sec of sections) {
    if (!sec.blocks.length) continue;
    y -= 8;
    drawLine(sec.title, 11, true);
    for (const block of sec.blocks) {
      drawLine(block.head, 10, true);
      for (const b of block.bullets) {
        drawLine(`• ${b}`, 10);
      }
    }
  }

  if (content.achievements.length) {
    y -= 8;
    drawLine("ACHIEVEMENTS", 11, true);
    for (const a of content.achievements) {
      drawLine(`• ${a}`, 10);
    }
  }

  return Buffer.from(await pdf.save());
}
