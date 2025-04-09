import { deleteHabit } from "@/db/queries/delete";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { updateHabit } from "@/db/queries/update"; // You'll create this query


export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const habitId = parseInt(id);
    if (isNaN(habitId)) {
      return NextResponse.json({ error: "Invalid habit ID" }, { status: 400 });
    }

    await deleteHabit(habitId);

    return NextResponse.json(
      { message: "Habit deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting habit:", error);
    return NextResponse.json(
      { error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const habitData = await request.json();
    const habitId = parseInt(id);
    if (isNaN(habitId)) {
      return NextResponse.json({ error: "Invalid habit ID" }, { status: 400 });
    }

    const updatedHabit = await updateHabit(habitId, {
      name: habitData.name,
      category: habitData.category,
      icon: habitData.icon,
      color: habitData.color,
      description: habitData.description,
    });

    return NextResponse.json({ habit: updatedHabit });
  } catch (error) {
    console.error("Error updating habit:", error);
    return NextResponse.json(
      { error: "Failed to update habit" },
      { status: 500 }
    );
  }
}
