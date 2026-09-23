import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      company,
      jobTitle,
      location,
      jobUrl,
      salary,
      status,
      appliedDate,
      notes,
    } = body;

    if (!company || !jobTitle) {
      return NextResponse.json(
        {
          error: "Company and job title are required",
        },
        { status: 400 }
      );
    }

    const newApplication = await db
      .insert(applications)
      .values({
        userId,

        company,
        jobTitle,

        location: location || null,
        jobUrl: jobUrl || null,
        salary: salary || null,

        status: status || "Wishlist",

        appliedDate: appliedDate || null,

        notes: notes || null,
      })
      .returning();

    return NextResponse.json(
      newApplication[0],
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Error creating application:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create application",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));

    return NextResponse.json(userApplications);
  } catch (error) {
    console.error(
      "Error fetching applications:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}