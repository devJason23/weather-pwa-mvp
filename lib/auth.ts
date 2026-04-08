"use server";

import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";

const COOKIE_NAME = "courtreview_session";

function sessionToken() {
  return createHash("sha256").update(`${env.ADMIN_EMAIL}:${env.SESSION_SECRET}`).digest("hex");
}

function constantCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (email !== env.ADMIN_EMAIL || !constantCompare(password, env.ADMIN_PASSWORD)) {
    redirect("/login?error=invalid");
  }

  (await cookies()).set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  redirect("/");
}

export async function signOut() {
  (await cookies()).delete(COOKIE_NAME);
  redirect("/login");
}

export async function requireAdmin() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !constantCompare(token, sessionToken())) {
    redirect("/login");
  }

  return {
    email: env.ADMIN_EMAIL,
    name: "Admin"
  };
}
