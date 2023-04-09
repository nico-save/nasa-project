const http = require("http");

require('dotenv').config();
const app = require("./app");

const {mongoConnect} = require('./services/mongo')

const PORT = process.env.PORT || 8080;

const colors = require("colors");
colors.enable();

const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");
const server = http.createServer(app);


const startServer = async () => {

	await mongoConnect();
	await loadPlanetsData();
	await loadLaunchData();
	server.listen(PORT, () => {
		console.log(
			`Listening on port :`.underline.magenta.bold +
				" " +
				PORT.toString().random +
				"..."
		);
	});
};
startServer();

// app.listen(PORT, () => {
//   console.log(
//     `Server listening on port:`.underline.magenta.bold +
//       ' ' +
//       PORT.toString().random
//   );
// });
