"use client";

import { HabitGrid } from "@/components/habit-grid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNewHabitModal } from "@/hooks/use-newhabit-modal";
import { habitIcons } from "@/lib/constants";
import clsx from "clsx";
import { CheckCircle, Plus } from "lucide-react";
import { useState } from "react";
import { NewHabitModal } from "./new-habit-modal";
import { adjustColor } from "@/lib/utils";
import { useTheme } from "next-themes";


// Generate dummy completion data for 240 days (6 rows × 40 columns)
const generateDummyCompletions = (completedDays: number) => {
    const completions: { date: string; completed: boolean }[] = [];
    const today = new Date();
    for (let i = 239; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const completed = i < completedDays || (i % 3 === 0); // Simulate some pattern
        completions.push({
            date: date.toISOString().split("T")[0], // e.g., "2025-04-05"
            completed,
        });
    }
    return completions;
};

// Dummy data with color property (hex codes)
const dummyHabits = [
    {
        id: "1",
        name: "Exercise",
        category: "Health & Fitness",
        icon: "Dumbbell",
        color: "#EF4444", // Red
        mutedColorDark: adjustColor("#EF4444", -65),
        mutedColorLight: adjustColor("#EF4444", 80),
        completions: generateDummyCompletions(200),
    },
    {
        id: "2",
        name: "Meditation",
        category: "Mental Wellbeing",
        icon: "Brain",
        color: "#3B82F6", // Blue
        mutedColorDark: adjustColor("#3B82F6", -65),
        mutedColorLight: adjustColor("#3B82F6", 80),
        completions: generateDummyCompletions(150),
    },
    {
        id: "3",
        name: "Reading",
        category: "Personal Development",
        icon: "Book",
        color: "#10B981", // Green
        mutedColorDark: adjustColor("#10B981", -65),
        mutedColorLight: adjustColor("#10B981", 80),
        completions: generateDummyCompletions(100),
    },
];



export function HabitsSection() {
    const { theme } = useTheme();
    const [habits, setHabits] = useState(dummyHabits);
    const { isOpen, openModal, closeModal } = useNewHabitModal();

    // Add a new habit (client-side only for now)
    const handleAddHabit = (newHabit: {
        name: string;
        category: string;
        icon: string;
        color: string;
    }) => {
        setHabits([
            ...habits,
            {
                id: String(habits.length + 1),
                name: newHabit.name,
                category: newHabit.category,
                icon: newHabit.icon,
                color: newHabit.color,
                mutedColorDark: adjustColor(newHabit.color, -65),
                mutedColorLight: adjustColor(newHabit.color, 80),
                completions: generateDummyCompletions(0),
            },
        ]);
    };

    // Toggle today's completion (client-side only for now)
    const toggleHabitCompletion = (habitId: string) => {


        setHabits(
            habits.map((habit) => {
                if (habit.id !== habitId) return habit;
                const today = new Date().toISOString().split("T")[0];
                const todayIndex = habit.completions.findIndex((c) => c.date === today);
                if (todayIndex === -1) {
                    // Add today's entry if it doesn't exist
                    return {
                        ...habit,
                        completions: [...habit.completions, { date: today, completed: true }],
                    };
                }
                // Toggle existing entry
                const newCompletions = [...habit.completions];
                newCompletions[todayIndex] = {
                    ...newCompletions[todayIndex],
                    completed: !newCompletions[todayIndex].completed,
                };
                return { ...habit, completions: newCompletions };
            })
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-end">
                <Button onClick={openModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Habit
                </Button>
                <NewHabitModal
                    isOpen={isOpen}
                    onClose={closeModal}
                    onCreate={handleAddHabit}
                />
            </div>
            <div className="grid gap-4">
                {habits.map((habit) => {
                    const IconComponent = habitIcons.find(i => i.name === habit.icon)?.icon;
                    return (
                        <Card key={habit.id} className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    {IconComponent && (
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{ backgroundColor: habit.color }}
                                        >
                                            <IconComponent className="h-5 w-5 text-white" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-semibold">{habit.name}</h3>
                                        <p className="text-sm text-muted-foreground">{habit.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">
                                        {calculateStreak(habit.completions)} day streak
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleHabitCompletion(habit.id)}
                                        className="w-10 h-10"
                                        style={{
                                            backgroundColor: habit.completions[habit.completions.length - 1]?.completed
                                                ? habit.color
                                                : theme === "dark"
                                                    ? habit.mutedColorDark
                                                    : habit.mutedColorLight
                                        }}
                                    >

                                        <CheckCircle
                                            style={{
                                                color:
                                                    theme === "dark"
                                                        ? "#FFFFFF" // white icon for both states in dark
                                                        : habit.completions[habit.completions.length - 1]?.completed
                                                            ? "#FFFFFF" // white when completed in light
                                                            : "#000000", // black when incomplete in light
                                            }}
                                        />
                                    </Button>
                                </div>
                            </div>
                            <HabitGrid completions={habit.completions} color={habit.color} />
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}

function calculateStreak(completions: { date: string; completed: boolean }[]) {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < completions.length; i++) {
        const date = new Date(completions[completions.length - 1 - i].date);
        const diffDays = Math.floor(
            (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays !== i || !completions[completions.length - 1 - i].completed) {
            break;
        }
        streak++;
    }
    return streak;
}