const fetch = require("node-fetch");
const cheerio = require("cheerio");

module.exports = {
	request: async (url, scraping = false) => {
		const booru = await fetch(url, {
			headers: {
				accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
				"user-agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.0 Safari/537.36 Edg/76.0.182.0",
				"accept-language": "en-US,en;q=1.0",
				"cache-control": "max-age=0"
			}
		});
		if (!booru.ok) throw Error(`Booru returned ${booru.status}`);

		return booru;
	},

	requestJSON: async (url, scraping = false) => {
		const booru = await module.exports.request(url, scraping);
		let json;

		try {
			json = await booru.json();
		} catch (e) {
			return [];
		}

		if (json.hasOwnProperty("success") && !json.success) throw Error(`Booru returned: "${booru.reason}"`);

		return json;
	},

	requestHTML: async (url, scraping = true) => {
		const booru = await module.exports.request(url, scraping);
		const html = await booru.text();

		return await cheerio.load(html);
	},

	decodeHTML: (str) => str.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
};
