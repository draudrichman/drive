import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SleepClock from "./sleep-clock";
import { DateTimePicker } from "./ui/date-time-picker";

export function SleepEntryCard({
    onSave,
}: {
    onSave: (entry: { startDate: string; endDate: string; hours: number }) => void;
}) {
    const [startDateTime, setStartDateTime] = useState<Date | undefined>(new Date());
    const [endDateTime, setEndDateTime] = useState<Date | undefined>(
        new Date(new Date().setHours(6, 0, 0, 0)) // Default to 6:00 AM
    );

    // Extract time strings for SleepClock
    const formatTime = (date: Date | undefined): string => {
        if (!date) return "00:00";
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    };

    const startTime = formatTime(startDateTime);
    const endTime = formatTime(endDateTime);

    // Calculate sleep duration in hours
    const calculateDuration = () => {
        if (!startDateTime || !endDateTime) return 0;
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        if (end < start) end.setDate(end.getDate() + 1);
        const diff = end.getTime() - start.getTime();
        return diff / (1000 * 60 * 60); // Convert to hours
    };

    const duration = calculateDuration();

    const handleSave = () => {
        if (!startDateTime || !endDateTime) return; // Ensure a date is selected
        onSave({
            startDate: startDateTime.toISOString(),
            endDate: endDateTime.toISOString(),
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
                            newDate.setHours(hours, minutes);
                            setStartDateTime(newDate);
                        }}
                        endTime={endTime}
                        setEndTime={(time) => {
                            if (!endDateTime) return;
                            const [hours, minutes] = time.split(":").map(Number);
                            const newDate = new Date(endDateTime);
                            newDate.setHours(hours, minutes);
                            setEndDateTime(newDate);
                        }}
                        sleepHours={duration}
                        onSave={handleSave}
                    />
                    <div className="text-center text-sm text-gray-500 mt-2">
                        Sleep time: {Math.floor(duration)} hours
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
                                // If endDateTime is before the new startDateTime, reset it
                                if (date && endDateTime && endDateTime < date) {
                                    setEndDateTime(new Date(date.getTime() + 60 * 60 * 1000)); // Set to 1 hour after start
                                }
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>To</Label>
                        <DateTimePicker
                            value={endDateTime}
                            onChange={setEndDateTime}
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