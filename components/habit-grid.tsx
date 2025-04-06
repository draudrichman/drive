"use client";

import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { adjustColor } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type HabitProps = {
    color: string;
    completions: { date: string; completed: boolean }[];
};

export function HabitGrid({ color, completions }: HabitProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false); // Track if component has mounted on client

    // Ensure theme is only used after mounting on the client
    useEffect(() => {
        setMounted(true);
    }, [])


    const days = completions.slice(-240); // Take the last 280 days (7 rows × 40 columns)
    const rows = 6;
    const columns = 40;
    // Reorder days to fill top-to-bottom, then next column
    const grid = Array.from({ length: rows }, () => Array(columns).fill(null));
    for (let i = 0; i < days.length; i++) {
        const row = i % rows; // Fill top to bottom
        const col = Math.floor(i / rows); // Move to next column after filling a column
        grid[row][col] = days[i];
    }

    // Adjust muted color based on theme
    // Use a fallback color during SSR, update on client
    const mutedColor = mounted && theme === "dark"
        ? adjustColor(color, -65) // Darken by 65% for dark mode
        : adjustColor(color, 80)  // Lighten by 80% for light mode
 

    return (
        <div
            className="grid gap-1 w-full box-border"
            style={{
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
        >
            {grid.flat().map((day, i) => {
                if (!day) return <div key={i} className="aspect-square" />; // Empty cell
                return (
                    <TooltipProvider key={i}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className={`aspect-square rounded-[4px] `}
                                    style={{ width: "100%", height: "0px", paddingBottom: "100%", backgroundColor: day.completed ? color : mutedColor }}
                                />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[200px] break-words">
                                <p className="text-xs">
                                    {new Date(day.date).toLocaleDateString()}:{" "}
                                    {day.completed ? "Completed" : "Missed"}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            })}
        </div>
    );
}