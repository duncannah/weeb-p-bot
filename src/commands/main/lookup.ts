import Discord from "discord.js";
import Commando from "discord.js-commando";

import { requestJSON, requestHTML } from "../../util/request";
import { whichGuild, fallbackUserAgent } from "../../util/constants";

// TODO: special rules per guild

const SITES = {
	gelbooru: {
		name: "Gelbooru",
		icon: "https://gelbooru.com/favicon.png",
		look: async (blacklist: string[], whitelist: string[], tags: string, userAgent: string) => {
			let url = `https://gelbooru.com/index.php?page=post&s=list&tags=sort:random%20${encodeURIComponent(
				tags || ""
			).trim()}`;

			const $ = await requestHTML(url, userAgent);

			const posts = $(".thumbnail-preview a").filter(
				(_: any, el: any) =>
					(parseInt(
						($("img", el)!
							.attr("title")!
							.match(/score:(\d)+ /) || [])[1],
						10
					) || -1) >= 0 &&
					(whitelist.length
						? !!whitelist.filter((t) => $("img", el)!.attr("title")!.split(" ").indexOf(t) !== -1).length
						: true) &&
					!blacklist.filter((t) => $("img", el)!.attr("title")!.split(" ").indexOf(t) !== -1).length
			);

			if (posts.length <= 0) return null;

			const postURL = "https:" + posts.eq(Math.round(Math.random() * (posts.length - 1))).attr("href");

			const $p = await requestHTML(postURL, userAgent);

			const imageURL = $p("meta[property='og:image']").attr("content");
			const cleanPostURL = $p("link[rel='canonical']").attr("href");

			return {
				postID: cleanPostURL!.substring(cleanPostURL!.lastIndexOf("=") + 1),
				postURL: cleanPostURL,
				imageURL: imageURL,
				score: $p('[id^="psc"]').text(),
				rating: $p('[id^="psc"]').parent().prev().text().substr(8).toLowerCase(),
				fileExt: imageURL!.substring(imageURL!.lastIndexOf(".") + 1),
				timestamp: $p('[id^="psc"]').parent().prevUntil("h3", "li").last().next().text().substring(8, 27),
				characters: $p(".tag-type-character a:nth-child(2)")
					.map((_: any, e: any) => $p(e).text().replace("_", " "))
					.get(),
			};
		},
	},

	danbooru: {
		name: "Danbooru",
		icon: "https://github.com/Bionus/imgbrd-grabber/raw/gh-pages/assets/img/sources/danbooru.png",
		look: async (blacklist: string[], whitelist: string[], tags: string, userAgent: string) => {
			let url = `https://danbooru.donmai.us/posts.json?limit=30&tags=order:random%20${encodeURIComponent(
				tags || ""
			).trim()}`;

			const json = await requestJSON(url, userAgent);

			const posts = json.filter(
				(p: any) =>
					p.score >= 0 &&
					p.rating !== "s" &&
					(whitelist.length
						? !!whitelist.filter((t) => p.tag_string.split(" ").indexOf(t) !== -1).length
						: true) &&
					!blacklist.filter((t) => p.tag_string.split(" ").indexOf(t) !== -1).length
			);

			if (!posts.length) return null;

			const post = posts[Math.round(Math.random() * (posts.length - 1))];

			return {
				postID: post.id,
				postURL: "https://danbooru.donmai.us/posts/" + post.id,
				imageURL: post.file_ext === "zip" ? post.large_file_url : post.file_url,
				score: post.score,
				// @ts-ignore
				rating: { s: "safe", q: "questionable", e: "explicit" }[post.rating],
				fileExt: post.file_ext,
				timestamp: post.created_at,
				characters: (post.tag_string_character || "").split(" ").map((c: string) => c.replace("_", " ")),
			};
		},
	},
};

module.exports = class LookupCommand extends Commando.Command {
	constructor(client: Commando.CommandoClient) {
		super(client, {
			name: "lookup",
			aliases: ["lu"],
			group: "main",
			memberName: "lookup",
			description: "Lookup stuff from a couple of sites (only on certain channels)",
			examples: ["lookup animated"],
			guildOnly: true,
			nsfw: true,
			throttling: {
				duration: 3,
				usages: 1,
			},

			args: [
				{
					key: "tags",
					label: "tags",
					prompt: "List of tags to search",
					type: "string",
					default: "",
				},
			],
		});
	}

	async run(msg: Commando.CommandoMessage, { tags }: any): Promise<null> {
		const ALLOWEDCHANNELS = [
			"yaoiposting",
			"yaoi-gifs",
			//
			"yuriposting",
			"yuri-gifs",
			"futa",
		];

		if (!ALLOWEDCHANNELS.includes((msg.channel as Discord.TextChannel).name)) return null;

		const BLACKLIST = "rating:safe scat dead death necrophilia loli shota real photo age_difference bestiality beastiality bug bugs pregnant birth vore watersports urine piss pee boku_no_pico creepy body_horror suicide".split(
			" "
		);
		const WHITELIST: string[] = [];

		[
			() => {
				BLACKLIST.push(
					..."yaoi erection penis bara 1boy 2boys 3boys 4boys 5boys 6+boys multiple_boys male_focus".split(
						" "
					)
				);
			},
			() => {
				BLACKLIST.push(
					..."yuri cleavage breasts 1girl 2girls 3girls 4girls 5girls 6+girls pussy futa futanari".split(" ")
				);
				WHITELIST.push(..."1boy 2boys 3boys 4boys 5boys 6+boys yaoi".split(" "));
			},
		][whichGuild(msg.guild.id)]();

		if ((msg.channel as Discord.TextChannel).name.match(/-gifs$/) !== null) tags += " animated";

		if ((msg.channel as Discord.TextChannel).name.match(/futa/) !== null) tags += " futanari";

		// shuffle array
		let sitesToTry = Object.keys(SITES)
			.map((a) => ({ sort: Math.random(), value: a }))
			.sort((a, b) => a.sort - b.sort)
			.map((a) => a.value);

		// try 3 times
		sitesToTry = [...sitesToTry, ...sitesToTry, ...sitesToTry];

		let post: any;
		let booru;

		for (const site of sitesToTry) {
			// @ts-ignore
			booru = SITES[site];
			post = await booru.look(
				BLACKLIST,
				WHITELIST,
				tags,
				msg.client.settings.get("userAgent", fallbackUserAgent)
			);

			if (post) break;
		}

		if (!post) return msg.reply(`couldn't find anything...`).then();

		let characters = (post.characters.length
			? post.characters.length > 4
				? [...post.characters.slice(0, 4), post.characters.length - 4 + "+"]
				: post.characters
			: []
		).join(", ");

		let embed = new Discord.MessageEmbed({
			title: "Post #" + post.postID + (characters.length ? ": " + characters : ""),
			description: "**Score**: " + post.score + "; **Rating**: " + post.rating,
			url: post.postURL,
			timestamp: post.timestamp,
			footer: { text: booru.name, icon_url: booru.icon },
			image: {
				url: post.imageURL,
			},
		});

		await msg
			.reply({ embed })
			.then(() => (["webm", "mp4"].includes(post.fileExt) ? msg.channel.send(post.imageURL) : null));

		return null;
	}
};
