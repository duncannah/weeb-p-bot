import Commando from "discord.js-commando";
import axios from "axios";

import { Task } from "../util/constants";

export default new Task(
	"fetchUserAgent",
	1000 * 60 * 60 * 24 * 3, // 3 days
	false,
	async (client: Commando.CommandoClient) => {
		// Fetch latest stable Chrome version
		const response = await axios({
			url: "http://omahaproxy.appspot.com/all.json?os=win&channel=stable",
			timeout: 1000 * 10,
		});
		if (typeof response.data !== "object") throw new Error("Response not JSON");
		if (!response.data.length || !response.data[0].versions || !response.data[0].versions[0].version)
			throw new Error("No versions found");

		return client.settings.set(
			"userAgent",
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/" +
				response.data[0].versions[0].version +
				" Safari/537.36"
		);
	}
);
