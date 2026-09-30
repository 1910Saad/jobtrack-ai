import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { resumeMatchers } from "@/db/schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const matcherId = Number(id);

    if (Number.isNaN(matcherId)) {
      return NextResponse.json(
        { error: "Invalid match ID" },
        { status: 400 }
      );
    }

    const [result] = await db
      .select()
      .from(resumeMatchers)
      .where(
        and(
          eq(resumeMatchers.id, matcherId),
          eq(resumeMatchers.userId, userId)
        )
      )
      .limit(1);

    if (!result) {
      return NextResponse.json(
        { error: "Resume match not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Resume match detail error:", error);

    return NextResponse.json(
      { error: "Failed to load resume match" },
      { status: 500 }
    );
  }
}