'use client';

import * as React from "react";
import { addDays, format, startOfDay, eachDayOfInterval, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, Cell } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { processSleepDataForGraph } from "@/lib/utils";

// Define interfaces for data structures
interface SleepInterval {
    start: number;
    end: number;
}

interface SleepData {
    date: string;
    intervals: SleepInterval[];
}

interface ChartData {
    date: string;
    intervals: SleepInterval[];
    totalSleep: number;
    hasData: boolean;
    startTime: string;
    endTime: string;
    displayDate: string;
    sleepValue: number;
    // Remove the single interval prop since we'll render all intervals
    [key: string]: string | number | boolean | SleepInterval[] | SleepInterval | null;
}

interface DateRange {
    from: Date;
    to: Date;
}

interface DateRangePickerProps {
    dateRange: DateRange;
    setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
}

// Interface for SleepIntervalBar props
interface SleepIntervalBarProps {
    x: number;
    y: number;
    width: number;
    height: number;
    interval: SleepInterval; // Single interval to render
    fill?: string;
}

type SleepDataFromPage = {
    id: number;
    day?: string;
    startDate: string;
    endDate: string;
    hours: number;
}

interface SleepGraphProps {
    sleepData: SleepDataFromPage[];
}

// Date range picker component
function DateRangePicker({ dateRange, setDateRange }: DateRangePickerProps) {
    const [date, setDate] = React.useState<DateRange>({
        from: dateRange.from,
        to: dateRange.to,
    });

    // Update parent state when date changes
    React.useEffect(() => {
        if (date.from && date.to) {
            setDateRange({ from: date.from, to: date.to });
        }
    }, [date, setDateRange]);

    return (
        <div className="flex items-center space-x-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(newDate: { from?: Date; to?: Date } | undefined) => {
                            if (newDate && newDate.from && newDate.to) {
                                setDate({ from: newDate.from, to: newDate.to });
                            }
                        }}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

