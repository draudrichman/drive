import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function adjustColor(hex: string, percent: number): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Positive percent lightens, negative percent darkens
  const adjust = (value: number) => {
    if (percent > 0) {
      return Math.min(255, Math.floor(value + (255 - value) * (percent / 100)));
    } else {
      return Math.max(0, Math.floor(value + value * (percent / 100)));
    }
  };
  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);

  return `#${newR.toString(16).padStart(2, "0")}${newG
    .toString(16)
    .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}
