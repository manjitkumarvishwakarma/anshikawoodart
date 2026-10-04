"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// must match your adminAuth cookie name
const ADMIN_COOKIE = "admin_token";

export async function adminLogout() {
  const cookieStore = await cookies(); // IMPORTANT: await
  cookieStore.set(ADMIN_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });

  // optional but recommended: send user to login page
  redirect("/admin/login");
}