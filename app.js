const fs = require("fs-extra");
const path = require("path");
const sqlite = require("sqlite");

const Commando = require("discord.js-commando");

const { cmdPrefix } = require("./util/constants");

const verifyReactionCollector = require("./reactionCollectors/verify");

// YURI: 586644986649378837
// YAOI: 586645137736859648

(async () => {
	if (!fs.existsSync(path.join(__dirname, ".token"))) return console.error(".token file missing!!");

	const botVersion = "git-" + require("child_process").execSync("git rev-parse HEAD").toString().trim().substr(0, 7);

	console.log("Running weeb-p-bot version " + botVersion);

	const client = new Commando.Client({
		owner: ["206147938085371904", "231560496564666369"],
		commandPrefix: cmdPrefix,
		nonCommandEditable: false,
		commandEditableDuration: 0,
	})
		.on("error", console.error)
		.on("ready", () => {
			console.log(`Logged in as ${client.user.tag}.`);

			client.user.setPresence({
				activity: { name: "version " + botVersion, type: "WATCHING" },
				status: "online",
			});
		})
		.on("message", (msg) => {
			if (!msg.guild) return;
		});

	client.on("commandRun", (_, promise, msg) => {
		msg.channel.startTyping();

		promise.finally(() => msg.channel.stopTyping());
	});

	client
		.setProvider(
			sqlite.open(path.join(__dirname, "settings.sqlite3")).then((db) => new Commando.SQLiteProvider(db))
		)
		.then(() => {
			client.guilds.valueOf().forEach((guild) => {
				let verifSettings = guild.settings.get("verificatorMessage");

				if (typeof verifSettings === "object") {
					client.channels.fetch(verifSettings.channelId).then(
						(channel) =>
							channel.messages.fetch(verifSettings.id).then(
								(msg) => verifyReactionCollector(msg),
								() => console.error("Can't find the verificator message")
							),
						() => console.error("Can't find the channel for this verificator message")
					);
				}
			});
		})
		.catch(console.error);

	client.registry
		.registerDefaultTypes()
		.registerGroups([["main", "Main commands"]])
		.registerGroups([["admin", "Admin commands", true]])
		.registerCommandsIn(path.join(__dirname, "commands"));

	client.login(fs.readFileSync(path.join(__dirname, ".token")).toString().split("\n")[0]);
})();
