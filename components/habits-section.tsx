"use client";

import { HabitGrid } from "@/components/habit-grid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { habitIcons } from "@/lib/constants";
import { CheckCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { NewHabitModal } from "./new-habit-modal";
import { adjustColor, calculateStreak } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Skeleton } from "./ui/skeleton";
import {
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EditHabitModal } from "./edit-habit-modal";
import { toast } from "sonner";


type Habit = {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  description?: string;
  completions: { id: string; date: string; completed: boolean }[];
};

type HabitsSectionProps = {
  habits: Habit[];
  isLoading: boolean;
};


export function HabitsSection({ habits: initialHabits, isLoading }: HabitsSectionProps) {
  const { theme } = useTheme();
  const [habits, setHabits] = useState(initialHabits);
  const today = new Date().toLocaleDateString("en-CA");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  // console.log("Today's date:", today);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingHabits, setLoadingHabits] = useState<{ [key: string]: boolean }>({});


  // const todays = new Date();
  // console.log(`Current date and time: ${todays.toLocaleString()}`);
  // Add this useEffect to sync habits with initialHabits
  useEffect(() => {
    setHabits(initialHabits);
  }, [initialHabits]);

  const handleHabitCreated = (newHabit: { id: number; name: string; category: string; icon: string; color: string; description?: string }) => {
    const habitWithId: Habit = {
      id: newHabit.id.toString(),
      name: newHabit.name,
      category: newHabit.category,
      icon: newHabit.icon,
      color: newHabit.color,
      description: newHabit.description,
      completions: [],
    };
    setHabits((prevHabits) => [...prevHabits, habitWithId]);
    setIsModalOpen(false);
  };

  // const toggleHabitCompletion = async (habitId: string) => {
  //     const habit = habits.find(h => h.id === habitId);
  //     if (!habit) return;

  //     const todayCompletion = habit.completions.find(c => c.date === today);

  //     if (todayCompletion) {
  //         // Delete if already completed
  //         await handleDeleteCompletion(todayCompletion.id, habitId);
  //     } else {
  //         // Create new completion
  //         try {
  //             const response = await fetch("/api/habits/completion", {
  //                 method: "POST",
  //                 headers: {
  //                     "Content-Type": "application/json",
  //                 },
  //                 body: JSON.stringify({
  //                     habitId: parseInt(habitId),
  //                     date: today,
  //                     completed: true,
  //                 }),
  //             });

  //             if (!response.ok) {
  //                 throw new Error("Failed to create habit completion");
  //             }

  //             const data = await response.json();
  //             const newCompletion = data.completion;

  //             setHabits((prevHabits) =>
  //                 prevHabits.map((habit) =>
  //                     habit.id === habitId
  //                         ? {
  //                             ...habit,
  //                             completions: [
  //                                 ...habit.completions,
  //                                 { id: newCompletion.id.toString(), date: newCompletion.date, completed: newCompletion.completed },
  //                             ],
  //                         }
  //                         : habit
  //                 )
  //             );
  //         } catch (error) {
  //             console.error("Error creating habit completion:", error);
  //         }
  //     }
  // };

  const toggleHabitCompletion = async (habitId: string) => {
    if (loadingHabits[habitId]) return;

    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const todayCompletion = habit.completions.find((c) => c.date === today);
    const isCurrentlyCompleted = !!todayCompletion;


    // Optimistically update the local state
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === habitId
          ? {
            ...habit,
            completions: isCurrentlyCompleted
              ? habit.completions.filter((c) => c.date !== today) // Remove today's completion
              : [
                ...habit.completions,
                { id: `${Date.now()}`, date: today, completed: true }, // Add temporary completion
              ],
          }
          : habit
      )
    );

    // Set loading state for this habit
    setLoadingHabits((prev) => ({ ...prev, [habitId]: true }));
    // Sync with backend asynchronously
    try {
      if (isCurrentlyCompleted) {
        // Delete the completion
        await handleDeleteCompletion(todayCompletion!.id, habitId);
      } else {
        // Create new completion
        const response = await fetch("/api/habits/completion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            habitId: parseInt(habitId),
            date: today,
            completed: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create habit completion");
        }

        const data = await response.json();
        const newCompletion = data.completion;

        // Update the temporary ID with the real one from the backend
        setHabits((prevHabits) =>
          prevHabits.map((habit) =>
            habit.id === habitId
              ? {
                ...habit,
                completions: habit.completions.map((c) =>
                  c.date === today && c.id === `${Date.now()}`
                    ? { ...c, id: newCompletion.id.toString() }
                    : c
                ),
              }
              : habit
          )
        );
        toast.success("Habit completed!");
      }
    } catch (error) {
      console.error("Error syncing habit completion:", error);
      // Optional: Revert on failure (uncomment if desired)
      setHabits((prevHabits) =>
        prevHabits.map((habit) =>
          habit.id === habitId
            ? {
              ...habit,
              completions: isCurrentlyCompleted
                ? [...habit.completions, todayCompletion!] // Re-add if delete fails
                : habit.completions.filter((c) => c.date !== today), // Remove if create fails
            }
            : habit
        )
      );
    } finally {
      // Clear loading state for this habit
      setLoadingHabits((prev) => ({ ...prev, [habitId]: false }));
    }
  };

  const handleDeleteCompletion = async (completionId: string, habitId: string) => {
    try {
      const response = await fetch(`/api/habits/completion/${completionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete completion");
      }

      setHabits((prevHabits) =>
        prevHabits.map((habit) =>
          habit.id === habitId
            ? {
              ...habit,
              completions: habit.completions.filter((c) => c.id !== completionId),
            }
            : habit
        )
      );
    } catch (error) {
      console.error("Error deleting completion:", error);
    }
  };

  const handleEditHabit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      setHabitToEdit(habit);
      setIsEditModalOpen(true);
    }
  };

  const handleHabitUpdated = (updatedHabit: {
    id: number;
    name: string;
    category: string;
    icon: string;
    color: string;
    description?: string;
  }) => {
    const updatedHabitWithId: Habit = {
      id: updatedHabit.id.toString(),
      name: updatedHabit.name,
      category: updatedHabit.category,
      icon: updatedHabit.icon,
      color: updatedHabit.color,
      description: updatedHabit.description,
      completions: habits.find((h) => h.id === updatedHabit.id.toString())?.completions || [], // Preserve existing completions
    };

    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === updatedHabit.id.toString() ? updatedHabitWithId : habit
      )
    );
    setIsEditModalOpen(false);
    setHabitToEdit(null);
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (loadingHabits[habitId]) return; // Prevent action if already loading

    // Set loading state for this habit
    setLoadingHabits((prev) => ({ ...prev, [habitId]: true }));

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId }),
      });

      if (!response.ok) throw new Error("Failed to delete habit");

      setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== habitId));
    } catch (error) {
      console.error("Error deleting habit:", error);
    } finally {
      // Clear loading state for this habit
      setLoadingHabits((prev) => ({ ...prev, [habitId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button variant={"default"} className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Habit
        </Button>

      </div>
      {habits.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <h3 className="font-medium text-lg mb-2">No habits found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first habit to start tracking your progress.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit) => {
            const IconComponent = habitIcons.find(i => i.name === habit.icon)?.icon;
            return (
              <Card key={habit.id} className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40">
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleEditHabit(habit.id)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-pink-600"
                            onClick={() => handleDeleteHabit(habit.id)}
                            disabled={loadingHabits[habit.id]}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <div className="flex items-center space-x-4">
                      {IconComponent && (
                        <div className="p-2 rounded-lg" style={{ backgroundColor: habit.color }}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">{habit.name}</h3>
                        <p className="text-sm text-muted-foreground">{habit.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {calculateStreak(habit.completions)} day streak
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleHabitCompletion(habit.id)} // Replace toggleHabitCompletion
                      className="w-10 h-10 cursor-pointer"
                      style={{
                        backgroundColor: habit.completions.find(c => c.date === today)?.completed
                          ? habit.color
                          : theme === "dark"
                            ? adjustColor(habit.color, -65)
                            : adjustColor(habit.color, 80),
                      }}
                      disabled={loadingHabits[habit.id]}
                    >
                      <CheckCircle
                        style={{
                          color: theme === "dark"
                            ? "#FFFFFF"
                            : habit.completions.find(c => c.date === today)?.completed
                              ? "#FFFFFF"
                              : "#000000",
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
      )}

      <NewHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleHabitCreated}
      />
      <EditHabitModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setHabitToEdit(null);
        }}
        onUpdate={(habit) => handleHabitUpdated({ ...habit, description: habit.description || undefined })}
        habit={habitToEdit}
      />
    </div>
  );
}
