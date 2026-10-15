
import { auth } from "@clerk/nextjs/server";
import {
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const region = process.env.AWS_REGION;
  const roleArn = process.env.AWS_ROLE_ARN;
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!region || !roleArn || !bucketName) {
    return Response.json(
      { error: "AWS environment variables are missing" },
      { status: 500 }
    );
  }

  try {
    const s3 = new S3Client({
      region,
      credentials: awsCredentialsProvider({ roleArn }),
    });

    await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 1,
      })
    );

    return Response.json({
      success: true,
      message: "JobTrack AI connected to private S3 storage.",
    });
  } catch (error) {
    console.error(
      "S3 connection failed:",
      error instanceof Error ? error.name : "UnknownError"
    );

    return Response.json(
      { error: "Could not connect to S3. Check AWS configuration." },
      { status: 500 }
    );
  }
}
