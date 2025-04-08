import { db } from "../index";
import { habitCompletions } from "../schema";
import { eq } from "drizzle-orm";

export async function updateHabitCompletion(id: number, completed: boolean) {
  const [updatedCompletion] = await db
    .update(habitCompletions)
    .set({ completed })
    .where(eq(habitCompletions.id, id))
    .returning();
  return updatedCompletion;
}
