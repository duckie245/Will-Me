// src/docFormatting.jsx
import { Paragraph, TextRun, AlignmentType } from "docx";

// Global doc styles
const FONT = "Arial";
const SIZE = 24; // 12pt in docx half-points

// Text helpers
export const t = (text, extra = {}) =>
  new TextRun({ text, font: FONT, size: SIZE, ...extra });

export const v = (text, extra = {}) =>
  new TextRun({ text, bold: true, font: FONT, size: SIZE, ...extra }); // variable = bold

// Paragraph helpers
export const p = (children = [], opts = {}) =>
  new Paragraph({ children, ...opts });

export const pc = (children = [], opts = {}) =>
  new Paragraph({ alignment: AlignmentType.CENTER, children, ...opts });

// Create the required title-only first page:
// "LAST WILL AND TESTAMENT", "OF", "<TESTATOR NAME>"
export const titlePage = (testatorName) => [
  pc([t("LAST WILL AND TESTAMENT", { size: 96 })]),
  pc([t("OF", { size: 96 })]),
  pc([t(String(testatorName || "").toUpperCase(), { size: 96 })]),
];

// A paragraph that forces next content to begin on a new page
export const pageBreakBefore = () =>
  new Paragraph({
    children: [t("")],
    pageBreakBefore: true,
  });

// Convenience helpers for common patterns
export const labelValue = (label, value, isVar = true) =>
  p([t(`${label}: `), isVar ? v(value || "") : t(value || "")]);

export const bullet = (text, isVar = false) =>
  p([isVar ? v(text || "") : t(text || "")]);
