const Commando = require("discord.js-commando");

const { requestJSON, requestHTML } = require("../../util/request");
const { whichGuild } = require("../../util/constants");

const SITES = {
	gelbooru: async (blacklist, tags) => {
		let url = `https://gelbooru.com/index.php?page=post&s=list&tags=${encodeURIComponent(tags || "").trim()}`;

		const $ = await requestHTML(url);

		const posts = $(".thumbnail-preview a").filter(
			(_, el) =>
				(parseInt(
					($("img", el)
						.attr("title")
						.match(/score:(\d)+ /) || [])[1],
					10
				) || -1) >= 0 &&
				!blacklist.filter(
					(t) =>
						$("img", el)
							.attr("title")
							.split(" ")
							.indexOf(t) !== -1
				).length
		);

		if (posts.length <= 0) return null;

		const postURL = "https:" + posts.eq(Math.round(Math.random() * (posts.length - 1))).attr("href");

		const $p = await requestHTML(postURL);

		return [
			$p('[id^="psc"]').text(),
			$p('[id^="psc"]')
				.parent()
				.prev()
				.text()
				.substr(8),
			$p("#image, source").attr("src")
		];
	},

	danbooru: async (blacklist, tags) => {
		let url = `https://danbooru.donmai.us/posts.json?limit=30&tags=order:random%20${encodeURIComponent(
			tags || ""
		).trim()}`;

		const json = await requestJSON(url);

		const posts = json.filter(
			(p) => p.score >= 0 && !blacklist.filter((t) => p.tag_string.split(" ").indexOf(t) !== -1).length
		);

		if (!posts.length) return null;

		const post = posts[Math.round(Math.random() * (posts.length - 1))];

		return [
			post.score,
			{ s: "Safe", q: "Questionable", e: "Explicit" }[post.rating],
			post.file_ext === "zip" ? post.large_file_url : post.file_url
		];
	}
};

module.exports = class LookupCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: "lookup",
			aliases: ["lu"],
			group: "main",
			memberName: "lookup",
			description: "Lookup stuff from a couple of sites",
			examples: ["lookup animated"],
			guildOnly: true,
			nsfw: true,
			throttling: {
				duration: 3,
				usages: 1
			},

			args: [
				{
					key: "tags",
					label: "tags",
					prompt: "List of tags to search",
					type: "message",
					default: ""
				}
			]
		});
	}

	async run(msg, { tags }) {
		const BLACKLIST = "scat dead necrophilia loli shota real photo".split(" ");
		const WHITELIST = "".split(" ");

		[
			() => {
				BLACKLIST.push(..."yaoi erection penis bara 1boy 2boys multiple_boys male_focus".split(" "));
			},
			() => {
				BLACKLIST.push(..."yuri cleavage breasts 1girl 2girls pussy".split(" "));
				WHITELIST.push(..."yaoi".split(" "));
			}
		][whichGuild(msg.guild.id)]();

		// shuffle array
		let sitesToTry = Object.keys(SITES)
			.map((a) => ({ sort: Math.random(), value: a }))
			.sort((a, b) => a.sort - b.sort)
			.map((a) => a.value);

		let result;

		for (const site of sitesToTry) {
			result = await SITES[site](BLACKLIST, tags + " " + WHITELIST.join(" "));

			if (result) break;
		}

		if (!result) return msg.reply(`couldn't find anything...`);

		msg.reply(`Score: **${result[0]}**; Rating: **${result[1]}**\n${result[2]}`);
	}
};
