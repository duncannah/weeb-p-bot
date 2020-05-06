import Discord from "discord.js";
import Commando from "discord.js-commando";

import { botName, cmdPrefix } from "../../util/constants";

module.exports = class HelpCommand extends Commando.Command {
	constructor(client: Commando.CommandoClient) {
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

			args: [
				{
					key: "group",
					prompt: "Group for which to list the commands of",
					type: "string",
					default: "",
				},
			],
		});
	}

	async run(msg: Commando.CommandoMessage, args: any): Promise<null> {
		let embed = new Discord.MessageEmbed()
			.setColor("#a442f4")
			.setAuthor(botName, msg!.client!.user!.displayAvatarURL());

		if (args.group && !this.client.registry.groups.some((g) => g.id === args.group))
			return msg.reply("Command group not found.").then();

		this.client.registry.groups.forEach((group) => {
			if (
				group.id === "internal" ||
				(args.group && group.id !== args.group) ||
				(!args.group && group.id === "admin")
			)
				return;

			embed = embed.addField("\u200B", "**" + group.name + "**");

			group.commands.forEach((cmd) => {
				embed = embed.addField(
					cmdPrefix +
						cmd.name +
						(cmd.aliases ? " (" + cmd.aliases.join(", ") + ")" : "") +
						(cmd.nsfw ? " NSFW" : ""),
					cmd.description
				);
			});
		});

		msg.reply(embed).then((msg) => (msg instanceof Discord.Message ? msg.delete({ timeout: 15000 }) : null));

		return null;
	}
};
