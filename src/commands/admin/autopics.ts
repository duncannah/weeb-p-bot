import Discord from "discord.js";
import Commando, { Command } from "discord.js-commando";

module.exports = class AutoPicsCommand extends Commando.Command {
	constructor(client: Commando.CommandoClient) {
		super(client, {
			name: "autopics",
			group: "admin",
			memberName: "autopics",
			description: "Set up AutoPics",
			guildOnly: true,
			ownerOnly: true,
			nsfw: false,

			args: [
				{
					key: "enable",
					prompt: "Enable?",
					type: "boolean",
					default: false,
				},

				{
					key: "query",
					prompt: "Query to search for",
					type: "string",
					default: "",
				},
			],
			argsPromptLimit: 0,
		});
	}

	async run(msg: Commando.CommandoMessage, args: any): Promise<null> {
		msg.delete();

		const autoPicsChannels: [[string, string]] = msg.guild.settings.get("autoPicsChannels", []);

		if (!args.enable) {
			await msg.guild.settings.set(
				"autoPicsChannels",
				autoPicsChannels.filter((entry) => entry[0] !== msg.channel.id)
			);
		} else {
			await msg.guild.settings.set("autoPicsChannels", [
				...autoPicsChannels.filter((entry) => entry[0] !== msg.channel.id),
				[msg.channel.id, args.query],
			]);
		}

		return null;
	}
};
