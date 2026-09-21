import { NextResponse } from "next/server";
import { db } from "@/db";
import { applications } from "@/db/schema";

export async function POST(request: Request) {
  try {
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
        { error: "Company and job title are required" },
        { status: 400 }
      );
    }

    const newApplication = await db
      .insert(applications)
      .values({
        userId: "demo-user",
        company,
        jobTitle,
        location: location || null,
        jobUrl: jobUrl || null,
        salary: salary || null,
        status: status || "Wishlist",

        // Important: empty date becomes null
        appliedDate: appliedDate || null,

        notes: notes || null,
      })
      .returning();

    return NextResponse.json(newApplication[0], {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating application:", error);

    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}