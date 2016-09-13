'use strict';

const MD5 = require('MD5');
const http = require('http');
const fs = require('fs');
const moment = require('moment');
const nani = require('nani').init("niisama1-uvake", "llbgsBx3inTdyGizCPMgExBVmQ5fU");
const Autolinker = require('autolinker');

let amCache = {anime:{}, manga:{}};
let colorCache = {};
Wisp.customColors = {};
let regdateCache = {};
Users.vips = [];
let Advertisements = {};
let monData;
try {
	monData = fs.readFileSync("data/WSSB.txt").toString().split("\n\n");
} catch (e) {}

Wisp.autoJoinRooms = {};
try {
	Wisp.autoJoinRooms = JSON.parse(fs.readFileSync('config/autojoin.json', 'utf8'));
} catch (e) {}

Wisp.tells = {};
try {
	Wisp.tells = JSON.parse(fs.readFileSync('config/tells.json', 'utf*'));
} catch (e) {}
const mainColors = {
	'theimmortal': 'taco',
	'bmelts': 'testmelts',
	'zarel': 'aeo',
	'zarell': 'aeo',
	'greatsage': 'test454',
	// 'snowflakes': 'snowflake',
	'jumpluff': 'zacchaeus',
	'zacchaeus': 'jumpluff',
	'kraw': 'kraw1',
	'growlithe': 'steamroll',
	'snowflakes': 'endedinariot',
	'doomvendingmachine': 'theimmortal',
	'mikel': 'mikkel',
	'arcticblast': 'rsem',
	'mjb': 'thefourthchaser',
	'thefourthchaser': 'mjb',
	'tfc': 'mjb',
	'mikedecishere': 'mikedec3boobs',
	'heartsonfire': 'haatsuonfaiyaa',
	'royalty': 'wonder9',
	// 'osiris': 'yamraiha',
	'limi': 'azure2',
	'haunter': 'cathy',
	'ginganinja': 'piratesandninjas',
	'aurora': 'c6n6fek',
	'jdarden': 'danielcross',
	'solace': 'amorlan',
	'dcae': 'galvatron',
	'queenofrandoms': 'hahaqor',
	'jelandee': 'thejelandee',
	'diatom': 'dledledlewhooop',
	// 'waterbomb': 'wb0',
	'texascloverleaf': 'aggronsmash',
	'treecko': 'treecko56',
	'treecko37': 'treecko56',
	'violatic': 'violatic92',
	'exeggutor': 'ironmanatee',
	'ironmanatee': 'exeggutor',
	// 'shamethat': 'aaa10',
	'skylight': 'aerithass',
	// 'prem': 'premisapieceofshit',
	'goddessbriyella': 'jolteonxvii', // third color change
	'nekonay': 'catbot20',
	'coronis': 'kowonis',
	'vaxter': 'anvaxter',
	'mattl': 'mattl34',
	'shaymin': 'test33',
	// 'orphic': 'dmt6922',
	'kayo': 'endedinariot',
	'tgmd': 'greatmightydoom',
	'vacate': 'vacatetest',
	'bean': 'dragonbean',
	'yunan': 'osiris13',
	'politoed': 'brosb4hoohs',
	'scotteh': 'nsyncluvr67',
	'bumbadadabum': 'styrofoamboots',
	'yuihirasawa': 'weeabookiller',
	'monohearted': 'nighthearted',
	'prem': 'erinanakiri', // second color change
	'clefairy': 'fuckes',
	'morfent': 'aaaa',
	'crobat': 'supergaycrobat4',
	'beowulf': '298789z7z',
	'flippy': 'flippo',
	'raoulsteve247': 'raoulbuildingpc',
	'thedeceiver': 'colourtest011',
	'darnell': 'ggggggg',
	'shamethat': 'qpwkfklkjpskllj', // second color change
	'aipom': 'wdsddsdadas',
	'alter': 'spakling',
	'biggie': 'aoedoedad',
	'osiris': 'osiris12', // second color change
	'azumarill': 'azumarill69',
	'redew': 'redeww',
	'sapphire': 'masquerains',
	'calyxium': 'calyxium142',
	'kiracookie': 'kracookie',
	'blitzamirin': 'hikaruhitachii',
	'skitty': 'shckieei',
	'sweep': 'jgjjfgdfg', // second color change
	'panpawn': 'crowt',
	'val': 'pleasegivemecolorr',
	'valentine': 'pleasegivemecolorr',
	'briayan': 'haxorusxi',
	'xzern': 'mintycolors',
	'shgeldz': 'cactusl00ver',
	'abra': 'lunchawaits',
	'maomiraen': 'aaaaaa',
	'trickster': 'sunako',
	'articuno': 'bluekitteh177',
	// 'antemortem': 'abc11092345678',
	'scene': 'aspire',
	'barton': 'hollywood15',
	// 'psych': 'epicwome',
	'zodiax': 'coldeann',
	'ninetynine': 'blackkkk',
	'kasumi': 'scooter4000',
	'xylen': 'bloodyrevengebr',
	'aelita': 'y34co3',
	'fx': 'cm48ubpq',
	'horyzhnz': 'superguy69',
	'quarkz': 'quarkz345',
	'fleurdyleurse': 'calvaryfishes',
	'trinitrotoluene': '4qpr7pc5mb',
	'rekeri': 'qgadlu6g',
	'austin': 'jkjkjkjkjkgdl',
	'jinofthegale': 'cainvelasquez',
	'waterbomb': 'naninan',
	'starbloom': 'taigaaisaka',
	'macle': 'flogged',
	'ashiemore': 'poncp',
	'charles': 'charlescarmichael',
	'sigilyph': 'ek6',
	'spy': 'spydreigon',
	'kinguu': 'dodmen',
	'dodmen': 'kinguu',
	'halite': 'cjilkposqknolssss',
	'magnemite': 'dsfsdffs',
	'ace': 'sigilyph143',
	'leftiez': 'xxxxnbbhiojll',
	'grim': 'grimoiregod',
	'strength': '0v0tqpnu',
	'advantage': 'nsyncluvr67',
	'quote': 'quotecs',
	'snow': 'q21yzqgh',
	'omegaxis': 'omegaxis14',
	'paradise': 'rnxvzwpwtz',
	'sailorcosmos': 'goldmedalpas',
	'dontlose': 'dhcli22h',
	'tatsumaki': 'developmentary',
	'starry': 'starryblanket',
	'imas': 'imas234',
	'vexeniv': 'vexenx',
	'ayanosredscarf': 'ezichqog',
	'penquin': 'privatepenquin',
	'cathy': '', //{color: '#ff5cb6'}
};

const polltiers = ['Random Battle', 'Anything Goes', 'Ubers', 'OverUsed', 'Underused',
	'RarelyUsed', 'NeverUsed', 'PU', 'LC', 'Random Doubles Battle', 'VGC 2016',
	'Battle Spot Doubles', 'Random Triples Battle', 'Challenge Cup 1v1', 'Balanced Hackmons',
	'1v1, Monotype', 'Inverse Battle', 'Almost Any Ability', 'STABmons', 'Hackmons Cup',
	'[Seasonal]', 'Battle Factory', 'Doubles OU', 'CAP', 'Gen 5 OU', 'Doubles 1v1', 'Random Monotype'];

const bubbleLetterMap = new Map([
	['a', '\u24D0'], ['b', '\u24D1'], ['c', '\u24D2'], ['d', '\u24D3'], ['e', '\u24D4'], ['f', '\u24D5'], ['g', '\u24D6'], ['h', '\u24D7'], ['i', '\u24D8'], ['j', '\u24D9'], ['k', '\u24DA'], ['l', '\u24DB'], ['m', '\u24DC'],
	['n', '\u24DD'], ['o', '\u24DE'], ['p', '\u24DF'], ['q', '\u24E0'], ['r', '\u24E1'], ['s', '\u24E2'], ['t', '\u24E3'], ['u', '\u24E4'], ['v', '\u24E5'], ['w', '\u24E6'], ['x', '\u24E7'], ['y', '\u24E8'], ['z', '\u24E9'],
	['A', '\u24B6'], ['B', '\u24B7'], ['C', '\u24B8'], ['D', '\u24B9'], ['E', '\u24BA'], ['F', '\u24BB'], ['G', '\u24BC'], ['H', '\u24BD'], ['I', '\u24BE'], ['J', '\u24BF'], ['K', '\u24C0'], ['L', '\u24C1'], ['M', '\u24C2'],
	['N', '\u24C3'], ['O', '\u24C4'], ['P', '\u24C5'], ['Q', '\u24C6'], ['R', '\u24C7'], ['S', '\u24C8'], ['T', '\u24C9'], ['U', '\u24CA'], ['V', '\u24CB'], ['W', '\u24CC'], ['X', '\u24CD'], ['Y', '\u24CE'], ['Z', '\u24CF'],
	['1', '\u2460'], ['2', '\u2461'], ['3', '\u2462'], ['4', '\u2463'], ['5', '\u2464'], ['6', '\u2465'], ['7', '\u2466'], ['8', '\u2467'], ['9', '\u2468'], ['0', '\u24EA'],
]);

