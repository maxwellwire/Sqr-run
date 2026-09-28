import { db } from "./db";
import { SeasonStatus } from "@prisma/client";

export async function getCurrentSeason() {
  const now = new Date();

  return db.season.findFirst({
    where: {
      startDate: {
        lte: now
      },

      endDate: {
        gte: now
      },

      status: {
        in: [
          SeasonStatus.LIVE,
          SeasonStatus.PAUSED
        ]
      }
    },

    orderBy: {
      startDate: "desc"
    }
  });
}