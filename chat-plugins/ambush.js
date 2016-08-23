'use strict';

const ROUND_DURATION = 8 * 1000; //8 seconds

class Ambush {
	constructor(room, seconds) {
		this.players = new Map();
		this.round = 0;
		this.room = room;
		if (this.room.ambushCount) {
			this.room.ambushCount++;
		} else {
			this.room.ambushCount = 1;
		}
		this.timeLeft = Date.now() + seconds * 1000;

		this.room.add('|uhtml|ambush' + this.room.ambushCount + this.round + '|<div class = "infobox"><center>A game of Ambush has been started!<br>' +
			'The game will begin in <b>' + seconds + '</b> seconds!<br>' +
			'<button name = "send" value = "/ambush join">Join!</button></center></div>'
		);
		this.timer = setTimeout(() => {
			if (this.players.size < 3) {
				this.room.add('|uhtmlchange|ambush' + this.room.ambushCount + this.round + '|<div class = "infobox"><center>This game of ambush has been ended due to the lack of players.</center></div>').update();
				return this.end();
			}
			this.nextRound();
		}, seconds * 1000);
	}
	updateJoins() {
		let msg = 'ambush' + this.room.ambushCount + this.round + '|<div class = "infobox"><center>A game of Ambush has been started!<br>' +
			'The game will begin in <b>' + Math.round((this.timeLeft - Date.now()) / 1000) + '</b> seconds<br>' +
			'<button name = "send" value = "/ambush join">Join!</button></center>';
		if (this.players.size > 0) {
			msg += '<center><b>' + this.players.size + '</b> ' + (this.players.size === 1 ? 'user has' : 'users have') + ' joined: ' + Array.from(this.players).map(player => Tools.escapeHTML(player[0].name)).join(', ') + '</center>';
		}
		this.room.add('|uhtmlchange|' + msg + '</div>');
	}
	join(user, self) {
		if (!user.named) return self.errorReply("You must choose a name before joining a game of ambush.");
		if (this.players.has(user)) return self.sendReply('You have already joined this game of ambush.');
		if (this.round > 0) return self.sendReply('You cannot join a game of ambush after it has started.');

		this.players.set(user, {status:'alive', rounds:0, warnings:0});
		this.updateJoins();
	}
	leave(user, self) {
		if (!this.players.has(user)) return self.sendReply('You haven\'t joined this game of ambush yet.');

		this.players.delete(user);
		if (!this.round) {
			this.updateJoins();
		} else {
			this.room.add('|html|<b>' + Tools.escapeHTML(user.name) + ' has left the game!</b>');
		}
	}
	getSurvivors() {
		return Array.from(this.players).filter(player => player[1].status === 'alive');
	}
	getMsg() {
		let msg = 'ambush' + this.room.ambushCount + this.round + '|<div class = "infobox"><center><b>Round ' + this.round + '</b><br>' +
			'Players: ' + this.getSurvivors().map(player => Tools.escapeHTML(player[0].name)).join(', ') +
			'<br><small>Use /fire [player] to shoot another player!</small>';
		return msg;
	}
	nextRound() {
		clearTimeout(this.timer);
		this.canShoot = false;
		if (this.checkWinner()) return this.getWinner();
		let survivors = this.getSurvivors();
		if (this.lastRoundSurvivors === survivors.length) {
			this.room.add('|html|<div class = "infobox"><center>This game of ambush has ended due to inactivity, with <b>' + survivors.length + '</b> survivors.</center></div>');
			return this.end();
		}
		this.lastRoundSurvivors = survivors.length;
		if (!this.round) {
			this.oldModchat = this.room.modchat || false;
			this.room.modchat = '%';
		}
		this.round++;
		this.madeMove = false;
		this.loadGuns();
		let msg = this.getMsg();
		this.room.add('|uhtml|' + msg + '<br><i>Wait for it...</i></div>').update();

		this.release = setTimeout(() => {
			this.room.add('|uhtmlchange|' + msg + '<br><b style = "color:red; font-size: 12pt;">FIRE!</b></div>').update();
			this.canShoot = true;
			this.resetTimer();
		}, (Math.floor(Math.random() * 12) + 3) * 1000);
	}
	fire(user, target, self) {
		let getUser = this.players.get(user);
		if (!getUser) return self.sendReply("You aren't a player in this game of Ambush.");
		if (!this.round) return self.sendReply("You're not allowed to open fire yet!");

		if (getUser.status === 'dead') return self.sendReply("You can't fire after you've been killed!");
		if (!getUser.rounds) return self.sendReply("You're out of rounds! You can't shoot anyone else!");

		let targetUser = Users(target);
		if (!targetUser) return self.sendReply('User ' + target + ' not found.');
		if (!this.players.has(targetUser)) return self.sendReply(targetUser.name + ' is not a player!');
		if (this.players.get(targetUser).status === 'dead') return self.sendReply(targetUser.name + ' has already been shot!');
		if (!this.canShoot) {
			if (targetUser === user) return self.sendReply("You're not allowed to open fire yet!");
			if (getUser.warnings < 2) {
				this.players.get(user).warnings++;
				return self.sendReply("You're not allowed to open fire yet!");
			}
			this.removeUser(user);
			self.sendReply("You have been disqualified for spamming /fire.");
			self.privateModCommand("(" + user.name + " was disqualified for spamming /fire.)");
			return;
		}

		this.madeMove = true;
		this.players.get(user).rounds--;
		if (targetUser === user) {
			this.room.add('|html|<b>' + user.name + ' shot themself!</b>');
		} else if (this.players.get(targetUser).shield) {
			this.room.add('|html|<b>' + Tools.escapeHTML(user.name) + ' fired at ' + Tools.escapeHTML(targetUser.name) + ', but ' + Tools.escapeHTML(targetUser.name) + ' has an active shield!</b>');
			return;
		} else {
			this.room.add('|html|<b>' + Tools.escapeHTML(user.name) + ' fired at ' + Tools.escapeHTML(targetUser.name) + '!</b>');
		}
		this.players.get(targetUser).status = 'dead';
		this.players.get(user).shield = true;

		if (this.checkWinner()) this.getWinner();
	}
	loadGuns() {
		this.players.forEach((details, user) => {
			let getUser = this.players.get(user);
			if (getUser.status === 'alive') {
				getUser.rounds = 1;
				getUser.shield = false;
				getUser.warnings = 0;
			}
		});
	}
	resetTimer() {
		this.timer = setTimeout(() => {
			this.nextRound();
			this.room.update();
		}, ROUND_DURATION);
	}
	dq(user, target, self) {
		if (!this.round) return self.sendReply('You can only disqualify a player after the first round has begun.');
		let targetUser = Users(target);
		if (!targetUser) return self.sendReply('User ' + target + ' not found.');

		let getUser = this.players.get(targetUser);
		if (!getUser) return self.sendReply(targetUser.name + ' is not a player!');
		if (getUser.status === 'dead') return self.sendReply(targetUser.name + ' has already been killed!');

		this.removeUser(targetUser);
		self.privateModCommand("(" + targetUser.name + " was disqualified by " + user.name + ".)");
		if (this.checkWinner()) this.getWinner();
	}
	removeUser(user) {
		if (!this.players.has(user)) return;

		this.players.delete(user);
		this.room.add('|html|<b>' + Tools.escapeHTML(user.name) + ' has been disqualified from the game.</b>');
		this.madeMove = true;
		if (this.checkWinner()) {
			this.getWinner();
		} else if (!this.canShoot) {
			this.room.add('|uhtmlchange|' + this.getMsg() + '<br><i>Wait for it...</i></div>').update();
		}
	}
	checkWinner() {
		if (this.getSurvivors().length === 1) return true;
	}
	getWinner() {
		let winner = this.getSurvivors()[0][0].name;
		let msg = '|html|<div class = "infobox"><center>The winner of this game of ambush is <b>' + Tools.escapeHTML(winner) + '!</b> Congratulations!</center>';
		if (this.room.id === 'marketplace') {
			msg += '<center>' + Tools.escapeHTML(winner) + ' has also won <b>5</b> credits for winning!</center>';
			Wisp.writeCredits(winner, 5, () => this.room.add(msg).update());
		} else {
			this.room.add(msg).update();
		}
		this.end();
	}
	end(user) {
		if (user) {
			let msg = '<div class = "infobox"><center>This game of ambush has been forcibly ended by <b>' + Tools.escapeHTML(user.name) + '</b></center></div>';
			if (!this.madeMove) {
				this.room.add('|uhtmlchange|ambush' + this.room.ambushCount + this.round + '|' + msg).update();
			} else {
				this.room.add('|html|' + msg).update();
			}
		}
		if (this.release) clearTimeout(this.release);
		clearTimeout(this.timer);
		this.room.modchat = this.oldModchat;
		delete this.room.ambush;
	}
}

