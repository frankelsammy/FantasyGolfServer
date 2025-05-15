const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000;

if (port == 3000) /* local build */ {
	require('dotenv').config();
}
const uri = process.env.MONGODB_URI;
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 120 }); // Cache with a TTL of 2 minutes (120 seconds)
const fs = require('fs');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	}
});

async function retrieveResults() {
	try {
		// Connect the client to the server
		await client.connect();

		const database = client.db('FantasyGolf');
		const collection = database.collection('League');
		const results = await collection.find({ title: "leaderboard" }).toArray();

		// Process the retrieved documents
		const outputFileName = 'output.json';
		fs.writeFileSync(outputFileName, JSON.stringify(results, null, 2));
		return results

	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
}
async function retrieveOverall() {
	try {
		// Connect the client to the server
		await client.connect();

		const database = client.db('FantasyGolf');
		const collection = database.collection('League');
		const results = await collection.find({ title: "overall" }).toArray();

		// Process the retrieved documents
		const outputFileName = 'overall.json';
		return results

	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
}

async function makeTable(results) {
	try {
		let res;
		let results = [];
		const cachedData = cache.get('database');
		if (cachedData) { //Check if the database is still in the cache
			res = cachedData
			console.log("using cached data")
		} else {
			res = await retrieveResults()
			console.log("retrieving from db")
			cache.set("database", res)
		}

		results[0] = res[0]["Date"];
		const currentRound = res[0]["CURRENT_ROUND"]

		let table = "<table border='1'>"
		table += `
		<caption>
		Teams highlighted yellow indicate everyone on the team made the cut (15 bonus points)
		<br>Teams with ${res[0]["worstTop25"]} get 15 bonus points (lowest ranked chosen player in top 25)`

		if (currentRound == 1 || currentRound == 2) {
			table += `<br> Using a projected Cut Line of 70th Place`;
		}
		table += `
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
			<th>Total Team Points</th>
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
			const date = new Date()
			const today = date.getDay()
			roster.forEach(player => {
				let finish = player["Finish"] === 1000 ? "N/A" : player["Finish"];
				if ((currentRound == 3 || currentRound == 4) && player["Cut"] && finish != "N/A") {
					finish = "CUT"
				}
				table += `<td>`
				full_name = player["Name"].split(" ")
				last_name = full_name[full_name.length - 1]
				table += `${last_name} (${finish})`
				table += "</td>"
				points = player["Points scored"]

				if (player["Name"] == res[0]["worstTop25"]) {
					points += 15
				}

				table += `<td>${points}</td>`

			})
			table += `<td>${team["Total Score"]}</td></tr>`


		});


		table += "</table>"
		results[1] = table
		return results
	} catch (error) {
		// Handle any errors that occur during the retrieval or processing process
		console.error('Error:', error);
		return 'Error occurred while processing results';
	}

}

async function makeOverallLeaderboard(overall) {
	teams = overall[0]["Teams"]
	let table = `<table id="overall" border='1'>`
	table += "<tr><th>Place</th><th>Name</th><th>Masters Score</th><th>PGA Champ Score</th><th>US Open Score</th><th>Open Champ Score</th><th>Total</th>"
	teams.forEach((team, index) => {
		table += `<tr>
		  <td>${team["place"]}</td>
		  <td>${team["name"]}</td>
		  <td>${team["masters"]}</td>
		  <td>${team["pga"]}</td>
		  <td>${team["US"]}</td>
		  <td>${team["open"]}</td>
		  <td>${team["total"]}</td>
		</tr>`;
	});
	table += "</table>"
	return table

}
module.exports = { makeTable, makeOverallLeaderboard, retrieveOverall }

