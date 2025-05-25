require("dotenv").config({ path: __dirname + "/../../.env" });
const { MongoClient } = require("mongodb");
const path = require("path");

const uri = process.env.MONGODB_URL;

const client = new MongoClient(uri);

// Export client to be reused throughout the application
let dbConnection = null;

const connectToDatabase = async () => {
  if (dbConnection) return dbConnection;

  try {
    await client.connect();
    console.log("Connected to DocumentDB");
    dbConnection = client.db("e-learn");

    return dbConnection;
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  }
};
connectToDatabase();
module.exports = {
  connectToDatabase,
  client,
};
