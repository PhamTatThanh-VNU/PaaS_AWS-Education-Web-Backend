require("dotenv").config({ path: __dirname + "/../../.env" });
const fs = require("fs");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { Readable } = require("stream");

// Khởi tạo S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_BUCKET;

// Upload file
const uploadFile = async (fileName) => {
  const fileContent = fs.readFileSync(fileName);

  const params = {
    Bucket: bucketName,
    Key: "video/" + fileName,
    Body: fileContent,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    console.log("✅ Upload thành công:", fileName);
  } catch (err) {
    console.error("❌ Upload thất bại:", err);
  }
};

uploadFile("test.mp4");

module.exports = { uploadFile };
