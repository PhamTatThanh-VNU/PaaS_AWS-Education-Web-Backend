// createIndex.js
const { connectToDatabase } = require("./mongodb");

(async () => {
  const db = await connectToDatabase();
  const serieCollection = db.collection("series");

  await serieCollection.createIndex({ serie_title: "text" });
  console.log("✅ Index created on 'serie_title'");
})();
