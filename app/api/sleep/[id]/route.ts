import { deleteSleepEntry } from "@/db/queries/delete";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

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
    const sleepEntryId = parseInt(id);
    if (isNaN(sleepEntryId)) {
      return NextResponse.json(
        { error: "Invalid sleep entry ID" },
        { status: 400 }
      );
    }

    await deleteSleepEntry(sleepEntryId);

    return NextResponse.json(
      { message: "Sleep entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting sleep entry:", error);
    return NextResponse.json(
      { error: "Failed to delete sleep entry" },
      { status: 500 }
    );
  }
}
