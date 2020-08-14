import Discord from "discord.js";
import Commando, { Command } from "discord.js-commando";

import { verificatorDefaultMessage } from "../../util/constants";

import verifyReactionCollector from "../../reactionCollectors/verify";

module.exports = class VerifSendCommand extends Commando.Command {
	constructor(client: Commando.CommandoClient) {
		super(client, {
			name: "verif-send",
			group: "admin",
			memberName: "verif-send",
			description: "Send verificator message. Replaces previous message.",
			guildOnly: true,
			ownerOnly: true,
			nsfw: false,

			args: [
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

		/*
		let verifSettings = msg.guild.settings.get("verificatorMessage");

		if (typeof verifSettings === "object")
			await msg.client.channels.fetch(verifSettings.channelId).then(
				(channel) =>
					channel instanceof Discord.TextChannel
						? channel.messages.fetch(verifSettings.id).then(
								(msg) => msg.delete(),
								() => {}
						  )
						: null,
				() => {}
			);
		*/

		msg.channel.send(args.message).then((message) => {
			if (message.guild)
				msg.client.provider
					.set(message.guild, "verificatorMessages", [
						...msg.client.provider.get(message.guild, "verificatorMessages", []),
						{
							channelId: message.channel.id,
							id: message.id,
							verifiedRole: args.verifiedRole.id,
						},
					])
					.then(() => message.react("\u2705").then(() => verifyReactionCollector(message)));
		});

		return null;
	}
};
