import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createSession,
  verifyPin
} from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed =
      loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid login details."
        },
        {
          status: 400
        }
      );
    }

    const username =
      parsed.data.username.trim();

    const user =
      await db.user.findUnique({
        where: {
          username
        }
      });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Invalid username or PIN."
        },
        {
          status: 401
        }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        {
          error:
            "This account has been suspended."
        },
        {
          status: 403
        }
      );
    }

    const validPin =
      await verifyPin(
        parsed.data.pin,
        user.pinHash
      );

    if (!validPin) {
      return NextResponse.json(
        {
          error:
            "Invalid username or PIN."
        },
        {
          status: 401
        }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      ok: true
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Login failed. Please try again."
      },
      {
        status: 500
      }
    );
  }
}