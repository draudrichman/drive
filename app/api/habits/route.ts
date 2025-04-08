// Create a new file: app/api/habits/route.ts
import { createHabit } from "@/db/queries/insert";
import { getUserHabits } from "@/db/queries/select";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Get habits
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const habits = await getUserHabits(user.id);
    return NextResponse.json({ habits });
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json(
      { error: "Failed to fetch habits" },
      { status: 500 }
    );
  }
}

// Create habit
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const habitData = await request.json();

    // Add the user ID to the habit data
    const newHabitData = {
      ...habitData,
      userId: user.id,
    };

    const newHabit = await createHabit(newHabitData);
    return NextResponse.json({ habit: newHabit });
  } catch (error) {
    console.error("Error creating habit:", error);
    return NextResponse.json(
      { error: "Failed to create habit" },
      { status: 500 }
    );
  }
}

