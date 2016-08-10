
'use strict';

const moment = require('moment');

const MAX_FRIENDS = 50;

function getFriends(userid, callback) {
	if (!callback) return false;
	userid = toId(userid);
	Wisp.database.all("SELECT friend FROM friends WHERE userid=$userid", {$userid: userid}, function (err, rows) {
		if (err) return console.log("getFriends: " + err);
		let friends = [];
		for (let row in rows) friends.push(rows[row].friend);
		callback((friends.length > 0 ? friends : false));
	});
}

function canPM(userid, targetUser, callback) {
	Wisp.database.all("SELECT userid FROM friends WHERE friend=$userid AND userid=$targetUser", {$userid: userid, $targetUser: targetUser}, function (err, rows) {
		if (err) {
			console.log("canPM: " + err);
			return callback(false);
		}
		return callback(rows.length > 0);
	});
}
Wisp.canPM = canPM;

function getAdded(userid, callback) {
	if (!callback) return false;
	userid = toId(userid);
	Wisp.database.all("SELECT userid FROM friends WHERE friend=$userid", {$userid: userid}, function (err, rows) {
		if (err) return console.log("getAdded: " + err);
		let added = [];
		for (let row in rows) added.push(rows[row].userid);
		callback((added.length > 0 ? added : false));
	});
}

function notifyStatus(userid, callback) {
	if (!callback) return false;
	userid = toId(userid);
	Wisp.database.all("SELECT notifyStatus FROM users WHERE userid=$userid", {$userid: userid}, function (err, rows) {
		if (err) return console.log("notifyStatus: " + err);
		callback(rows[0].notifyStatus === 1);
	});
}

function getOnlineTimes(friends, count, options) {
	if (!friends[count]) return showFriends(options[0], friends, options[1]);
	Wisp.lastSeen(friends[count], function (date) {
		Economy.readMoney(friends[count], function (bucks) {
			friends[count] = [friends[count], date, bucks];
			count++;
			getOnlineTimes(friends, count, options);
		});
	});
}

function showFriends(target, friends, self) {
	notifyStatus(target, status => {
		let output = "";
		output += "<div style=\"max-height: 150px; overflow-y: auto; overflow-x: hidden;\"><b>Friendslist of " + Wisp.nameColor(target, true) + " (" + friends.length + "):</b><br />";
		output += (status ? "(<i>does</i> get notified when friends come online)" : "(<i>does NOT</i> get notified when friends come online)");
		output += '<table border="1" cellspacing ="0" cellpadding="3">';
		output += "<tr><td><u>Friend:</u></td><td><u>Last Online:</u></td><td><u>Bucks:</u></td></tr>";

		for (let u in friends) {
			let seen = (friends[u][1] ? moment(friends[u][1]).format("MMMM Do YYYY, h:mm:ss A") + " EST. (" + moment(friends[u][1]).fromNow() + ")" : "<font color=\"red\">Never</font>");
			if (Users(friends[u][0]) && Users(friends[u][0]).connected) seen = '<font color="green">Currently Online</font>';
			output += "<tr><td>" + Wisp.nameColor(friends[u][0], true) + "</td><td>" + seen + "</td><td>" + friends[u][2] + "</td></tr>";
		}
		output += "</table>";

		getAdded(target, function (added) {
			if (added.length > 0) {
				output += "<button name=\"send\" value=\"/friendslist getadded " + toId(target) + "\">" + added.length +
				(added.length === 1 ? " user has" : " users have") + " added " + Wisp.nameColor(target) + " as a friend.</button>";
			}
			self.sendReplyBox(output);
			self.room.update();
		});
	});
}

function friendsNotify(user, offline) {
	user = toId(user);
	if (!Users(user) || !Users(user).connected) return;
	Wisp.database.all("SELECT userid FROM friends WHERE friend=$userid", {$userid: user}, function (err, rows) {
		if (err) return console.log("friendsNotify: " + err);
		if (rows.length > 0) {
			for (let row in rows) {
				if (!Users(rows[row].userid) || !Users(rows[row].userid).connected) continue;
				let cooldown = (offline ? Users(user).notifyCooldownOffline : Users(user).notifyCooldown);
				if (cooldown && (Date.now() - cooldown) < 5 * 60 * 1000) continue;
				if (!offline) Users(user).notifyCooldown = Date.now();
				if (offline) Users(user).notifyCooldownOffline = Date.now();
				notifyStatus(rows[row].userid, function (status) {
					if (!status) return;
					Users(rows[row].userid).send('|pm|~Friendslist Notifications|' + Users(rows[row].userid).getIdentity() + '|/raw ' + Wisp.nameColor(user, true) +
					(offline ? ' has gone <font color="red">offline.</font>' : ' has come <font color="green">online.</font>'));
				});
			}
		}
	});
}
Wisp.friendsNotify = friendsNotify;

