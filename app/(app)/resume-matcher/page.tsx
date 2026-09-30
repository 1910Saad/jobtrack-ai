"use client";

import { ChangeEvent, DragEvent, useState, useEffect } from "react";
import Link from "next/link";


type AnalysisResult = {
    matchScore: number;
    candidateSkills: string[];
    matchingSkills: string[];
    missingSkills: string[];
    jobRequirements: string[];
    recommendations: string[];
    summary: string;
};

export default function ResumeMatcherPage() {
    const [resume, setResume] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    function handleFile(file: File) {
        setError("");

        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
        ];

        const validExtension =
            file.name.toLowerCase().endsWith(".pdf") ||
            file.name.toLowerCase().endsWith(".docx") ||
            file.name.toLowerCase().endsWith(".doc");

        if (!allowedTypes.includes(file.type) && !validExtension) {
            setError("Please upload a PDF or DOC/DOCX resume.");
            return;
        }

        setResume(file);
    }

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (file) {
            handleFile(file);
        }
    }

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];

        if (file) {
            handleFile(file);
        }
    }

    function removeResume() {
        setResume(null);
    }

    async function handleAnalyze() {
        if (!resume) {
            setError("Please upload your resume first.");
            return;
        }

        if (!jobDescription.trim()) {
            setError("Please enter the job description.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const formData = new FormData();

            formData.append("resume", resume);
            formData.append("jobDescription", jobDescription);

            const response = await fetch("/api/resume-matcher", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to analyze resume"
                );
            }

            setResult(data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    }

    function resetAnalysis() {
        setResult(null);
        setError("");
    }

    async function loadHistory() {
        try {
            setHistoryLoading(true);

            const response = await fetch("/api/resume-matcher/history");

            if (!response.ok) {
                throw new Error("Failed to load history");
            }

            const data = await response.json();
            setHistory(data);
        } catch (error) {
            console.error("History error:", error);
        } finally {
            setHistoryLoading(false);
        }
    }

    useEffect(() => {
        loadHistory();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50 px-5 py-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
                    >
                        ← Dashboard
                    </Link>

                    <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                <span>✦</span>
                                AI Powered
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                                Resume Matcher
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                                Compare your resume with a job description and discover
                                your skills match, missing requirements, and areas to
                                prepare.
                            </p>
                        </div>

                        {result && (
                            <button
                                onClick={resetAnalysis}
                                className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                            >
                                New Analysis
                            </button>
                        )}

                        <Link
                            href="/resume-matcher/history"
                            className="rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            View History
                        </Link>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <div className="flex items-start gap-3">
                            <span className="font-bold">!</span>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {!result ? (
                    <>
                        {/* Input Grid */}
                        <div className="grid gap-6 lg:grid-cols-2">

                            {/* Resume Upload */}
                            <section className="rounded-2xl border bg-white p-6 shadow-sm">
                                <div className="mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600">
                                            ↑
                                        </div>

                                        <div>
                                            <h2 className="font-semibold text-gray-900">
                                                Upload Resume
                                            </h2>

                                            <p className="text-xs text-gray-500">
                                                PDF or DOCX
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {!resume ? (
                                    <div
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setDragActive(true);
                                        }}
                                        onDragLeave={() => setDragActive(false)}
                                        onDrop={handleDrop}
                                        className={`relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition ${dragActive
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                                            }`}
                                    >
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 cursor-pointer opacity-0"
                                        />

                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                                            📄
                                        </div>

                                        <h3 className="mt-5 text-sm font-semibold text-gray-900">
                                            Drop your resume here
                                        </h3>

                                        <p className="mt-2 text-xs text-gray-500">
                                            or click to browse from your computer
                                        </p>

                                        <span className="mt-5 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white">
                                            Choose File
                                        </span>

                                        <p className="mt-4 text-[11px] text-gray-400">
                                            Supported formats: PDF, DOC, DOCX
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex min-h-[300px] flex-col justify-center">
                                        <div className="rounded-xl border bg-gray-50 p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl">
                                                    📄
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                        {resume.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {formatFileSize(resume.size)}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={removeResume}
                                                    className="rounded-lg border bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="mt-5 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-xs text-green-700">
                                                <span>✓</span>
                                                Resume ready for analysis
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Job Description */}
                            <section className="rounded-2xl border bg-white p-6 shadow-sm">
                                <div className="mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-lg text-purple-600">
                                            ≡
                                        </div>

                                        <div>
                                            <h2 className="font-semibold text-gray-900">
                                                Job Description
                                            </h2>

                                            <p className="text-xs text-gray-500">
                                                Paste the job you're applying for
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <textarea
                                    value={jobDescription}
                                    onChange={(e) =>
                                        setJobDescription(e.target.value)
                                    }
                                    placeholder={`Paste the complete job description here...

Example:

We are looking for a Backend Developer with experience in Node.js, NestJS, REST APIs, PostgreSQL and AWS.

Requirements:
• Node.js
• NestJS
• PostgreSQL
• Redis
• AWS
• REST APIs`}
                                    className="min-h-[300px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                />

                                <div className="mt-3 flex justify-between text-xs text-gray-400">
                                    <span>Paste the full description for better results</span>
                                    <span>
                                        {jobDescription.length.toLocaleString()} characters
                                    </span>
                                </div>
                            </section>
                        </div>

                        {/* Analyze */}
                        <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
                            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        Ready to compare?
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Our AI will compare your resume against the job
                                        requirements.
                                    </p>
                                </div>

                                <button
                                    onClick={handleAnalyze}
                                    disabled={
                                        loading ||
                                        !resume ||
                                        !jobDescription.trim()
                                    }
                                    className="w-full rounded-xl bg-black px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Analyzing Resume...
                                        </span>
                                    ) : (
                                        "✦ Analyze Resume"
                                    )}
                                </button>
                            </div>
                        </section>
                    </>
                ) : (
                    <AnalysisResults result={result} />
                )}
            </div>
        </main>
    );
}

