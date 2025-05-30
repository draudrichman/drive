"use client";

import { HabitsSection } from "@/components/habits-section";
import PushupCounter from "@/components/pushup-counter";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WaterTracker from "@/components/water-intake";
import { useEffect, useState } from "react";

export default function HabitsPage() {
  const [userHabits, setUserHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        // Fetch habits through the API route instead of directly using the DB
        const response = await fetch('/api/habits');

        if (!response.ok) {
          throw new Error('Failed to fetch habits');
        }

        const data = await response.json();
        setUserHabits(data.habits);
      } catch (error) {
        console.error("Error fetching habits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHabits();
  }, []);

  return (
    <div className="px-4 py-6 sm:px-8 sm:pt-6">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Habits</h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 3/4 for HabitsSection */}
        <div className="lg:col-span-3">
          <HabitsSection habits={userHabits} isLoading={isLoading} />
        </div>

        {/* 1/4 for Placeholder Cards */}
        <div className="lg:col-span-1 space-y-4">
          {/* <Tabs defaultValue="water" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="water">Water</TabsTrigger>
              <TabsTrigger value="pushups">Pushups</TabsTrigger>
            </TabsList>
            <TabsContent value="water"> */}
          <PushupCounter />
          <WaterTracker />
          {/* </TabsContent> */}
          {/* <TabsContent value="pushups"> */}
          {/* </TabsContent>
          </Tabs> */}
        </div>
      </div>
    </div>
  );
}