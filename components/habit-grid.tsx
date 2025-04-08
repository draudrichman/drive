"use client";

import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { adjustColor } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type HabitProps = {
    color: string;
    completions: { date: string; completed: boolean }[];
};

function getHabitGridData(
    completions: { date: string; completed: boolean }[],
    totalDays = 280
) {
    const rows = 7;
    const today = new Date();

    const getGridRowIndex = (date: Date) => (date.getDay() + 1) % 7;


    const dayOfWeek = today.getDay();

    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysUntilFriday);

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalDays + 1);


    const dateMap = new Map(
        completions.map((c) => [new Date(c.date).toDateString(), c])
    );


    const grid: ({ date: string; completed: boolean; upcoming: boolean } | null)[][] = Array.from(
        { length: rows },
        () => []
    );


    const currentDate = new Date(startDate);
    for (let i = 0; i < totalDays; i++) {
        const dateKey = currentDate.toDateString();
        const isUpcoming = currentDate > today;

        const entry = isUpcoming
            ? { date: currentDate.toISOString(), completed: false, upcoming: true }
            : {
                date: currentDate.toISOString(),
                completed: dateMap.get(dateKey)?.completed ?? false,
                upcoming: false
            };

        const row = getGridRowIndex(currentDate);
        grid[row].push(entry);

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return grid;
}


export function HabitGrid({ color, completions }: HabitProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const grid = getHabitGridData(completions);
    const rows = 7;
    const columns = grid[0]?.length || 0;

    const mutedColor = mounted && theme === "dark"
        ? adjustColor(color, -65)
        : adjustColor(color, 80);

    return (
        <div
            className="grid gap-1 w-full box-border"
            style={{
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
        >
            {grid.map((row, rowIndex) =>
                row.map((day, colIndex) => {
                    const key = `${rowIndex}-${colIndex}`;
                    if (!day) return <div key={key} className="aspect-square" />;
                    return (
                        <TooltipProvider key={key}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className="aspect-square rounded-[4px]"
                                        style={{
                                            width: "100%",
                                            height: "0px",
                                            paddingBottom: "100%",
                                            backgroundColor: day.completed ? color : mutedColor,
                                        }}
                                    />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[200px] break-words content-center">
                                    <p className="text-xs">
                                        {new Date(day.date).toLocaleDateString(undefined, {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                    <div className="flex justify-center">
                                        <p>{day.completed ? "Completed" : day.upcoming ? "Upcoming" : "Missed"}</p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })
            )}
        </div>
    );
}