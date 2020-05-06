import Commando from "discord.js-commando";

export const botName = "Weeb Porn Bot™️";

export const cmdPrefix = "!";

const YURI = "586644986649378837";
const YAOI = "586645137736859648";

export const whichGuild = (i: string) => (i === YURI ? 0 : i === YAOI ? 1 : 1);

// verificator

export const verificatorDefaultMessage =
	"⚠️ By **reacting** to this message below (click the ✅) you're agreeing to the rules you've just read and __***will gain access to the rest of the server***__.";

export class Task {
	constructor(name: string, frequency: number, func: (client: Commando.CommandoClient) => Promise<any>) {
		this.name = name;
		this.frequency = frequency;
		this.func = func;
	}

	public name: string;
	public frequency: number;
	public func: (client: Commando.CommandoClient) => Promise<any>;
}

export const fallbackUserAgent =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4135.1 Safari/537.36";
