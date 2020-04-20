module.exports = (message) => {
	const collector = message.createReactionCollector((reaction) => reaction.emoji.name === "✅");

	collector.on("collect", (_, user) => {
		if (message.client.user.id !== user.id)
			message.guild.member(user).roles.add(message.guild.settings.get("verificatorMessage").verifiedRole);
	});
};
