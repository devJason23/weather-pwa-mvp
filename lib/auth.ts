"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { constantCompare, COOKIE_NAME, sessionToken } from "@/lib/session";

async function hasValidAdminSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return Boolean(token && constantCompare(token, sessionToken(env.ADMIN_EMAIL, env.SESSION_SECRET)));
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (email !== env.ADMIN_EMAIL || !constantCompare(password, env.ADMIN_PASSWORD)) {
    redirect("/login?error=invalid");
  }

  (await cookies()).set(COOKIE_NAME, sessionToken(env.ADMIN_EMAIL, env.SESSION_SECRET), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  redirect("/admin");
}

export async function signOut() {
  (await cookies()).delete(COOKIE_NAME);
  redirect("/login");
}

export async function requireAdmin() {
  if (!(await hasValidAdminSession())) {
    redirect("/login");
  }

  return {
    email: env.ADMIN_EMAIL,
    name: "Admin"
  };
}
