import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

// Dummy data
const dummyHabits = [
    { id: '1', name: 'Drink water', completed: true },
    { id: '2', name: 'Exercise', completed: false },
    { id: '3', name: 'Read', completed: true },
];
const dummyStreaks = [3, 0, 5]; // Streak days for each habit
const dummySleepData = [
    { id: '1', hours: 7.5, day: 'Mon Mar 24' },
    { id: '2', hours: 6.8, day: 'Tue Mar 25' },
    { id: '3', hours: 8.0, day: 'Wed Mar 26' },
    { id: '4', hours: 7.2, day: 'Thu Mar 27' },
    { id: '5', hours: 6.5, day: 'Fri Mar 28' },
    { id: '6', hours: 7.8, day: 'Sat Mar 29' },
    { id: '7', hours: 8.2, day: 'Sun Mar 30' },
];

// Mock data types (replace with real Supabase schema later)
type Habit = { id: string; name: string; completed: boolean };
type SleepEntry = { id: string; hours: number; day: string };

async function getHabitsAndStreaks() {
    const supabase = await createClient();
    // const { data, error } = await supabase.from('habits').select('*');
    // if (error) throw new Error(error.message);

    // const habits = data as Habit[];
    // Simplified streak calculation (assumes a 'completed' field)
    // const streaks = habits.map(h => (h.completed ? 1 : 0)); // Replace with real logic
    // return { habits, streaks };
}

async function getSleepData() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('sleep_logs').select('hours, day').order('day', { ascending: false }).limit(7);
    if (error) throw new Error(error.message);

    const sleepData = data as SleepEntry[];
    const averageSleep = sleepData.length > 0 ? sleepData.reduce((sum, d) => sum + d.hours, 0) / sleepData.length : 0;
    return { sleepData, averageSleep };
}

export default async function Dashboard() {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
        redirect('/login');
    }

    // const { habits, streaks } = await getHabitsAndStreaks();
    // const { sleepData, averageSleep } = await getSleepData();

    // const totalHabits = habits.length;
    // const activeStreaks = streaks.filter(streak => streak > 0).length;
    // const lastSleep = sleepData.length > 0 ? sleepData[0].hours : 0;

    const habits = dummyHabits;
    const streaks = dummyStreaks;
    const sleepData = dummySleepData;
    const totalHabits = habits.length;
    const activeStreaks = streaks.filter(streak => streak > 0).length;
    const lastSleep = sleepData.length > 0 ? sleepData[0].hours : 0;
    const averageSleep = sleepData.length > 0 ? sleepData.reduce((sum, d) => sum + d.hours, 0) / sleepData.length : 0;

    return (
        <div className="space-y-6 p-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-gray-500">Welcome to Drive, your productivity hub.</p>
                <ThemeToggle />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/habits">
                    <Card className="hover:bg-gray-50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
                            <BarChart className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalHabits}</div>
                            <p className="text-xs text-gray-500">{activeStreaks} with active streaks</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/sleep">
                    <Card className="hover:bg-gray-50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Last Night&apos;s Sleep</CardTitle>
                            <Bed className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lastSleep.toFixed(1)}h</div>
                            <p className="text-xs text-gray-500">{averageSleep.toFixed(1)}h average</p>
                        </CardContent>
                    </Card>
                </Link>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                        <BarChart className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.max(...streaks, 0)} days</div>
                        <p className="text-xs text-gray-500">Your longest active streak</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Habit Tracker</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center">
                            <div className="grid grid-cols-7 gap-1">
                                {[...Array(28)].map((_, i) => {
                                    const level = Math.min(Math.floor(Math.random() * 5), 4); // Random dummy data
                                    return (
                                        <div
                                            key={i}
                                            className={`h-6 w-6 rounded ${level === 0
                                                ? "bg-blue-100"
                                                : level === 1
                                                    ? "bg-blue-200"
                                                    : level === 2
                                                        ? "bg-blue-300"
                                                        : level === 3
                                                            ? "bg-blue-400"
                                                            : "bg-blue-600"
                                                }`}
                                            title={`${level} contributions`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sleep Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="sleep-graph flex items-end space-x-2 pt-2 h-[150px]">
                            {sleepData.map((day, i) => {
                                const height = (day.hours / 12) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="text-xs">{day.hours}h</div>
                                        <div
                                            className="w-full bg-green-200 rounded-t"
                                            style={{ height: `${height}%` }}
                                        />
                                        <div className="text-xs text-gray-500">{day.day.substring(0, 3)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}