const express = require('express')
const app = express()
const port = 3000
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
console.log(uri)
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.render("index")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

async function retrieveResults() {
  try {
    // Connect the client to the server
    await client.connect();

    const database = client.db('FantasyGolf');
    const collection = database.collection('League');
    const documents = await collection.find({ /* your query criteria */ }).toArray();

    // Process the retrieved documents
    console.log('Retrieved Documents:', documents);
    const outputFileName = 'output.json';
    fs.writeFileSync(outputFileName, JSON.stringify(documents, null, 2));


  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
//retrieveResults().catch(console.dir);