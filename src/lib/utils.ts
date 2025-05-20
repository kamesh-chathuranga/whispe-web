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
