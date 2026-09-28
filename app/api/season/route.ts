import { NextResponse } from "next/server";
import { getCurrentSeason } from "@/lib/season";

export async function GET() {
  const season =
    await getCurrentSeason();

  if (!season) {
    return NextResponse.json({
      season: null
    });
  }

  return NextResponse.json({
    season: {
      id: season.id,
      name: season.name,
      startDate:
        season.startDate,
      endDate:
        season.endDate,
      status:
        season.status
    }
  });
}