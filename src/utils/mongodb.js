const { MongoClient } = require("mongodb");
const path = require("path");

const uri =
  "mongodb+srv://user:1@cluster0.9l9x3dx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