const asciiMap = new Map([
	['\u24D0', 'a'], ['\u24D1', 'b'], ['\u24D2', 'c'], ['\u24D3', 'd'], ['\u24D4', 'e'], ['\u24D5', 'f'], ['\u24D6', 'g'], ['\u24D7', 'h'], ['\u24D8', 'i'], ['\u24D9', 'j'], ['\u24DA', 'k'], ['\u24DB', 'l'], ['\u24DC', 'm'],
	['\u24DD', 'n'], ['\u24DE', 'o'], ['\u24DF', 'p'], ['\u24E0', 'q'], ['\u24E1', 'r'], ['\u24E2', 's'], ['\u24E3', 't'], ['\u24E4', 'u'], ['\u24E5', 'v'], ['\u24E6', 'w'], ['\u24E7', 'x'], ['\u24E8', 'y'], ['\u24E9', 'z'],
	['\u24B6', 'A'], ['\u24B7', 'B'], ['\u24B8', 'C'], ['\u24B9', 'D'], ['\u24BA', 'E'], ['\u24BB', 'F'], ['\u24BC', 'G'], ['\u24BD', 'H'], ['\u24BE', 'I'], ['\u24BF', 'J'], ['\u24C0', 'K'], ['\u24C1', 'L'], ['\u24C2', 'M'],
	['\u24C3', 'N'], ['\u24C4', 'O'], ['\u24C5', 'P'], ['\u24C6', 'Q'], ['\u24C7', 'R'], ['\u24C8', 'S'], ['\u24C9', 'T'], ['\u24CA', 'U'], ['\u24CB', 'V'], ['\u24CC', 'W'], ['\u24CD', 'X'], ['\u24CE', 'Y'], ['\u24CF', 'Z'],
	['\u2460', '1'], ['\u2461', '2'], ['\u2462', '3'], ['\u2463', '4'], ['\u2464', '5'], ['\u2465', '6'], ['\u2466', '7'], ['\u2467', '8'], ['\u2468', '9'], ['\u24EA', '0'],
]);

const MAX_TELLS = 4;
const MAX_TELL_LENGTH = 500;

function parseStatus(text, encoding) {
	if (encoding) {
		text = text.split('').map(function (char) {
			return bubbleLetterMap.get(char);
		}).join('');
	} else {
		text = text.split('').map(function (char) {
			return asciiMap.get(char);
		}).join('');
	}
	return text;
}

