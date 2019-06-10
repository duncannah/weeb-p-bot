const { requestHTML } = require("../util/request");

const Discord = require("discord.js");

module.exports = {
	command: "help",
	desc: "List of all the things I can do",

	func: async (msg, txt, ext) => {
		let embed = new Discord.MessageEmbed()
			.setColor("#a442f4")
			.setAuthor(msg.client.user.username, msg.client.user.avatar);

		ext.CMDS.forEach((cmd) => {
			embed = embed.addField(ext.CMDPREFIX + cmd.command, cmd.desc);
		});

		msg.reply(embed);
	}
};
