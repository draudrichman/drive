'use client';

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SleepClock from "./sleep-clock";
import { toast } from "sonner"; // Add this import at the top
import { DateTimePicker } from "./ui/date-time-picker";

export function SleepEntryCard({
    onSave,
}: {
    onSave: (entry: { startDate: string; endDate: string; hours: number }) => void;
}) {
    const [startDateTime, setStartDateTime] = useState<Date | undefined>(() => {
        const now = new Date();
        now.setHours(22, 0, 0, 0); // Default to 10:00 PM local time
        return now;
    });
    const [endDateTime, setEndDateTime] = useState<Date | undefined>(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(6, 0, 0, 0); // Default to 6:00 AM local time the next day
        return tomorrow;
    });

    // Extract time strings for SleepClock (local time)
    const formatTime = (date: Date | undefined): string => {
        if (!date) return "00:00";
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    };

    const startTime = formatTime(startDateTime);
    const endTime = formatTime(endDateTime);

    // Calculate sleep duration in hours
    const calculateDuration = () => {
        if (!startDateTime || !endDateTime) return 0;
        const start = new Date(startDateTime);
        let end = new Date(endDateTime);

        // If end is before start, assume end is on the next day
        if (end < start) {
            end = new Date(end);
            end.setDate(end.getDate() + 1);
        }

        const diff = end.getTime() - start.getTime();
        const hours = diff / (1000 * 60 * 60); // Convert to hours
        return hours;
    };

    const duration = calculateDuration();

    const handleSave = () => {
        if (!startDateTime || !endDateTime) return; // Ensure a date is selected

        // Check if endDateTime is before startDateTime
        if (endDateTime.getTime() < startDateTime.getTime()) {
            // console.log(startDateTime, endDateTime);
            toast.warning("End time cannot be before start time. Please adjust the times.");
            return;
        }

        onSave({
            startDate: startDateTime.toISOString(), // Save as UTC
            endDate: endDateTime.toISOString(),     // Save as UTC
            hours: duration,
        });
    };

    return (
        <div className="p-2 max-w-md mx-auto">
            <div className="flex flex-col items-center space-y-6">
                {/* Clock Visualization */}
                <div className="relative">
                    <SleepClock
                        startTime={startTime}
                        setStartTime={(time) => {
                            if (!startDateTime) return;
                            const [hours, minutes] = time.split(":").map(Number);
                            const newDate = new Date(startDateTime);
                            newDate.setHours(hours, minutes, 0, 0);
                            setStartDateTime(newDate);
                        }}
                        endTime={endTime}
                        setEndTime={(time) => {
                            if (!endDateTime) return;
                            const [hours, minutes] = time.split(":").map(Number);
                            const newDate = new Date(endDateTime);
                            newDate.setHours(hours, minutes, 0, 0);
                            setEndDateTime(newDate);
                        }}
                        sleepHours={duration}
                        onSave={handleSave}
                    />
                    <div className="text-center text-sm text-gray-500 mt-2">
                        Sleep time: {duration.toFixed(1)} hours
                    </div>
                </div>

                {/* Date-Time Pickers */}
                <div className="w-full grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>From</Label>
                        <DateTimePicker
                            value={startDateTime}
                            onChange={(date) => {
                                setStartDateTime(date);
                                // If endDateTime is before the new startDateTime, adjust it
                                if (date && endDateTime && endDateTime < date) {
                                    const newEndDate = new Date(date);
                                    newEndDate.setHours(newEndDate.getHours() + 8); // Default to 8 hours later
                                    setEndDateTime(newEndDate);
                                }
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>To</Label>
                        <DateTimePicker
                            value={endDateTime}
                            onChange={(date) => {
                                setEndDateTime(date);
                            }}
                            minDate={startDateTime} // Pass startDateTime as minDate
                        />
                    </div>
                </div>

                <Button className="w-full" onClick={handleSave}>
                    Save Sleep Entry
                </Button>
            </div>
        </div>
    );
}