import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  // Determine the appropriate unit by calculating the log
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Format with 2 decimal places and round
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const generateUUID = () => crypto.randomUUID();

/**
 * Stitches the two halves of a split analysis into one `Feedback`.
 *
 * The five sections are scored by two prompts running in parallel, so neither
 * response is a complete report and neither model call can judge the overall
 * score — that is derived here from the five section scores.
 *
 * Returns `null` if either half is unparseable or missing a section, which the
 * caller treats as a failed analysis. Being strict matters: a half-populated
 * report would render as a confident set of scores with sections silently
 * missing.
 */
export function mergeFeedbackHalves(
  atsText: string,
  writingText: string,
): Feedback | null {
  let ats: any;
  let writing: any;
  try {
    ats = JSON.parse(extractJSON(atsText));
    writing = JSON.parse(extractJSON(writingText));
  } catch {
    return null;
  }

  const merged = {
    ATS: ats?.ATS,
    skills: ats?.skills,
    toneAndStyle: writing?.toneAndStyle,
    content: writing?.content,
    structure: writing?.structure,
  };

  const scores = Object.values(merged).map((section: any) => section?.score);
  if (scores.some((score) => typeof score !== "number")) return null;

  const overallScore = Math.round(
    (scores as number[]).reduce((sum, score) => sum + score, 0) / scores.length,
  );

  return { overallScore, ...merged } as Feedback;
}

export function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const firstArr = text.indexOf("[");
  const lastArr = text.lastIndexOf("]");
  const firstObj = text.indexOf("{");
  const lastObj = text.lastIndexOf("}");
  if (
    firstArr !== -1 &&
    lastArr !== -1 &&
    (firstObj === -1 || firstArr < firstObj)
  )
    return text.slice(firstArr, lastArr + 1);
  if (firstObj !== -1 && lastObj !== -1)
    return text.slice(firstObj, lastObj + 1);
  return text.trim();
}
