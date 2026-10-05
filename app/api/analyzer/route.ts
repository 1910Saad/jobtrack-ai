import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { jobAnalyzers } from "@/db/schema";

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey,
});

export async function POST(request: Request) {
  try {
    // Get logged-in user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { jobDescription } = await request.json();

    if (
      !jobDescription ||
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const prompt = `
Analyze the following job description.

Return ONLY valid JSON.

Use exactly this structure:

{
  "jobTitle": "",
  "summary": "",
  "requiredSkills": [],
  "preferredSkills": [],
  "keywords": [],
  "responsibilities": [],
  "preparationTopics": [],
  "experience": "",
  "education": ""
}

Rules:
- Ground everything in the provided job description.
- Do not invent requirements.
- Keep array items short and useful.
- If something is not mentioned, return an empty string or empty array.
- Do not return Markdown.
- Do not wrap the JSON in code fences.

JOB DESCRIPTION:

${jobDescription}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const text = response.text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "AI returned an empty response" },
        { status: 502 }
      );
    }

    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let result;

    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error("Invalid JSON returned by Gemini:", text);

      return NextResponse.json(
        { error: "AI returned an invalid analysis format" },
        { status: 502 }
      );
    }

    // Save analysis to database
    const [savedAnalysis] = await db
      .insert(jobAnalyzers)
      .values({
        userId,

        jobTitle: result.jobTitle || null,

        jobDescription,

        summary: result.summary || null,

        requiredSkills: Array.isArray(result.requiredSkills)
          ? result.requiredSkills
          : [],

        preferredSkills: Array.isArray(result.preferredSkills)
          ? result.preferredSkills
          : [],

        keywords: Array.isArray(result.keywords)
          ? result.keywords
          : [],

        responsibilities: Array.isArray(result.responsibilities)
          ? result.responsibilities
          : [],

        preparationTopics: Array.isArray(result.preparationTopics)
          ? result.preparationTopics
          : [],

        experience: result.experience || null,

        education: result.education || null,
      })
      .returning();

    return NextResponse.json(savedAnalysis);
  } catch (error: any) {
    console.error("Analyzer error:", error);

    const status = error?.status;

    if (status === 503) {
      return NextResponse.json(
        {
          error:
            "The AI service is temporarily busy. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    if (status === 429) {
      return NextResponse.json(
        {
          error:
            "AI usage limit reached. Please try again later.",
        },
        { status: 429 }
      );
    }

    if (status === 404) {
      return NextResponse.json(
        {
          error:
            "The configured Gemini model is unavailable. Please check the model configuration.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to analyze job description",
      },
      { status: 500 }
    );
  }
}