exports.commands = {
	lastseen: 'seen',
	seen: function (target, room, user) {
		if (!target) return this.errorReply("Usage: /seen [username] - Show's the last time the user was online.");
		switch (target) {
		case '!names':
		case '!name':
			if (!this.runBroadcast()) return;
			Wisp.database.all("SELECT * FROM users WHERE lastSeen NOT NULL", (err, rows) => {
				this.sendReplyBox("There have been " + rows.length + " user names recorded in this database.");
				room.update();
			});
			break;
		default:
			if (!this.runBroadcast()) return;
			let userid = toId(target);
			if (userid.length > 18) return this.errorReply("Usernames cannot be over 18 characters.");
			if (userid.length < 1) return this.errorReply("/seen - Please specify a name.");
			let userName = '<strong class="username">' + Wisp.nameColor(target, false) + '</strong>';
			if (userid === user.userid) return this.sendReplyBox(userName + ", have you looked in a mirror lately?");
			if (Users(target) && Users(target).connected) return this.sendReplyBox(userName + ' is currently <font color="green">online</font>.');
			Wisp.lastSeen(userid, seen => {
				if (!seen) return this.sendReplyBox(userName + ' has <font color=\"red\">never</font> been seen online on this server.');
				this.sendReplyBox(userName + ' was last seen online on ' + moment(seen).format("MMMM Do YYYY, h:mm:ss A") + ' EST. (' + moment(seen).fromNow() + ')');
				room.update();
			});
			break;
		}
	},

	regdate: function (target, room, user, connection) {
		if (toId(target).length < 1 || toId(target).length > 19) return this.sendReply("Usernames may not be less than one character or longer than 19");
		if (!this.runBroadcast()) return;
		Wisp.regdate(target, date => {
			this.sendReplyBox(Wisp.nameColor(target, false) + (date ? " was registered on " + moment(date).format("dddd, MMMM DD, YYYY HH:mmA ZZ") : " is not registered."));
			room.update();
		});
	},

	tell: function (target, room, user, connection, cmd) {
		if (!target) return this.parse('/help tell');
		if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
		target = this.splitTarget(target);
		let targetUser = this.targetUsername;
		let id = toId(targetUser);
		if (id === user.userid || (Users(id) && Users(id).userid === user.userid)) return this.sendReply('You can\'t send a message to yourself!');
		if (Users(id) && Users(id).connected) return this.sendReply('User ' + Users(id).name + ' is currently online. PM them instead.');
		if (!id || !target) return this.parse('/help tell');
		if (target.length > MAX_TELL_LENGTH) return this.errorReply("You may not send a tell longer than " + MAX_TELL_LENGTH + " characters.");

		if (Wisp.tells[id]) {
			if (!user.can('hotpatch')) {
				let names = Object.keys(user.prevNames).concat(user.userid);
				for (let i in names) {
					let name = names[i];
					if (Wisp.tells[id][name] && Wisp.tells[id][name].length >= MAX_TELLS) return this.sendReply('You may only leave ' + MAX_TELLS + ' messages for a user at a time. Please wait until ' + targetUser + ' comes online and views them before sending more.');
				}
			}
		} else {
			Wisp.tells[id] = {};
		}

		let tell = Wisp.tells[id][user.userid];
		let msg = '<span style = "color:gray;"><i>(Sent by ' + user.name + ' on ' + moment().format("ddd, MMMM DD, YYYY HH:mmA ZZ") + ')</i></span><br><b><span style = "color:' + Wisp.hashColor(user.userid) + '">' + user.name + ':</span></b> ' + Tools.escapeHTML(target);
		if (tell) {
			Wisp.tells[id][user.userid].push(msg);
		} else {
			Wisp.tells[id][user.userid] = [msg];
		}

		fs.writeFileSync('config/tells.json', JSON.stringify(Wisp.tells));
		this.sendReply('Your message "' + target + '" has successfully been sent to ' + this.targetUsername + '.');
	},
	tellhelp: ['/tell [user], [message] - Leaves a message for an offline user for them to see when they log on next.'],

	def: 'define',
	define: function (target, room, user) {
		if (!target) return this.sendReply('Usage: /define <word>');
		target = toId(target);
		if (target > 50) return this.sendReply('/define <word> - word can not be longer than 50 characters.');
		if (!this.runBroadcast()) return;

		let options = {
			host: 'api.wordnik.com',
			port: 80,
			path: '/v4/word.json/' + target + '/definitions?limit=3&sourceDictionaries=all' +
			'&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5',
			method: 'GET',
		};

		http.get(options, res => {
			let data = '';
			res.on('data', chunk => {
				data += chunk;
			}).on('end', () => {
				if (data.charAt(0) !== '[') {
					this.sendReplyBox("Error retrieving definition for <b>" + Tools.escapeHTML(target) + "</b>.");
					room.update();
					return;
				}
				data = JSON.parse(data);
				let output = '<font color=#24678d><b>Definitions for ' + target + ':</b></font><br />';
				if (!data[0]) {
					this.sendReplyBox('No results for <b>"' + target + '"</b>.');
					return room.update();
				} else {
					let count = 1;
					for (let u in data) {
						if (count > 3) break;
						output += '(<b>' + count + '</b>) ' + Tools.escapeHTML(data[u]['text']) + '<br />';
						count++;
					}
					this.sendReplyBox(output);
					return room.update();
				}
			});
		});
	},

	u: 'urbandefine',
	ud: 'urbandefine',
	urbandefine: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.parse('/help urbandefine');
		if (target.toString() > 50) return this.sendReply('Phrase can not be longer than 50 characters.');
		let self = this;
		let options = {
			host: 'api.urbandictionary.com',
			port: 80,
			path: '/v0/define?term=' + encodeURIComponent(target),
			term: target,
		};

		http.get(options, res => {
			let data = '';
			res.on('data', chunk => {
				data += chunk;
			}).on('end', () => {
				if (data.charAt(0) !== '{') {
					this.sendReplyBox("Error retrieving definition for <b>" + Tools.escapeHTML(target) + "</b>.");
					room.update();
					return;
				}
				data = JSON.parse(data);
				let definitions = data['list'];
				if (data['result_type'] === 'no_results') {
					this.sendReplyBox('No results for <b>"' + Tools.escapeHTML(target) + '"</b>.');
					return room.update();
				} else {
					if (!definitions[0]['word'] || !definitions[0]['definition']) {
						self.sendReplyBox('No results for <b>"' + Tools.escapeHTML(target) + '"</b>.');
						return room.update();
					}
					let output = '<b>' + Tools.escapeHTML(definitions[0]['word']) + ':</b> ' + Tools.escapeHTML(definitions[0]['definition']).replace(/\r\n/g, '<br />').replace(/\n/g, ' ');
					if (output.length > 400) output = output.slice(0, 400) + '...';
					this.sendReplyBox(output);
					return room.update();
				}
			});
		});
	},

	masspm: 'pmall',
	pmall: function (target, room, user) {
		if (!this.can('pmall')) return false;
		if (!target) return this.parse('/help pmall');

		let pmName = ' Server PM [Do not reply]';

		Users.users.forEach(function (user) {
			let message = '|pm|' + pmName + '|' + user.getIdentity() + '|' + target;
			user.send(message);
		});
	},
	pmallhelp: ["/pmall [message] - PM all users in the server."],

	staffpm: 'pmallstaff',
	pmstaff: 'pmallstaff',
	pmallstaff: function (target, room, user) {
		if (!this.can('forcewin')) return false;
		if (!target) return this.parse('/help pmallstaff');

		let pmName = ' Staff PM [Do not reply]';

		Users.users.forEach(function (user) {
			if (!user.isStaff) return;
			let message = '|pm|' + pmName + '|' + user.getIdentity() + '|' + target;
			user.send(message);
		});
	},
	pmallstaffhelp: ["/pmallstaff [message] - Sends a PM to every staff member online."],

	pmroom: 'rmall',
	roompm: 'rmall',
	rmall: function (target, room, user) {
		if (!this.can('declare', null, room)) return this.errorReply("/rmall - Access denied.");
		if (room.id === 'lobby') return this.errorReply("This command cannot be used in Lobby.");
		if (!target) return this.sendReply("/rmall [message] - Sends a pm to all users in the room.");
		target = target.replace(/<(?:.|\n)*?>/gm, '');

		let pmName = '~Room PM (' + room.title + ') [Do not reply]';

		for (let i in room.users) {
			let message = '|pm|' + pmName + '|' + room.users[i].getIdentity() + '| ' + target;
			room.users[i].send(message);
		}
		this.privateModCommand('(' + Tools.escapeHTML(user.name) + ' mass PMd: ' + target + ')');
	},
	rmallhelp: ["/rmall [message] - Sends a PM to every user in a room."],

	afk: 'away',
	busy: 'away',
	work: 'away',
	eating: 'away',
	working: 'away',
	sleep: 'away',
	sleeping: 'away',
	gaming: 'away',
	nerd: 'away',
	nerding: 'away',
	mimis: 'away',
	away: function (target, room, user, connection, cmd) {
		if (!user.isAway && user.name.length > 19) return this.sendReply("Your username is too long for any kind of use of this command.");
		if (!this.canTalk()) return false;

		target = target ? target.replace(/[^a-zA-Z0-9]/g, '') : 'AWAY';
		if (cmd !== 'away') target = cmd;
		let newName = user.name;
		let status = parseStatus(target, true);
		let statusLen = status.length;
		if (statusLen > 14) return this.sendReply("Your away status should be short and to-the-point, not a dissertation on why you are away.");

		if (user.isAway) {
			let statusIdx = newName.search(/\s\-\s[\u24B6-\u24E9\u2460-\u2468\u24EA]+$/);
			if (statusIdx > -1) newName = newName.substr(0, statusIdx);
			if (user.name.substr(-statusLen) === status) return this.sendReply("Your away status is already set to \"" + target + "\".");
		}

		newName += ' - ' + status;
		if (newName.length > 18) return this.sendReply("\"" + target + "\" is too long to use as your away status.");

		// forcerename any possible impersonators
		let targetUser = Users.getExact(user.userid + target);
		if (targetUser && targetUser !== user && targetUser.name === user.name + ' - ' + target) {
			targetUser.resetName();
			targetUser.send("|nametaken||Your name conflicts with " + user.name + (user.name.substr(-1) === "s" ? "'" : "'s") + " new away status.");
		}

		if (user.can('mute', null, room)) this.add("|raw|-- <font color='" + Wisp.hashColor(user.userid) + "'><strong>" + Tools.escapeHTML(user.name) + "</strong></font> is now " + target.toLowerCase() + ".");
		if (user.can('lock')) this.parse('/hide');
		user.forceRename(newName, user.registered);
		user.updateIdentity();
		user.isAway = true;
	},
	awayhelp: ["/away [message] - Sets a user's away status."],

	back: function (target, room, user) {
		if (!user.isAway) return this.sendReply("You are not set as away.");
		user.isAway = false;

		let newName = user.name;
		let statusIdx = newName.search(/\s\-\s[\u24B6-\u24E9\u2460-\u2468\u24EA]+$/);
		if (statusIdx < 0) {
			user.isAway = false;
			if (user.can('mute', null, room)) this.add("|raw|-- <font color='" + Wisp.hashColor(user.userid) + "'><strong>" + Tools.escapeHTML(user.name) + "</strong></font> is no longer away.");
			return false;
		}

		let status = parseStatus(newName.substr(statusIdx + 3), false);
		newName = newName.substr(0, statusIdx);
		user.forceRename(newName, user.registered);
		user.updateIdentity();
		user.isAway = false;
		if (user.can('mute', null, room)) this.add("|raw|-- <font color='" + Wisp.hashColor(user.userid) + "'><strong>" + Tools.escapeHTML(newName) + "</strong></font> is no longer " + status.toLowerCase() + ".");
		if (user.can('lock')) this.parse('/show');
	},
	backhelp: ["/back - Sets a users away status back to normal."],

	showauth: 'hideauth',
	show: 'hideauth',
	hide: 'hideauth',
	hideauth: function (target, room, user, connection, cmd) {
		if (!user.can('lock')) return this.sendReply("/hideauth - access denied.");
		if (cmd === 'show' || cmd === 'showauth') {
			delete user.hideauth;
			user.updateIdentity();
			return this.sendReply("You have revealed your auth symbol.");
		}
		let tar = ' ';
		if (target) {
			target = target.trim();
			if (Config.groupsranking.indexOf(target) > -1 && target !== '#') {
				if (Config.groupsranking.indexOf(target) <= Config.groupsranking.indexOf(user.group)) {
					tar = target;
				} else {
					this.sendReply('The group symbol you have tried to use is of a higher authority than you have access to. Defaulting to \' \' instead.');
				}
			} else {
				this.sendReply('You have tried to use an invalid character as your auth symbol. Defaulting to \' \' instead.');
			}
		}
		user.hideauth = tar;
		user.updateIdentity();
		this.sendReply('You are now hiding your auth symbol as \'' + tar + '\'.');
		this.logModCommand(user.name + ' is hiding auth symbol as \'' + tar + '\'');
	},

	rpoll: 'roompoll',
	roompoll: function (target, room, user) {
		if (!target) {
			if (!this.can('broadcast', null, room) || room.battle) return false;
			if (!room.RPoll) return this.parse('/help roompoll');
			return this.parse('/poll create ' + room.RPoll);
		}
		let parts = target.split(" ");
		let action = toId(parts[0] || " ");
		let details = parts.slice(1).join(" ");
		if (action === "help") return this.parse('/help roompoll');
		if (action === "change" || action === "set") {
			if (!this.can('declare', null, room) || room.battle) return false;
			if (!toId(details || " ")) return this.parse('/help roompoll');
			if (details.split(",").length < 3) return this.errorReply("You did not include enough arguments for the poll.");
			room.RPoll = details.replace(/^\/poll/i, "");
			if (room.chatRoomData) {
				room.chatRoomData.RPoll = room.RPoll;
				Rooms.global.writeChatRoomData();
			}
			return this.sendReply("The roompoll has been set.");
		}
		if (action === 'view') {
			if (!this.can('declare', null, room)) return false;
			if (!room.RPoll) return this.errorReply("No roompoll has been set yet.");
			return this.sendReply("The roompoll is: /poll create " + room.RPoll);
		}
		if (action === 'end') {
			if (!this.can('broadcast', null, room) || room.battle) return false;
			return this.parse('/poll end');
		} else {
			return this.errorReply("This is not a valid roompoll command, do '/roompoll help' for more information");
		}
	},
	roompollhelp: ["- /roompoll - creates a new roompoll. (Start poll with '/roompoll', display poll with '!pr', end poll with '/endpoll'). Requires: + $ % @ # & ~",
		"- /roompoll set/change [details] - sets the roompoll. Requires: # & ~",
		"- /roompoll view - displays the command for the current roompoll. Requires: # & ~"],

	formatpoll: 'tierpoll',
	tpoll: 'tierpoll',
	tierspoll: 'tierpoll',
	tierpoll: function (target, room, user) {
		if (room.battle) return false;
		if (!this.can('broadcast', null, room)) return false;
		if (room.game && room.id === 'lobby') return this.errorReply("Polls cannot be created in Lobby when there is a room game in progress.");
		this.parse('/poll create Tier for the next tournament?, ' + polltiers.join(', '));
	},

	clearall: 'clearroom',
	cleer: 'clearroom',
	clearroom:  function (target, room, user) {
		if (!this.can('clearroom', null, room)) return false;
		if (room.battle) return this.sendReply("You cannot clearall in battle rooms.");
		let len = room.log.length;
		let users = [];
		while (len--) {
			room.log[len] = '';
		}
		for (let u in room.users) {
			if (!Users.get(u) || !Users.get(u).connected) continue;
			users.push(u);
			Users.get(u).leaveRoom(room, Users.get(u).connections[0]);
		}
		len = users.length;
		setTimeout(function () {
			while (len--) {
				Users.get(users[len]).joinRoom(room, Users.get(users[len]).connections[0]);
			}
		}, 1000);
		this.privateModCommand("(" + user.name + " used /clearroom)");
	},

	roomkick: 'kick',
	kick: function (target, room, user) {
		if (!target) return this.parse('/help kick');
		if (!this.canTalk()) return false;
		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.errorReply('User "' + this.targetUsername + '" not found.');
		}
		if (!this.can('mute', targetUser, room)) return false;
		if (!(targetUser in room.users)) return this.errorReply("User '" + targetUser + "' is not in this room.");
		if (targetUser.can('seniorstaff') && !this.can('seniorstaff')) return this.errorReply("Upper staff may not be kicked.");
		this.addModCommand(targetUser.name + ' was kicked from the room by ' + user.name + '.');
		targetUser.popup('You were kicked from ' + room.id + ' by ' + user.name + '.');
		targetUser.leaveRoom(room.id);
	},
	kickhelp: ['/kick [user] - Kicks a user from the room.'],
	roomkickhelp: ['/kick [user] - Kicks a user from the room.'],

	unlink: 'breaklinks',
	breaklink: 'breaklinks',
	linkbreak: 'breaklinks',
	breaklinks: function (target, room, user) {
		if (!target || !target.trim()) return this.parse('/help unlink');
		let targetUser = Users(target);
		if (!targetUser) return this.errorReply("User '" + target + "' not found.");
		if (!this.can('warn', targetUser, room)) return false;

		this.add('|unlink|' + targetUser.userid);
		for (let i in targetUser.prevNames) {
			this.add('|unlink|' + i);
		}
		this.privateModCommand("(" + targetUser.name + "'s links were broken by " + user.name + ")");
	},
	unlinkhelp: ["/unlink [user] - Breaks a user's posted links."],

	clearmessages: 'hidetext',
	clearmsg: 'hidetext',
	hidetext: function (target, room, user) {
		if (!target) return this.parse('/help hidetext');
		this.splitTarget(target);
		let targetUser = this.targetUser;
		let name = this.targetUsername;
		if (!targetUser) return this.errorReply("User '" + name + "' not found.");
		let userid = targetUser.getLastId();
		let hidetype = '';
		if (!user.can('lock', targetUser) && !user.can('ban', targetUser, room)) {
			this.errorReply("/hidetext - Access denied.");
			return false;
		}
		if ((targetUser.locked || Punishments.useridSearch(userid)) && user.can('lock', targetUser)) {
			hidetype = 'hide|';
		} else {
			hidetype = 'roomhide|';
		}
		this.addModCommand("" + targetUser.name + "'s messages were cleared from room " + room.id + " by " + user.name + ".");
		this.add('|unlink|' + hidetype + userid);
		this.add('|uhtmlchange|' + userid + '|');
		if (userid !== toId(this.inputUsername)) {
			this.add('|unlink|' + hidetype + toId(this.inputUsername));
			this.add('|uhtmlchange|' + toId(this.inputUsername) + '|');
		}
	},

	hex: function (target, room, user) {
		if (!this.runBroadcast()) return;
		let targetUser = (target ? target : user.name);
		this.sendReplyBox('The hex code of ' + Wisp.nameColor(targetUser, true) + ' is: <font color="' + Wisp.hashColor(targetUser) + '"><b>' + Wisp.hashColor(targetUser) + '</b></font>');
	},
	anime: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.errorReply("No target.");
		let targetAnime = Tools.escapeHTML(target.trim());
		let id = targetAnime.toLowerCase().replace(/ /g, '');
		if (amCache.anime[id]) return this.sendReply('|raw|' + amCache.anime[id]);

		nani.get('anime/search/' + targetAnime)
		.then(data => {
			if (data[0].adult) {
				return this.errorReply('Nsfw content is not allowed.');
			}
			nani.get('anime/' + data[0].id)
				.then(data => {
					let css = 'text-shadow: 1px 1px 1px #CCC; padding: 3px 8px;';
					let output = '<div class="infobox"><table width="100%"><tr>';
					let description = data.description.replace(/(\r\n|\n|\r)/gm, "").split('<br><br>').join('<br>');
					if (description.indexOf('&lt;br&gt;&lt;br&gt;') >= 0) description = description.substr(0, description.indexOf('&lt;br&gt;&lt;br&gt;'));
					if (description.indexOf('<br>') >= 0) description = description.substr(0, description.indexOf('<br>'));
					output += '<td style="' + css + ' background: rgba(170, 165, 215, 0.5); box-shadow: 2px 2px 5px rgba(170, 165, 215, 0.8); border: 1px solid rgba(170, 165, 215, 1); border-radius: 5px; color: #2D2B40; text-align: center; font-size: 15pt;"><b>' + data.title_romaji + '</b></td>';
					output += '<td rowspan="6"><img src="' + data.image_url_lge + '" height="320" width="225" alt="' + data.title_romaji + '" title="' + data.title_romaji + '" style="float: right; border-radius: 10px; box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.5), 1px 1px 2px rgba(255, 255, 255, 0.5) inset;" /></td></tr>';
					output += '<tr><td style="' + css + '"><b>Genre(s): </b>' + data.genres + '</td></tr>';
					output += '<tr><td style="' + css + '"><b>Air Date: </b>' + data.start_date.substr(0, 10) + '</td></tr><tr>';
					output += '<tr><td style="' + css + '"><b>Status: </b>' + data.airing_status + '</td></tr>';
					output += '<tr><td style="' + css + '"><b>Episode Count: </b>' + data.total_episodes + '</td></tr>';
					output += '<tr><td style="' + css + '"><b>Rating: </b> ' + data.average_score + '/100</td></tr>';
					output += '<tr><td colspan="2" style="' + css + '"><b>Description: </b>' + description + '</td></tr>';
					output += '</table></div>';
					amCache.anime[id] = output;
					this.sendReply('|raw|' + output);
					room.update();
				});
		})
		.catch(error => {
			return this.errorReply("Anime not found.");
		});
	},

	manga: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.errorReply("No target.");
		let targetAnime = Tools.escapeHTML(target.trim());
		let id = targetAnime.toLowerCase().replace(/ /g, '');
		if (amCache.anime[id]) return this.sendReply('|raw|' + amCache.anime[id]);

		nani.get('manga/search/' + targetAnime)
		.then(data => {
			nani.get('manga/' + data[0].id)
				.then(data => {
					let css = 'text-shadow: 1px 1px 1px #CCC; padding: 3px 8px;';
					let output = '<div class="infobox"><table width="100%"><tr>';
					for (let i = 0; i < data.genres.length; i++) {
						if (/(Hentai|Yaoi|Ecchi)/.test(data.genres[i])) return this.errorReply('Nsfw content is not allowed.');
					}
					let description = data.description.replace(/(\r\n|\n|\r)/gm, " ").split('<br><br>').join('<br>');
					if (description.indexOf('&lt;br&gt;&lt;br&gt;') >= 0) description = description.substr(0, description.indexOf('&lt;br&gt;&lt;br&gt;'));
					if (description.indexOf('<br>') >= 0) description = description.substr(0, description.indexOf('<br>'));
					output += '<td style="' + css + ' background: rgba(170, 165, 215, 0.5); box-shadow: 2px 2px 5px rgba(170, 165, 215, 0.8); border: 1px solid rgba(170, 165, 215, 1); border-radius: 5px; color: #2D2B40; text-align: center; font-size: 15pt;"><b>' + data.title_romaji + '</b></td>';
					output += '<td rowspan="6"><img src="' + data.image_url_lge + '" height="320" width="225" alt="' + data.title_romaji + '" title="' + data.title_romaji + '" style="float: right; border-radius: 10px; box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.5), 1px 1px 2px rgba(255, 255, 255, 0.5) inset;" /></td></tr>';
					output += '<tr><td style="' + css + '"><b>Genre(s): </b>' + data.genres + '</td></tr>';
					output += '<tr><td style="' + css + '"><b>Release Date: </b>' + data.start_date.substr(0, 10) + '</td></tr><tr>';
					output += '<tr><td style="' + css + '"><b>Status: </b>' + data.publishing_status + '</td></tr>';
					output += '<tr><td style="' + css + '"><b>Chapter Count: </b>' + data.total_chapters + '</td></tr>';
					output += '<tr><td style="' + css + '"><b>Rating: </b> ' + data.average_score + '/100</td></tr>';
					output += '<tr><td colspan="2" style="' + css + '"><b>Description: </b>' + description + '</td></tr>';
					output += '</table></div>';
					amCache.manga[id] = output;
					this.sendReply('|raw|' + output);
					room.update();
				});
		})
		.catch(error => {
			return this.errorReply("Anime not found.");
		});
	},

	fcadd: 'friendcodeadd',
	friendcodeadd: function (target, room, user) {
		if (!target) return this.errorReply("Invalid command. Valid commands are `/friendcodeadd code` and `/friendcoderemove`.");
		let fc = Tools.escapeHTML(target.trim());
		let reg = /^\d{4}-\d{4}-\d{4}$/;
		if (!reg.test(fc)) return this.errorReply("Invalid friend code, example: 3110-7818-5106");
		Db('friendcodes').set(toId(user), fc);
		this.sendReply("Friendcode set.");
	},

	fcrmv: 'friendcoderemove',
	fcdelete: 'friendcoderemove',
	friendcodecdelete: 'friendcoderemove',
	friendcoderemove: function (target, room, user) {
		if (!Db('friendcodes').has(toId(user))) return this.errorReply("You do not have a friendcode.");
		Db('friendcodes').delete(toId(user));
		this.sendReply("Friendcode removed.");
	},

	togglegdeclares: function (target, room, user) {
		if (!this.can('declare', null, room)) return false;
		if (room.isOfficial && this.can('gdeclare')) return this.errorReply("Only global leaders may toggle global declares in official rooms.");
		if (!room.chatRoomData) return this.errorReply("You can't toggle global declares in this room.");
		let status = !room.disableGlobalDeclares;
		room.disableGlobalDeclares = status;
		room.chatRoomData.disableGlobalDeclares = status;
		Rooms.global.writeChatRoomData();
		this.privateModCommand("(" + user.name + " has " + (status ? "disabled" : "enabled") + " global declares in this room.)");
	},

	etour: function (target, room, user) {
		if (!target) return this.parse("/help etour");
		this.parse("/tour create " + target + ", elimination");
	},
	etourhelp: ["/etour [format] - Creates an elimination tournament."],

	endpoll: function (target, room, user) {
		this.parse("/poll end");
	},

	votes: function (target, room, user) {
		if (!room.poll) return this.errorReply("There is no poll running in this room.");
		if (!this.runBroadcast()) return;
		this.sendReplyBox("votes: " + room.poll.totalVotes);
	},

	endtour: function (target, room, user) {
		this.parse("/tour end");
	},

	title: function (target, room, user) {
		if (!target) return this.parse("/help title");
		let targets = target.split(',');
		for (let u in targets) targets[u] = targets[u].trim();
		if (!targets[0]) return this.parse("/help title");
		let cmd = targets[0];
		let targetUser, title, hex;
		if (targets[1]) targetUser = targets[1];
		if (targets[2]) title = targets[2];
		if (targets[3]) hex = targets[3];

		switch (toId(cmd)) {
		case "set":
			if (!this.can('title')) return false;
			if (!targets[2]) return this.parse("/help title");
			if (!Users(targetUser)) return this.errorReply('"' + targetUser + '" is not online.');
			if (title.length < 1) return this.errorReply("Title must be at least one character long.");
			if (title.length > 25) return this.errorReply("Titles may not be longer than 25 characters.");
			if (hex && hex.length > 7) return this.errorReply("The hex may not be longer than 7 characters (including #).");
			title = '<font color="#' + ((hex && hex.length > 1) ? toId(hex) : 'b30000') + '"><b>' + Tools.escapeHTML(title) + '</b></font>';
			Wisp.setTitle(targetUser, title);
			if (Users(targetUser).connected) Users(targetUser).popup("|html|" + Wisp.nameColor(user.name) + " has set your user title to \"" + title + "\".");
			this.sendReply("|raw|You've set " + Wisp.nameColor(targetUser) + "'s title to \"" + title + "\".");
			Rooms('upperstaff').add("|raw|" + Wisp.nameColor(user.name, true) + " has set " + Wisp.nameColor(targetUser, true) + "'s user title to " + title + ".").update();
			Wisp.messageSeniorStaff("/html " + Wisp.nameColor(user.name, true) + " has set " + Wisp.nameColor(targetUser, true) + "'s user title to " + title + ".");
			break;
		case "delete":
			if (!this.can('title')) return false;
			if (!targets[1]) return this.parse("/help title");
			Wisp.getTitle(targetUser, title => {
				if (title === "") return this.sendReply(targetUser + " does not have a title.");
				Wisp.setTitle(targetUser, "", () => {
					if (Users(targetUser) && Users(targetUser).connected) Users(targetUser).popup("|html|" + Wisp.nameColor(user.name) + " has removed your user title.");
					this.sendReply("You have removed " + targetUser + "'s user title.");
					Rooms('upperstaff').add("|raw|" + Wisp.nameColor(user.name, true) + " has removed " + Wisp.nameColor(targetUser, true) + "'s user title.").update();
					Wisp.messageSeniorStaff("/html " + Wisp.nameColor(user.name, true) + " has removed " + Wisp.nameColor(targetUser, true) + "'s user title.");
				});
			});
			break;
		case "view":
			if (!targets[1]) return this.parse("/help title");
			if (!this.runBroadcast()) return;
			Wisp.getTitle(targetUser, title => {
				if (title === "") {
					this.sendReplyBox(Wisp.nameColor(targetUser, true) + " does not have a title.");
				} else {
					this.sendReplyBox(Wisp.nameColor(targetUser, true) + "'s user title is \"" + title + "\".");
				}
				room.update();
			});
			break;
		}
	},
	titlehelp: ["/title set, user, title - Sets a title.",
		"/title delete, user - Deletes a users title.",
		"/title view, user - Shows a users title [broadcastable]"],

	advertise: function (target, room, user, connection) {
		if (room.id !== 'lobby') return this.sendReply("This command only works in the lobby.");
		if (!target) return this.sendReply("Usage: /advertise [message] - Adds an advertisement to the advertisement queue.");
		if (target.length > 250) return this.sendReply("Advertisements may not be longer than 250 characters.");
		if (Users.ShadowBan.checkBanned(user)) return this.sendReply("Your message has been added to the advertisement queue. It will be broadcast in the lobby shortly.");
		if (!this.canTalk()) return this.sendReply("You're unable to chat in this room.");
		for (let u in user.ips) {
			if (Advertisements[u]) {
				return this.sendReply("You already have an advertisement in the queue. Please wait for it to be broadcast before adding another one.");
			}
		}

		if (user.advertisementCooldown) {
			let milliseconds = (Date.now() - user.advertisementCooldown);
			let seconds = ((milliseconds / 1000) % 60);
			let remainingTime = Math.round(seconds - (15 * 60));
			if (((Date.now() - user.advertisementCooldown) <= 15 * 60 * 1000)) return this.sendReply("You must wait " + (remainingTime - remainingTime * 2) + " seconds before placing another advertisement.");
		}
		user.advertisementCooldown = Date.now();

		let message = target;
		if (Config.chatfilter) message = Config.chatfilter(message, user, room, connection);
		if (!message) return;

		if (!room.lastAdvertisement) {
			room.add('|raw|<div class="infobox"><strong><font color=#2DA900>Advertisement: </font></strong> ' + Wisp.parseMessage(message) + ' - ' + Wisp.nameColor(user.name) + '</div>');
			room.update();
			room.lastAdvertisement = Date.now();
			return;
		}

		if ((Date.now() - room.lastAdvertisement) >= 5 * 60 * 1000) {
			room.add('|raw|<div class="infobox"><strong><font color=#2DA900>Advertisement: </font></strong> ' + Wisp.parseMessage(message) + ' - ' + Wisp.nameColor(user.name) + '</div>');
			room.update();
			room.lastAdvertisement = Date.now();
			return;
		}

		queueAdvertisement(message, user.name, user.latestIp);
		room.lastAdvertisement = Date.now();
		return this.sendReply("Your message has been added to the advertisement queue. It will be broadcast in the lobby shortly.");
	},

	crashlogs: function (target, room, user) {
		if (!this.can('hotpatch') && user.userid !== 'panpawn' && user.userid !== 'silveee') return false;
		if (target) {
			target = Number(target);
			if (isNaN(target)) return this.parse('/help crashlogs');
			if (target < 1) target = 100; // default to 100 lines
		}
		let crashes = fs.readFileSync('logs/errors.txt', 'utf8').split('\n').splice((target ? target * -1 : -100)).join('\n');
		user.send('|popup|' + crashes);
	},

	autovoice: 'autorank',
	autodriver: 'autorank',
	automod: 'autorank',
	autoowner: 'autorank',
	autopromote: 'autorank',
	autorank: function (target, room, user, connection, cmd) {
		switch (cmd) {
		case 'autovoice':
			target = '+';
			break;
		case 'autodriver':
			target = '%';
			break;
		case 'automod':
			target = '@';
			break;
		case 'autoowner':
			target = '#';
			break;
		}

		if (!target) return this.sendReply("Usage: /autorank [rank] - Automatically promotes user to the specified rank when they join the room.");
		if (!this.can('roommod', null, room)) return false;
		target = target.trim();

		if (target === 'off' && room.autorank) {
			delete room.autorank;
			delete room.chatRoomData.autorank;
			Rooms.global.writeChatRoomData();
			for (let u in room.users) Users(u).updateIdentity();
			return this.privateModCommand("(" + user.name + " has disabled autorank in this room.)");
		}
		if (room.autorank && room.autorank === target) return this.sendReply("Autorank is already set to \"" + target + "\".");

		if (Config.groups[target] && !Config.groups[target].globalonly) {
			if (target === '#' && user.userid !== room.founder) return this.sendReply("You can't set autorank to # unless you're the room founder.");
			room.autorank = target;
			room.chatRoomData.autorank = target;
			Rooms.global.writeChatRoomData();
			for (let u in room.users) Users(u).updateIdentity();
			return this.privateModCommand("(" + user.name + " has set autorank to \"" + target + "\" in this room.)");
		}
		return this.sendReply("Group \"" + target + "\" not found.");
	},

	clearroomstaff: 'clearroomauth',
	clearroomauth: function (target, room, user) {
		if (!room.founder && user.group !== '~') return this.sendReply('/clearroomauth - Access denied.');
		if (room.founder !== user.userid && !user.can('seniorstaff')) return this.sendReply('/clearroomauth - Access denied.');
		if (!room.chatRoomData) return this.sendReply('This room isn\'t registered.');
		if (!room.auth) return this.sendReply('This room has no auth.');
		if (room.isOfficial && !user.can('seniorstaff')) return this.sendReply('Only senior staff can clear the room auth in official rooms.');
		if (target && !Config.groups[target]) return this.errorReply("Please specify a valid rank.");

		if (target && Config.groups[target]) {
			for (let u in room.auth) {
				if (room.founder && u === room.founder) continue;
				if (room.auth[u] === target) delete room.auth[u];
			}
			room.chatRoomData.auth = room.auth;
			Rooms.global.writeChatRoomData();
			for (let i in room.users) Users(i).updateIdentity();
			return this.privateModCommand("(" + user.name + " has cleared the room auth list of " + Config.groups[target].name + "s.)");
		}

		room.auth = {};
		room.auth[user.userid] = '#';
		room.founder = user.userid;
		room.chatRoomData.auth = room.auth;
		room.chatRoomData.founder = room.founder;
		Rooms.global.writeChatRoomData();
		for (let u in room.users) Users(u).updateIdentity();
		return this.privateModCommand('(' + user.name + ' has cleared the room auth list.)');
	},
	clearroomauthhelp: ['/clearroomauth - Clears the room auth list in the current room.',
		'/clearroomauth [rank] - Clears the room auth list of users with the rank specified.'],

	roomlist: function (target, room, user) {
		if (!this.can('seniorstaff')) return;

		let header = ['<b><font color="#b30000" size="2">Total users connected: ' + Rooms.global.userCount + '</font></b><br />'];
		let official = ['<b><font color="#1a5e00" size="2">Official chat rooms:</font></b><br />'];
		let nonOfficial = ['<hr><b><font color="#000b5e" size="2">Public chat rooms:</font></b><br />'];
		let privateRoom = ['<hr><b><font color="#ff5cb6" size="2">Private chat rooms:</font></b><br />'];
		let groupChats = ['<hr><b><font color="#740B53" size="2">Group Chats:</font></b><br />'];
		let battleRooms = ['<hr><b><font color="#0191C6" size="2">Battle Rooms:</font></b><br />'];

		let rooms = [];

		Rooms.rooms.forEach(curRoom => {
			rooms.push(curRoom.id);
		});

		rooms.sort(function (a, b) {
			return a - b;
		});

		for (let u in rooms) {
			let curRoom = Rooms(rooms[u]);
			if (!curRoom || u === 'global') continue;
			if (curRoom.type === 'battle') {
				battleRooms.push('<a href="/' + curRoom.id + '" class="ilink">' + Tools.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
			}
			if (curRoom.type === 'chat') {
				if (curRoom.isPersonal) {
					groupChats.push('<a href="/' + curRoom.id + '" class="ilink">' + curRoom.id + '</a> (' + curRoom.userCount + ')');
					continue;
				}
				if (curRoom.isOfficial) {
					official.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + Tools.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
					continue;
				}
				if (curRoom.isPrivate) {
					privateRoom.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + Tools.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
					continue;
				}
			}
			if (curRoom.type !== 'battle') nonOfficial.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + curRoom.title + '</a> (' + curRoom.userCount + ')');
		}
		this.sendReplyBox(header + official.join(' ') + nonOfficial.join(' ') + privateRoom.join(' ') + (groupChats.length > 1 ? groupChats.join(' ') : '') + (battleRooms.length > 1 ? battleRooms.join(' ') : ''));
	},

	ssb: 'wssb',
	wssb: function (target, room, user) {
		if (!this.runBroadcast()) return false;
		if (!target || target === 'help') return this.parse('/help wssb');
		let targetData = getMonData(toId(target));
		if (!targetData) return this.errorReply("The staffmon '" + toId(target) + "' could not be found.");
		return this.sendReplyBox(targetData);
	},
	wssbhelp: ["/Wssb [staff member's name] - displays data for a staffmon's movepool, custom move, and custom ability."],

	roombanlist: function (target, room, user) {
		if (!this.can('roomban', null, room)) return false;
		if (!this.runBroadcast()) return;
		if (Object.keys(room.bannedUsers).length < 1) return this.sendReplyBox("This room has no banned users.");
		let users = [];
		for (let u in room.bannedUsers) users.push(Wisp.nameColor(u, true));
		this.sendReplyBox("Roombanned users in " + Tools.escapeHTML(room.title) + ":<br />" + users.join(', '));
	},

	staffdeclare: function (target, room, user) {
		if (!this.can('declare', null, room)) return false;
		if (!target) return this.parse('/help staffdeclare');
		if (!this.canTalk()) return;
		if (room.type !== 'chat') return this.errorReply("You can't use staff declares in this room.");

		let id = user.userid + "-" + Wisp.randomString(5);
		room.declareIds.push(id);

		for (let u in room.users) {
			let curUser = Users(u);
			if (!curUser || !curUser.connected || !curUser.can('receiveauthmessages', null, room)) continue;
			curUser.sendTo(room, '|uhtml|' + id + '|<div class="broadcast-red"><u><b>Staff Declare by ' + Tools.escapeHTML(user.name) + ':</b></u><br />' + target + '</div>');
		}
		this.logModCommand(user.name + " staff declared: " + target + " (id: " + id + ")");
	},
	staffdeclarehelp: ['/staffdeclare - Declares a message only visible to Staff.'],

	background: {
		set: function (target, room, user) {
			if (!this.can('background')) return false;
			if (!target) return this.parse('/help background');
			let targets = target.split(',');
			for (let u in targets) targets[u] = targets[u].trim();
			if (!targets[1]) return this.parse('/help background');

			let targetUser = Users(targets[0]);
			let image = targets[1];

			if (!targetUser || !targetUser.connected) return this.errorReply(targets[0] + " is not online");
			if (!image) return this.errorReply("Please specify an image to set.");
			if (image.length > 100) return this.errorReply("Image URLs may not be longer than 100 characters.");

			Wisp.setBackground(targetUser.userid, image);
			Wisp.messageSeniorStaff("/html " + Wisp.nameColor(user.name, true) + " has set " + Wisp.nameColor(targetUser.name, true) + "'s profile background to: " + Tools.escapeHTML(image));
			Rooms('upperstaff').add("|raw|" + Wisp.nameColor(user.name, true) + " has set " + Wisp.nameColor(targetUser.name, true) + "'s profile background to: " + Tools.escapeHTML(image));

			this.sendReply("You've set " + targetUser.name + "'s profile background.");
		},

		delete: function (target, room, user) {
			if (!this.can('background')) return false;
			if (!target) return this.parse('/help background');

			let targetUser = Users(target);

			if (!targetUser || !targetUser.connected) return this.errorReply(target + " is not online");

			Wisp.setBackground(targetUser.userid, "");
			Wisp.messageSeniorStaff("/html " + Wisp.nameColor(user.name, true) + " has removed " + Wisp.nameColor(targetUser.name, true) + "'s profile background");
			Rooms('upperstaff').add("|raw|" + Wisp.nameColor(user.name, true) + " has removed " + Wisp.nameColor(targetUser.name, true) + "'s profile background");

			this.sendReply("You've removed " + targetUser.name + "'s profile background.");
		},
		'': function (target, room, user) {
			return this.parse('/help background');
		},
	},
	backgroundhelp: ["/background set [user], [image] - Sets a users profile background.",
		"/background delete [user] - Deletes a users profile background."],
	music: {
		set: function (target, room, user) {
			if (!this.can('music')) return false;
			if (!target) return this.parse('/help music');
			let targets = target.split(',');
			for (let u in targets) targets[u] = targets[u].trim();
			if (!targets[1]) return this.parse('/help music');

			let targetUser = Users(targets[0]);
			let song = targets[1];

			if (!targetUser || !targetUser.connected) return this.errorReply(targets[0] + " is not online");
			if (!song) return this.errorReply("Please specify a song to set.");
			if (song.length > 100) return this.errorReply("Music URLs may not be longer than 100 characters.");

			Wisp.setMusic(targetUser.userid, song);
			Wisp.messageSeniorStaff("/html " + Wisp.nameColor(user.name, true) + " has set " + Wisp.nameColor(targetUser.name, true) + "'s profile music to: " + Tools.escapeHTML(song));
			Rooms('upperstaff').add("|raw|" + Wisp.nameColor(user.name, true) + " has set " + Wisp.nameColor(targetUser.name, true) + "'s profile music to: " + Tools.escapeHTML(song));

			this.sendReply("You've set " + targetUser.name + "'s profile music.");
		},

		delete: function (target, room, user) {
			if (!this.can('music')) return false;
			if (!target) return this.parse('/help music');

			let targetUser = Users(target);

			if (!targetUser || !targetUser.connected) return this.errorReply(target + " is not online");

			Wisp.setMusic(targetUser.userid, "");
			Wisp.messageSeniorStaff("/html " + Wisp.nameColor(user.name, true) + " has removed " + Wisp.nameColor(targetUser.name, true) + "'s profile music");
			Rooms('upperstaff').add("|raw|" + Wisp.nameColor(user.name, true) + " has removed " + Wisp.nameColor(targetUser.name, true) + "'s profile music");

			this.sendReply("You've removed " + targetUser.name + "'s profile music.");
		},
		'': function (target, room, user) {
			return this.parse('/help music');
		},
	},
	musichelp: ["/music set [user], [song] - Sets a users profile music.",
		"/music delete [user] - Deletes a users profile music."],
};

