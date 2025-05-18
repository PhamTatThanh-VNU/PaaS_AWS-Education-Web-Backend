const { ObjectId } = require("mongodb");
const { uploadFile, deleteFile } = require("../utils/s3");
const { v4: uuidv4 } = require("uuid");
const { connectToDatabase } = require("../utils/mongodb");

class LessonService {
  async createLesson(data, files) {
    try {
      let videoUrl = "";
      let documentUrls = [];

      if (files?.video) {
        const videoName = `${uuidv4()}_${files.video.originalname}`;
        videoUrl = await uploadFile(
          files.video.buffer,
          videoName,
          files.video.mimetype,
          "video"
        );
      }

      // Upload nhiều document nếu có
      if (files?.document) {
        const documentsArray = Array.isArray(files.document)
          ? files.document
          : [files.document];

        for (const doc of documentsArray) {
          const docName = `${uuidv4()}_${doc.originalname}`;
          const documentUrl = await uploadFile(
            doc.buffer,
            docName,
            doc.mimetype,
            "docs"
          );
          documentUrls.push(documentUrl);
        }
      }

      const db = await connectToDatabase();
      const lessonCollection = db.collection("lessons");

      const newLesson = {
        ...data,
        lesson_video: videoUrl,
        lesson_documents: documentUrls,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await lessonCollection.insertOne(newLesson);
      return { _id: result.insertedId, ...newLesson };
    } catch (err) {
      console.error("Error in createLesson:", err);
      throw err;
    }
  }

  async getAllLessons(query = {}) {
    try {
      const db = await connectToDatabase();
      const lessonCollection = db.collection("lessons");

      const queryCopy = { ...query };
      if (queryCopy._id) {
        try {
          queryCopy._id = new ObjectId(queryCopy._id);
        } catch {
          delete queryCopy._id;
        }
      }

      return await lessonCollection.find(queryCopy).toArray();
    } catch (err) {
      console.error("Error in getAllLessons:", err);
      throw err;
    }
  }

  async getLessonById(id) {
    try {
      const db = await connectToDatabase();
      const lessonCollection = db.collection("lessons");

      return await lessonCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      console.error("Error in getLessonById:", err);
      throw err;
    }
  }

  async updateLesson(id, data, files) {
    try {
      const db = await connectToDatabase();
      const lessonCollection = db.collection("lessons");

      data.updatedAt = new Date();

      // Lấy lesson hiện tại
      const currentLesson = await lessonCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!currentLesson) {
        return null;
      }

      // Nếu có file video mới, xóa video cũ, upload video mới
      if (files?.video) {
        if (currentLesson.lesson_video) {
          await deleteFile(currentLesson.lesson_video);
        }
        const videoName = `${uuidv4()}_${files.video.originalname}`;
        const videoUrl = await uploadFile(
          files.video.buffer,
          videoName,
          files.video.mimetype,
          "video"
        );
        data.lesson_video = videoUrl;
      }

      // Nếu có file document mới, xóa document cũ, upload document mới
      if (files?.document) {
        if (currentLesson.lesson_document) {
          await deleteFile(currentLesson.lesson_document);
        }
        const docName = `${uuidv4()}_${files.document.originalname}`;
        const documentUrl = await uploadFile(
          files.document.buffer,
          docName,
          files.document.mimetype,
          "docs"
        );
        data.lesson_document = documentUrl;
      }

      const updateResult = await lessonCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );

      if (updateResult.matchedCount === 0) {
        return null;
      }

      const updatedLesson = await lessonCollection.findOne({
        _id: new ObjectId(id),
      });

      console.log("Update Success");
      return updatedLesson;
    } catch (err) {
      console.error("Error in updateLesson:", err);
      throw err;
    }
  }

  async deleteLesson(id) {
    try {
      const db = await connectToDatabase();
      const lessonCollection = db.collection("lessons");

      // Lấy lesson để xóa file nếu có
      const lesson = await lessonCollection.findOne({ _id: new ObjectId(id) });
      if (!lesson) {
        throw new Error("Lesson không tồn tại.");
      }

      const result = await lessonCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount > 0) {
        if (lesson.lesson_video) {
          await deleteFile(lesson.lesson_video);
        }

        // Nếu lesson_documents là mảng (nhiều file) thì xóa từng file
        if (Array.isArray(lesson.lesson_documents)) {
          for (const docUrl of lesson.lesson_documents) {
            await deleteFile(docUrl);
          }
        } else if (lesson.lesson_documents) {
          // Nếu chỉ có 1 document dưới dạng string
          await deleteFile(lesson.lesson_documents);
        }
      }

      console.log("Delete Success");
      return result.deletedCount > 0;
    } catch (err) {
      console.error("Error in deleteLesson:", err);
      throw err;
    }
  }
}

module.exports = new LessonService();
