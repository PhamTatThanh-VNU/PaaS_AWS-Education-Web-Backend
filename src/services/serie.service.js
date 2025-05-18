const { ObjectId } = require("mongodb");
const { uploadFile, deleteFile } = require("../utils/s3");
const { v4: uuidv4 } = require("uuid");
const { connectToDatabase } = require("../utils/mongodb");

class SerieService {
  async createSerie(data, file) {
    try {
      let imageUrl = "";
      if (file) {
        const uniqueName = `${uuidv4()}_${file.originalname}`;
        imageUrl = await uploadFile(
          file.buffer,
          uniqueName,
          file.mimetype,
          "thumbnail"
        );
      }

      const db = await connectToDatabase();
      const serieCollection = db.collection("series");

      const newSerie = {
        ...data,
        serie_thumbnail: imageUrl,
        isPublish: data.isPublish ?? false,
        serie_lessons: data.serie_lessons ?? [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await serieCollection.insertOne(newSerie);
      console.log("Create Sucess");
      return { _id: result.insertedId, ...newSerie };
    } catch (err) {
      console.error("Error in createSerie:", err);
      throw err;
    }
  }

  async getAllSeries(query = {}) {
    try {
      const db = await connectToDatabase();
      const serieCollection = db.collection("series");

      if (query._id) {
        query._id = new ObjectId(query._id);
      }
      return await serieCollection.find(query).toArray();
    } catch (err) {
      console.error("Error in getAllSeries:", err);
      throw err;
    }
  }

  async getSerieById(id) {
    try {
      const db = await connectToDatabase();
      const serieCollection = db.collection("series");

      return await serieCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      console.error("Error in getSerieById:", err);
      throw err;
    }
  }

  async updateSerie(id, data, file) {
    try {
      const db = await connectToDatabase();
      const serieCollection = db.collection("series");

      data.updatedAt = new Date();

      const currentSerie = await serieCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!currentSerie) {
        return null;
      }

      if (file) {
        // Xóa thumbnail cũ nếu có
        if (currentSerie.serie_thumbnail) {
          await deleteFile(currentSerie.serie_thumbnail);
        }

        // Upload file mới lên S3
        const uniqueName = `${uuidv4()}_${file.originalname}`;
        const newImageUrl = await uploadFile(
          file.buffer,
          uniqueName,
          file.mimetype,
          "thumbnail"
        );

        // Gán lại giá trị thumbnail mới cho data update
        data.serie_thumbnail = newImageUrl;
      }

      const updateResult = await serieCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );

      if (updateResult.matchedCount === 0) {
        return null;
      }

      const updatedSerie = await serieCollection.findOne({
        _id: new ObjectId(id),
      });
      console.log("Update Sucess");
      return updatedSerie;
    } catch (err) {
      console.error("Error in updateSerie:", err);
      throw err;
    }
  }

  async deleteSerie(id) {
    try {
      const db = await connectToDatabase();
      const serieCollection = db.collection("series");

      // Lấy dữ liệu serie để biết được URL ảnh
      const serie = await serieCollection.findOne({ _id: new ObjectId(id) });
      if (!serie) {
        throw new Error("Serie không tồn tại.");
      }

      const result = await serieCollection.deleteOne({ _id: new ObjectId(id) });

      // Nếu xóa thành công và có ảnh thì xóa ảnh
      if (result.deletedCount > 0 && serie.serie_thumbnail) {
        await deleteFile(serie.serie_thumbnail);
      }
      console.log("Delete Sucess");
      return result.deletedCount > 0;
    } catch (err) {
      console.error("Error in deleteSerie:", err);
      throw err;
    }
  }
}

module.exports = new SerieService();
