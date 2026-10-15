
import { auth } from "@clerk/nextjs/server";
import { S3Client } from "@aws-sdk/client-s3";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("fileName" in body) ||
      !("contentType" in body) ||
      !("size" in body)
    ) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const { fileName, contentType, size } = body as {
      fileName: unknown;
      contentType: unknown;
      size: unknown;
    };

    if (
      typeof fileName !== "string" ||
      fileName.length > 255 ||
      typeof contentType !== "string" ||
      typeof size !== "number" ||
      !Number.isSafeInteger(size) ||
      size < 1 ||
      size > MAX_FILE_SIZE
    ) {
      return Response.json(
        { error: "Invalid file name or file size. Maximum size is 5 MB." },
        { status: 400 }
      );
    }

    const extension = fileName.toLowerCase().split(".").pop();

    if (
      extension !== "pdf" &&
      extension !== "docx"
    ) {
      return Response.json(
        { error: "Only PDF and DOCX files are supported." },
        { status: 400 }
      );
    }

    const expectedType = ALLOWED_TYPES[extension];

    if (contentType !== expectedType) {
      return Response.json(
        { error: "File extension and content type do not match." },
        { status: 400 }
      );
    }

    const region = process.env.AWS_REGION;
    const roleArn = process.env.AWS_ROLE_ARN;
    const bucket = process.env.S3_BUCKET_NAME;

    if (!region || !roleArn || !bucket) {
      return Response.json(
        { error: "Storage is not configured." },
        { status: 500 }
      );
    }

    const s3 = new S3Client({
      region,
      credentials: awsCredentialsProvider({ roleArn }),
    });

    const key = `${userId}/${randomUUID()}.${extension}`;

    const presigned = await createPresignedPost(s3, {
      Bucket: bucket,
      Key: key,
      Expires: 60,
      Fields: {
        "Content-Type": contentType,
      },
      Conditions: [
        ["content-length-range", 1, MAX_FILE_SIZE],
        ["eq", "$Content-Type", contentType],
      ],
    });

    return Response.json({
      uploadUrl: presigned.url,
      fields: presigned.fields,
      key,
    });
  } catch (error) {
    console.error(
      "Resume upload signing failed:",
      error instanceof Error ? error.name : "UnknownError"
    );

    return Response.json(
      { error: "Could not prepare the upload." },
      { status: 500 }
    );
  }
}
