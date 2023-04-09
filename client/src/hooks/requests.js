const API_URL = process.env.API_URL || "http://localhost:5000/v1";

// Load planets and return as JSON
const httpGetPlanets = async () => {
	const res = await fetch(`${API_URL}/planets`);
	return await res.json();
};

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
	const res = await fetch(`${API_URL}/launches`);
	const fetchedLaunches = await res.json();
	return fetchedLaunches.sort((a, b) => {
		return a.flightNumber - b.flightNumber;
	});
}

async function httpSubmitLaunch(launch) {
	try {
		return await fetch(`${API_URL}/launches`, {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(launch),
		});
	} catch (error) {
		return { ok: false };
	}
}

async function httpAbortLaunch(id) {
	try {
		return await fetch(`${API_URL}/launches/${id}`, {
			method: "delete",
		});
	} catch (error) {
		return { ok: false };
	}
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
