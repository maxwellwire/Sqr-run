import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentSeason } from "@/lib/season";
import { runSchema } from "@/lib/validation";
import { validateRun } from "@/lib/game-validation";

export async function POST(req: Request) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized."
        },
        {
          status: 401
        }
      );
    }

    const body = await req.json();

    const parsed =
      runSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid run data."
        },
        {
          status: 400
        }
      );
    }

    const season =
      await getCurrentSeason();

    if (!season) {
      return NextResponse.json(
        {
          error:
            "There is no active season."
        },
        {
          status: 409
        }
      );
    }

    if (season.status !== "LIVE") {
      return NextResponse.json(
        {
          error:
            "The season is not currently live."
        },
        {
          status: 409
        }
      );
    }

    const data = parsed.data;

    const startedAt =
      new Date(data.startedAt);

    const endedAt =
      new Date(data.endedAt);

    const validation =
      validateRun({
        distance: data.distance,
        durationMs: data.durationMs,
        collectibles:
          data.collectibles,
        startedAt,
        endedAt
      });

    /*
     * Prevent submitting the same run
     * multiple times within a very short
     * period.
     */
    const recentRun =
      await db.gameRun.findFirst({
        where: {
          userId: user.id,
          seasonId: season.id,
          createdAt: {
            gt: new Date(
              Date.now() - 5000
            )
          }
        }
      });

    if (recentRun) {
      return NextResponse.json(
        {
          error:
            "Duplicate run submission."
        },
        {
          status: 409
        }
      );
    }

    /*
     * Suspicious runs are stored rather
     * than silently discarded so the admin
     * can review them later.
     */
    if (!validation.valid) {
      await db.gameRun.create({
        data: {
          userId: user.id,
          seasonId: season.id,
          distance: data.distance,
          durationMs: data.durationMs,
          collectibles:
            data.collectibles,
          startedAt,
          endedAt,
          status: "SUSPICIOUS",
          validationReason:
            validation.reason
        }
      });

      return NextResponse.json({
        ok: false,
        status: "SUSPICIOUS"
      });
    }

    /*
     * Save valid run.
     */
    await db.gameRun.create({
      data: {
        userId: user.id,
        seasonId: season.id,
        distance: data.distance,
        durationMs: data.durationMs,
        collectibles:
          data.collectibles,
        startedAt,
        endedAt,
        status: "VALID"
      }
    });

    /*
     * Update personal best.
     */
    const newBest =
      data.distance >
      user.bestDistance;

    if (newBest) {
      await db.user.update({
        where: {
          id: user.id
        },
        data: {
          bestDistance:
            data.distance
        }
      });
    }

    return NextResponse.json({
      ok: true,
      newBest
    });
  } catch (error) {
    console.error(
      "Run submission error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not submit run."
      },
      {
        status: 500
      }
    );
  }
}