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

export function calculateStreak(completions: { date: string; completed: boolean }[]) {
  if (completions.length === 0) return 0;

  // Sort completions by date in descending order (most recent first)
  const sortedCompletions = [...completions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date().toLocaleDateString("en-CA"); // Local date (e.g., "2025-04-08")

  // Start from the most recent completion and work backwards
  for (let i = 0; i < sortedCompletions.length; i++) {
    const currentDate = sortedCompletions[i].date; // Already in "YYYY-MM-DD" format
    const expectedDate = new Date(today); // Copy of today
    expectedDate.setDate(expectedDate.getDate() - i); // Subtract i days
    const expectedDateStr = expectedDate.toLocaleDateString("en-CA");

    // If the date doesn’t match or isn’t completed, break the streak
    if (currentDate !== expectedDateStr || !sortedCompletions[i].completed) {
      break;
    }
    streak++;
  }

  // Check if today should count (if no completion for today yet)
  if (streak === 0 && sortedCompletions[0]?.date < today && sortedCompletions[0]?.completed) {
    streak = 1; // Start streak if yesterday was completed
  }

  return streak;
}