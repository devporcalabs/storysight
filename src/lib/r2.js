import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

export const isR2Configured = !!(
  accountId &&
  accessKeyId &&
  secretAccessKey &&
  bucketName
);

let s3Client = null;

if (isR2Configured) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Uploads a buffer to Cloudflare R2 bucket
 * @param {Buffer} buffer - File buffer
 * @param {string} key - S3 Key / destination path inside bucket
 * @param {string} contentType - Mime type of the file
 * @returns {Promise<string>} Proxy URL path (/api/files/...) for the uploaded file
 */
export async function uploadToR2(buffer, key, contentType) {
  if (!isR2Configured) {
    throw new Error("Cloudflare R2 is not fully configured in environment variables.");
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return a proxy URL that routes through Next.js API (avoids CORS issues)
  return `/api/files/${key}`;
}

/**
 * Retrieves a file stream from Cloudflare R2 bucket
 * @param {string} key - S3 Key / path inside bucket
 * @returns {Promise<{body: ReadableStream, contentType: string, contentLength: number}>}
 */
export async function getFileFromR2(key) {
  if (!isR2Configured) {
    throw new Error("Cloudflare R2 is not fully configured in environment variables.");
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);

  return {
    body: response.Body,
    contentType: response.ContentType || "application/octet-stream",
    contentLength: response.ContentLength,
  };
}
