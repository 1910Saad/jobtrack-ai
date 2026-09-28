import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-3.8-flash";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
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

    const prompt = `
Analyze the following job description.

Return ONLY valid JSON with this structure:

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
- Keep the information grounded in the job description.
- Do not invent requirements.
- Use short, useful items in arrays.
- If something is not mentioned, use an empty string or empty array.
- Do not wrap the JSON in markdown.

JOB DESCRIPTION:

${jobDescription}
`;

    let response;

    // Retry temporary Gemini availability errors.
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: MODEL,
          contents: prompt,
        });

        break;
      } catch (error: any) {
        console.error(
          `Gemini attempt ${attempt} failed:`,
          error
        );

        const status = error?.status;

        // Only retry temporary service errors.
        if (status !== 503 || attempt === 3) {
          throw error;
        }

        // 2s → 4s
        await sleep(attempt * 2000);
      }
    }

    if (!response) {
      return NextResponse.json(
        {
          error:
            "The AI service is temporarily unavailable. Please try again shortly.",
        },
        { status: 503 }
      );
    }

    const text = response.text?.trim();

    if (!text) {
      return NextResponse.json(
        {
          error: "AI returned an empty response. Please try again.",
        },
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
    } catch (parseError) {
      console.error(
        "Failed to parse Gemini response:",
        cleaned
      );

      return NextResponse.json(
        {
          error:
            "AI returned an invalid response. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Analyzer error:", error);

    if (error?.status === 503) {
      return NextResponse.json(
        {
          error:
            "The AI service is currently busy. Please try again in a few seconds.",
        },
        { status: 503 }
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