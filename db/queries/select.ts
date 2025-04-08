import { db } from "../index";
import { habits, habitCompletions } from "../schema";
import { eq, and } from "drizzle-orm";

// Function to get all habits for a given user
export async function getUserHabits(userId: string) {
  const userHabits = await db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId))
    .leftJoin(habitCompletions, eq(habits.id, habitCompletions.habitId));

  // Transform into the format your frontend expects
  const formattedHabits = userHabits.reduce((acc, row) => {
    const habit = row.habits;
    const completion = row.habit_completions;

    const existingHabit = acc.find((h) => h.id === habit.id.toString());
    if (!existingHabit) {
      acc.push({
        id: habit.id.toString(),
        name: habit.name,
        category: habit.category,
        icon: habit.icon,
        color: habit.color,
        completions: completion
          ? [
              {
                id: completion.id.toString(),
                date: completion.date,
                completed: completion.completed,
              },
            ]
          : [],
      });
    } else if (completion) {
      existingHabit.completions.push({
        id: completion.id.toString(),
        date: completion.date,
        completed: completion.completed,
      });
    }
    return acc;
  }, [] as Array<{
    id: string;
    name: string;
    category: string;
    icon: string;
    color: string;
    completions: Array<{
      id: string;
      date: string;
      completed: boolean;
    }>;
  }>);

  return formattedHabits;
}

export async function getHabitCompletion(habitId: number, date: string) {
  const completion = await db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.habitId, habitId),
        eq(habitCompletions.date, date)
      )
    )
    .limit(1);
  return completion[0] || null;
}
