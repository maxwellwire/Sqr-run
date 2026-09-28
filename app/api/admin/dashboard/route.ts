import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getCurrentSeason } from "@/lib/season";

export async function GET(
  request: Request
) {
  try {
    const url =
      new URL(request.url);

    const key =
      url.searchParams.get(
        "key"
      ) || "";

    if (!key) {
      return NextResponse.json(
        {
          error:
            "Admin authentication required."
        },
        {
          status: 401
        }
      );
    }

    const admins =
      await db.admin.findMany();

    let authorized = false;

    for (
      const admin of admins
    ) {
      const matches =
        await bcrypt.compare(
          key,
          admin.secretHash
        );

      if (matches) {
        authorized = true;
        break;
      }
    }

    if (!authorized) {
      return NextResponse.json(
        {
          error:
            "Unauthorized."
        },
        {
          status: 401
        }
      );
    }

    const season =
      await getCurrentSeason();

    const players =
      await db.user.count();

    const active =
      await db.user.count({
        where: {
          isSuspended: false
        }
      });

    const suspicious =
      await db.gameRun.count({
        where: {
          status: "SUSPICIOUS"
        }
      });

    const top =
      await db.user.findMany({
        orderBy: {
          bestDistance: "desc"
        },

        take: 100,

        select: {
          id: true,
          username: true,
          walletAddress: true,
          bestDistance: true
        }
      });

    return NextResponse.json({
      stats: {
        players,
        active,
        suspicious
      },

      season,

      top
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not load dashboard."
      },
      {
        status: 500
      }
    );
  }
}