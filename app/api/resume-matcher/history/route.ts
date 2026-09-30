import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { resumeMatchers } from "@/db/schema";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const history = await db
      .select({
        id: resumeMatchers.id,
        resumeName: resumeMatchers.resumeName,
        matchScore: resumeMatchers.matchScore,
        summary: resumeMatchers.summary,
        createdAt: resumeMatchers.createdAt,
      })
      .from(resumeMatchers)
      .where(eq(resumeMatchers.userId, userId))
      .orderBy(desc(resumeMatchers.createdAt));

    return NextResponse.json(history);
  } catch (error) {
    console.error("Resume history error:", error);

    return NextResponse.json(
      { error: "Failed to load resume match history" },
      { status: 500 }
    );
  }
}