const fs = require('fs');

try {
    const jsonData = fs.readFileSync('output.json', 'utf8');
    const jsonObject = JSON.parse(jsonData);
    const teams = jsonObject[0]["Teams"]
	teams.forEach(team => {
		team["Roster"].forEach(player => {
			console.log(player["Name"])
		})
	});

} catch (error) {
    console.error('Error reading JSON file:', error);
}