import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .regex(
      /^[A-Za-z0-9_]+$/,
      "Username can only contain letters, numbers and underscores."
    ),

  walletAddress: z
    .string()
    .trim()
    .regex(
      /^0x[a-fA-F0-9]{40}$/,
      "Enter a valid EVM wallet address."
    ),

  pin: z
    .string()
    .regex(
      /^\d{4,8}$/,
      "PIN must contain 4 to 8 digits."
    )
});

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(20),

  pin: z
    .string()
    .regex(
      /^\d{4,8}$/,
      "PIN must contain 4 to 8 digits."
    )
});

export const runSchema = z.object({
  distance: z
    .number()
    .int()
    .min(0)
    .max(1000000),

  durationMs: z
    .number()
    .int()
    .min(1000)
    .max(3600000),

  collectibles: z
    .number()
    .int()
    .min(0)
    .max(100000),

  startedAt: z
    .string()
    .datetime(),

  endedAt: z
    .string()
    .datetime()
});