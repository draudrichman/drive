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
      // console.log(
      //   `Streak reset to 0: Yesterday (${yesterdayStr}) not completed. Completions: ${JSON.stringify(
      //     completions.map((c) => ({ date: c.date, completed: c.completed }))
      //   )}`
      // );
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
  // console.log(
  //   `Streak for completions ${JSON.stringify(
  //     completions.map((c) => ({ date: c.date, completed: c.completed }))
  //   )}: ${streak}`
  // );

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

///////////////////////////////////////////////////

type SleepDataFromPage = {
  id: number;
  day?: string;
  startDate: string;
  endDate: string;
  hours: number;
};

interface SleepGraphProps {
  sleepData: SleepDataFromPage[];
}

interface Interval {
  start: number;
  end: number;
}

interface DateIntervals {
  date: string;
  intervals: Interval[];
}

/**
 * Transforms sleep data into date-specific intervals
 * @param sleepData Single sleep data entry
 * @returns Array of date intervals
 */
function transformSleepData(sleepData: SleepDataFromPage): DateIntervals[] {
  // Parse the dates
  const startDate = new Date(sleepData.startDate);
  const endDate = new Date(sleepData.endDate);

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Convert hours and minutes to decimal representation
  const toDecimalHours = (date: Date): number => {
    return date.getUTCHours() + date.getUTCMinutes() / 60;
  };

  // Get start and end times in decimal hours
  const startTime = toDecimalHours(startDate);
  const endTime = toDecimalHours(endDate);

  // Get dates as strings
  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);

  // Create result object
  const result: DateIntervals[] = [];

  // Handle case where start and end dates are the same
  if (startDateStr === endDateStr) {
    result.push({
      date: startDateStr,
      intervals: [{ start: startTime, end: endTime }],
    });
    return result;
  }

  // Handle case where dates span multiple days
  // First day: from start time to midnight
  result.push({
    date: startDateStr,
    intervals: [{ start: startTime, end: 24 }],
  });

  // Last day: from midnight to end time
  result.push({
    date: endDateStr,
    intervals: [{ start: 0, end: endTime }],
  });

  // Handle any intermediate days (full 24-hour periods)
  const currentDate = new Date(startDate);
  currentDate.setUTCDate(currentDate.getUTCDate() + 1);

  while (formatDate(currentDate) !== endDateStr) {
    result.push({
      date: formatDate(currentDate),
      intervals: [{ start: 0, end: 24 }],
    });
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  // Sort by date
  result.sort((a, b) => a.date.localeCompare(b.date));

  return result;
}

/**
 * Processes all sleep data for the graph
 * @param props SleepGraphProps containing array of sleep data
 * @returns Processed data for graph display
 */
export function processSleepDataForGraph(
  props: SleepGraphProps
): DateIntervals[] {
  const { sleepData } = props;

  // Process each sleep data entry and flatten the results
  const allDateIntervals: DateIntervals[] = [];

  for (const entry of sleepData) {
    const intervals = transformSleepData(entry);
    allDateIntervals.push(...intervals);
  }

  // Combine intervals for the same date
  const dateMap = new Map<string, Interval[]>();

  for (const dateInterval of allDateIntervals) {
    if (!dateMap.has(dateInterval.date)) {
      dateMap.set(dateInterval.date, []);
    }

    dateMap.get(dateInterval.date)!.push(...dateInterval.intervals);
  }

  // Create final result
  const result: DateIntervals[] = [];

  dateMap.forEach((intervals, date) => {
    // Sort intervals by start time
    intervals.sort((a, b) => a.start - b.start);

    // Merge overlapping intervals
    const mergedIntervals: Interval[] = [];
    let currentInterval: Interval | null = null;

    for (const interval of intervals) {
      if (!currentInterval) {
        currentInterval = { ...interval };
      } else if (currentInterval.end >= interval.start) {
        // Intervals overlap, merge them
        currentInterval.end = Math.max(currentInterval.end, interval.end);
      } else {
        // No overlap, add current interval and start a new one
        mergedIntervals.push(currentInterval);
        currentInterval = { ...interval };
      }
    }

    if (currentInterval) {
      mergedIntervals.push(currentInterval);
    }

    result.push({
      date,
      intervals: mergedIntervals,
    });
  });

  // Sort by date
  result.sort((a, b) => a.date.localeCompare(b.date));

  return result;
}
