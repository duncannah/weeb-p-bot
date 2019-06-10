const fs = require("fs-extra");
const path = require("path");
const fg = require("fast-glob");

const Discord = require("discord.js");

const CMDPREFIX = "!";
const CMDS = [];

// YURI: 586644986649378837
// YAOI: 586645137736859648

(async () => {
	if (!fs.existsSync(path.join(__dirname, ".token"))) return console.error(".token file missing!!");

	await fg("commands/*.js").then((files) =>
		files.forEach((file) => {
			let cmd = require(path.join(__dirname, file));
			if (
				typeof cmd === "object" &&
				cmd.hasOwnProperty("command") &&
				cmd.hasOwnProperty("desc") &&
				cmd.hasOwnProperty("func")
			)
				CMDS.push(cmd);
			else console.info(`${file} is not constructed properly; not loading`);
		})
	);

	const client = new Discord.Client()
		.on("ready", () => {
			console.log(`Logged in as ${client.user.tag}.`);
		})
		.on("message", (msg) => {
			if (msg.guild.id === "586644986649378837") msg.serverType = 0;
			else if (msg.guild.id === "586645137736859648") msg.serverType = 1;
			else return;

			if (msg.toString().startsWith(CMDPREFIX))
				for (const cmd of CMDS) {
					let match = msg.toString().match(new RegExp(CMDPREFIX + cmd.command + "(.*)", "i"));

					if (match) cmd.func(msg, match[1], { CMDPREFIX, CMDS });
				}
		});

	client.login(fs.readFileSync(path.join(__dirname, ".token")).toString());
})();
