const handler: ExportedHandler = {
	async fetch(request, env, ctx) {
		let apiKey = request.headers.get("ApiKey")
		let stopId = request.headers.get("StopId")
		let lineId = request.headers.get("LineId")
		if (!(apiKey && stopId && lineId)) {
			return new Response("E INVALIDREQ")
		}

		const translinkEndpoint = `https://api.translink.ca/rttiapi/v1/stops/${stopId}/estimates?apikey=${apiKey}&routeNo=${lineId}`;

		async function gatherResponse(response: Response) : Promise<EstimateResponse[] | TranslinkErrorResponse | null> {
			const { headers } = response;
			const contentType = headers.get("content-type") || "";
			if (contentType.includes("application/json")) {
				return await response.json();
			}
			return null;
		}

		const init = {
			headers: {
				"content-type": "application/json;charset=UTF-8",
			},
		};

		const response = await fetch(translinkEndpoint, init);
		const results = await gatherResponse(response);
		if (!results) {
			return new Response("E NULL RESP ")
		}
		if ((results as TranslinkErrorResponse).Code) {
			return new Response("E CODE " + (results as TranslinkErrorResponse).Code.padStart(5, ' '))
		}
		let estimates = results as EstimateResponse[]
		return new Response(
			estimates[0]
				.Schedules
				.map(s => `${s.CancelledStop || s.CancelledTrip ? 'T' : 'F'}${(s.ExpectedCountdown > 99 ? 99 : s.ExpectedCountdown).toString().padStart(2, '0')}${s.ScheduleStatus}`)
				.slice(0, 3)
				.join('')
			, init);
	},
};

interface TranslinkErrorResponse {
	Code: string,
	Message: string
}

interface EstimateResponse {
	RouteNo: string,
	RouteName: string,
	Direction: string,
	RouteMap: { Href: string },
	Schedules: ScheduleResponse[],
}

interface ScheduleResponse {
	// poorly documented, unknown use i.e. NB1
	Pattern: string,
	Destination: string,
	// i.e. 12:10pm
	ExpectedLeaveTime: string,
	// estimated minutes until arrival at stop
	ExpectedCountdown: number,
	// response " " is undocumented, unknown meaning
	ScheduleStatus: "*" | "+" | "-" | " ",
	CancelledTrip: boolean,
	CancelledStop: boolean,
	AddedTrip: boolean,
	AddedStop: boolean,
	// i.e. 11:05:18 am
	LastUpdate: string
}

export default handler;
