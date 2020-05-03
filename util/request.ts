import fetch from "node-fetch";
import cheerio from "cheerio";
import UserAgent from "user-agents";

export const request = async (url: string, scraping = false) => {
	const userAgent = new UserAgent();

	const booru = await fetch(url, {
		headers: {
			accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
			"user-agent": userAgent.toString(),
			"accept-language": "en-US,en;q=1.0",
			"cache-control": "max-age=0",
		},
	});

	if (!booru.ok) throw Error(`Booru returned ${booru.status}`);

	return booru;
};

export const requestJSON = async (url: string, scraping = false): Promise<Array<any>> => {
	try {
		const booru = await module.exports.request(url, scraping);

		const json = await booru.json();
		if (json.hasOwnProperty("success") && !json.success) throw Error(`Booru returned: "${booru.reason}"`);

		return json;
	} catch (e) {
		return [];
	}
};

export const requestHTML = async (url: string, scraping = true) => {
	try {
		const booru = await module.exports.request(url, scraping);
		const html = await booru.text();

		return await cheerio.load(html);
	} catch (e) {
		return cheerio.load("");
	}
};

export const decodeHTML = (str: string) => str.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
