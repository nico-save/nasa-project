const axios = require('axios')
const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;


 

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

const populateLaunches = async () => {
	console.log("Loading launch data");
	const response = await axios.post(SPACEX_API_URL, 
			{
				query: {},
				options: {
					pagination: false,
					populate: [
						{
							path: 'rocket',
							select: {
								'name':1
							}
						},
						{
							path: 'payloads',
							select: {
								'customers':1
							}
						}
					]
				}
			}
		)
		if(response.status !== 200) {
			console.log("Problem downloading launch data");
			throw new Error('Launch data download failed')
		}
		const launchDocs = response.data.docs;
		for(const launchDoc of launchDocs) {
			const payloads = launchDoc.payloads;
			const customers = payloads.flatMap(payload => {return payload.customers} )
			const launch = {
				flightNumber: launchDoc.flight_number,
				mission: launchDoc.name,
				rocket: launchDoc.rocket.name,
				launchDate: new Date(launchDoc.date_local),
			   
				upcoming: launchDoc.upcoming,
				success: launchDoc.success,
				customers:customers,
			}
			console.log(launch.flightNumber, launch.mission)
			await saveLaunch(launch);
		}
}
const loadLaunchData = async () => {
const firstLaunch =	await findLaunch({
		flightNumber:1,
		rocket: 'Falcon 1',
		mission: 'FalconSat'
	})

	if(firstLaunch){
		console.log('Launch data already loaded!')
		 
	} else {
	 await populateLaunches()
	}

}

const findLaunch = async(filter) => {
	return await launchesDatabase.findOne(filter);
}
 
const existsLaunchWithId = async (launchId) => {
	return await findLaunch({flightNumber:launchId});
};

const getLatestFligthNumber = async () => {
 const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber');
if(!latestLaunch){
	return DEFAULT_FLIGHT_NUMBER;
}
 return latestLaunch.flightNumber;
}

const getAllLaunches = async (skip, limit) => {
	return await launchesDatabase.find({}, {
		'_id': 0,
 		 '__v':0
	}).sort({flightNumber: 1}).skip(skip).limit(limit);
};

 async function saveLaunch (launch) {

	await launchesDatabase.findOneAndUpdate({
		flightNumber: launch.flightNumber,
	}, launch, {upsert: true});
}

const scheduleNewLaunch = async (launch) => {
	const planet = await planets.findOne({
		keplerName: launch.destination,
	});
	if(!planet) {
		throw new Error("Planet not found");
	}
	const newFligthNumber = await getLatestFligthNumber() + 1;
	const newLaunch = Object.assign(launch, {
		success: true,
		upcoming: true,
		customers: ["Zero to Mastery", "NASA"],
		flightNumber:newFligthNumber
	})
     await saveLaunch(newLaunch);
}
 

const abortLaunchById = async (launchId) => {
 
const aborted = await launchesDatabase.updateOne({
		flightNumber: launchId
	}, {
		upcoming: false,
		success: false
	})
 
	return aborted.modifiedCount === 1;
};

module.exports = {
	loadLaunchData,
	existsLaunchWithId,
	getAllLaunches, 
	scheduleNewLaunch,
	abortLaunchById,
};
