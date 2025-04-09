import { db } from "../index";
import { habitCompletions, InsertSleepEntry, sleepEntries, habits } from "../schema";
import { eq } from "drizzle-orm";

export async function updateHabitCompletion(id: number, completed: boolean) {
  const [updatedCompletion] = await db
    .update(habitCompletions)
    .set({ completed })
    .where(eq(habitCompletions.id, id))
    .returning();
  return updatedCompletion;
}

export async function updateSleepEntry(
  id: number,
  data: Partial<InsertSleepEntry>
) {
  const [updatedEntry] = await db
    .update(sleepEntries)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(sleepEntries.id, id))
    .returning();
  return updatedEntry;
}

export async function updateHabit(
  id: number,
  data: {
    name: string;
    category: string;
    icon: string;
    color: string;
    description?: string | null;
  }
) {
  const [updatedHabit] = await db
    .update(habits)
    .set({
      name: data.name,
      category: data.category,
      icon: data.icon,
      color: data.color,
      description: data.description,
    })
    .where(eq(habits.id, id))
    .returning();
  return updatedHabit;
}
