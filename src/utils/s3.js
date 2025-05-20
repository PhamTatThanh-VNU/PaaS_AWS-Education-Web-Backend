require("dotenv").config({ path: __dirname + "/../../.env" });

const fs = require("fs");
const path = require("path");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  S3ServiceException,
  waitUntilObjectNotExists,
} = require("@aws-sdk/client-s3");

const bucketName = process.env.AWS_BUCKET;

const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
// Khởi tạo S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Hàm uploadFile như bạn viết
async function uploadFile(buffer, fileName, mimetype, folder) {
  const key = `${folder}/${fileName}`;
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    // ACL: "public-read",
    ContentType: mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    const cloudfrontUrl = `https://${cloudFrontDomain}/${key}`;
    console.log("Upload thành công, URL:", cloudfrontUrl);
    return cloudfrontUrl;
  } catch (error) {
    console.error("Upload lỗi:", error);
    throw error;
  }
}
async function deleteFile(fileUrl) {
  try {
    const prefix = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    if (!fileUrl.startsWith(prefix)) {
      throw new Error(
        "URL không hợp lệ hoặc không thuộc bucket đã định nghĩa."
      );
    }

    const key = fileUrl.replace(prefix, "");

    console.log("Key cần xóa:", key);
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    await waitUntilObjectNotExists(
      { client: s3 },
      { Bucket: bucketName, Key: key }
    );

    console.log(`File "${key}" đã bị xóa khỏi bucket "${bucketName}".`);
    return true;
  } catch (err) {
    if (err instanceof S3ServiceException) {
      console.error(`Lỗi S3 khi xóa file: ${err.name} - ${err.message}`);
    } else {
      console.error("Lỗi khi xóa file:", err);
    }
    throw err;
  }
}

module.exports = { uploadFile, deleteFile };
