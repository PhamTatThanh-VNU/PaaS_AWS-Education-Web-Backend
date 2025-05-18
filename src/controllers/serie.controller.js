const serieService = require("../services/serie.service");

class SerieController {
  // [POST] /series
  async createSerie(req, res) {
    try {
      const data = req.body;
      const file = req.file || null;

      //   // Taking userID
      //   const userId = req.user.userId;
      const newSerie = await serieService.createSerie(
        { ...data /*, serie_user: userId  */ },
        file
      );

      return res.status(201).json(newSerie);
    } catch (err) {
      console.error("Error in createSerie:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // [GET] /series
  async getAllSeries(req, res) {
    try {
      const series = await serieService.getAllSeries(req.query);
      return res.status(200).json(series);
    } catch (err) {
      console.error("Error in getAllSeries:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // [GET] /series/:id
  async getSerieById(req, res) {
    try {
      const serie = await serieService.getSerieById(req.params.id);
      if (!serie) {
        return res.status(404).json({ message: "Serie not found" });
      }
      return res.status(200).json(serie);
    } catch (err) {
      console.error("Error in getSerieById:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // [PATCH] /series/:id
  async updateSerie(req, res) {
    try {
      const id = req.params.id;
      const data = req.body;
      const file = req.file;

      const updatedSerie = await serieService.updateSerie(id, data, file);
      if (!updatedSerie) {
        return res.status(404).json({ message: "Serie not found" });
      }
      return res.status(200).json(updatedSerie);
    } catch (err) {
      console.error("Error in updateSerie:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // [DELETE] /series/:id
  async deleteSerie(req, res) {
    try {
      const deletedSerie = await serieService.deleteSerie(req.params.id);
      if (!deletedSerie) {
        return res.status(404).json({ message: "Serie not found" });
      }
      return res.status(200).json({ message: "Serie deleted successfully" });
    } catch (err) {
      console.error("Error in deleteSerie:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = new SerieController();
