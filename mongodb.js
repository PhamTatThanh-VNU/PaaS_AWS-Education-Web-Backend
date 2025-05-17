const { MongoClient } = require("mongodb");
const fs = require("fs");

const ca = [fs.readFileSync("global-bundle.pem")];

const uri =
  "mongodb://root:admin123@docdb-2025-05-17-16-07-35.cluster-cl6a6swcexfm.ap-southeast-1.docdb.amazonaws.com:27017/?tls=true&readPreference=secondaryPreferred&retryWrites=false";

const client = new MongoClient(uri, {
  tls: true,
  tlsCAFile: "./global-bundle.pem", // nên có đường dẫn rõ ràng
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to DocumentDB");
    const db = client.db("mydb");
    // thao tác với db
  } finally {
    await client.close();
  }
}
run().catch(console.error);