let commands = {
	'': 'help',
	help: function () {
		this.parse('/help ambush');
	},
	'new': 'start',
	begin: 'start',
	start: function (target, room, user) {
		if (room.ambush) return this.sendReply("There is already a game of ambush going on in this room.");
		if (room.isMuted(user) || user.locked) return this.errorReply("You cannot use this while unable to speak.");
		if (!user.can('broadcast', null, room)) return this.sendReply("You must be ranked + or higher in this room to start a game of ambush.");

		if (!target || !target.trim()) target = '60';
		if (isNaN(target)) return this.sendReply('\'' + target + '\' is not a valid number.');
		if (target.includes('.') || target > 180 || target < 10) return this.sendReply('The number of seconds needs to be a non-decimal number between 10 and 180.');

		room.ambush = new Ambush(room, Number(target));
	},
	join: function (target, room, user) {
		if (!room.ambush) return this.sendReply("There is no game of ambush going on in this room.");
		if (room.isMuted(user) || user.locked) return this.errorReply("You cannot use this while unable to speak.");

		room.ambush.join(user, this);
	},
	leave: function (target, room, user) {
		if (!room.ambush) return this.sendReply("There is no game of ambush going on in this room.");

		room.ambush.leave(user, this);
	},
	proceed: function (target, room, user) {
		if (!room.ambush) return this.sendReply("There is no game of ambush going on in this room.");
		if (room.isMuted(user) || user.locked) return this.errorReply("You cannot use this while unable to speak.");
		if (!user.can('broadcast', null, room)) return this.sendReply("You must be ranked + or higher in this room to forcibly begin the first round of a game of ambush.");

		if (room.ambush.round) return this.sendReply('This game of ambush has already begun!');
		if (room.ambush.players.size < 3) return this.sendReply('There aren\'t enough players yet. Wait for more to join!');
		room.add('(' + user.name + ' forcibly started round 1)');
		room.ambush.nextRound();
	},
	disqualify: 'dq',
	dq: function (target, room, user) {
		if (!room.ambush) return this.sendReply("There is no game of ambush going on in this room.");
		if (room.isMuted(user) || user.locked) return this.errorReply("You cannot use this while unable to speak.");
		if (!user.can('mute', null, room)) return this.sendReply("You must be ranked % or higher in this room to disqualify a user from a game of ambush.");

		room.ambush.dq(user, target, this);
	},
	shoot: 'fire',
	fire: function (target, room, user) {
		if (!room.ambush) return this.sendReply("There is no game of ambush going on in this room.");
		if (room.isMuted(user) || user.locked) return this.errorReply("You cannot use this while unable to speak.");

		room.ambush.fire(user, target, this);
	},
	cancel: 'end',
	end: function (target, room, user) {
		if (!room.ambush) return this.sendReply("There is no game of ambush going on in this room.");
		if (!user.can('mute', null, room)) return this.sendReply("You must be ranked % or higher in this room to end a game of ambush.");

		room.ambush.end(user);
	},
	rule: 'rules',
	rules: function (target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReplyBox("Ambush is a game of dexterity, and the goal is to be the last one standing." +
			"Players 'shoot' each other by using /fire [player] once the big red '<b style = \"color: red\">FIRE!</b>' message pops up on screen." +
			"If you have shot someone in a round, then you are given a 'shield' for the rest of the round, and will be immune to any bullets till the next round starts," +
			"but they cannot fire anymore for that round. This means that players have to strive to be the fastest shooter so that they are guaranteed safety." +
			"Once signups end and the game begins, modchat % is enabled to prevent breaking other players' concentration." +
			"Spamming /fire before the message to fire pops up will get you disqualified automatically after three attempts.<br>" +
			"If you'd like to view the commands for Ambush, simply use /ambush help. Have fun playing!"
		);
	},
};

exports.commands = {
	ambush: commands,
	fire: 'shoot',
	shoot: commands.fire,
	ambushhelp: [
		'/ambush start [seconds] - Starts a game of ambush in the room. The first round will begin after the mentioned number of seconds (1 minute by default). Requires + or higher to use.',
		'/ambush join/leave - Joins/Leaves a game of ambush.',
		'/ambush proceed - Forcibly starts the first round of the game. Requires + or higher to use',
		'/ambush dq [user] - Disqualifies a player from a game of ambush. Requires % or higher to use',
		'/ambush shoot/fire [user] - Shoots another player (you can shoot yourself too). NOTE: Spamming this can get you disqualified.',
		'/ambush end - Forcibly ends a game of ambush. Requires % or higher to use.',
		'/ambush rules - Displays the rules of the game.',
	],
};
