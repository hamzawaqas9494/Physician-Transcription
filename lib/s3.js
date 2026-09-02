import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ======================================================
// ENV
// ======================================================

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region) {
  throw new Error("AWS_REGION is missing.");
}

if (!bucket) {
  throw new Error("AWS_S3_BUCKET is missing.");
}

if (!accessKeyId) {
  throw new Error("AWS_ACCESS_KEY_ID is missing.");
}

if (!secretAccessKey) {
  throw new Error("AWS_SECRET_ACCESS_KEY is missing.");
}

// ======================================================
// CLIENT
// ======================================================

export const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const S3_BUCKET = bucket;

// ======================================================
// UPLOAD
// ======================================================

export async function uploadFileToS3({ key, buffer, contentType, metadata }) {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata || undefined,
    }),
  );

  return key;
}

// ======================================================
// DELETE
// ======================================================

export async function deleteFileFromS3(key) {
  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }),
  );
}

// ======================================================
// PRIVATE URL
// ======================================================

export async function getPrivateFileUrl(key, expiresIn = 3600) {
  if (!key) return null;

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3, command, {
    expiresIn,
  });
}
