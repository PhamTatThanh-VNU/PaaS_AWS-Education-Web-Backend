const { v4: uuidv4 } = require("uuid");

class SeriesService {
  async createSeries(data) {
    const newSerie = {
      serieId: uuidv4(),
      ...data,
    };
    await createItem(newSerie);
    return newSerie;
  }

  async getSeries(serieId) {
    const key = { serieId };
    await getItem(key);
  }

  async updateSeries(serieId, updates) {
    const key = { serieId };
    const updateExpression =
      "SET " +
      Object.keys(updates)
        .map((k, i) => `${k} = :val${i}`)
        .join(", ");

    const expressionAttributeValues = Object.values(updates).reduce(
      (acc, val, i) => {
        acc[`:val${i}`] = val;
        return acc;
      },
      {}
    );

    await updateItem(key, updateExpression, expressionAttributeValues);
  }

  async deleteSeries(serieId) {
    const key = { serieId };
    await deleteItem(key);
  }
}

module.exports = new SeriesService();