exports.commands = {
	friend: 'friends',
	friendslist: 'friends',
	friendlist: 'friends',
	friends: {
		'': 'list',
		view: 'list',
		list: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (!target) target = user.name;
			getFriends(target, friends => {
				if (!friends) {
					this.sendReplyBox(Wisp.nameColor(target, true) + " has no friends.");
					return room.update();
				}
				getOnlineTimes(friends, 0, [target, this]);
			});
		},

		add: function (target, room, user) {
			if (!target) return this.errorReply("Please specify a user to add.");
			let friend = toId(target);
			if (friend.length < 1) return this.errorReply("Please specify a valid username.");
			if (friend.length > 19) return this.errorReply("Usernames may not be longer than 19 characters.");
			if (friend === user.userid) return this.errorReply("You can't add yourself as a friend.");

			Wisp.database.all("SELECT * FROM friends WHERE userid=$userid", {$userid: user.userid}, (err, rows) => {
				if (err) return console.log("/friend add (1): " + err);
				if (rows.length >= MAX_FRIENDS) return this.errorReply("You may not add more than " + MAX_FRIENDS + " friends to your friends list.");
				Wisp.database.all("SELECT * FROM friends WHERE userid=$userid AND friend=$friend", {$userid: user.userid, $friend: friend}, (err, rows) => {
					if (err) return console.log("/friend add (2): " + err);
					if (rows.length < 1) {
						Wisp.database.run("INSERT INTO friends(userid, friend) VALUES ($userid, $friend)", {$userid: user.userid, $friend: friend}, err => {
							if (err) return console.log("/friend add (3): " + err);
							return this.sendReply("You've added " + friend + " to your friends list.");
						});
					} else {
						return this.errorReply("That user is already added to your friends list.");
					}
				});
			});
		},

		delete: 'remove',
		del: 'remove',
		rem: 'remove',
		remove: function (target, room, user) {
			if (!target) return this.errorReply("Please specify a user to remove from your friends list.");
			let friend = toId(target);
			if (friend.length < 1) return this.errorReply("Please specify a valid username.");
			if (friend.length > 19) return this.errorReply("Usernames may not be longer than 19 characters.");

			Wisp.database.all("SELECT * FROM friends WHERE userid=$userid AND friend=$friend", {$userid: user.userid, $friend: friend}, (err, rows) => {
				if (err) return console.log("/friend del (1): " + err);
				if (rows.length < 1) {
					return this.errorReply("That user is not on your friends list.");
				} else {
					Wisp.database.run("DELETE FROM friends WHERE userid=$userid AND friend=$friend", {$userid: user.userid, $friend: friend}, err => {
						if (err) return console.log("/friend del (2): " + err);
						return this.sendReply("That user has been removed from your friends list.");
					});
				}
			});
		},

		removeall: 'clear',
		clear: function (target, room, user) {
			if (!user.confirmClearFriends) {
				user.confirmClearFriends = true;
				return this.errorReply("WARNING: This command will remove all friends from your friends list. If you are sure you want to do this, enter the command again.");
			}
			delete user.confirmClearFriends;
			Wisp.database.run("DELETE FROM friends WHERE userid=$userid", {$userid: user.userid}, err => {
				if (err) return console.log("/friends clear: " + err);
				return this.sendReply("You have cleared your friends list.");
			});
		},

		notify: function (target, room, user) {
			notifyStatus(user.userid, status => {
				let newStatus = (status ? 0 : 1);
				Wisp.database.all("SELECT * FROM users WHERE userid=$userid", {$userid: user.userid}, (err, rows) => {
					if (err) return console.log("/friends notify (1): " + err);
					if (rows.length < 1) {
						Wisp.database.run("INSERT INTO users(userid, notifystatus) VALUES ($userid, $status)", {$userid: user.userid, $status: newStatus}, err => {
							if (err) return console.log("/friends notify (2): " + err);
							return this.sendReply((newStatus === 1 ? "You will now be notified when your friends come online." : "You will no longer be notified when your friends come online."));
						});
					} else {
						Wisp.database.run("UPDATE users SET notifyStatus=$status WHERE userid=$userid", {$status: newStatus, $userid: user.userid}, err => {
							if (err) return console.log("/friends notify (3): " + err);
							return this.sendReply((newStatus === 1 ? "You will now be notified when your friends come online." : "You will no longer be notified when your friends come online."));
						});
					}
				});
			});
		},

		added: 'getadded',
		getadded: function (target, room, user) {
			if (!target) target = user.userid;
			if (!this.runBroadcast()) return;
			getAdded(target, users => {
				if (!users) {
					this.sendReplyBox("No one has added " + Wisp.nameColor(target, true) + " to their friends list.");
					room.update();
					return;
				}
				for (let u in users) {
					users[u] = '<button name="send" value="/friendslist list ' + users[u] + '">' + Wisp.nameColor(users[u], true) + '</button>';
				}
				this.sendReplyBox("The following users have added " + Wisp.nameColor(target, true) + " to their friends list:<br />" + users.join(''));
				room.update();
			});
		},

		help: function (target, room, user) {
			if (!this.runBroadcast()) return;
			this.sendReplyBox(
				"/friendslist add [user] - Adds a user to your friendslist.<br />" +
				"/friendslist remove [user] - Removes a user from your friendslist.<br />" +
				"/friendslist clear - Clears your friendslist.<br />" +
				"/friendslist - Displays your friendslist.<br />" +
				"/friendslist view [user] - Displays another users friendslist.<br />" +
				"/friendslist added [user] - Shows whose added a user as a friend to their friendslist.<br />" +
				"/friendslist notify - Toggles being notified or not when a friend comes online (disabled by default)."
			);
		},
	},
	friendshelp: 'friendslisthelp',
	friendslisthelp: function (target, room, user) {
		return this.parse("/friends help");
	},
};
