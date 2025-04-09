import { db } from "../index";
import { habits, habitCompletions, sleepEntries } from "../schema";
import { eq } from "drizzle-orm";

export async function deleteHabit(id: number) {
  await db.delete(habits).where(eq(habits.id, id));
}

export async function deleteHabitCompletion(id: number) {
  await db.delete(habitCompletions).where(eq(habitCompletions.id, id));
}

export async function deleteSleepEntry(id: number) {
  await db.delete(sleepEntries).where(eq(sleepEntries.id, id));
}
