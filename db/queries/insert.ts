import { db } from "../index";
import {
  habits,
  habitCompletions,
  InsertHabit,
  InsertHabitCompletion,
} from "../schema";

export async function createHabit(data: InsertHabit) {
  const [newHabit] = await db.insert(habits).values(data).returning();
  return newHabit;
}

export async function createHabitCompletion(data: InsertHabitCompletion) {
  const [newCompletion] = await db
    .insert(habitCompletions)
    .values(data)
    .returning();
  return newCompletion;
}
