import fs from "fs-extra";
import path from "path";
import sqlite from "sqlite";
import fg from "fast-glob";

import Discord from "discord.js";
import Commando, { Command } from "discord.js-commando";

import { cmdPrefix, Task } from "./util/constants";

import verifyReactionCollector from "./reactionCollectors/verify";

// YURI: 586644986649378837
// YAOI: 586645137736859648

require("source-map-support").install();

(async () => {
	if (!fs.existsSync(path.join(__dirname, "..", ".token"))) return console.error(".token file missing!!");

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
			console.log(`Logged in as ${client!.user!.tag}.`);

			client!.user!.setPresence({
				activity: { name: "version " + botVersion, type: "WATCHING" },
				status: "online",
			});
		})
		.on("message", (msg) => {
			if (!msg.guild) return;
		});

	client.on("commandRun", (_, prom, msg) => {
		msg.channel.startTyping();

		Promise.race([prom, new Promise((r) => setTimeout(r, 1000 * 5))]).finally(() => msg.channel.stopTyping());
	});

	client
		.setProvider(
			sqlite.open(path.join(__dirname, "..", "settings.sqlite3")).then((db) => new Commando.SQLiteProvider(db))
		)
		.then(() => {
			client.guilds.cache.forEach(async (guild) => {
				// TODO: make settings a type or whatever

				// upgrade
				let oldVerifSettings = client.provider.get(guild, "verificatorMessage");

				if (typeof oldVerifSettings === "object") {
					await client.provider.set(guild, "verificatorMessages", [{ ...oldVerifSettings }]);
					await client.provider.remove(guild, "verificatorMessage");
					console.log("Upgraded verificator message settings for " + guild.name);
				}

				let verifSettings = client.provider.get(guild, "verificatorMessages", []);

				if (verifSettings instanceof Array) {
					verifSettings.forEach((verifSetting: any) =>
						client.channels.fetch(verifSetting.channelId).then(
							(channel) =>
								channel instanceof Discord.TextChannel
									? channel.messages.fetch(verifSetting.id).then(
											(msg) => verifyReactionCollector(msg),
											() => console.error("Can't find the verificator message")
									  )
									: null,
							() => console.error("Can't find the channel for this verificator message")
						)
					);
				}
			});

			fg(path.join(__dirname, "tasks/*.js")).then(async (files) => {
				let tasks = client.settings.get("tasks", {});

				for (const file of files) {
					// await to prevent race
					await import(file).then((module: { default: Task }) => {
						const task = module.default;

						let runFunc = () => {
							if (!task.quiet) console.log("[INFO] Running task " + task.name);
							let start = new Date().getTime();

							let prom = task.func(client).then(
								() =>
									!task.quiet
										? console.log(
												`[INFO] Task ${task.name} completed and took ${
													(new Date().getTime() - start) / 1000
												}s.`
										  )
										: null,
								(err) =>
									console.error(
										`[ERROR] Task ${task.name} failed after ${
											(new Date().getTime() - start) / 1000
										}s.`,
										err
									)
							);

							return prom;
						};

						let updateFunc = () => {
							client.settings.set("tasks", {
								...client.settings.get("tasks", {}),
								[task.name]: new Date().getTime() + task.frequency,
							});

							setTimeout(() => runFunc().finally(updateFunc), task.frequency);
						};

						// if task has been run before
						if (tasks[task.name] && !isNaN(tasks[task.name])) {
							// if time has already passed
							if (tasks[task.name] < new Date().getTime()) runFunc().finally(updateFunc);
							else
								setTimeout(
									() => runFunc().finally(updateFunc),
									parseInt(tasks[task.name], 10) - new Date().getTime()
								);
						} else {
							tasks[task.name] = new Date().getTime() + task.frequency;

							runFunc().finally(updateFunc);
						}
					});
				}

				client.settings.set("tasks", tasks);
			});
		})
		.catch(console.error);

	client.registry
		.registerDefaultTypes()
		.registerGroups([["main", "Main commands"]])
		.registerGroups([["admin", "Admin commands"]])
		.registerCommandsIn(path.join(__dirname, "commands"));

	client.login(fs.readFileSync(path.join(__dirname, "..", ".token")).toString().split("\n")[0]);
})();