Object.assign(Wisp, {
	hashColor: function (name) {
		name = toId(name);
		if (mainColors[name]) name = mainColors[name];
		if (Wisp.customColors[name]) return Wisp.customColors[name];
		if (colorCache[name]) return colorCache[name];

		let hash = MD5(name);
		let H = parseInt(hash.substr(4, 4), 16) % 360; // 0 to 360
		let S = parseInt(hash.substr(0, 4), 16) % 50 + 40; // 40 to 89
		let L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 + 30); // 30 to 49
		let C = (100 - Math.abs(2 * L - 100)) * S / 100 / 100;
		let X = C * (1 - Math.abs((H / 60) % 2 - 1));
		let m = L / 100 - C / 2;

		let R1, G1, B1;
		switch (Math.floor(H / 60)) {
		case 1: R1 = X; G1 = C; B1 = 0; break;
		case 2: R1 = 0; G1 = C; B1 = X; break;
		case 3: R1 = 0; G1 = X; B1 = C; break;
		case 4: R1 = X; G1 = 0; B1 = C; break;
		case 5: R1 = C; G1 = 0; B1 = X; break;
		case 0: default: R1 = C; G1 = X; B1 = 0; break;
		}
		let lum = (R1 + m) * 0.2126 + (G1 + m) * 0.7152 + (B1 + m) * 0.0722; // 0.05 (dark blue) to 0.93 (yellow)
		let HLmod = (lum - 0.5) * -100; // -43 (yellow) to 45 (dark blue)
		if (HLmod > 12) {
			HLmod -= 12;
		} else if (HLmod < -10) {
			HLmod = (HLmod + 10) * 2 / 3;
		} else {
			HLmod = 0;
		}

		L += HLmod;
		let Smod = 10 - Math.abs(50 - L);
		if (HLmod > 15) Smod += (HLmod - 15) / 2;
		S -= Smod;

		let rgb = this.hslToRgb(H, S, L);
		colorCache[name] = "#" + this.rgbToHex(rgb.r, rgb.g, rgb.b);
		return colorCache[name];
	},

	hslToRgb: function (h, s, l) {
		let r, g, b, m, c, x;

		if (!isFinite(h)) h = 0;
		if (!isFinite(s)) s = 0;
		if (!isFinite(l)) l = 0;

		h /= 60;
		if (h < 0) h = 6 - (-h % 6);
		h %= 6;

		s = Math.max(0, Math.min(1, s / 100));
		l = Math.max(0, Math.min(1, l / 100));

		c = (1 - Math.abs((2 * l) - 1)) * s;
		x = c * (1 - Math.abs((h % 2) - 1));

		if (h < 1) {
			r = c;
			g = x;
			b = 0;
		} else if (h < 2) {
			r = x;
			g = c;
			b = 0;
		} else if (h < 3) {
			r = 0;
			g = c;
			b = x;
		} else if (h < 4) {
			r = 0;
			g = x;
			b = c;
		} else if (h < 5) {
			r = x;
			g = 0;
			b = c;
		} else {
			r = c;
			g = 0;
			b = x;
		}

		m = l - c / 2;
		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		return {
			r: r,
			g: g,
			b: b,
		};
	},

	rgbToHex: function (R, G, B) {
		return this.toHex(R) + this.toHex(G) + this.toHex(B);
	},

	toHex: function (N) {
		if (N === null) return "00";
		N = parseInt(N);
		if (N === 0 || isNaN(N)) return "00";
		N = Math.max(0, N);
		N = Math.min(N, 255);
		N = Math.round(N);
		return "0123456789ABCDEF".charAt((N - N % 16) / 16) + "0123456789ABCDEF".charAt(N % 16);
	},

	nameColor: function (name, bold) {
		return (bold ? "<b>" : "") + "<font color=" + this.hashColor(name) + ">" +
		(Users(name) && Users.getExact(name) ? Tools.escapeHTML(Users.getExact(name).name) : Tools.escapeHTML(name)) +
		"</font>" + (bold ? "</b>" : "");
	},

	regdate: function (target, callback) {
		target = toId(target);
		if (regdateCache[target]) return callback(regdateCache[target]);
		let options = {
			host: 'pokemonshowdown.com',
			port: 80,
			path: '/users/' + target + '.json',
			method: 'GET',
		};
		http.get(options, function (res) {
			let data = '';
			res.on('data', function (chunk) {
				data += chunk;
			}).on('end', function () {
				if (data.charAt(0) !== '{') data = JSON.stringify({registertime: 0});
				data = JSON.parse(data);
				let date = data['registertime'];
				if (date !== 0 && date.toString().length < 13) {
					while (date.toString().length < 13) {
						date = Number(date.toString() + '0');
					}
				}
				if (date !== 0) {
					regdateCache[target] = date;
					saveRegdateCache();
				}
				callback((date === 0 ? false : date));
			});
		});
	},

	getBackground: function (user, callback) {
		let userid = toId(user);
		Wisp.database.all("SELECT background FROM users WHERE userid=$userid", {$userid: userid}, function (err, rows) {
			if (err) return console.log("getBackground: " + err);
			callback((rows[0] ? rows[0].background : false));
		});
	},

	setBackground: function (user, image) {
		let userid = toId(user);
		Wisp.database.run("UPDATE users SET background=$background WHERE userid=$userid;", {$background: image, $userid: userid}, function (err) {
			if (err) return console('setBackground 1: ' + err);
			Wisp.database.run("INSERT OR IGNORE INTO users (userid,background) VALUES ($userid, $background)", {$userid: userid, $background: image}, function (err) {
				if (err) return console.log("setBackground 2: " + err);
			});
		});
	},
	getMusic: function (user, callback) {
		let userid = toId(user);
		Wisp.database.all("SELECT music FROM users WHERE userid=$userid", {$userid: userid}, function (err, rows) {
			if (err) return console.log("getMusic: " + err);
			callback((rows[0] ? rows[0].music : false));
		});
	},

	setMusic: function (user, song) {
		let userid = toId(user);
		Wisp.database.run("UPDATE users SET music=$music WHERE userid=$userid;", {$music: song, $userid: userid}, function (err) {
			if (err) return console.log('setMusic 1: ' + err);
			Wisp.database.run("INSERT OR IGNORE INTO users (userid,music) VALUES ($userid, $music)", {$userid: userid, music: song}, function (err) {
				if (err) return console.log("setMusic 2: " + err);
			});
		});
	},

	updateSeen: function (user) {
		let userid = toId(user);
		if (userid.match(/^guest[0-9]/)) return false;
		let date = Date.now();
		Wisp.database.run("UPDATE users SET lastSeen=$date, name=$name WHERE userid=$userid;", {$date: date, $name: user, $userid: userid}, function (err) {
			if (err) return console('updateSeen 1: ' + err);
			Wisp.database.run("INSERT OR IGNORE INTO users (userid, name, lastSeen) VALUES ($userid, $name, $date)", {$userid: userid, $name: user, $date: date}, function (err) {
				if (err) return console.log("updateSeen 2: " + err);
			});
		});
	},

	lastSeen: function (userid, callback) {
		Wisp.database.all("SELECT * FROM users WHERE userid=$userid", {$userid: userid}, function (err, rows) {
			if (err) return console.log("lastSeen: " + err);
			callback((rows[0] ? rows[0].lastSeen : false));
		});
	},

	reloadCSS: function () {
		let options = {
			host: 'play.pokemonshowdown.com',
			port: 80,
			path: '/customcss.php?server=wisp',
			method: 'GET',
		};
		http.get(options);
	},

	messageSeniorStaff: function (message) {
		for (let u in Rooms.global.users) {
			let curUser = Users(u);
			if (!curUser || !curUser.connected || !curUser.can('seniorstaff')) continue;
			curUser.send('|pm|~Server|~|' + message);
		}
	},

	saveAutoJoins: function () {
		fs.writeFileSync('config/autojoin.json', JSON.stringify(Wisp.autoJoinRooms));
	},

	getTells: function (user) {
		let tell = Wisp.tells[user.userid];
		if (!tell) return;
		for (let i in tell) {
			tell[i].forEach(msg => user.send('|pm| Tells|' + user.getIdentity() + '|/raw ' + msg));
		}
		delete Wisp.tells[user.userid];
		fs.writeFileSync('config/tells.json', JSON.stringify(Wisp.tells));
	},

	getTitle: function (userid, callback) {
		if (!callback) return false;
		userid = toId(userid);
		Wisp.database.all("SELECT title FROM users WHERE userid=$userid", {$userid: userid}, function (err, rows) {
			if (err) return console.log("getTitle: " + err);
			callback(((rows[0] && rows[0].title) ? rows[0].title : ""));
		});
	},

	setTitle: function (userid, title, callback) {
		userid = toId(userid);
		Wisp.database.all("SELECT * FROM users WHERE userid=$userid", {$userid: userid}, function (err, rows) {
			if (rows.length < 1) {
				Wisp.database.run("INSERT INTO users(userid, title) VALUES ($userid, $title)", {$userid: userid, $title: title}, function (err) {
					if (err) return console.log("setTitle 1: " + err);
					if (callback) return callback();
				});
			} else {
				Wisp.database.run("UPDATE users SET title=$title WHERE userid=$userid", {$title: title, $userid: userid}, function (err) {
					if (err) return console.log("setTitle 2: " + err);
					if (callback) return callback();
				});
			}
		});
	},

	parseMessage: function (message) {
		if (message.substr(0, 5) === "/html") {
			message = message.substr(5);
			message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>'); // italics
			message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<b>$1</b>'); // bold
			message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>'); // strikethrough
			message = message.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g, '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;'); // <<roomid>>
			message = Autolinker.link(message.replace(/&#x2f;/g, '/'), {stripPrefix: false, phone: false, twitter: false});
			return message;
		}
		message = Tools.escapeHTML(message).replace(/&#x2f;/g, '/');
		message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>'); // italics
		message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<b>$1</b>'); // bold
		message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>'); // strikethrough
		message = message.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g, '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;'); // <<roomid>>
		message = Autolinker.link(message, {stripPrefix: false, phone: false, twitter: false});
		return message;
	},

	randomString: function (length) {
		return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
	},
});

