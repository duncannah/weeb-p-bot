import Discord from "discord.js";
import Commando from "discord.js-commando";

import { verificatorDefaultMessage } from "../../util/constants";

module.exports = class VerifEditCommand extends Commando.Command {
	constructor(client: Commando.CommandoClient) {
		super(client, {
			name: "verif-edit",
			group: "admin",
			memberName: "verif-edit",
			description: "Edit verificator message.",
			guildOnly: true,
			ownerOnly: true,
			nsfw: false,

			args: [
				{
					key: "verificatorID",
					prompt: "ID of verificator?",
					type: "integer",
				},

				{
					key: "verifiedRole",
					prompt: "Verified role?",
					type: "role",
					default: (msg: Commando.CommandoMessage, client: Commando.Client) =>
						new (require("discord.js-commando/src/types/role"))(client).parse("Verified", msg),
				},

				{
					key: "message",
					prompt: "Verificator message?",
					type: "string",
					default: verificatorDefaultMessage,
				},
			],
			argsPromptLimit: 0,
		});
	}

	async run(msg: Commando.CommandoMessage, args: any): Promise<null> {
		msg.delete();

		let verificators = msg.guild.settings.get("verificatorMessages");

		if (!(verificators instanceof Array)) return msg.reply("No verificator messages in this guild").then();

		let verifSettings: any = verificators.find((verifSettings: any) => verifSettings.id == args.verificatorID);

		if (typeof verifSettings !== "object" || verifSettings === null)
			return msg.reply("Can't find message with ID").then();

		await msg.client.channels.fetch(verifSettings.channelId).then(
			(channel) =>
				channel instanceof Discord.TextChannel
					? channel.messages.fetch(verifSettings.id).then(
							(msg) => msg.edit(args.message),
							() => msg.reply("Can't find the verificator message")
					  )
					: null,
			() => msg.reply("Can't find the channel for this verificator message")
		);

		verificators[verificators.findIndex((verificator: any) => verificator.id === args.verificatorID)] = {
			...verifSettings,
			verifiedRole: args.verifiedRole.id,
		};

		msg.guild.settings.set("verificatorMessages", verificators);

		return null;
	}
};
