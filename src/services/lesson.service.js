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
      const seriesCollection = db.collection("series");
      const newLesson = {
        ...data,
        lesson_video: videoUrl,
        lesson_documents: documentUrls,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await lessonCollection.insertOne(newLesson);

      // Lấy id lesson vừa tạo
      const lessonId = result.insertedId;

      await seriesCollection.updateOne(
        { _id: new ObjectId(data.lesson_serie) },
        { $push: { serie_lessons: lessonId } }
      );
      return { _id: result.insertedId, ...newLesson };
    } catch (err) {
      console.error("Error in createLesson:", err);
      throw err;
    }
  }

  async getAllLessonsBySerie(seriesId) {
    try {
      const db = await connectToDatabase();
      const lessonCollection = db.collection("lessons");

      const query = { lesson_serie: seriesId }; // Chỉ lọc theo lesson_serie
      return await lessonCollection.find(query).toArray();
    } catch (err) {
      console.error("Error in getAllLessonsBySerie:", err);
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

      const currentLesson = await lessonCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!currentLesson) return null;

      // Xử lý video mới nếu có
      if (files?.lesson_video && files.lesson_video.length > 0) {
        // Xóa video cũ nếu có
        if (currentLesson.lesson_video) {
          await deleteFile(currentLesson.lesson_video);
        }

        const videoFile = files.lesson_video[0];
        const videoName = `${uuidv4()}_${videoFile.originalname}`;
        const videoUrl = await uploadFile(
          videoFile.buffer,
          videoName,
          videoFile.mimetype,
          "video"
        );

        data.lesson_video = videoUrl;
      }

      // Xử lý documents mới nếu có
      if (files?.lesson_documents && files.lesson_documents.length > 0) {
        // Xóa document cũ nếu có
        if (currentLesson.lesson_documents) {
          const docs = Array.isArray(currentLesson.lesson_documents)
            ? currentLesson.lesson_documents
            : [currentLesson.lesson_documents];
          for (const docUrl of docs) {
            await deleteFile(docUrl);
          }
        }

        const documentUrls = [];
        for (const docFile of files.lesson_documents) {
          const docName = `${uuidv4()}_${docFile.originalname}`;
          const docUrl = await uploadFile(
            docFile.buffer,
            docName,
            docFile.mimetype,
            "docs"
          );
          documentUrls.push(docUrl);
        }

        data.lesson_documents = documentUrls;
      }

      // Cập nhật DB
      const updateResult = await lessonCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );

      if (updateResult.matchedCount === 0) return null;

      return await lessonCollection.findOne({ _id: new ObjectId(id) });
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
