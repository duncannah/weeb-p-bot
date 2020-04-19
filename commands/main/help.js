const Discord = require("discord.js");
const Commando = require("discord.js-commando");

const { botName, cmdPrefix } = require("../../util/constants");

module.exports = class HelpCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: "help",
			aliases: ["h"],
			group: "main",
			memberName: "help",
			description: "A list of what I can do",
			examples: ["help"],
			guildOnly: true,
			nsfw: false,
			throttling: {
				duration: 15,
				usages: 1,
			},
		});
	}

	async run(msg, args) {
		let embed = new Discord.MessageEmbed().setColor("#a442f4").setAuthor(botName, msg.client.user.avatar);

		this.client.registry.commands.forEach((cmd) => {
			embed = embed.addField(
				cmdPrefix +
					cmd.name +
					(cmd.aliases ? " (" + cmd.aliases.join(", ") + ")" : "") +
					(cmd.nsfw ? " NSFW" : ""),
				cmd.description
			);
		});

		(await msg.reply(embed)).delete({ timeout: 15000 });
	}
};
