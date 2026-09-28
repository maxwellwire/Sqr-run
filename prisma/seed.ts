import { PrismaClient, SeasonStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const now = new Date();

  await db.season.upsert({
    where: {
      name: "SEASON 01"
    },
    update: {},
    create: {
      name: "SEASON 01",
      startDate: now,
      endDate: new Date(now.getTime() + 30 * 86400000),
      status: SeasonStatus.LIVE
    }
  });

  const secret = process.env.ADMIN_SECRET;

  if (secret) {
    const secretHash = await bcrypt.hash(secret, 12);

    await db.admin.upsert({
      where: {
        username: "admin"
      },
      update: {
        secretHash
      },
      create: {
        username: "admin",
        secretHash
      }
    });
  }
}

main().finally(() => {
  db.$disconnect();
});