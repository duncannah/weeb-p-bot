const fetch = require("node-fetch");
const cheerio = require("cheerio");

module.exports = {
	request: async (url, scraping = false) => {
		const booru = await fetch(url, {
			headers: {
				accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
				"user-agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3850.0 Safari/537.36",
				"accept-language": "en-US,en;q=1.0",
				"cache-control": "max-age=0"
			}
		});
		if (!booru.ok) throw Error(`Booru returned ${booru.status}`);

		return booru;
	},

	requestJSON: async (url, scraping = false) => {
		try {
			const booru = await module.exports.request(url, scraping);

			const json = await booru.json();
			if (json.hasOwnProperty("success") && !json.success) throw Error(`Booru returned: "${booru.reason}"`);

			return json;
		} catch (e) {
			return [];
		}
	},

	requestHTML: async (url, scraping = true) => {
		try {
			const booru = await module.exports.request(url, scraping);
			const html = await booru.text();

			return await cheerio.load(html);
		} catch (e) {
			return cheerio();
		}
	},

	decodeHTML: (str) => str.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
};
