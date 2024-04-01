const express = require('express')
const app = express()
const port = 3000
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
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
  makeTable().then((result) => {
    res.render("index", { result })
  }).catch((error) => {
    console.error('Error in processResultsAndReturnString:', error);
  });
  
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
    const results = await collection.find({ /* your query criteria */ }).toArray();

    // Process the retrieved documents
    const outputFileName = 'output.json';
    fs.writeFileSync(outputFileName, JSON.stringify(results, null, 2));
    return results

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function makeTable(results) {
  try {
    const res = await retrieveResults()
    let table = "<table border='1'>"
    table += `
      <caption>
      *Teams highlighted yellow indicate everyone on the team made the cut (15 bonus points)
      </caption>
      <thead>
      <tr>
          <th>Place</th>
          <th>Name</th>
          <th>Player 1</th>
          <th>PTS</th>
          <th>Player 2</th>
          <th>PTS</th>
          <th>Player 3</th>
          <th>PTS</th>
          <th>Player 4</th>
          <th>PTS</th>
          <th>Player 5</th>
          <th>PTS</th>
          <th>Player 6</th>
          <th>PTS</th>
          <th>Player 7</th>
          <th>PTS</th>
          <th>Player 8</th>
          <th>PTS</th>
          <th>Total points</th>
      </tr>
  </thead>
  <tbody>
  `;
  const teams = res[0]["Teams"]
  teams.forEach(team => {
    if (team["AllCut"] == true) {
      table += `
      <tr class="allCut">
      <td>
      `
    } else {
      table += `
      <tr>
      <td>
      `
    }
    table += `${team["Place"]}</td><td class="Name">`
    table += team["Name"]
    table += `
    </td>
    `
    const roster = team["Roster"]
    roster.forEach(player => {
      table += `<td>`
      table += player["Name"]
      table += "</td>"
      table += `<td>${player["Points scored"]}</td>`

    })
    table += `<td>${team["Total Score"]}</td></tr>`

    
  });

    
    table += "</table>"
    return table
  } catch (error) {
    // Handle any errors that occur during the retrieval or processing process
    console.error('Error:', error);
    return 'Error occurred while processing results';
  }

}