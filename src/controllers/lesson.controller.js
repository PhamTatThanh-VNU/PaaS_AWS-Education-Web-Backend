const lessonService = require("../services/lesson.service");

class LessonController {
  // [POST] /lessons
  async createLesson(req, res) {
    try {
      const data = req.body;
      const files = req.files || {}; // files: { video: [...], document: [...] }

      // Lấy file đầu tiên trong mỗi mảng nếu có (vì multer fields trả về mảng)
      const formattedFiles = {
        video: files.lesson_video ? files.lesson_video[0] : null,
        document: files.lesson_documents || [],
      };

      const newLesson = await lessonService.createLesson(
        { ...data },
        formattedFiles
      );
      return res.status(201).json(newLesson);
    } catch (err) {
      console.error("Error in createLesson:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // [GET] /lessons
  async getAllLessons(req, res) {
    try {
      const lessons = await lessonService.getAllLessons(req.query);
      return res.status(200).json(lessons);
    } catch (err) {
      console.error("Error in getAllLessons:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // [GET] /lessons/:id
  async getLessonById(req, res) {
    try {
      const lesson = await lessonService.getLessonById(req.params.id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      return res.status(200).json(lesson);
    } catch (err) {
      console.error("Error in getLessonById:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // [PUT] /lessons/:id
  async updateLesson(req, res) {
    try {
      const updated = await lessonService.updateLesson(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      return res.status(200).json(updated);
    } catch (err) {
      console.error("Error in updateLesson:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // [DELETE] /lessons/:id
  async deleteLesson(req, res) {
    try {
      const deleted = await lessonService.deleteLesson(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      return res.status(200).json({ message: "Lesson deleted successfully" });
    } catch (err) {
      console.error("Error in deleteLesson:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = new LessonController();
