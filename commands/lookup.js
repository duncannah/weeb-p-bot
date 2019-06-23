const { requestJSON, requestHTML } = require("../util/request");
//const fetch = require("node-fetch");

//const Discord = require("discord.js");

const SITES = {
	gelbooru: async (blacklist, tags) => {
		let url = `https://gelbooru.com/index.php?page=post&s=list&tags=${encodeURIComponent(tags || "").trim()}`;

		const $ = await requestHTML(url);

		const posts = $(".thumbnail-preview a").filter(
			(_, el) =>
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
		let url = `https://danbooru.donmai.us/posts.json?limit=30&tags=${encodeURIComponent(tags || "").trim()}`;

		const json = await requestJSON(url);

		const posts = json.filter((p) => !blacklist.filter((t) => p.tag_string.split(" ").indexOf(t) !== -1).length);

		if (!posts.length) return null;

		const post = posts[Math.round(Math.random() * (posts.length - 1))];

		return [post.score, { s: "Safe", q: "Questionable", e: "Explicit" }[post.rating], post.file_url];
	}
};

module.exports = {
	command: "lookup",
	desc: "Lookup stuff from a couple of sites",
	nsfw: true,

	func: async (msg, txt) => {
		const BLACKLIST = "scat dead necrophilia loli shota".split(" ");
		const WHITELIST = "".split(" ");

		if (msg.serverType === 0)
			BLACKLIST.push(..."yaoi erection penis bara 1boy 2boys multiple_boys male_focus".split(" "));
		else if (msg.serverType === 1) {
			BLACKLIST.push(..."yuri cleavage breasts 1girl 2girls pussy".split(" "));
			WHITELIST.push(..."yaoi".split(" "));
		}

		// shuffle array
		let sitesToTry = Object.keys(SITES)
			.map((a) => ({ sort: Math.random(), value: a }))
			.sort((a, b) => a.sort - b.sort)
			.map((a) => a.value);

		let result;

		for (const site of sitesToTry) {
			result = await SITES[site](BLACKLIST, txt + " " + WHITELIST.join(" "));

			if (result) break;
		}

		if (!result) return msg.reply(`couldn't find anything sweetie :(`);

		msg.reply(`Score: **${result[0]}**; Rating: **${result[1]}**\n${result[2]}`);

		/*

		let url = `https://gelbooru.com/index.php?page=post&s=list&tags=${encodeURIComponent(txt || "")}`;

		const $ = await requestHTML(url);

		const posts = $(".thumbnail-preview a").filter(
			(_, el) =>
				!BLACKLIST.filter(
					(t) =>
						$("img", el)
							.attr("title")
							.split(" ")
							.indexOf(t) !== -1
				).length
		);

		if (posts.length <= 0) return msg.reply(`couldn't find anything sweetie :(`);

		const postURL = "https:" + posts.eq(Math.round(Math.random() * (posts.length - 1))).attr("href");

		const $p = await requestHTML(postURL);

		msg.reply(
			`Score: **${$p('[id^="psc"]').text()}**; Rating: **${$p('[id^="psc"]')
				.parent()
				.prev()
				.text()
				.substr(8)}**\n${$p("#image, source").attr("src")}`
		);

		*/

		/*
	
		let fileURL;
	
		if ($p("source").length)
			fetch($p("source").attr("src"), { method: "HEAD" }).then((res) => {
				if (parseInt(res.headers.get("Content-Length"), 10) > 8388119) {
					msg.reply(
						`Score: **${$p('[id^="psc"]').text()}**; Rating: **${$p('[id^="psc"]')
							.parent()
							.prev()
							.text()
							.substr(8)}**\n${$p("source").attr("src")}`
					);
					fileURL = false;
				} else fileURL = $p("source").attr("src");
			});
		else fileURL = $p("#image").attr("src");
	
		if (fileURL)
			msg.reply(
				`Score: **${$p('[id^="psc"]').text()}**; Rating: **${$p('[id^="psc"]')
					.parent()
					.prev()
					.text()
					.substr(8)}**`,
				new Discord.MessageAttachment(fileURL)
			);
		*/
	}
};
