/**
 * Certificate PDF Generator
 * Uses pdf-lib to overlay participant name and other fields onto a certificate background image.
 */

import { PDFDocument, rgb, StandardFonts, type PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import 'regenerator-runtime/runtime';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { randomBytes } from 'crypto';
import { existsSync } from 'fs';

export interface TemplateFieldConfig {
  field_key: string;
  label: string;
  x_position: number;   // pixels from left
  y_position: number;   // pixels from top
  width: number;
  height: number;
  font_family: string;  // 'Helvetica' | 'Times-Roman' | 'Courier'
  font_size: number;
  font_weight: string;  // 'normal' | 'bold'
  text_align: string;   // 'left' | 'center' | 'right'
  color: string;        // hex e.g. '#000000'
}

export interface GeneratePdfOptions {
  backgroundUrl: string;        // local path like /uploads/abc.png or full URL
  participantImageUrl?: string | null;
  participantImageData?: { buffer: Buffer; ext: string } | null;
  templateWidth: number;
  templateHeight: number;
  fields: TemplateFieldConfig[];
  fieldValues: Record<string, string>; // field_key -> value
  orientation: string;
}

/** Convert a hex color string to pdf-lib rgb */
function hexToRgb(hex: string): ReturnType<typeof rgb> {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

/** Resolve a background URL to a Buffer.
 *  Handles both /uploads/xxx.png (local filesystem) and any absolute URL. */
async function loadImageBuffer(backgroundUrl: string): Promise<{ buffer: Buffer; ext: string } | null> {
  try {
    if (backgroundUrl.startsWith('/')) {
      // Local file served from /public
      const localPath = join(process.cwd(), 'public', backgroundUrl);
      if (existsSync(localPath)) {
        const buffer = await readFile(localPath);
        return { buffer, ext: extname(localPath).toLowerCase() };
      }
    } else if (backgroundUrl.startsWith('http')) {
      const res = await fetch(backgroundUrl);
      if (!res.ok) return null;
      const buffer = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get('content-type') ?? '';
      const ext = contentType.includes('png') ? '.png' : '.jpg';
      return { buffer, ext };
    }
  } catch {
    // ignore — proceed without background
  }
  return null;
}

function containsDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/u.test(text);
}

/** Pick a font that can encode the text, falling back to the configured standard font. */
async function getFont(doc: PDFDocument, family: string, weight: string, text: string): Promise<PDFFont> {
  if (containsDevanagari(text)) {
    const fontPath = weight === 'bold'
      ? join(process.cwd(), 'public', 'fonts', 'noto-sans-devanagari-700.woff')
      : join(process.cwd(), 'public', 'fonts', 'noto-sans-devanagari-400.woff');
    return doc.embedFont(await readFile(fontPath));
  }

  if (family.toLowerCase().includes('times')) {
    return doc.embedFont(weight === 'bold' ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman);
  }
  if (family.toLowerCase().includes('courier')) {
    return doc.embedFont(weight === 'bold' ? StandardFonts.CourierBold : StandardFonts.Courier);
  }
  // Default: Helvetica
  return doc.embedFont(weight === 'bold' ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);
}

function getFieldValue(field: TemplateFieldConfig, fieldValues: Record<string, string>): string | undefined {
  const exactValue = fieldValues[field.field_key];
  if (exactValue !== undefined) return exactValue;

  const normalizedKey = field.field_key.toLowerCase().replace(/[\s-]+/g, '_');
  const normalizedLabel = field.label.toLowerCase().replace(/[\s-]+/g, '_');
  const nameFieldAliases = [
    'participant_name',
    'attendee_name',
    'recipient_name',
    'user_name',
    'full_name',
    'participant',
    'attendee',
    'recipient',
    'user',
    'name',
    'name_field',
  ];
  const isParticipantNameField =
    nameFieldAliases.includes(normalizedKey) ||
    nameFieldAliases.includes(normalizedLabel) ||
    normalizedLabel.includes('name') ||
    (normalizedKey.includes('name') && ['participant', 'attendee', 'recipient', 'user'].some((prefix) => normalizedKey.includes(prefix))) ||
    (normalizedLabel.includes('name') && ['participant', 'attendee', 'recipient', 'user'].some((prefix) => normalizedLabel.includes(prefix)));

  return isParticipantNameField ? fieldValues.participant_name : undefined;
}

function isParticipantImageField(field: TemplateFieldConfig): boolean {
  const key = field.field_key.toLowerCase().replace(/[\s-]+/g, '_');
  const label = field.label.toLowerCase().replace(/[\s-]+/g, '_');
  const imageAliases = [
    'participant_image',
    'participant_photo',
    'attendee_image',
    'attendee_photo',
    'profile_image',
    'profile_photo',
    'avatar',
    'photo',
    'image',
  ];

  return imageAliases.includes(key) ||
    imageAliases.includes(label) ||
    (['participant', 'attendee', 'profile'].some((prefix) => key.includes(prefix)) && /(image|photo|picture)/.test(key)) ||
    (['participant', 'attendee', 'profile'].some((prefix) => label.includes(prefix)) && /(image|photo|picture)/.test(label));
}

export async function generateCertificatePdf(options: GeneratePdfOptions): Promise<string> {
  const pdfBytes = await generateCertificatePdfBytes(options);

  // Save to /public/certificates/ for deployments that support persistent local files.
  const certDir = join(process.cwd(), 'public', 'certificates');
  await mkdir(certDir, { recursive: true });
  const filename = `${randomBytes(16).toString('hex')}.pdf`;
  await writeFile(join(certDir, filename), pdfBytes);

  return `/certificates/${filename}`;
}

export async function generateCertificatePdfBytes(options: GeneratePdfOptions): Promise<Uint8Array> {
  const { backgroundUrl, participantImageUrl, participantImageData, templateWidth, templateHeight, fields, fieldValues } = options;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // A4 Landscape: 841.89 × 595.28 pt  (1pt = 1/72 inch)
  // We treat the template pixel dimensions as the logical canvas.
  // Scale factor: templateWidth px → page width in points.
  const PAGE_W = 841.89;
  const PAGE_H = 595.28;
  const scaleX = PAGE_W / templateWidth;
  const scaleY = PAGE_H / templateHeight;

  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

  // Embed background image if available
  const imgData = await loadImageBuffer(backgroundUrl);
  if (imgData) {
    try {
      let img;
      if (imgData.ext === '.png') {
        img = await pdfDoc.embedPng(imgData.buffer);
      } else {
        img = await pdfDoc.embedJpg(imgData.buffer);
      }
      page.drawImage(img, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });
    } catch {
      // If image embedding fails, continue with blank background
    }
  }

  let participantImage: Awaited<ReturnType<PDFDocument['embedPng']>> | Awaited<ReturnType<PDFDocument['embedJpg']>> | null = null;
  if (participantImageUrl || participantImageData) {
    const imageData = participantImageData ?? await loadImageBuffer(participantImageUrl as string);
    if (imageData) {
      try {
        participantImage = imageData.ext === '.png'
          ? await pdfDoc.embedPng(imageData.buffer)
          : await pdfDoc.embedJpg(imageData.buffer);
      } catch (error) {
        console.error('Unable to embed participant image in certificate:', error);
      }
    }
  }

  // Draw each configured text field
  for (const fieldConfig of fields) {
    if (isParticipantImageField(fieldConfig)) {
      if (!participantImage) continue;

      const x = fieldConfig.x_position * scaleX;
      const yFromBottom = PAGE_H - (fieldConfig.y_position * scaleY) - (fieldConfig.height * scaleY);
      const boxWidth = fieldConfig.width * scaleX;
      const boxHeight = fieldConfig.height * scaleY;
      const imageDimensions = participantImage.scale(1);
      const imageScale = Math.min(boxWidth / imageDimensions.width, boxHeight / imageDimensions.height);
      const imageWidth = imageDimensions.width * imageScale;
      const imageHeight = imageDimensions.height * imageScale;

      page.drawImage(participantImage, {
        x: x + (boxWidth - imageWidth) / 2,
        y: yFromBottom + (boxHeight - imageHeight) / 2,
        width: imageWidth,
        height: imageHeight,
      });
      continue;
    }

    const value = getFieldValue(fieldConfig, fieldValues);
    if (!value) continue;

    const font = await getFont(pdfDoc, fieldConfig.font_family, fieldConfig.font_weight, value);
    const fontSize = fieldConfig.font_size * scaleX; // scale font size proportionally
    const textColor = hexToRgb(fieldConfig.color);

    // pdf-lib coordinate system: origin is bottom-left
    // Template uses top-left origin → convert Y
    const x = fieldConfig.x_position * scaleX;
    const yFromBottom = PAGE_H - (fieldConfig.y_position * scaleY) - (fieldConfig.height * scaleY);
    const boxWidth = fieldConfig.width * scaleX;

    // Calculate text width for alignment
    const textWidth = font.widthOfTextAtSize(value, fontSize);
    let drawX = x;
    if (fieldConfig.text_align === 'center') {
      drawX = x + (boxWidth - textWidth) / 2;
    } else if (fieldConfig.text_align === 'right') {
      drawX = x + boxWidth - textWidth;
    }

    page.drawText(value, {
      x: drawX,
      y: yFromBottom + (fontSize * 0.8), // align the text's visual top with the field box
      size: fontSize,
      font,
      color: textColor,
    });
  }

  return pdfDoc.save();
}
