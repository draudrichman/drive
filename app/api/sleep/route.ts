import { createSleepEntry } from "@/db/queries/insert";
import { getUserSleepEntries } from "@/db/queries/select";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Get sleep entries
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;

    const sleepEntries = await getUserSleepEntries(user.id, startDate, endDate);
    return NextResponse.json({ sleepEntries });
  } catch (error) {
    console.error("Error fetching sleep entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch sleep entries" },
      { status: 500 }
    );
  }
}

// Create sleep entry
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sleepEntryData = await request.json();

    const newSleepEntryData = {
      ...sleepEntryData,
      userId: user.id,
      startDate: new Date(sleepEntryData.startDate),
      endDate: new Date(sleepEntryData.endDate),
    };

    const newSleepEntry = await createSleepEntry(newSleepEntryData);
    return NextResponse.json({ sleepEntry: newSleepEntry });
  } catch (error) {
    console.error("Error creating sleep entry:", error);
    return NextResponse.json(
      { error: "Failed to create sleep entry" },
      { status: 500 }
    );
  }
}