function queueAdvertisement(message, user, ip) {
	Advertisements[ip] = {message: message, user: user};
}
if (!Config.advertisementTimer) {
	Config.advertisementTimer = setInterval(function () {
		if (!Object.keys(Advertisements)[0]) return;
		let ip = Object.keys(Advertisements)[0];
		let message = Advertisements[ip].message;
		let user = Advertisements[ip].user;
		Rooms('lobby').add('|raw|<div class="infobox"><strong><font color="#2DA900">Advertisement: </font></strong> ' + Wisp.parseMessage(message) + ' - ' + Wisp.nameColor(user) + '</div>');
		Rooms('lobby').update();
		delete Advertisements[ip];
	}, 5 * 60 * 1000);
	Config.advertisementsLoaded = true;
}


function loadRegdateCache() {
	try {
		regdateCache = JSON.parse(fs.readFileSync('config/regdate.json', 'utf8'));
	} catch (e) {}
}
loadRegdateCache();

function saveRegdateCache() {
	fs.writeFileSync('config/regdate.json', JSON.stringify(regdateCache));
}

function getMonData(target) {
	let returnData = null;
	monData.forEach(function (data) {
		if (toId(data.split("\n")[0].split(" - ")[0] || " ") === target) {
			returnData = data.split("\n").map(function (line) {
				return Tools.escapeHTML(line);
			}).join("<br />");
		}
	});
	return returnData;
}
