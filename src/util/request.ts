import axios from "axios";
import cheerio from "cheerio";

export const request = async (url: string, userAgent: string) => {
	const booru = await axios({
		url: url,
		headers: {
			Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
			"User-Agent": userAgent.toString(),
			"Accept-Encoding": "gzip, deflate, br",
			"Accept-Language": "en-US,en;q=1.0",
			Pragma: "no-cache",
			"Cache-Control": "max-age=0",
		},
		timeout: 1000 * 10,
	}).catch((err) => {
		throw new Error(`Booru returned ${booru.status}`);
	});

	return booru;
};

export const requestJSON = async (url: string, userAgent: string): Promise<Array<any>> => {
	try {
		const booru = await module.exports.request(url, userAgent);

		if (typeof booru.data !== "object") throw Error(`Invalid JSON`);
		if (booru.data.hasOwnProperty("success") && !booru.data.success)
			throw Error(`Booru returned: "${booru.reason}"`);

		return booru.data;
	} catch (e) {
		return [];
	}
};

export const requestHTML = async (url: string, userAgent: string) => {
	try {
		const booru = await module.exports.request(url, userAgent);
		const html = booru.data.toString();

		return await cheerio.load(html);
	} catch (e) {
		return cheerio.load("");
	}
};

export const decodeHTML = (str: string) => str.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
