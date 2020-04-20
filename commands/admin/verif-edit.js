const Discord = require("discord.js");
const Commando = require("discord.js-commando");

const { botName, cmdPrefix, verificatorDefaultMessage } = require("../../util/constants");

module.exports = class VerifEditCommand extends Commando.Command {
	constructor(client) {
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
					key: "verifiedRole",
					prompt: "Verified role?",
					type: "role",
					default: (msg, client) =>
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

	async run(msg, args) {
		msg.delete();

		let verifSettings = msg.guild.settings.get("verificatorMessage");

		if (typeof verifSettings !== "object") return msg.reply("No verificator message in this guild");

		await msg.client.channels.fetch(verifSettings.channelId).then(
			(channel) =>
				channel.messages.fetch(verifSettings.id).then(
					(msg) => msg.edit(args.message),
					() => msg.reply("Can't find the verificator message")
				),
			() => msg.reply("Can't find the channel for this verificator message")
		);

		msg.guild.settings.set("verificatorMessage", {
			...verifSettings,
			verifiedRole: args.verifiedRole.id,
		});
	}
};
