import { deleteHabitCompletion } from "@/db/queries/delete";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {

  const id = (await params).id;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const completionId = parseInt(id);
    if (isNaN(completionId)) {
      return NextResponse.json(
        { error: "Invalid completion ID" },
        { status: 400 }
      );
    }

    await deleteHabitCompletion(completionId);

    return NextResponse.json(
      { message: "Habit completion deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting habit completion:", error);
    return NextResponse.json(
      { error: "Failed to delete habit completion" },
      { status: 500 }
    );
  }
}
