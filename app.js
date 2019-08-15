const fs = require("fs-extra");
const path = require("path");

const Commando = require("discord.js-commando");

const { cmdPrefix } = require("./util/constants");

// YURI: 586644986649378837
// YAOI: 586645137736859648

(async () => {
	if (!fs.existsSync(path.join(__dirname, ".token"))) return console.error(".token file missing!!");

	const client = new Commando.Client({
		owner: ["206147938085371904", "231560496564666369"],
		commandPrefix: cmdPrefix
	})
		.on("ready", () => {
			console.log(`Logged in as ${client.user.tag}.`);
		})
		.on("message", (msg) => {
			if (!msg.guild) return;
		});

	client.registry
		.registerDefaultTypes()
		.registerGroups([["main", "Main commands"]])
		.registerCommandsIn(path.join(__dirname, "commands"));

	client.login(
		fs
			.readFileSync(path.join(__dirname, ".token"))
			.toString()
			.split("\n")[0]
	);
})();