function AnalysisResults({
    result,
}: {
    result: AnalysisResult;
}) {
    const score = Math.max(
        0,
        Math.min(100, result.matchScore)
    );

    return (
        <div className="space-y-6">

            {/* Score + Summary */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
                <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-center">

                    {/* Score */}
                    <div className="flex justify-center">
                        <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gray-100">
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: `conic-gradient(#2563eb ${score * 3.6}deg, #e5e7eb 0deg)`,
                                }}
                            />

                            <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-white">
                                <span className="text-4xl font-bold text-gray-900">
                                    {score}%
                                </span>

                                <span className="mt-1 text-xs font-medium text-gray-500">
                                    Match Score
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                            AI Resume Analysis
                        </span>

                        <h2 className="mt-2 text-2xl font-bold text-gray-900">
                            Resume Match Overview
                        </h2>

                        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
                            {result.summary}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <StatBadge
                                label="Matching"
                                value={result.matchingSkills.length}
                                className="bg-green-50 text-green-700"
                            />

                            <StatBadge
                                label="Missing"
                                value={result.missingSkills.length}
                                className="bg-red-50 text-red-700"
                            />

                            <StatBadge
                                label="Requirements"
                                value={result.jobRequirements.length}
                                className="bg-blue-50 text-blue-700"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Skills */}
            <div className="grid gap-6 lg:grid-cols-2">

                <SkillCard
                    title="Matching Skills"
                    description="Skills demonstrated in both your resume and the job description."
                    items={result.matchingSkills}
                    variant="success"
                    icon="✓"
                />

                <SkillCard
                    title="Missing Skills"
                    description="Important requirements not clearly demonstrated in your resume."
                    items={result.missingSkills}
                    variant="danger"
                    icon="!"
                />

                <SkillCard
                    title="Your Skills"
                    description="Skills identified from your resume."
                    items={result.candidateSkills}
                    variant="neutral"
                    icon="◆"
                />

                <SkillCard
                    title="Job Requirements"
                    description="Key requirements extracted from the job description."
                    items={result.jobRequirements}
                    variant="info"
                    icon="→"
                />
            </div>

            {/* Recommendations */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg text-amber-600">
                        ✦
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Recommended Preparation
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Practical steps based on the gaps identified by the AI.
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid gap-3">
                    {result.recommendations.length > 0 ? (
                        result.recommendations.map((item, index) => (
                            <div
                                key={index}
                                className="flex gap-4 rounded-xl border bg-gray-50 p-4"
                            >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-700 shadow-sm">
                                    {index + 1}
                                </div>

                                <p className="text-sm leading-6 text-gray-600">
                                    {item}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">
                            No additional recommendations were generated.
                        </p>
                    )}
                </div>
            </section>

        </div>
    );
}

function SkillCard({
    title,
    description,
    items,
    variant,
    icon,
}: {
    title: string;
    description: string;
    items: string[];
    variant: "success" | "danger" | "neutral" | "info";
    icon: string;
}) {
    const styles = {
        success: {
            icon: "bg-green-50 text-green-600",
            pill: "bg-green-50 text-green-700",
        },
        danger: {
            icon: "bg-red-50 text-red-600",
            pill: "bg-red-50 text-red-700",
        },
        neutral: {
            icon: "bg-gray-100 text-gray-600",
            pill: "bg-gray-100 text-gray-700",
        },
        info: {
            icon: "bg-blue-50 text-blue-600",
            pill: "bg-blue-50 text-blue-700",
        },
    };

    return (
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${styles[variant].icon}`}
                >
                    {icon}
                </div>

                <div>
                    <h2 className="font-semibold text-gray-900">
                        {title}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        {description}
                    </p>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <span
                            key={`${item}-${index}`}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${styles[variant].pill}`}
                        >
                            {item}
                        </span>
                    ))
                ) : (
                    <span className="text-xs text-gray-400">
                        None identified
                    </span>
                )}
            </div>
        </section>
    );
}

function StatBadge({
    label,
    value,
    className,
}: {
    label: string;
    value: number;
    className: string;
}) {
    return (
        <div
            className={`rounded-lg px-3 py-2 text-xs font-medium ${className}`}
        >
            <span className="font-bold">{value}</span>{" "}
            {label}
        </div>
    );
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}