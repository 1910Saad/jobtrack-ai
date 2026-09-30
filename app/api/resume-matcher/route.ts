import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import mammoth from "mammoth";
import { extractText } from "unpdf";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { resumeMatchers } from "@/db/schema";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const resume = formData.get("resume");
        const jobDescription = formData.get("jobDescription");
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!(resume instanceof File)) {
            return NextResponse.json(
                { error: "Resume file is required" },
                { status: 400 }
            );
        }

        if (
            typeof jobDescription !== "string" ||
            !jobDescription.trim()
        ) {
            return NextResponse.json(
                { error: "Job description is required" },
                { status: 400 }
            );
        }

        const fileName = resume.name.toLowerCase();

        const buffer = Buffer.from(
            await resume.arrayBuffer()
        );

        let resumeText = "";

        // PDF
        if (fileName.endsWith(".pdf")) {
            const { text } = await extractText(
                new Uint8Array(buffer)
            );

            resumeText = Array.isArray(text)
                ? text.join("\n")
                : String(text);
        }

        // DOCX
        else if (fileName.endsWith(".docx")) {
            const result = await mammoth.extractRawText({
                buffer,
            });

            resumeText = result.value;
        }

        else {
            return NextResponse.json(
                {
                    error:
                        "Unsupported resume format. Please upload PDF or DOCX.",
                },
                { status: 400 }
            );
        }

        if (!resumeText.trim()) {
            return NextResponse.json(
                {
                    error:
                        "Could not extract text from the resume.",
                },
                { status: 400 }
            );
        }

        const prompt = `
You are a resume-to-job-description matching assistant.

Compare the candidate resume with the job description.

Return ONLY valid JSON.

Use exactly this structure:

{
  "matchScore": 0,
  "candidateSkills": [],
  "matchingSkills": [],
  "missingSkills": [],
  "jobRequirements": [],
  "recommendations": [],
  "summary": ""
}

Rules:

- matchScore must be an integer from 0 to 100.
- Base the score only on evidence in the resume and job description.
- candidateSkills should contain skills explicitly supported by the resume.
- matchingSkills should contain skills present in both the resume and job requirements.
- missingSkills should contain important requirements from the job description that are not demonstrated in the resume.
- jobRequirements should contain important technical and professional requirements from the job description.
- recommendations should provide practical suggestions based on missing skills.
- summary should briefly explain the overall match.
- Do not invent experience, education, skills, certifications, or projects.
- Keep arrays concise and useful.
- Do not use markdown.
- Return valid JSON only.

CANDIDATE RESUME:

${resumeText}

JOB DESCRIPTION:

${jobDescription}
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
        });

        const text = response.text?.trim();

        if (!text) {
            throw new Error(
                "AI returned an empty response"
            );
        }

        const cleaned = text
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        const result = JSON.parse(cleaned);

        await db.insert(resumeMatchers).values({
            userId,
            resumeName: resume.name,
            jobDescription,
            matchScore: result.matchScore,
            candidateSkills: result.candidateSkills,
            matchingSkills: result.matchingSkills,
            missingSkills: result.missingSkills,
            jobRequirements: result.jobRequirements,
            recommendations: result.recommendations,
            summary: result.summary,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Resume matcher error:", error);

        const status = error?.status;

        if (status === 429) {
            return NextResponse.json(
                {
                    error:
                        "AI quota exceeded. Please try again later or configure a Gemini API project with billing enabled.",
                },
                { status: 429 }
            );
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to analyze resume against job description",
            },
            { status: 500 }
        );
    }
}