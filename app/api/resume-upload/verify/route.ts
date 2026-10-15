
import { auth } from "@clerk/nextjs/server";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import JSZip from "jszip";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function createS3Client() {
  const region = process.env.AWS_REGION;
  const roleArn = process.env.AWS_ROLE_ARN;

  if (!region || !roleArn || !process.env.S3_BUCKET_NAME) {
    throw new Error("Storage is not configured");
  }

  return new S3Client({
    region,
    credentials: awsCredentialsProvider({ roleArn }),
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let key: string;

  try {
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("key" in body) ||
      typeof body.key !== "string"
    ) {
      return Response.json({ error: "Invalid object key" }, { status: 400 });
    }

    key = body.key;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  // Only accept keys generated for this user's upload namespace.
  const prefix = `${userId}/`;
  const objectName = key.startsWith(prefix)
    ? key.slice(prefix.length)
    : "";

  if (
    !/^[0-9a-f-]{36}\.(pdf|docx)$/i.test(objectName)
  ) {
    return Response.json({ error: "Invalid object key" }, { status: 400 });
  }

  const bucket = process.env.S3_BUCKET_NAME;

  if (!bucket) {
    return Response.json({ error: "Storage is not configured" }, { status: 500 });
  }

  const s3 = createS3Client();

  try {
    const metadata = await s3.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key })
    );

    if (
      !metadata.ContentLength ||
      metadata.ContentLength < 1 ||
      metadata.ContentLength > MAX_FILE_SIZE
    ) {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

      return Response.json(
        { error: "File must be between 1 byte and 5 MB." },
        { status: 400 }
      );
    }

    const result = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    if (!result.Body) {
      return Response.json({ error: "Could not read uploaded file" }, { status: 400 });
    }

    const bytes = Buffer.from(await result.Body.transformToByteArray());
    const isPdf = objectName.toLowerCase().endsWith(".pdf");
    let valid = false;

    if (isPdf) {
      // Check the PDF signature near the start of the file.
      valid = bytes.subarray(0, 1024).includes(Buffer.from("%PDF-"));
    } else {
      try {
        const zip = await JSZip.loadAsync(bytes);
        const documentXml = zip.file("word/document.xml");
        const contentTypes = zip.file("[Content_Types].xml");

        valid = Boolean(documentXml && contentTypes);

        if (valid && documentXml) {
          const xml = await documentXml.async("string");
          valid = xml.includes("<w:document") || xml.includes(":document");
        }
      } catch {
        valid = false;
      }
    }

    if (!valid) {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

      return Response.json(
        { error: "The uploaded file is not a valid supported document." },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      key,
      size: bytes.length,
      type: isPdf ? "pdf" : "docx",
    });
  } catch (error) {
    console.error(
      "Resume verification failed:",
      error instanceof Error ? error.name : "UnknownError"
    );

    return Response.json(
      { error: "Could not verify uploaded file." },
      { status: 500 }
    );
  }
}
