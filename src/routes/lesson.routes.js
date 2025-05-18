/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Lesson management
 */

/**
 * @swagger
 * /lessons:
 *   post:
 *     summary: Create a new lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               lesson_title:
 *                 type: string
 *                 description: Title of the lesson
 *               lesson_description:
 *                 type: string
 *                 description: Description of the lesson content
 *               lesson_serie:
 *                 type: string
 *                 description: ID of the series that this lesson belongs to
 *               isPublish:
 *                 type: boolean
 *                 description: Whether the lesson is published or not
 *               lesson_video:
 *                 type: string
 *                 format: binary
 *                 description: Video file for the lesson
 *               lesson_documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Supporting document files for the lesson
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /lessons:
 *   get:
 *     summary: Get all lessons
 *     tags: [Lessons]
 *     responses:
 *       200:
 *         description: List of lessons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lesson'
 */

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     summary: Get a lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson data
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /lessons/{id}:
 *   put:
 *     summary: Update a lesson by ID
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lesson_title:
 *                 type: string
 *               lesson_content:
 *                 type: string
 *               serie_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /lessons/{id}:
 *   delete:
 *     summary: Delete a lesson by ID
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 *       404:
 *         description: Not found
 */

const express = require("express");
const multer = require("multer");
const router = express.Router();
const lessonController = require("../controllers/lesson.controller");
const { authenticateJWT } = require("../middlewares/auth.middleware");

const upload = multer(); // in-memory

// Create lesson (upload 2 files: video, document)
router.post(
  "/",
  /* authenticateJWT, */
  upload.fields([
    { name: "lesson_video", maxCount: 1 },
    { name: "lesson_documents", maxCount: 10 },
  ]),
  lessonController.createLesson
);

// Get all lessons
router.get("/", lessonController.getAllLessons);

// Get lesson by ID
router.get("/:id", lessonController.getLessonById);

// Update lesson by ID
router.put("/:id", /* authenticateJWT, */ lessonController.updateLesson);

// Delete lesson by ID
router.delete("/:id", /* authenticateJWT, */ lessonController.deleteLesson);

module.exports = router;
