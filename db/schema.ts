import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// Habits table
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(), // References Supabase Auth user ID (UUID)
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(), // Hex color code
  description: varchar("description", { length: 1000 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Habit completions table
export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }), // Foreign key to habits
  date: varchar("date", { length: 10 }).notNull(), // ISO date (e.g., "2025-04-06")
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations (optional, for querying convenience)
export const habitsRelations = relations(habits, ({ many }) => ({
  completions: many(habitCompletions),
}));

export const habitCompletionsRelations = relations(
  habitCompletions,
  ({ one }) => ({
    habit: one(habits, {
      fields: [habitCompletions.habitId],
      references: [habits.id],
    }),
  })
);

// Sleep entries table
export const sleepEntries = pgTable("sleep_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(), // References Supabase Auth user ID (UUID)
  startDate: timestamp("start_date").notNull(), // Full start date-time (e.g., "2025-04-06 22:00:00")
  endDate: timestamp("end_date").notNull(), // Full end date-time (e.g., "2025-04-07 05:30:00")
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InsertHabit = typeof habits.$inferInsert;
export type InsertHabitCompletion = typeof habitCompletions.$inferInsert;
export type InsertSleepEntry = typeof sleepEntries.$inferInsert;
