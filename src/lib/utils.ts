import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapMimTypeToFileType(mimtype: string) {
  return mimtype.startsWith("image")
    ? "image"
    : mimtype.startsWith("video")
    ? "video"
    : mimtype.startsWith("audio")
    ? "audio"
    : "file";
}

export const capitalizeWord = (word: string) => {
  if (!word) return "File";
  return word.charAt(0).toUpperCase() + word.slice(1);
};
