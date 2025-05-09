const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const path = require('path');

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use('/static', express.static('static'))


if (port == 3000) /* local build */ {
  require('dotenv').config();
}
const { makeTable, getOverallLeaderboard, retrieveOverall, makeOverallLeaderboard} = require('./modules/getResults');

app.get('/', (req, res) => {
  makeTable().then((result) => {
    res.render("index", { date: result[0], result: result[1] })
  }).catch((error) => {
    console.error('Error in processResultsAndReturnString:', error);
  });

})

app.get('/rules', (req, res) => {
  res.render("rules")
})
// app.get('/overall', async (req, res) => {
//   overall = await retrieveOverall()
//   table = makeOverallLeaderboard(overall)
//   res.render(table)
//   // getOverallLeaderboard((err, table) => {
//   //   if (err) {
//   //     console.error('Error:', err);
//   //     return;
//   //   }
//   //   res.render("overall", { table })
//   // });
  

// })
app.get('/overall', async (req, res) => {
  try {
    const overall = await retrieveOverall();
    const table = await makeOverallLeaderboard(overall);
    
    res.render("overall", { table });  // Assumes you have an 'overall.ejs' or equivalent view
  } catch (error) {
    console.error("Error retrieving leaderboard:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get('/admin', (req, res) => {
  res.render("admin")
})

app.get('/counter', (req, res) => {
  res.render("counter")
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
