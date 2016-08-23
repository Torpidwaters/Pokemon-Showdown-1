'use strict';

let icons = {};
const fs = require('fs');

function load() {
	fs.readFile('config/icons.json', 'utf8', function (err, file) {
		if (err) return;
		icons = JSON.parse(file);
	});
}
load();

function updateIcons() {
	fs.writeFileSync('config/icons.json', JSON.stringify(icons));

	let newCss = '/* ICONS START */\n';

	for (let name in icons) {
		newCss += generateCSS(name, icons[name]);
	}
	newCss += '/* ICONS END */\n';

	let file = fs.readFileSync('config/custom.css', 'utf8').split('\n');
	if (~file.indexOf('/* ICONS START */')) file.splice(file.indexOf('/* ICONS START */'), (file.indexOf('/* ICONS END */') - file.indexOf('/* ICONS START */')) + 1);
	fs.writeFileSync('config/custom.css', file.join('\n') + newCss);
	Wisp.reloadCSS();
}
Wisp.updateIcons = updateIcons;

function generateCSS(name, icon) {
	let css = '';
	let rooms = [];
	name = toId(name);
	Rooms.rooms.forEach((curRoom, id) => {
		if (id === 'global' || curRoom.type !== 'chat' || curRoom.isPersonal) return;
		if (!isNaN(Number(id.charAt(0)))) return;
		rooms.push('#' + id + '-userlist-user-' + name);
	});
	css = rooms.join(', ');
	css += '{\nbackground: url("' + icon + '") no-repeat right\n}\n';
	return css;
}

exports.commands = {
	customicon: 'icon',
	icon: function (target, room, user) {
		if (!this.can('customicon')) return false;
		target = target.split(',');
		for (let u in target) target[u] = target[u].trim();
		if (!target[1]) return this.parse('/help icon');
		if (toId(target[0]).length > 19) return this.errorReply("Usernames are not this long...");
		if (target[1] === 'delete') {
			if (!icons[toId(target[0])]) return this.errorReply('/icon - ' + target[0] + ' does not have an icon.');
			delete icons[toId(target[0])];
			updateIcons();
			this.sendReply("You removed " + target[0] + "'s icon.");
			Rooms('upperstaff').add(user.name + " removed " + target[0] + "'s icon.").update();
			this.privateModCommand("(" + target[0] + "'s icon was removed by " + user.name + ".)");
			if (Users(target[0]) && Users(target[0]).connected) Users(target[0]).popup("|modal||html|" + Wisp.nameColor(user.name, true) + " removed your icon.");
			return;
		}

		this.sendReply("|raw|You have given <b><font color=" + Wisp.hashColor(Tools.escapeHTML(target[0])) + ">" + Tools.escapeHTML(target[0]) + "</font></b> an icon.");
		if (Users(target[0]) && Users(target[0]).connected) Users(target[0]).popup("|modal||html|" + Wisp.nameColor(user.name, true) + " has set your icon as : <img src='" + target[1] + "' width='32' height='32'");
		Rooms('upperstaff').add('|raw|<b><font color="' + Wisp.hashColor(Tools.escapeHTML(target[0])) + '">' + Tools.escapeHTML(target[0]) + '</font> has received an icon from ' + Tools.escapeHTML(user.name) + '.</b>').update();
		this.privateModCommand("(" + target[0] + " has recieved icon: '" + target[1] + "' from " + user.name + ".)");
		icons[toId(target[0])] = target[1];
		updateIcons();
	},
	iconhelp: [
		"Commands Include:",
		"/icon [user], [image url] - Gives [user] an icon of [image url]",
		"/icon [user], delete - Deletes a user's icon",
	],
};
