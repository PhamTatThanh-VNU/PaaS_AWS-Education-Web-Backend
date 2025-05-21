require("dotenv").config({ path: __dirname + "/../../.env" });

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  S3ServiceException,
  waitUntilObjectNotExists,
} = require("@aws-sdk/client-s3");

const bucketName = process.env.AWS_BUCKET;

// Khởi tạo S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadFile(buffer, fileName, mimetype, folder) {
  const key = `${folder}/${fileName}`;
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ACL: "public-read",
    ContentType: mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log("Upload thành công, URL:", url);
    return url;
  } catch (error) {
    console.error("Upload lỗi:", err);
    throw error;
  }
}

async function uploadViaCloudFront(
  idToken,
  buffer,
  fileName,
  mimetype,
  folder
) {
  const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

  const key = `${folder}/${fileName}`;
  const uploadUrl = `https://${CLOUDFRONT_DOMAIN}/${key}`;

  try {
    const response = await axios.put(uploadUrl, buffer, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": mimetype || "application/octet-stream",
      },
    });

    console.log("Upload Sucess:", response.status);
    return uploadUrl;
  } catch (error) {
    console.error(
      "Upload error:",
      error.response?.status,
      error.response?.data
    );
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

async function uploadViaCloudFront(
  idToken,
  buffer,
  fileName,
  mimetype,
  folder
) {
  const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

  const key = `${folder}/${fileName}`;
  const uploadUrl = `https://${CLOUDFRONT_DOMAIN}/${key}`;

  try {
    const response = await axios.put(uploadUrl, buffer, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": mimetype || "application/octet-stream",
      },
    });

    console.log("Upload Sucess:", response.status);
    return uploadUrl;
  } catch (error) {
    console.error(
      "Upload error:",
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
}

async function deleteViaCloudFront(idToken, fileUrl) {
  try {
    // Xác định URL hợp lệ
    const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;
    const prefix = `https://${CLOUDFRONT_DOMAIN}/`;

    if (!fileUrl.startsWith(prefix)) {
      throw new Error("URL không hợp lệ hoặc không thuộc CloudFront domain.");
    }

    // Gửi request DELETE đến CloudFront
    const response = await axios.delete(fileUrl, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    console.log("Delete Sucess:", response.status);
    return true;
  } catch (error) {
    console.error(
      "Delete error:",
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  uploadViaCloudFront,
  deleteViaCloudFront,
};