// Helper function to format decimal hours to time string (e.g., 13.5 -> "1:30 PM")
function formatHourToTime(hour: number): string {
    const hours = Math.floor(hour);
    const minutes = Math.round((hour - hours) * 60);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Custom bar shape for sleep intervals
const SleepIntervalBar = (props: SleepIntervalBarProps) => {
    const { x, y, width, height, interval, fill } = props;

    if (!interval) return null;

    // Calculate the y position based on the interval start time
    const startY = isNaN(y) ? 0 : y + ((interval.start / 24) * height);

    // Calculate the height based on the interval duration
    const intervalHeight = ((interval.end - interval.start) / 24) * height;

    // Guard against NaN values
    if (isNaN(startY) || isNaN(intervalHeight) || intervalHeight <= 0) {
        return null;
    }

    return (
        <rect
            x={x + width * 0.1} // Centered in the bar space
            y={startY.toString()}
            width={width * 0.8} // 80% of the bar width
            height={intervalHeight.toString()}
            fill={fill || "hsl(var(--primary))"}
            rx={4}
            className="hover:opacity-80 transition-opacity"
        />
    );
};

export function SleepGraph(sleepData: SleepGraphProps) {
    // Transform the real sleep data into the format expected by the graph
    const transformedSleepData = React.useMemo(() => {
        return processSleepDataForGraph(sleepData);
    }, [sleepData]);

    // Set default date range to last 7 days

    const [dateRange, setDateRange] = React.useState<DateRange>({
        from: startOfMonth(subMonths(new Date(), 1)), // First day of previous month
        to: endOfMonth(new Date()), // Last day of current month
    });

    // Generate all dates in the selected range
    const allDatesInRange = React.useMemo(() => {
        return eachDayOfInterval({
            start: dateRange.from,
            end: dateRange.to,
        }).map((date) => format(date, "yyyy-MM-dd"));
    }, [dateRange]);

    // Convert transformed sleep data to a map for easier lookup
    const sleepDataMap: Record<string, SleepInterval[]> = React.useMemo(() => {
        return transformedSleepData.reduce((acc, item) => {
            acc[item.date] = item.intervals;
            return acc;
        }, {} as Record<string, SleepInterval[]>);
    }, [transformedSleepData]);

    // Create chart data with all dates in range
    const chartData = React.useMemo((): ChartData[] => {
        return allDatesInRange.map((dateStr) => {
            const intervals = sleepDataMap[dateStr] || [];
            const totalSleep = intervals.reduce((total, interval) => total + (interval.end - interval.start), 0);

            // Get start and end times for display (use the first interval for tooltip)
            const startTime = intervals.length > 0 ? formatHourToTime(intervals[0].start) : 'N/A';
            const endTime = intervals.length > 0 ? formatHourToTime(intervals[0].end) : 'N/A';

            const data: ChartData = {
                date: dateStr,
                intervals: intervals, // Store all intervals for rendering
                totalSleep: totalSleep,
                hasData: intervals.length > 0,
                startTime,
                endTime,
                displayDate: new Date(dateStr).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                sleepValue: 24, // Placeholder value for the bar to render (full height)
            };

            return data;
        });
    }, [allDatesInRange, sleepDataMap]);

    // Calculate average sleep time
    const averageSleep = React.useMemo(() => {
        const daysWithData = chartData.filter((day) => day.hasData);
        if (daysWithData.length === 0) return 0;
        return daysWithData.reduce((sum, day) => sum + day.totalSleep, 0) / daysWithData.length;
    }, [chartData]);

    // Define chart configuration for the tooltip
    const chartConfig: ChartConfig = {
        sleep: {
            label: "Sleep Time",
            color: "oklch(0.645 0.246 16.439)",
        },
        totalSleep: {
            label: "Total Hours",
            color: "hsl(var(--primary))",
        },
        startTime: {
            label: "Start Time",
            color: "hsl(var(--primary))",
        },
        endTime: {
            label: "End Time",
            color: "hsl(var(--primary))",
        },
        axisLabel: {
            label: "Axis Labels",
            color: "hsl(var(--foreground))", // Use foreground color for better contrast in dark mode
        },
        grid: {
            label: "Grid Lines",
            color: "hsl(var(--muted-foreground))", // Use muted foreground for grid lines
        },
        desktop: {
            label: "Desktop",
            color: "hsl(var(--chart-1))",
        },
        mobile: {
            label: "Mobile",
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-4 border-b px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardDescription>
                            Showing sleep intervals over time - Average: {averageSleep.toFixed(1)} hours/day
                        </CardDescription>
                    </div>
                    <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-[400px] w-full relative">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                            <CartesianGrid vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                style={{ fontSize: "12px", fill: "" }}
                            />
                            <YAxis
                                domain={[0, 24]}
                                ticks={[0, 3, 6, 9, 12, 15, 18, 21, 24]}
                                // tickFormatter={(value: number): string => {
                                //     const hour = value % 24;
                                //     const ampm = hour >= 12 ? "PM" : "AM";
                                //     const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                                //     return hour === 0 || hour === 12 ? `${displayHour} ${ampm}` : `${displayHour}`;
                                // }}
                                tickFormatter={(value: number): string => {
                                    switch (value) {
                                        case 24: return "12 AM";
                                        case 21: return "3";
                                        case 18: return "6";
                                        case 15: return "9";
                                        case 12: return "12 PM";
                                        case 9: return "3";
                                        case 6: return "6";
                                        case 3: return "9";
                                        case 0: return "12 AM";
                                        default: return "";
                                    }
                                }}
                                style={{ fontSize: "12px", fill: "" }}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-[180px]"
                                        nameKey="sleep"
                                        labelFormatter={(value) => {
                                            return new Date(value).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            });
                                        }}
                                        formatter={(value, name, props) => {
                                            const data = props.payload as ChartData;
                                            if (!data.hasData) return ["No data", ""];

                                            // Return an array of [value, label] pairs for each piece of information
                                            return (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                    <span>{`${data.totalSleep.toFixed(1)} hours slept`}</span>
                                                    <span>{data.startTime} to {data.endTime}</span>
                                                </div>
                                            );
                                        }}
                                    />
                                }
                            />
                            <Bar
                                dataKey="sleepValue"
                                fill="transparent"
                                // @ts-expect-error - Suppress TypeScript error for shape prop
                                shape={(props) => {
                                    const { x, y, width, height, payload } = props;
                                    const intervals = payload.intervals || [];

                                    // Render a SleepIntervalBar for each interval on this day
                                    return (
                                        <g>
                                            {intervals.map((interval: SleepInterval, index: number) => (
                                                <SleepIntervalBar
                                                    key={`interval-${index}`}
                                                    x={x}
                                                    y={y}
                                                    width={width}
                                                    height={height}
                                                    interval={interval}
                                                    fill={chartConfig.sleep.color}
                                                />
                                            ))}
                                        </g>
                                    );
                                }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}