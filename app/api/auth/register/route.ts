import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createSession,
  hashPin
} from "@/lib/auth";
import { registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed =
      registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Invalid registration details."
        },
        {
          status: 400
        }
      );
    }

    const username =
      parsed.data.username.trim();

    const walletAddress =
      parsed.data.walletAddress
        .trim()
        .toLowerCase();

    const existingUser =
      await db.user.findFirst({
        where: {
          OR: [
            {
              username
            },
            {
              walletAddress
            }
          ]
        }
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Username or wallet address is already registered."
        },
        {
          status: 409
        }
      );
    }

    const pinHash =
      await hashPin(parsed.data.pin);

    const user =
      await db.user.create({
        data: {
          username,
          walletAddress,
          pinHash
        }
      });

    await createSession(user.id);

    return NextResponse.json({
      ok: true
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Registration failed. Please try again."
      },
      {
        status: 500
      }
    );
  }
}