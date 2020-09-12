import Discord from "discord.js";
import Commando from "discord.js-commando";

import { Task } from "../util/constants";

export default new Task(
	"autoPics",
	1000 * 60 * 60 * 2, // 2 HOURS
	true,
	async (client: Commando.CommandoClient) => {
		const lookupCommand = client.registry.commands.find((c) => c.name === "lookup");

		if (!lookupCommand) return Promise.resolve();

		Promise.all(
			client.guilds.cache.map((guild) => {
				const autoPicsChannels: [[string, string]] = client.provider.get(guild, "autoPicsChannels", []);

				return Promise.all(
					autoPicsChannels.map((entry, index) =>
						new Promise((resolve) => setTimeout(resolve, 5000 * index)).then(() => {
							const channel = guild.channels.resolve(entry[0]);
							if (channel instanceof Discord.TextChannel) {
								// this will do
								return lookupCommand.run(
									(new Discord.Message(client, {}, channel) as unknown) as Commando.CommandoMessage,
									{
										tags: entry[1],
										automated: true,
									},
									false
								);
							}
						})
					)
				);
			})
		);
	}
);
