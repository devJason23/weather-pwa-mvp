import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(4),
  SESSION_SECRET: z.string().min(8),
  SHADOW_MODE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  STORAGE_DRIVER: z.string().default("local"),
  NEXT_PUBLIC_APP_NAME: z.string().default("CourtReview AI")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  SESSION_SECRET: process.env.SESSION_SECRET,
  SHADOW_MODE: process.env.SHADOW_MODE,
  STORAGE_DRIVER: process.env.STORAGE_DRIVER,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME
});
