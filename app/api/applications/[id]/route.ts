import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
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
    const applicationId = Number(id);

    if (Number.isNaN(applicationId)) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.id, applicationId),
          eq(applications.userId, userId)
        )
      );

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching application:", error);

    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext
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
    const applicationId = Number(id);

    if (Number.isNaN(applicationId)) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
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
        { error: "Company and job title are required" },
        { status: 400 }
      );
    }

    const updatedApplication = await db
      .update(applications)
      .set({
        company,
        jobTitle,
        location: location || null,
        jobUrl: jobUrl || null,
        salary: salary || null,
        status: status || "Wishlist",
        appliedDate: appliedDate || null,
        notes: notes || null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(applications.id, applicationId),
          eq(applications.userId, userId)
        )
      )
      .returning();

    if (updatedApplication.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedApplication[0]);
  } catch (error) {
    console.error("Error updating application:", error);

    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}