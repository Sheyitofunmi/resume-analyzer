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
