'use client';

import { SleepEntryCard } from "@/components/sleep-entry-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bed, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";

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

    // Fetch sleep entries on component mount
    useEffect(() => {
        const fetchSleepEntries = async () => {
            try {
                const response = await fetch("/api/sleep");
                if (!response.ok) {
                    throw new Error("Failed to fetch sleep entries");
                }
                const { sleepEntries } = await response.json();
                const formattedEntries: SleepEntry[] = sleepEntries.map((entry: { id: string; startDate: string; endDate: string }) => ({
                    id: parseInt(entry.id),
                    day: new Date(entry.startDate).toLocaleDateString("en-US", { weekday: "long" }),
                    startDate: entry.startDate,
                    endDate: entry.endDate,
                    hours: (new Date(entry.endDate).getTime() - new Date(entry.startDate).getTime()) / (1000 * 60 * 60),
                }));
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
            const newEntry: SleepEntry = {
                id: parseInt(sleepEntry.id),
                day: new Date(sleepEntry.startDate).toLocaleDateString("en-US", { weekday: "long" }),
                startDate: sleepEntry.startDate,
                endDate: sleepEntry.endDate,
                hours: (new Date(sleepEntry.endDate).getTime() - new Date(sleepEntry.startDate).getTime()) / (1000 * 60 * 60),
            };

            setSleepData((prev) => [...prev, newEntry]);
            const total = [...sleepData, newEntry].reduce((sum: number, entry: SleepEntry) => sum + entry.hours, 0);
            setAverageSleep([...sleepData, newEntry].length > 0 ? total / [...sleepData, newEntry].length : 0);
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
            </Tabs>
        </div>
    );
};

export default Sleep;