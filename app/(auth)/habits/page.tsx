"use client";

import { HabitsSection } from "@/components/habits-section";
import { Card } from "@/components/ui/card";
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
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Placeholder Card 1</h3>
            <p className="text-sm text-muted-foreground">
              Add your content here later.
            </p>
          </Card>
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Placeholder Card 2</h3>
            <p className="text-sm text-muted-foreground">
              Add your content here later.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}