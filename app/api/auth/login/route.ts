import { NextResponse } from "next/server";
export async function GET(){
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://soundgit.online";
  return NextResponse.redirect(new URL("/login", base));
}
