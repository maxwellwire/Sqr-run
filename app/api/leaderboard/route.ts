import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSeason } from "@/lib/season";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const season =
      await getCurrentSeason();

    if (!season) {
      return NextResponse.json({
        season: null,
        leaders: [],
        mine: null
      });
    }

    /*
     * Get each player's highest valid
     * distance for the current season.
     */
    const grouped =
      await db.gameRun.groupBy({
        by: ["userId"],

        where: {
          seasonId: season.id,
          status: "VALID"
        },

        _max: {
          distance: true
        }
      });

    const userIds =
      grouped.map(
        (item) => item.userId
      );

    const users =
      userIds.length > 0
        ? await db.user.findMany({
            where: {
              id: {
                in: userIds
              },

              isSuspended: false
            },

            select: {
              id: true,
              username: true
            }
          })
        : [];

    const userMap =
      new Map(
        users.map((user) => [
          user.id,
          user
        ])
      );

    const leaderboard =
      grouped
        .map((item) => {
          const user =
            userMap.get(
              item.userId
            );

          if (!user) {
            return null;
          }

          return {
            userId: user.id,

            username:
              user.username,

            distance:
              item._max.distance ||
              0
          };
        })
        .filter(
          (
            item
          ): item is {
            userId: string;
            username: string;
            distance: number;
          } =>
            item !== null
        )
        .sort(
          (a, b) =>
            b.distance -
            a.distance
        )
        .map(
          (player, index) => ({
            rank: index + 1,
            ...player
          })
        );

    const topPlayers =
      leaderboard.slice(0, 100);

    const currentUser =
      await getCurrentUser();

    const mine =
      currentUser
        ? leaderboard.find(
            (player) =>
              player.userId ===
              currentUser.id
          ) || null
        : null;

    return NextResponse.json({
      season: {
        name: season.name,
        endDate:
          season.endDate
      },

      leaders:
        topPlayers,

      mine
    });
  } catch (error) {
    console.error(
      "Leaderboard error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not load leaderboard."
      },
      {
        status: 500
      }
    );
  }
}