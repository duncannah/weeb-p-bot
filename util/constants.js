exports.botName = "Weeb Porn Bot™️";

exports.cmdPrefix = "!";

const YURI = "586644986649378837";
const YAOI = "586645137736859648";

exports.whichGuild = (i) => (i === YURI ? 0 : i === YAOI ? 1 : 1);

// verificator

exports.verificatorDefaultMessage =
	"⚠️ By **reacting** to this message below (click the ✅) you're agreeing to the rules you've just read and __***will gain access to the rest of the server***__.";
