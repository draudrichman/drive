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

export function calculateStreak(
  completions: { id: string; date: string; completed: boolean }[]
): number {
  if (!completions || completions.length === 0) return 0;

  // Get today's date in "en-CA" format (YYYY-MM-DD)
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA");

  // Check if today is completed
  const todayCompleted = completions.some(
    (c) => c.date === todayStr && c.completed
  );

  // If today is completed, streak starts at 1; otherwise, start checking from yesterday
  let streak = todayCompleted ? 1 : 0;
  const currentDate = new Date(today);

  // If today isn't completed, we start checking from yesterday
  if (!todayCompleted) {
    currentDate.setDate(currentDate.getDate() - 1);
    const yesterdayStr = currentDate.toLocaleDateString("en-CA");
    const yesterdayCompleted = completions.some(
      (c) => c.date === yesterdayStr && c.completed
    );

    // If yesterday isn't completed, streak must be 0 (resets due to break in streak)
    if (!yesterdayCompleted) {
      console.log(
        `Streak reset to 0: Yesterday (${yesterdayStr}) not completed. Completions: ${JSON.stringify(
          completions.map((c) => ({ date: c.date, completed: c.completed }))
        )}`
      );
      return 0;
    }
    streak = 1; // Yesterday was completed, so streak starts at 1
  }

  // Go backward day by day to count consecutive completed days
  while (true) {
    currentDate.setDate(currentDate.getDate() - 1); // Move to the previous day
    const currentDateStr = currentDate.toLocaleDateString("en-CA");

    const dayCompleted = completions.some(
      (c) => c.date === currentDateStr && c.completed
    );
    if (!dayCompleted) {
      break; // Streak ends when we find a non-completed day
    }
    streak++;
  }

  // Log the streak for debugging
  console.log(
    `Streak for completions ${JSON.stringify(
      completions.map((c) => ({ date: c.date, completed: c.completed }))
    )}: ${streak}`
  );

  return streak;
}

export function calculateDuration(start: string, end: string) {
  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = end.split(":").map(Number);
  const startTotal = startHours * 60 + startMinutes;
  let endTotal = endHours * 60 + endMinutes;
  if (endTotal <= startTotal) endTotal += 24 * 60; // Handle midnight crossover
  const diffMinutes = endTotal - startTotal;
  return diffMinutes / 60; // Convert to hours
}

// Keep this function for converting UTC to local time
export const parseUTCTimestampToLocal = (utcTimestamp: string): Date => {
  const date = new Date(utcTimestamp); // Parse the UTC timestamp
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000); // Adjust for local timezone
};

export const formatTimeWithDate = (
  dateStr: string
): { time: string; date: string } => {
  const date = new Date(dateStr);

  // Extract UTC hours and minutes directly
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getUTCMinutes();

  // Convert 24-hour to 12-hour format
  const ampm = utcHours >= 12 ? "PM" : "AM";
  const displayHours = utcHours % 12 || 12; // Convert to 12-hour format

  const formattedTime = `${displayHours
    .toString()
    .padStart(2, "0")}:${utcMinutes.toString().padStart(2, "0")} ${ampm}`;

  // Get UTC date parts
  const month = date.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const day = date.getUTCDate();
  const formattedDate = `${month} ${day}`;

  return { time: formattedTime, date: formattedDate };
};
