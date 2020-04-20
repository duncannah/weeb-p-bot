const Discord = require("discord.js");
const Commando = require("discord.js-commando");

const { botName, cmdPrefix, verificatorDefaultMessage } = require("../../util/constants");

const verifyReactionCollector = require("../../reactionCollectors/verify");

module.exports = class VerifSendCommand extends Commando.Command {
	constructor(client) {
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

		if (typeof verifSettings === "object")
			await msg.client.channels.fetch(verifSettings.channelId).then(
				(channel) =>
					channel.messages.fetch(verifSettings.id).then(
						(msg) => msg.delete(),
						() => {}
					),
				() => {}
			);

		msg.channel.send(args.message).then((message) => {
			message.react("\u2705").then(() => verifyReactionCollector(message));

			message.guild.settings.set("verificatorMessage", {
				channelId: message.channel.id,
				id: message.id,
				verifiedRole: args.verifiedRole.id,
			});
		});
	}
};
