import Discord from "discord.js";
import Commando from "discord.js-commando";

export default function (message: Discord.Message): void {
	const collector = message.createReactionCollector((reaction) => reaction.emoji.name === "✅");

	collector.on("collect", (_, user) => {
		message instanceof Commando.CommandoMessage
			? message.client!.user!.id !== user.id
				? message
						.guild!.members.fetch(user)
						.then((member) =>
							member.roles.add(message.guild.settings.get("verificatorMessage").verifiedRole)
						)
						.catch((err) => console.error(err))
				: null
			: console.error(new Error(), message);
	});
}
