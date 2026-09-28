import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";

const COOKIE_NAME = "sqr_session";

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");

  const days = Number(
    process.env.SESSION_DAYS || "30"
  );

  const expiresAt = new Date(
    Date.now() + days * 86400000
  );

  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt
    }
  });

  const cookieStore = await cookies();

  cookieStore.set(
    COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/"
    }
  );
}

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore
    .get(COOKIE_NAME)
    ?.value;

  if (!token) {
    return null;
  }

  const session = await db.session.findUnique({
    where: {
      tokenHash: hashToken(token)
    },
    include: {
      user: true
    }
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    return null;
  }

  if (session.user.isSuspended) {
    return null;
  }

  return session.user;
}

export async function destroySession() {
  const cookieStore = await cookies();

  const token = cookieStore
    .get(COOKIE_NAME)
    ?.value;

  if (token) {
    await db.session.deleteMany({
      where: {
        tokenHash: hashToken(token)
      }
    });
  }

  cookieStore.delete(COOKIE_NAME);
}

export async function hashPin(pin: string) {
  return bcrypt.hash(pin, 12);
}

export async function verifyPin(
  pin: string,
  hash: string
) {
  return bcrypt.compare(pin, hash);
}