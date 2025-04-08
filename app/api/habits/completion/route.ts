// app/api/habits/completion/route.ts
import { createHabitCompletion } from "@/db/queries/insert";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const completionData = await request.json();
    const newCompletion = await createHabitCompletion(completionData);
    return NextResponse.json({ completion: newCompletion });
  } catch (error) {
    console.error("Error creating habit completion:", error);
    return NextResponse.json(
      { error: "Failed to create habit completion" },
      { status: 500 }
    );
  }
}
