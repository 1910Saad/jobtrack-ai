
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
    DeleteObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

export const runtime = "nodejs";

export async function POST(request: Request) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body: unknown = await request.json();

        if (
            !body ||
            typeof body !== "object" ||
            !("key" in body) ||
            typeof body.key !== "string"
        ) {
            return NextResponse.json(
                { error: "Invalid object key" },
                { status: 400 }
            );
        }

        const key = body.key;
        const prefix = `${userId}/`;
        const objectName = key.startsWith(prefix)
            ? key.slice(prefix.length)
            : "";

        if (
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|docx)$/i.test(
                objectName
            )
        ) {
            return NextResponse.json(
                { error: "Invalid object key" },
                { status: 400 }
            );
        }

        const region = process.env.AWS_REGION;
        const roleArn = process.env.AWS_ROLE_ARN;
        const bucket = process.env.S3_BUCKET_NAME;

        if (!region || !roleArn || !bucket) {
            return NextResponse.json(
                { error: "Storage is not configured" },
                { status: 500 }
            );
        }

        const s3 = new S3Client({
            region,
            credentials: awsCredentialsProvider({ roleArn }),
        });

        await s3.send(
            new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            })
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(
            "Resume cleanup failed:",
            error instanceof Error ? error.name : "UnknownError"
        );

        return NextResponse.json(
            { error: "Could not clean up temporary resume" },
            { status: 500 }
        );
    }
}
