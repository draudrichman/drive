import { db } from "../index";
import { habitCompletions, InsertSleepEntry, sleepEntries } from "../schema";
import { eq } from "drizzle-orm";

export async function updateHabitCompletion(id: number, completed: boolean) {
  const [updatedCompletion] = await db
    .update(habitCompletions)
    .set({ completed })
    .where(eq(habitCompletions.id, id))
    .returning();
  return updatedCompletion;
}

export async function updateSleepEntry(id: number, data: Partial<InsertSleepEntry>) {
  const [updatedEntry] = await db
    .update(sleepEntries)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(sleepEntries.id, id))
    .returning();
  return updatedEntry;
}
