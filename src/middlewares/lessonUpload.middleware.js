const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({ storage });

const lessonUpload = upload.fields([
  { name: "lesson_video", maxCount: 1 },
  { name: "lesson_documents", maxCount: 10 }, // Cho phép nhiều documents
]);

module.exports = {
  lessonUpload,
};
