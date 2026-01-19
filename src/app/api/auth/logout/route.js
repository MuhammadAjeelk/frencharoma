import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const cookieOptions = clearAuthCookie();
    cookieStore.set(cookieOptions);

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
