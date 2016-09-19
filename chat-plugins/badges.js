'use strict';
/**********************
 * Badges by a weeb for weebs *
 **********************/

function badgeImg(link, name) {
	return '<img src="' + link + '" height="16" width="16" alt="' + name + '" title="' + name + '" >';
}

exports.commands = {
	badge: 'badges',
	badges: {
		set: function (target, room, user) {
			let parts = target.split(',');
			let userid, targetUser;
			let selectedBadge;
			let userBadges;
			if (!this.can('lock')) return false;
			if (parts.length !== 2) return this.errorReply("Correct command: `/badges set user, badgeName`");
			userid = toId(parts[0].trim());
			targetUser = Users.getExact(userid);
			userBadges = Db('userBadges').get(userid);
			selectedBadge = parts[1].trim();
			if (!Db('badgeData').has(selectedBadge)) return this.errorReply("This badge does not exist, please check /badges list");
			if (!Db('userBadges').has(userid)) userBadges = [];
			userBadges = userBadges.filter(b => b !== selectedBadge);
			userBadges.push(selectedBadge);
			Db('userBadges').set(toId(userid), userBadges);
			if (Users.get(targetUser)) Users.get(userid).popup('|modal||html|<font color="red"><strong>ATTENTION!</strong></font><br /> You have received a badge from <b><font color="' + Wisp.hashColor(toId(user)) + '">' + Tools.escapeHTML(user.name) + '</font></b>: <img src="' + Db('badgeData').get(selectedBadge)[1] + '" width="16" height="16">');

			this.logModCommand(user.name + " gave the badge '" + selectedBadge + "' badge to " + userid + ".");
			this.sendReply("The '" + selectedBadge + "' badge was given to '" + userid + "'.");
		},
		create: function (target, room, user) {
			let parts = target.split(',');
			if (!this.can('ban')) return false;
			if (parts.length !== 3) return this.errorReply("Correct command: `/badges create badge name, description, image`.");
			let badgeName = Tools.escapeHTML(parts[0].trim());
			let description = Tools.escapeHTML(parts[1].trim());
			let img = parts[2].trim();
			if (Db('badgeData').has(badgeName)) return this.errorReply('This badge already exists.');
			Db('badgeData').set(badgeName, [description, img]);

			this.logModCommand(user.name + " created the badge '" + badgeName + ".");
			this.sendReply("The badge '" + badgeName + "' was successfully created.");
		},
		list: function (target, room, user) {
			let output = '';
			if (!this.runBroadcast()) return;
			output = '<table border="1">';
			Object.keys(Db('badgeData').object()).forEach(badge => {
				let badgeData = Db('badgeData').get(badge);
				output += '<tr><td>' + badgeImg(badgeData[1], badge) + '</td> <td>' + badge + '</td> <td>' + badgeData[0] + '</td><tr>';
			});
			output += '<table>';
			this.sendReply('|html|<div class = "infobox' + (this.broadcasting ? '-limited' : '') + '">' + output + '</div>');
		},
		info: function (target, room, user) {
			let selectedBadge;
			if (!this.runBroadcast()) return;
			if (!target) return this.errorReply("Correct command: `/badges info badgeName`.");
			selectedBadge = target.trim();
			if (!Db('badgeData').has(selectedBadge)) return this.errorReply("This badge does not exist, please check /badges list");
			let badgeData = Db('badgeData').get(selectedBadge);
			this.sendReplyBox(badgeImg(badgeData[1], selectedBadge) + selectedBadge + ': ' + badgeData[0]);
		},
		take: function (target, room, user) {
			let parts = target.split(',');
			let userid;
			let selectedBadge;
			let userBadges;
			if (!this.can('lock')) return false;
			if (parts.length !== 2) return this.errorReply("Correct command: `/badges take user, badgeName`");
			userid = toId(parts[0].trim());
			if (!Db('userBadges').has(userid)) return this.errorReply("This user doesn't have any badges.");
			userBadges = Db('userBadges').get(userid);
			selectedBadge = parts[1].trim();
			userBadges = userBadges.filter(b => b !== selectedBadge);
			Db('userBadges').set(toId(userid), userBadges);

			this.logModCommand(user.name + " took the badge '" + selectedBadge + "' badge from " + userid + ".");
			this.sendReply("The '" + selectedBadge + "' badge was taken from '" + userid + "'.");
		},
		delete: function (target, room, user) {
			let selectedBadge;
			if (!this.can('ban')) return false;
			if (!target) return this.errorReply("Correct command: `/badges deleteall badgeName`");
			selectedBadge = target.trim();
			if (!Db('badgeData').has(selectedBadge)) return this.errorReply("This badge does not exist, please check /badges list");
			Db('badgeData').delete(selectedBadge);
			let badgeUserObject = Db('userBadges').object();
			let users = Object.keys(badgeUserObject);
			users.forEach(u => Db('userBadges').set(u, (badgeUserObject[u].filter(b => b !== selectedBadge))));

			this.sendReply("The badge with the name '" + selectedBadge + "' deleted.");
			this.logModCommand(user.name + " removed the badge '" + selectedBadge + ".");
		},
		transfer: function (target, room, user) {
			let parts = target.split(',');
			if (!this.can('ban')) return false;
			if (parts.length !== 2) return this.errorReply("Correct command: `/badges transfer userfrom, userto`");
			let userFrom = toId(parts[0].trim());
			let userTo = toId(parts[1].trim());
			let targetUser;
			targetUser = Users.get(userFrom);
			if (!targetUser || !targetUser.connected) return this.errorReply("User '" + userFrom + "' not found.");
			if (!Db('userBadges').has(userFrom)) return this.errorReply("This user doesn't have any badges.");
			let alts = Object.keys(targetUser.prevNames);
			if (!alts.some(a => a === userTo)) return this.errorReply("These two accounts are not alts of the same user.");
			let userToBadges = Db('userBadges').get(userFrom);
			Db('userBadges').set(toId(userFrom), []);
			Db('userBadges').set(toId(userTo), userToBadges);

			this.logModCommand(user.name + " transfered " + userFrom + "'s badges to " + userTo + ".");
			this.sendReply("All badges were taken from '" + userFrom + "' and given to " + userTo + ".");
		},
		'': function (target, room, user) {
			return this.errorReply("Invalid command. Valid commands are `/badges list`, `/badges info badgeName`, `/badges set user, badgeName`, `/badges take user, badgeName`, " +
				"`/badges transfer userFrom, userTo`, `/badges create name, description, img`, and `/badges delete badgeName`.");
		},
	},
	badgeshelp: ["User commands:", "`/badges list` - Lists all server badges", "`/badges info badgeName` - Provides information about a badge `badgeName`", "Staff Commands:", "`/badges set user, badgeName` - Gives badge `badgeName` to user `user`",
		"`/badges take user, badgeName` - Takes badge `badgeName` from user `user`", "`/badges transfer userFrom, userTo` - Transfers all badges from user `userFrom` to user `userTo`",
		"`/badges create name, description, img` - Creates a badge called `name` with description `description` and icon `img`", "`/badges delete badgeName` - Deletes badge `badgeName` and removes the badge from all users who currently possess it"],
};
