import Discord from "discord.js";
import Commando from "discord.js-commando";

import { verificatorDefaultMessage } from "../../util/constants";

module.exports = class VerifListCommand extends Commando.Command {
	constructor(client: Commando.CommandoClient) {
		super(client, {
			name: "verif-list",
			group: "admin",
			memberName: "verif-list",
			description: "List verificator messages.",
			guildOnly: true,
			ownerOnly: true,
			nsfw: false,

			args: [],
			argsPromptLimit: 0,
		});
	}

	async run(msg: Commando.CommandoMessage, args: any): Promise<null> {
		msg.delete();

		let verifSettings = msg.guild.settings.get("verificatorMessages", []);

		await msg
			.reply(
				"```" +
					verifSettings
						.map(
							(setting: any) =>
								"#" + setting.id + " at " + (msg.guild.channels.resolve(setting.channelId) || {}).name
						)
						.join("\n") +
					"```"
			)
			.then();

		return null;
	}
};
