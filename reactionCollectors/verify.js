module.exports = (message) => {
	const collector = message.createReactionCollector((reaction) => reaction.emoji.name === "✅");

	collector.on("collect", (_, user) => {
		if (message.client.user.id !== user.id)
			message.guild.members
				.fetch(user)
				.then((member) => member.roles.add(message.guild.settings.get("verificatorMessage").verifiedRole))
				.catch((err) => console.error(err));
	});
};
