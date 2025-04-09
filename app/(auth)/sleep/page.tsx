'use client';

import { SleepEntryCard } from "@/components/sleep-entry-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTimeWithDate, parseUTCTimestampToLocal } from "@/lib/utils";
import { Bed, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Define the sleep data type
type SleepEntry = {
    id: number;
    day?: string;
    startDate: string;
    endDate: string;
    hours: number;
};

const Sleep = () => {
    // State for sleep data
    const [sleepData, setSleepData] = useState<SleepEntry[]>([]);
    const [averageSleep, setAverageSleep] = useState(0);

    const formatTime = (dateStr: string): string => {
        const date = parseUTCTimestampToLocal(dateStr);
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    };

    // Fetch sleep entries on component mount
    useEffect(() => {
        const fetchSleepEntries = async () => {
            try {
                const response = await fetch("/api/sleep");
                if (!response.ok) {
                    throw new Error("Failed to fetch sleep entries");
                }
                const { sleepEntries } = await response.json();
                const formattedEntries: SleepEntry[] = sleepEntries.map((entry: { id: string; startDate: string; endDate: string }) => {
                    const localStartDate = parseUTCTimestampToLocal(entry.startDate);
                    const localEndDate = parseUTCTimestampToLocal(entry.endDate);
                    const hours = (localEndDate.getTime() - localStartDate.getTime()) / (1000 * 60 * 60);
                    console.log(`Entry ${entry.id}: Start ${localStartDate.toLocaleString()} - End ${localEndDate.toLocaleString()}, Hours: ${hours}`);
                    return {
                        id: parseInt(entry.id),
                        day: localStartDate.toLocaleDateString("en-US", { weekday: "long" }),
                        startDate: localStartDate.toISOString(),
                        endDate: localEndDate.toISOString(),
                        hours,
                    };
                });
                setSleepData(formattedEntries);
                const total = formattedEntries.reduce((sum: number, entry: SleepEntry) => sum + entry.hours, 0);
                setAverageSleep(formattedEntries.length > 0 ? total / formattedEntries.length : 0);
            } catch (error) {
                console.error("Error fetching sleep entries:", error);
            }
        };
        fetchSleepEntries();
    }, []);

    // Handle adding a new sleep entry
    const handleAddEntry = async (entry: { startDate: string; endDate: string; hours: number }) => {
        try {
            const response = await fetch("/api/sleep", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startDate: entry.startDate,
                    endDate: entry.endDate,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save sleep entry");
            }

            const { sleepEntry } = await response.json();
            // Convert UTC timestamps to local time
            const localStartDate = parseUTCTimestampToLocal(sleepEntry.startDate);
            const localEndDate = parseUTCTimestampToLocal(sleepEntry.endDate);
            const hours = (localEndDate.getTime() - localStartDate.getTime()) / (1000 * 60 * 60);

            const newEntry: SleepEntry = {
                id: parseInt(sleepEntry.id),
                day: localStartDate.toLocaleDateString("en-US", { weekday: "long" }),
                startDate: localStartDate.toISOString(), // Keep as UTC for storage
                endDate: localEndDate.toISOString(),
                hours,
            };

            setSleepData((prev) => [...prev, newEntry]);
            const total = [...sleepData, newEntry].reduce((sum: number, entry: SleepEntry) => sum + entry.hours, 0);
            setAverageSleep([...sleepData, newEntry].length > 0 ? total / [...sleepData, newEntry].length : 0);

            toast.success("Sleep entry saved!");
        } catch (error) {
            console.error("Error saving sleep entry:", error);
        }
    };

    const quality = averageSleep >= 8
        ? "Great"
        : averageSleep >= 7
            ? "Good"
            : averageSleep >= 6
                ? "Fair"
                : "Poor";

    const qualityColor = averageSleep >= 8
        ? "text-green-500"
        : averageSleep >= 7
            ? "text-green-400"
            : averageSleep >= 6
                ? "text-yellow-500"
                : "text-red-500";

    return (
        <div className="space-y-6 h-screen flex flex-col p-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Sleep Tracker</h1>
                <p className="text-muted-foreground">
                    Track and improve your sleep habits.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Average Sleep</CardTitle>
                        <Clock className="h-6 w-6 text-sleep" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageSleep.toFixed(1)} hours</div>
                        <p className="text-xs">
                            Quality: <span className={qualityColor}>{quality}</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Last Night</CardTitle>
                        <Bed className="h-6 w-6 text-sleep" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {sleepData.length > 0 ? `${sleepData[sleepData.length - 1].hours.toFixed(1)} hours` : "No data"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {sleepData.length > 0 ? sleepData[sleepData.length - 1].day : ""}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Entries</CardTitle>
                        <Calendar className="h-6 w-6 text-sleep" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sleepData.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Total sleep records
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="add" className="space-y-4 flex-1 flex flex-col">
                <TabsList>
                    <TabsTrigger value="add">Add Entry</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="data">Data-testing</TabsTrigger>
                </TabsList>

                <TabsContent value="add" className="space-y-4 flex-1 overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Graph Card: 70% width */}
                        <Card className="w-full md:w-[65%]">
                            <CardContent className="pt-6">
                                {/* <SleepGraph data={sleepData} /> */}
                            </CardContent>
                        </Card>
                        {/* Clock Card: 30% width */}
                        <Card className="w-full md:w-[35%] flex justify-center">
                            <CardContent className="pt-6 flex justify-center">
                                <SleepEntryCard onSave={handleAddEntry} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    {/* <Card className="p-6">
            <div className="h-[500px]">
            </div>
          </Card> */}
                </TabsContent>

                <TabsContent value="data" className="space-y-4">
                    <Card className="p-6">
                        <div className="space-y-4">
                            {sleepData.length === 0 ? (
                                <p className="text-center text-muted-foreground">No sleep entries found.</p>
                            ) : (
                                sleepData.map((entry) => {
                                    console.log(entry.startDate, entry.endDate);
                                    const start = formatTimeWithDate(entry.startDate);
                                    const end = formatTimeWithDate(entry.endDate);
                                    return (
                                        <div key={entry.id} className="flex justify-between items-center border-b pb-2">
                                            <div>
                                                <p className="text-sm font-medium">{entry.day}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {start.date} {start.time} - {end.date} {end.time}
                                                </p>
                                            </div>
                                            <p className="text-sm font-medium">{entry.hours.toFixed(1)} hours</p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Sleep;