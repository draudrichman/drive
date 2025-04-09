import { db } from "../index";
import {
  habitCompletions,
  habits,
  InsertHabit,
  InsertHabitCompletion,
  InsertSleepEntry,
  sleepEntries,
} from "../schema";

export async function createHabit(data: InsertHabit) {
  const [newHabit] = await db.insert(habits).values(data).returning();
  return newHabit;
}

export async function createHabitCompletion(data: InsertHabitCompletion) {
  const [newCompletion] = await db.insert(habitCompletions).values(data).returning();
  return newCompletion;
}

export async function createSleepEntry(data: InsertSleepEntry) {
  const [newEntry] = await db.insert(sleepEntries).values(data).returning();
  return newEntry;
}
