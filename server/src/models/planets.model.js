const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

const planets = require("./planets.mongo");

const colors = require("colors");
colors.enable();

const isHabitablePlanet = (planet) => {
	return (
		planet["koi_disposition"] === "CONFIRMED" &&
		planet["koi_insol"] > 0.36 &&
		planet["koi_insol"] < 1.11 &&
		planet["koi_prad"] < 1.6
	);
};

const loadPlanetsData = () => {
	return new Promise((res, rej) => {
		fs.createReadStream(
			path.join(__dirname, "..", "..", "data", "kepler_data.csv")
		)
			.pipe(
				parse({
					comment: "#",
					columns: true,
				})
			)
			.on("data", async (data) => {
				if (isHabitablePlanet(data)) {
					await savePlanet(data);
				}
			})
			.on("error", (err) => {
				console.log(err);
				rej(err);
			})
			.on("end", async () => {
				const countPlanetsFound = (await getAllPlanets()).length;
				console.log(`${countPlanetsFound} habitable planets found!`.random);
				res();
			});
	});
};

const savePlanet = async (planet) => {
	try {
		await planets.updateOne(
			{
				keplerName: planet.kepler_name,
			},
			{
				keplerName: planet.kepler_name,
			},
			{ upsert: true }
		);
	} catch (error) {
		console.error(error);
	}
};

const getAllPlanets = async () => {
	return await planets.find({}, {
		'__v':0,
		'_id':0
	});
};

module.exports = {
	getAllPlanets,
	loadPlanetsData: loadPlanetsData,
};
