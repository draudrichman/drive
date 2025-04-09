"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DateTimePickerProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    minDate?: Date; // Add minDate prop to restrict dates
}

export function DateTimePicker({ value, onChange, minDate }: DateTimePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(value);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        setDate(value);
    }, [value]);

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            // If minDate is set, ensure the selected date is not before it
            if (minDate && selectedDate < minDate) {
                selectedDate.setFullYear(minDate.getFullYear());
                selectedDate.setMonth(minDate.getMonth());
                selectedDate.setDate(minDate.getDate());
            }
            setDate(selectedDate);
            onChange?.(selectedDate);
        }
    };

    const handleTimeChange = (
        type: "hour" | "minute" | "ampm",
        value: string
    ) => {
        if (date) {
            const newDate = new Date(date);
            if (type === "hour") {
                newDate.setHours(
                    (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
                );
            } else if (type === "minute") {
                newDate.setMinutes(parseInt(value));
            } else if (type === "ampm") {
                const currentHours = newDate.getHours();
                newDate.setHours(
                    value === "PM"
                        ? currentHours >= 12
                            ? currentHours
                            : currentHours + 12
                        : currentHours >= 12
                            ? currentHours - 12
                            : currentHours
                );
            }
            // Ensure the new date-time is not before minDate
            if (minDate && newDate < minDate) {
                setDate(minDate);
                onChange?.(minDate);
            } else {
                setDate(newDate);
                onChange?.(newDate);
            }
        }
    };

    // Helper to check if a date is on the same day as minDate
    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                        format(date, "MM/dd/yyyy hh:mm aa")
                    ) : (
                        <span>MM/DD/YYYY hh:mm aa</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="sm:flex">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={(date) => minDate ? date < minDate : false} // Disable dates before minDate
                    />
                    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {hours.reverse().map((hour) => {
                                    const testDate = date ? new Date(date) : new Date();
                                    testDate.setHours(
                                        (hour % 12) + (testDate.getHours() >= 12 ? 12 : 0)
                                    );
                                    const isDisabled =
                                        minDate &&
                                        testDate < minDate &&
                                        (!date || !isSameDay(testDate, minDate));
                                    return (
                                        <Button
                                            key={hour}
                                            size="icon"
                                            variant={
                                                date && date.getHours() % 12 === hour % 12
                                                    ? "default"
                                                    : "ghost"
                                            }
                                            className="sm:w-full shrink-0 aspect-square"
                                            onClick={() => handleTimeChange("hour", hour.toString())}
                                            disabled={isDisabled}
                                        >
                                            {hour}
                                        </Button>
                                    );
                                })}
                            </div>
                            <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => {
                                    const testDate = date ? new Date(date) : new Date();
                                    testDate.setMinutes(minute);
                                    const isDisabled =
                                        minDate &&
                                        testDate < minDate &&
                                        (!date || !isSameDay(testDate, minDate));
                                    return (
                                        <Button
                                            key={minute}
                                            size="icon"
                                            variant={
                                                date && date.getMinutes() === minute ? "default" : "ghost"
                                            }
                                            className="sm:w-full shrink-0 aspect-square"
                                            onClick={() => handleTimeChange("minute", minute.toString())}
                                            disabled={isDisabled}
                                        >
                                            {minute}
                                        </Button>
                                    );
                                })}
                            </div>
                            <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                        <ScrollArea className="">
                            <div className="flex sm:flex-col p-2">
                                {["AM", "PM"].map((ampm) => {
                                    const testDate = date ? new Date(date) : new Date();
                                    const currentHours = testDate.getHours();
                                    testDate.setHours(
                                        ampm === "PM"
                                            ? currentHours >= 12
                                                ? currentHours
                                                : currentHours + 12
                                            : currentHours >= 12
                                                ? currentHours - 12
                                                : currentHours
                                    );
                                    const isDisabled =
                                        minDate &&
                                        testDate < minDate &&
                                        (!date || !isSameDay(testDate, minDate));
                                    return (
                                        <Button
                                            key={ampm}
                                            size="icon"
                                            variant={
                                                date &&
                                                    ((ampm === "AM" && date.getHours() < 12) ||
                                                        (ampm === "PM" && date.getHours() >= 12))
                                                    ? "default"
                                                    : "ghost"
                                            }
                                            className="sm:w-full shrink-0 aspect-square"
                                            onClick={() => handleTimeChange("ampm", ampm)}
                                            disabled={isDisabled}
                                        >
                                            {ampm}
                                        </Button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}