'use strict';

const BRACKET_MINIMUM_UPDATE_INTERVAL = 2 * 1000;
const AUTO_DISQUALIFY_WARNING_TIMEOUT = 30 * 1000;
const AUTO_START_MINIMUM_TIMEOUT = 30 * 1000;
const MAX_REASON_LENGTH = 300;

let TournamentGenerators = Object.create(null);
let generatorFiles = {
	'roundrobin': 'generator-round-robin.js',
	'elimination': 'generator-elimination.js',
	'buyin': 'generator-elimination.js',
};
for (let type in generatorFiles) {
	TournamentGenerators[type] = require('./' + generatorFiles[type]);
}

exports.tournaments = {};

function usersToNames(users) {
	return users.map(user => user.name);
}

class Tournament {
	constructor(room, format, generator, playerCap, isRated) {
		format = toId(format);

		this.id = room.id;
		this.room = room;
		this.prizeMoney = 0;
		this.title = Tools.getFormat(format).name + ' tournament';
		this.allowRenames = false;
		this.players = Object.create(null);
		this.playerCount = 0;
		this.playerCap = parseInt(playerCap) || Config.tournamentDefaultPlayerCap || 0;

		this.format = format;
		this.generator = generator;
		this.isRated = isRated;
		this.scouting = true;
		this.modjoin = false;
		this.autostartcap = false;
		if (Config.tournamentDefaultPlayerCap && this.playerCap > Config.tournamentDefaultPlayerCap) {
			Monitor.log('[TourMonitor] Room ' + room.id + ' starting a tour over default cap (' + this.playerCap + ')');
		}

		this.isBracketInvalidated = true;
		this.lastBracketUpdate = 0;
		this.bracketUpdateTimer = null;
		this.bracketCache = null;

		this.isTournamentStarted = false;
		this.availableMatches = null;
		this.inProgressMatches = null;

		this.isAvailableMatchesInvalidated = true;
		this.availableMatchesCache = null;

		this.pendingChallenges = null;
		this.autoDisqualifyTimeout = Infinity;
		this.autoDisqualifyTimer = null;
		this.autoStartTimeout = Infinity;
		this.autoStartTimer = null;

		this.isEnded = false;

		if (room.tournamentBuyin) {
			this.generator.name = (room.tournamentBuyin + ' Buck Buy in');
		}

		room.add('|tournament|create|' + this.format + '|' + generator.name + '|' + this.playerCap);
		room.send('|tournament|update|' + JSON.stringify({
			format: this.format,
			generator: generator.name,
			playerCap: this.playerCap,
			isStarted: false,
			isJoined: false,
		}));
		this.update();
	}

	setGenerator(generator, output) {
		if (this.isTournamentStarted) {
			output.sendReply('|tournament|error|BracketFrozen');
			return;
		}

		let isErrored = false;
		this.generator.getUsers().forEach(user => {
			let error = generator.addUser(user);
			if (typeof error === 'string') {
				output.sendReply('|tournament|error|' + error);
				isErrored = true;
			}
		});

		if (isErrored) return;

		this.generator = generator;
		this.room.send('|tournament|update|' + JSON.stringify({generator: generator.name}));
		this.isBracketInvalidated = true;
		this.update();
		return true;
	}

	forceEnd() {
		if (this.isTournamentStarted) {
			if (this.autoDisqualifyTimer) clearTimeout(this.autoDisqualifyTimer);
			this.inProgressMatches.forEach(match => {
				if (match) {
					delete match.room.tour;
					match.room.addRaw("<div class=\"broadcast-red\"><b>The tournament was forcefully ended.</b><br />You can finish playing, but this battle is no longer considered a tournament battle.</div>");
				}
			});
		} else if (this.autoStartTimer) {
			clearTimeout(this.autoStartTimer);
		}
		for (let i in this.players) {
			this.players[i].destroy();
		}
		this.room.add('|tournament|forceend');
		this.isEnded = true;
	}

	updateFor(targetUser, connection) {
		if (!connection) connection = targetUser;
		if (this.isEnded) return;
		if ((!this.bracketUpdateTimer && this.isBracketInvalidated) || (this.isTournamentStarted && this.isAvailableMatchesInvalidated)) {
			this.room.add(
				"Error: update() called with a target user when data invalidated: " +
				(!this.bracketUpdateTimer && this.isBracketInvalidated) + ", " +
				(this.isTournamentStarted && this.isAvailableMatchesInvalidated) +
				"; Please report this to an admin."
			);
			return;
		}
		let isJoined = targetUser.userid in this.players;
		connection.sendTo(this.room, '|tournament|update|' + JSON.stringify({
			format: this.format,
			generator: this.generator.name,
			isStarted: this.isTournamentStarted,
			isJoined: isJoined,
			bracketData: this.bracketCache,
		}));
		if (this.isTournamentStarted && isJoined) {
			connection.sendTo(this.room, '|tournament|update|' + JSON.stringify({
				challenges: usersToNames(this.availableMatchesCache.challenges.get(this.players[targetUser.userid])),
				challengeBys: usersToNames(this.availableMatchesCache.challengeBys.get(this.players[targetUser.userid])),
			}));

			let pendingChallenge = this.pendingChallenges.get(this.players[targetUser.userid]);
			if (pendingChallenge) {
				if (pendingChallenge.to) {
					connection.sendTo(this.room, '|tournament|update|' + JSON.stringify({challenging: pendingChallenge.to.name}));
				} else if (pendingChallenge.from) {
					connection.sendTo(this.room, '|tournament|update|' + JSON.stringify({challenged: pendingChallenge.from.name}));
				}
			}
		}
		connection.sendTo(this.room, '|tournament|updateEnd');
	}

	update(targetUser) {
		if (targetUser) throw new Error("Please use updateFor() to update the tournament for a specific user.");
		if (this.isEnded) return;
		if (this.isBracketInvalidated) {
			if (Date.now() < this.lastBracketUpdate + BRACKET_MINIMUM_UPDATE_INTERVAL) {
				if (this.bracketUpdateTimer) clearTimeout(this.bracketUpdateTimer);
				this.bracketUpdateTimer = setTimeout(() => {
					this.bracketUpdateTimer = null;
					this.update();
				}, BRACKET_MINIMUM_UPDATE_INTERVAL);
			} else {
				this.lastBracketUpdate = Date.now();

				this.bracketCache = this.getBracketData();
				this.isBracketInvalidated = false;
				this.room.send('|tournament|update|' + JSON.stringify({bracketData: this.bracketCache}));
			}
		}

		if (this.isTournamentStarted && this.isAvailableMatchesInvalidated) {
			this.availableMatchesCache = this.getAvailableMatches();
			this.isAvailableMatchesInvalidated = false;

			this.availableMatchesCache.challenges.forEach((opponents, player) => {
				player.sendRoom('|tournament|update|' + JSON.stringify({challenges: usersToNames(opponents)}));
			});
			this.availableMatchesCache.challengeBys.forEach((opponents, player) => {
				player.sendRoom('|tournament|update|' + JSON.stringify({challengeBys: usersToNames(opponents)}));
			});
		}
		this.room.send('|tournament|updateEnd');
	}

	removeBannedUser(user) {
		if (!(user.userid in this.players)) return;
		if (this.isTournamentStarted) {
			if (!this.disqualifiedUsers.get(this.players[user.userid])) {
				this.disqualifyUser(user.userid, user, null);
			}
		} else {
			this.removeUser(user);
		}
		this.room.update();
	}

	addUser(user, isAllowAlts, output) {
		if (!user.named) {
			output.sendReply('|tournament|error|UserNotNamed');
			return;
		}

		if (user.userid in this.players) {
			output.sendReply('|tournament|error|UserAlreadyAdded');
			return;
		}

		if (this.playerCap && this.playerCount >= this.playerCap) {
			output.sendReply('|tournament|error|Full');
			return;
		}

		let gameCount = user.games.size;
		if (gameCount > 4) {
			output.errorReply("Due to high load, you are limited to 4 games at the same time.");
			return;
		}

		if (!isAllowAlts) {
			let users = this.generator.getUsers();
			for (let i = 0; i < users.length; i++) {
				let otherUser = Users.get(users[i].userid);
				if (otherUser && otherUser.latestIp === user.latestIp) {
					output.sendReply('|tournament|error|AltUserAlreadyAdded');
					return;
				}
			}
		}

		let player = new Rooms.RoomGamePlayer(user, this);
		let error = this.generator.addUser(player);
		if (typeof error === 'string') {
			output.sendReply('|tournament|error|' + error);
			player.destroy();
			return;
		}

		this.players[user.userid] = player;
		this.playerCount++;
		this.room.add('|tournament|join|' + user.name);
		user.sendTo(this.room, '|tournament|update|{"isJoined":true}');
		this.isBracketInvalidated = true;
		this.update();
		if (this.playerCount === this.playerCap) {
			if (this.autostartcap === true) {
				this.startTournament(output);
			} else {
				this.room.add("The tournament is now full.");
			}
		}
	}
	removeUser(user, output) {
		if (!(user.userid in this.players)) {
			output.sendReply('|tournament|error|UserNotAdded');
			return;
		}

		let error = this.generator.removeUser(this.players[user.userid]);
		if (typeof error === 'string') {
			output.sendReply('|tournament|error|' + error);
			return;
		}

		if (toId(this.generator.name).substr(5) === 'buyin') {
			this.room.tournamentPool -= this.room.tournamentBuyin;
			Economy.writeMoney(user.userid, this.room.tournamentBuyin);
		}

		this.players[user.userid].destroy();
		delete this.players[user.userid];
		this.playerCount--;
		this.room.add('|tournament|leave|' + user.name);
		user.sendTo(this.room, '|tournament|update|{"isJoined":false}');
		this.isBracketInvalidated = true;
		this.update();
	}
	replaceUser(user, replacementUser, output) {
		if (!(user.userid in this.players)) {
			output.sendReply('|tournament|error|UserNotAdded');
			return;
		}

		if (replacementUser.userid in this.players) {
			output.sendReply('|tournament|error|UserAlreadyAdded');
			return;
		}

		let player = new Rooms.RoomGamePlayer(replacementUser, this);
		this.generator.replaceUser(this.players[user.userid], player);
		this.players[user.userid].destroy();
		delete this.players[user.userid];
		this.players[replacementUser.userid] = player;

		this.room.add('|tournament|replace|' + user.name + '|' + replacementUser.name);
		user.sendTo(this.room, '|tournament|update|{"isJoined":false}');
		replacementUser.sendTo(this.room, '|tournament|update|{"isJoined":true}');
		this.isBracketInvalidated = true;
		this.update();
	}

	getBracketData() {
		let data = this.generator.getBracketData();
		if (data.type === 'tree') {
			if (!data.rootNode) {
				data.users = usersToNames(this.generator.getUsers().sort());
				return data;
			}
			let queue = [data.rootNode];
			while (queue.length > 0) {
				let node = queue.shift();

				if (node.state === 'available') {
					let pendingChallenge = this.pendingChallenges.get(node.children[0].team);
					if (pendingChallenge && node.children[1].team === pendingChallenge.to) {
						node.state = 'challenging';
					}

					let inProgressMatch = this.inProgressMatches.get(node.children[0].team);
					if (inProgressMatch && node.children[1].team === inProgressMatch.to) {
						node.state = 'inprogress';
						node.room = inProgressMatch.room.id;
					}
				}

				if (node.team) node.team = node.team.name;

				node.children.forEach(child => {
					queue.push(child);
				});
			}
		} else if (data.type === 'table') {
			if (this.isTournamentStarted) {
				data.tableContents.forEach((row, r) => {
					let pendingChallenge = this.pendingChallenges.get(data.tableHeaders.rows[r]);
					let inProgressMatch = this.inProgressMatches.get(data.tableHeaders.rows[r]);
					if (pendingChallenge || inProgressMatch) {
						row.forEach((cell, c) => {
							if (!cell) return;

							if (pendingChallenge && data.tableHeaders.cols[c] === pendingChallenge.to) {
								cell.state = 'challenging';
							}

							if (inProgressMatch && data.tableHeaders.cols[c] === inProgressMatch.to) {
								cell.state = 'inprogress';
								cell.room = inProgressMatch.room.id;
							}
						});
					}
				});
			}
			data.tableHeaders.cols = usersToNames(data.tableHeaders.cols);
			data.tableHeaders.rows = usersToNames(data.tableHeaders.rows);
		}
		return data;
	}

	startTournament(output) {
		if (this.isTournamentStarted) {
			output.sendReply('|tournament|error|AlreadyStarted');
			return false;
		}

		let users = this.generator.getUsers();
		if (users.length < 2) {
			output.sendReply('|tournament|error|NotEnoughUsers');
			return false;
		}

		if (this.generator.generateBracket) this.generator.generateBracket();
		this.generator.freezeBracket();

		this.availableMatches = new Map();
		this.inProgressMatches = new Map();
		this.pendingChallenges = new Map();
		this.disqualifiedUsers = new Map();
		this.isAutoDisqualifyWarned = new Map();
		this.lastActionTimes = new Map();
		users.forEach(user => {
			this.availableMatches.set(user, new Map());
			this.inProgressMatches.set(user, null);
			this.pendingChallenges.set(user, null);
			this.disqualifiedUsers.set(user, false);
			this.isAutoDisqualifyWarned.set(user, false);
			this.lastActionTimes.set(user, Date.now());
		});

		this.isTournamentStarted = true;
		if (this.autoStartTimer) clearTimeout(this.autoStartTimer);
		this.isBracketInvalidated = true;
		this.room.add('|tournament|start');
		this.room.send('|tournament|update|{"isStarted":true}');
		this.update();
		return true;
	}
	getAvailableMatches() {
		let matches = this.generator.getAvailableMatches();
		if (typeof matches === 'string') {
			this.room.add("Unexpected error from getAvailableMatches(): " + matches + ". Please report this to an admin.");
			return;
		}

		let users = this.generator.getUsers();
		let challenges = new Map();
		let challengeBys = new Map();
		let oldAvailableMatches = new Map();

		users.forEach(user => {
			challenges.set(user, []);
			challengeBys.set(user, []);

			let oldAvailableMatch = false;
			let availableMatches = this.availableMatches.get(user);
			if (availableMatches.size) {
				oldAvailableMatch = true;
				availableMatches.clear();
			}
			oldAvailableMatches.set(user, oldAvailableMatch);
		});

		matches.forEach(match => {
			challenges.get(match[0]).push(match[1]);
			challengeBys.get(match[1]).push(match[0]);

			this.availableMatches.get(match[0]).set(match[1], true);
		});

		this.availableMatches.forEach((availableMatches, user) => {
			if (oldAvailableMatches.get(user)) return;

			if (availableMatches.size) this.lastActionTimes.set(user, Date.now());
		});

		return {
			challenges: challenges,
			challengeBys: challengeBys,
		};
	}

	disqualifyUser(userid, output, reason) {
		let user = Users.get(userid);
		let sendReply;
		if (output) {
			sendReply = msg => output.sendReply(msg);
		} else if (user) {
			sendReply = msg => user.sendTo(this.id, msg);
		} else {
			sendReply = () => {};
		}
		if (!this.isTournamentStarted) {
			sendReply('|tournament|error|NotStarted');
			return false;
		}

		if (!(userid in this.players)) {
			sendReply('|tournament|error|UserNotAdded');
			return false;
		}

		let player = this.players[userid];
		if (this.disqualifiedUsers.get(player)) {
			sendReply('|tournament|error|AlreadyDisqualified');
			return false;
		}

		let error = this.generator.disqualifyUser(player);
		if (error) {
			sendReply('|tournament|error|' + error);
			return false;
		}

		this.disqualifiedUsers.set(player, true);
		this.generator.setUserBusy(player, false);

		let challenge = this.pendingChallenges.get(player);
		if (challenge) {
			this.pendingChallenges.set(player, null);
			if (challenge.to) {
				this.generator.setUserBusy(challenge.to, false);
				this.pendingChallenges.set(challenge.to, null);
				challenge.to.sendRoom('|tournament|update|{"challenged":null}');
			} else if (challenge.from) {
				this.generator.setUserBusy(challenge.from, false);
				this.pendingChallenges.set(challenge.from, null);
				challenge.from.sendRoom('|tournament|update|{"challenging":null}');
			}
		}

		let matchFrom = this.inProgressMatches.get(player);
		if (matchFrom) {
			this.generator.setUserBusy(matchFrom.to, false);
			this.inProgressMatches.set(player, null);
			delete matchFrom.room.tour;
			if (matchFrom.room.battle) matchFrom.room.battle.forfeit(player.userid);
		}

		let matchTo = null;
		this.inProgressMatches.forEach((match, playerFrom) => {
			if (match && match.to === player) matchTo = playerFrom;
		});
		if (this.room.isOfficial && this.generator.users.size >= 4 && (matchTo || matchFrom)) {
			let matchRoom = matchFrom === null ? this.inProgressMatches.get(matchTo).room : matchFrom.room;
			let opponent = matchRoom.p1.userid === player.userid ? matchRoom.p2 : matchRoom.p1;
			Wisp.updateTourLadder(opponent, player, 'win', matchRoom);
		}
		if (matchTo) {
			this.generator.setUserBusy(matchTo, false);
			let matchRoom = this.inProgressMatches.get(matchTo).room;
			delete matchRoom.tour;
			if (matchRoom.battle) matchRoom.battle.forfeit(player.userid);
			this.inProgressMatches.set(matchTo, null);
		}

		this.room.add('|tournament|disqualify|' + player.name);
		if (user) {
			user.sendTo(this.room, '|tournament|update|{"isJoined":false}');
			if (reason !== null) user.popup("|modal|You have been disqualified from the tournament in " + this.room.title + (reason ? ":\n\n" + reason : "."));
		}
		this.isBracketInvalidated = true;
		this.isAvailableMatchesInvalidated = true;

		if (this.generator.isTournamentEnded()) {
			this.onTournamentEnd();
		} else {
			this.update();
		}

		return true;
	}

	setAutoStartTimeout(timeout, output) {
		if (this.isTournamentStarted) {
			output.sendReply('|tournament|error|AlreadyStarted');
			return false;
		}
		timeout = parseFloat(timeout);
		if (timeout < AUTO_START_MINIMUM_TIMEOUT || isNaN(timeout)) {
			output.sendReply('|tournament|error|InvalidAutoStartTimeout');
			return false;
		}

		if (this.autoStartTimer) clearTimeout(this.autoStartTimer);
		if (timeout === Infinity) {
			this.room.add('|tournament|autostart|off');
		} else {
			this.autoStartTimer = setTimeout(() => this.startTournament(output), timeout);
			this.room.add('|tournament|autostart|on|' + timeout);
		}
		this.autoStartTimeout = timeout;

		return true;
	}

	setAutoDisqualifyTimeout(timeout, output) {
		if (timeout < AUTO_DISQUALIFY_WARNING_TIMEOUT || isNaN(timeout)) {
			output.sendReply('|tournament|error|InvalidAutoDisqualifyTimeout');
			return false;
		}

		this.autoDisqualifyTimeout = parseFloat(timeout);
		if (this.autoDisqualifyTimeout === Infinity) {
			this.room.add('|tournament|autodq|off');
		} else {
			this.room.add('|tournament|autodq|on|' + this.autoDisqualifyTimeout);
		}

		if (this.isTournamentStarted) this.runAutoDisqualify();
		return true;
	}
	runAutoDisqualify(output) {
		if (!this.isTournamentStarted) {
			output.sendReply('|tournament|error|NotStarted');
			return false;
		}
		if (this.autoDisqualifyTimer) clearTimeout(this.autoDisqualifyTimer);
		this.lastActionTimes.forEach((time, player) => {
			let availableMatches = false;
			if (this.availableMatches.get(player).size) availableMatches = true;
			let pendingChallenge = this.pendingChallenges.get(player);

			if (!availableMatches && !pendingChallenge) return;
			if (pendingChallenge && pendingChallenge.to) return;

			if (Date.now() > time + this.autoDisqualifyTimeout && this.isAutoDisqualifyWarned.get(player)) {
				this.disqualifyUser(player.userid, output, "You failed to make or accept the challenge in time.");
				this.room.update();
			} else if (Date.now() > time + this.autoDisqualifyTimeout - AUTO_DISQUALIFY_WARNING_TIMEOUT && !this.isAutoDisqualifyWarned.get(player)) {
				let remainingTime = this.autoDisqualifyTimeout - Date.now() + time;
				if (remainingTime <= 0) {
					remainingTime = AUTO_DISQUALIFY_WARNING_TIMEOUT;
					this.lastActionTimes.set(player, Date.now() - this.autoDisqualifyTimeout + AUTO_DISQUALIFY_WARNING_TIMEOUT);
				}

				this.isAutoDisqualifyWarned.set(player, true);
				player.sendRoom('|tournament|autodq|target|' + remainingTime);
			} else {
				this.isAutoDisqualifyWarned.set(player, false);
			}
		});
		if (this.autoDisqualifyTimeout !== Infinity && !this.isEnded) this.autoDisqualifyTimer = setTimeout(() => this.runAutoDisqualify(), this.autoDisqualifyTimeout);
	}

	challenge(user, targetUserid, output) {
		if (!this.isTournamentStarted) {
			output.sendReply('|tournament|error|NotStarted');
			return;
		}

		if (!(user.userid in this.players)) {
			output.sendReply('|tournament|error|UserNotAdded');
			return;
		}

		if (!(targetUserid in this.players)) {
			output.sendReply('|tournament|error|InvalidMatch');
			return;
		}

		let from = this.players[user.userid];
		let to = this.players[targetUserid];
		if (!this.availableMatches.get(from) || !this.availableMatches.get(from).get(to)) {
			output.sendReply('|tournament|error|InvalidMatch');
			return;
		}

		if (this.generator.getUserBusy(from) || this.generator.getUserBusy(to)) {
			this.room.add("Tournament backend breaks specifications. Please report this to an admin.");
			return;
		}

		this.generator.setUserBusy(from, true);
		this.generator.setUserBusy(to, true);

		this.isAvailableMatchesInvalidated = true;
		this.update();

		user.prepBattle(this.format, 'tournament', user).then(result => this.finishChallenge(user, to, output, result));
	}
	finishChallenge(user, to, output, result) {
		let from = this.players[user.userid];
		if (!result) {
			this.generator.setUserBusy(from, false);
			this.generator.setUserBusy(to, false);

			this.isAvailableMatchesInvalidated = true;
			this.update();
			return;
		}

		let now = Date.now();
		this.lastActionTimes.set(from, now);
		this.lastActionTimes.set(to, now);
		this.pendingChallenges.set(from, {to: to, team: user.team});
		this.pendingChallenges.set(to, {from: from, team: user.team});
		from.sendRoom('|tournament|update|' + JSON.stringify({challenging: to.name}));
		to.sendRoom('|tournament|update|' + JSON.stringify({challenged: from.name}));

		this.isBracketInvalidated = true;
		this.update();
	}
	cancelChallenge(user, output) {
		if (!this.isTournamentStarted) {
			output.sendReply('|tournament|error|NotStarted');
			return;
		}

		if (!(user.userid in this.players)) {
			output.sendReply('|tournament|error|UserNotAdded');
			return;
		}

		let player = this.players[user.userid];
		let challenge = this.pendingChallenges.get(player);
		if (!challenge || challenge.from) return;

		this.generator.setUserBusy(player, false);
		this.generator.setUserBusy(challenge.to, false);
		this.pendingChallenges.set(player, null);
		this.pendingChallenges.set(challenge.to, null);
		user.sendTo(this.room, '|tournament|update|{"challenging":null}');
		challenge.to.sendRoom('|tournament|update|{"challenged":null}');

		this.isBracketInvalidated = true;
		this.isAvailableMatchesInvalidated = true;
		this.update();
	}
	acceptChallenge(user, output) {
		if (!this.isTournamentStarted) {
			output.sendReply('|tournament|error|NotStarted');
			return;
		}

		if (!(user.userid in this.players)) {
			output.sendReply('|tournament|error|UserNotAdded');
			return;
		}

		let player = this.players[user.userid];
		let challenge = this.pendingChallenges.get(player);
		if (!challenge || !challenge.from) return;

		user.prepBattle(this.format, 'tournament', user).then(result => this.finishAcceptChallenge(user, challenge, result));
	}
	finishAcceptChallenge(user, challenge, result) {
		if (!result) return;

		// Prevent battles between offline users from starting
		let from = Users.get(challenge.from.userid);
		if (!from || !from.connected || !user.connected) return;

		// Prevent double accepts and users that have been disqualified while between these two functions
		if (!this.pendingChallenges.get(challenge.from)) return;
		let player = this.players[user.userid];
		if (!this.pendingChallenges.get(player)) return;

		let room = Rooms.global.startBattle(from, user, this.format, challenge.team, user.team, {rated: this.isRated, tour: this});
		if (!room) return;

		this.pendingChallenges.set(challenge.from, null);
		this.pendingChallenges.set(player, null);
		from.sendTo(this.room, '|tournament|update|{"challenging":null}');
		user.sendTo(this.room, '|tournament|update|{"challenged":null}');

		this.inProgressMatches.set(challenge.from, {to: player, room: room});
		this.room.add('|tournament|battlestart|' + from.name + '|' + user.name + '|' + room.id).update();

		this.isBracketInvalidated = true;
		this.runAutoDisqualify(this.room);
		this.update();
	}
	forfeit(user) {
		this.disqualifyUser(user.userid, null, "You left the tournament");
	}
	onConnect(user, connection) {
		this.updateFor(user, connection);
	}
	onUpdateConnection(user, connection) {
		this.updateFor(user, connection);
	}
	onRename(user, oldUserid) {
		if (oldUserid in this.players) {
			if (user.userid === oldUserid) {
				this.players[user.userid].name = user.name;
			} else {
				this.players[user.userid] = this.players[oldUserid];
				this.players[user.userid].userid = user.userid;
				this.players[user.userid].name = user.name;
				delete this.players[oldUserid];
			}
		}

		this.updateFor(user);
	}
	onBattleJoin(room, user) {
		if (this.scouting || this.isEnded || user.latestIp === room.p1.latestIp || user.latestIp === room.p2.latestIp) return;
		let users = this.generator.getUsers(true);
		for (let i = 0; i < users.length; i++) {
			let otherUser = Users.get(users[i].userid);
			if (otherUser && otherUser.latestIp === user.latestIp) {
				return "Scouting is banned: tournament players can't watch other tournament battles.";
			}
		}
	}
	onBattleWin(room, winnerid) {
		let from = this.players[room.p1.userid];
		let to = this.players[room.p2.userid];
		let winner = this.players[winnerid];
		let score = room.battle.score || [0, 0];

		let result = 'draw';
		if (from === winner) {
			result = 'win';
		} else if (to === winner) {
			result = 'loss';
		}
		let tourSize = this.generator.users.size;
		if (this.room.isOfficial && tourSize >= 4 && room.battle.endType !== 'forced') Wisp.updateTourLadder(from, to, result, room);

		if (result === 'draw' && !this.generator.isDrawingSupported) {
			this.room.add('|tournament|battleend|' + from.name + '|' + to.name + '|' + result + '|' + score.join(',') + '|fail|' + room.id);

			this.generator.setUserBusy(from, false);
			this.generator.setUserBusy(to, false);
			this.inProgressMatches.set(from, null);

			this.isBracketInvalidated = true;
			this.isAvailableMatchesInvalidated = true;

			this.runAutoDisqualify();
			this.update();
			return this.room.update();
		}

		let error = this.generator.setMatchResult([from, to], result, score);
		if (error) {
			// Should never happen
			return this.room.add("Unexpected " + error + " from setMatchResult([" + room.p1.userid + ", " + room.p2.userid + "], " + result + ", " + score + ") in onBattleWin(" + room.id + ", " + winnerid + "). Please report this to an admin.").update();
		}

		this.room.add('|tournament|battleend|' + from.name + '|' + to.name + '|' + result + '|' + score.join(',') + '|success|' + room.id);

		this.generator.setUserBusy(from, false);
		this.generator.setUserBusy(to, false);
		this.inProgressMatches.set(from, null);

		this.isBracketInvalidated = true;
		this.isAvailableMatchesInvalidated = true;

		if (this.generator.isTournamentEnded()) {
			this.onTournamentEnd();
		} else {
			this.runAutoDisqualify();
			this.update();
		}
		this.room.update();
	}
	onTournamentEnd() {
		this.room.add('|tournament|end|' + JSON.stringify({
			results: this.generator.getResults().map(usersToNames),
			format: this.format,
			generator: this.generator.name,
			bracketData: this.getBracketData(),
		}));

		let data = {results: this.generator.getResults().map(usersToNames), bracketData: this.getBracketData()};
		let data2 = data;
		data = data['results'].toString();
		let winner = '';

		if (data.indexOf(',') >= 0) {
			data = data.split(',');
			winner = data[0];
		} else {
			winner = data;
		}

		let tourSize = this.generator.users.size;

		if (this.room.id === 'monotype') {
			try {
				Wisp.givePoints(winner, tourSize, this.room);
			} catch (e) {
				console.log('Error giving monoladder points: ' + e);
			}
		}

		try { // this code is a bigger mess than I remember... I should clean it up some day.
			let runnerUp = false;

			// there's probably a better way to do this but I'm lazy
			if (data2['bracketData']['rootNode']) {
				if (data2['bracketData']['rootNode']['children']) {
					if (data2['bracketData']['rootNode']['children'][0]['team'] !== winner) runnerUp = data2['bracketData']['rootNode']['children'][0]['team'];
					if (data2['bracketData']['rootNode']['children'][1]['team'] !== winner) runnerUp = data2['bracketData']['rootNode']['children'][1]['team'];
				}
			}

			let firstMoney = false;
			let secondMoney = false;
			let firstBuck;
			let secondBuck;

			if ((this.room.isOfficial || this.room.tourBucks) && tourSize >= 4) {
				firstMoney = Math.round(tourSize / 4);
				secondMoney = Math.round(firstMoney / 2);
				firstBuck = 'buck';
				secondBuck = 'buck';
			}

			if (this.prizeMoney) {
				firstMoney = this.prizeMoney[0];
				if (this.prizeMoney[1]) secondMoney = this.prizeMoney[1];
			}

			if (toId(this.generator.name).substr(5) === 'buyin') {
				this.room.tournamentPool -= Math.round(this.room.tournamentPool * 0.10);
				firstMoney = Math.round(this.room.tournamentPool);
				secondMoney = Math.floor(this.room.tournamentPool / 3);
				firstMoney -= secondMoney;
				firstBuck = 'buck';
				secondBuck = 'buck';
			}

			if (firstMoney) {
				if (firstMoney > 1) firstBuck = 'bucks';
				if (secondMoney > 1) secondBuck = 'bucks';
				this.room.add('|raw|<b><font color="' + Wisp.hashColor(winner) + '">' + Tools.escapeHTML(winner) + '</font> has also won <font color=#b30000>' + firstMoney + '</font> ' + firstBuck + ' for winning the tournament!</b>');
				if (runnerUp && secondMoney) this.room.add('|raw|<b><font color="' + Wisp.hashColor(runnerUp) + '">' + Tools.escapeHTML(runnerUp) + '</font> has also won <font color=#b30000>' + secondMoney + '</font> ' + secondBuck + ' for coming in second!</b>');
				Economy.writeMoney(toId(winner), firstMoney, () => {
					Economy.readMoney(toId(winner), newMoney => {
						Economy.logTransaction(winner + ' has won ' + firstMoney + ' ' + firstBuck + ' from a tournament in ' + this.room.title + '. They now have ' + newMoney);
						if (runnerUp) {
							Economy.writeMoney(toId(runnerUp), secondMoney, () => {
								Economy.readMoney(toId(runnerUp), newMoney2 => {
									Economy.logTransaction(runnerUp + ' has won ' + secondMoney + ' ' + secondBuck + ' from a tournament in ' + this.room.title + '. They now have ' + newMoney2);
								});
							});
						}
					});
				});
			}
		} catch (e) {
			console.log('Error giving bucks for tournaments: ' + e.stack);
		}

		if (this.room.isOfficial && tourSize >= 4) {
			Wisp.addTourWin(winner);
			try {
				let tourRarity = Wisp.tourCard(tourSize, toId(winner));
				this.room.addRaw("<b><font color='" + Wisp.hashColor(winner) + "'>" + Tools.escapeHTML(winner) + "</font> has also won a <font color=" + tourRarity[0] + ">" + tourRarity[1] + "</font> card: <button class='tourcard-btn' style='border-radius: 20px; box-shadow: 1px 1px rgba(255, 255, 255, 0.3) inset, -1px -1px rgba(0, 0, 0, 0.2) inset, 2px 2px 2px rgba(0, 0, 0, 0.5);' name='send' value='/card " + tourRarity[2] + "'>" + tourRarity[3] + "</button> from the tournament.");
			} catch (e) {
				console.log('Error giving cards for tournaments: ' + e.stack);
			}
		}

		this.isEnded = true;
		if (this.autoDisqualifyTimer) clearTimeout(this.autoDisqualifyTimer);
		delete exports.tournaments[this.room.id];
		delete this.room.game;
		for (let i in this.players) {
			this.players[i].destroy();
		}
	}
}

function createTournamentGenerator(generator, args, output) {
	let Generator = TournamentGenerators[toId(generator)];
	if (!Generator) {
		output.errorReply(generator + " is not a valid type.");
		output.errorReply("Valid types: " + Object.keys(TournamentGenerators).join(", "));
		return;
	}
	args.unshift(null);
	return new (Generator.bind.apply(Generator, args))();
}
function createTournament(room, format, generator, playerCap, isRated, args, output, buyin) {
	if (room.type !== 'chat') {
		output.errorReply("Tournaments can only be created in chat rooms.");
		return;
	}
	if (room.game) {
		output.errorReply("You cannot have a tournament until the current room activity is over: " + room.game.title);
		return;
	}
	if (Rooms.global.lockdown) {
		output.errorReply("The server is restarting soon, so a tournament cannot be created.");
		return;
	}
	format = Tools.getFormat(format);
	if (format.effectType !== 'Format' || !format.tournamentShow) {
		output.errorReply(format.id + " is not a valid tournament format.");
		output.errorReply("Valid formats: " + Object.values(Tools.data.Formats).filter(f => f.effectType === 'Format' && f.tournamentShow).map(format => format.name).join(", "));
		return;
	}
	if (!TournamentGenerators[toId(generator)]) {
		output.errorReply(generator + " is not a valid type.");
		output.errorReply("Valid types: " + Object.keys(TournamentGenerators).join(", "));
		return;
	}
	if (playerCap && playerCap < 2) {
		output.errorReply("You cannot have a player cap that is less than 2.");
		return;
	}
	if (toId(generator) === 'buyin') {
		if (!buyin) buyin = 1;
		room.tournamentBuyin = parseInt(buyin);
		room.tournamentPool = 0;
	}
	room.game = exports.tournaments[room.id] = new Tournament(room, format, createTournamentGenerator(generator, args, output), playerCap, isRated);
	return room.game;
}
function deleteTournament(id, output) {
	let tournament = exports.tournaments[id];
	if (!tournament) {
		output.errorReply(id + " doesn't exist.");
		return false;
	}
	if (toId(tournament.generator.name).substr(5) === 'buyin') {
		let amount = tournament.room.tournamentBuyin;
		let users = usersToNames(tournament.generator.getUsers().sort());
		Economy.writeMoneyArr(users, amount);
	}
	delete tournament.room.tournamentBuyin;
	delete tournament.room.tournamentPool;
	tournament.forceEnd(output);
	delete exports.tournaments[id];
	let room = Rooms(id);
	if (room) delete room.game;
	return true;
}
function getTournament(id, output) {
	if (exports.tournaments[id]) {
		return exports.tournaments[id];
	}
}

let commands = {
	basic: {
		j: 'join',
		in: 'join',
		join: function (tournament, user) {
			if (toId(tournament.generator.name).substr(toId(tournament.generator.name).length - 5, toId(tournament.generator.name).length) === 'buyin') {
				Economy.readMoney(user.userid, amount => {
					if (amount < tournament.room.tournamentBuyin) return this.sendReply("You need " + (tournament.room.tournamentBuyin - amount) + " more bucks to join this tournament.");
					Economy.writeMoney(user.userid, tournament.room.tournamentBuyin * -1, () => {
						tournament.addUser(user, false, this);
						tournament.room.tournamentPool += tournament.room.tournamentBuyin;
						this.sendReply('You have joined the tournament.');
					});
				});
				return;
			}
			tournament.addUser(user, false, this);
		},
		l: 'leave',
		out: 'leave',
		leave: function (tournament, user) {
			if (tournament.isTournamentStarted) {
				if (tournament.generator.getUsers(true).some(player => player.userid === user.userid)) {
					tournament.disqualifyUser(user.userid, this);
				} else {
					this.errorReply("You have already been eliminated from this tournament.");
				}
			} else {
				tournament.removeUser(user, this);
			}
		},
		getusers: function (tournament) {
			if (!this.runBroadcast()) return;
			let users = usersToNames(tournament.generator.getUsers(true).sort());
			this.sendReplyBox("<strong>" + users.length + " users remain in this tournament:</strong><br />" + Tools.escapeHTML(users.join(", ")));
		},
		getupdate: function (tournament, user) {
			tournament.updateFor(user);
			this.sendReply("Your tournament bracket has been updated.");
		},
		challenge: function (tournament, user, params, cmd) {
			if (params.length < 1) {
				return this.sendReply("Usage: " + cmd + " <user>");
			}
			tournament.challenge(user, toId(params[0]), this);
		},
		cancelchallenge: function (tournament, user) {
			tournament.cancelChallenge(user, this);
		},
		acceptchallenge: function (tournament, user) {
			tournament.acceptChallenge(user, this);
		},
	},
	creation: {
		settype: function (tournament, user, params, cmd) {
			if (params.length < 1) {
				return this.sendReply("Usage: " + cmd + " <type> [, <comma-separated arguments>]");
			}
			let playerCap = parseInt(params.splice(1, 1));
			let generator = createTournamentGenerator(params.shift(), params, this);
			if (generator && tournament.setGenerator(generator, this)) {
				if (playerCap && playerCap >= 2) {
					tournament.playerCap = playerCap;
					if (Config.tournamentDefaultPlayerCap && tournament.playerCap > Config.tournamentDefaultPlayerCap) {
						Monitor.log('[TourMonitor] Room ' + tournament.room.id + ' starting a tour over default cap (' + tournament.playerCap + ')');
					}
				} else if (tournament.playerCap && !playerCap) {
					tournament.playerCap = 0;
				}
				const capNote = (tournament.playerCap ? " with a player cap of " + tournament.playerCap : "");
				this.privateModCommand("(" + user.name + " set tournament type to " + generator.name + capNote + ".)");
				this.sendReply("Tournament set to " + generator.name + capNote + ".");
			}
		},
		end: 'delete',
		stop: 'delete',
		delete: function (tournament, user) {
			if (deleteTournament(tournament.room.id, this)) {
				this.privateModCommand("(" + user.name + " forcibly ended a tournament.)");
			}
		},
	},
	moderation: {
		begin: 'start',
		start: function (tournament, user) {
			if (tournament.startTournament(this)) {
				this.room.sendModCommand("(" + user.name + " started the tournament.)");
			}
		},
		dq: 'disqualify',
		disqualify: function (tournament, user, params, cmd) {
			if (params.length < 1) {
				return this.sendReply("Usage: " + cmd + " <user>");
			}
			let targetUser = Users.get(params[0]) || params[0];
			let targetUserid = toId(targetUser);
			let reason = '';
			if (params[1]) {
				reason = params[1].trim();
				if (reason.length > MAX_REASON_LENGTH) return this.errorReply("The reason is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
			}
			if (tournament.disqualifyUser(targetUserid, this, reason)) {
				this.privateModCommand("(" + (targetUser.name || targetUserid) + " was disqualified from the tournament by " + user.name + (reason ? " (" + reason + ")" : "") + ")");
			}
		},
		autostart: 'setautostart',
		setautostart: function (tournament, user, params, cmd) {
			if (params.length < 1) {
				return this.sendReply("Usage: " + cmd + " <on|minutes|off>");
			}
			let option = params[0].toLowerCase();
			if (option === 'on' || option === 'true' || option === 'start') {
				if (tournament.isTournamentStarted) {
					return this.errorReply("The tournament has already started.");
				} else if (!tournament.playerCap) {
					return this.errorReply("The tournament does not have a player cap set.");
				} else {
					if (tournament.autostartcap) return this.errorReply("The tournament is already set to autostart when the player cap is reached.");
					tournament.autostartcap = true;
					this.room.add("The tournament will start once " + tournament.playerCap + " players have joined.");
					this.privateModCommand("(The tournament was set to autostart when the player cap is reached by " + user.name + ")");
				}
			} else {
				if (option === '0' || option === 'infinity' || option === 'off' || option === 'false' || option === 'stop' || option === 'remove') {
					if (!tournament.autostartcap && tournament.autoStartTimeout === Infinity) return this.errorReply("The automatic tournament start timer is already off.");
					params[0] = 'off';
					tournament.autostartcap = false;
				}
				let timeout = params[0].toLowerCase() === 'off' ? Infinity : params[0];
				if (tournament.setAutoStartTimeout(timeout * 60 * 1000, this)) {
					this.privateModCommand("(The tournament auto start timer was set to " + params[0] + " by " + user.name + ")");
				}
			}
		},
		autodq: 'setautodq',
		setautodq: function (tournament, user, params, cmd) {
			if (params.length < 1) {
				if (tournament.autoDisqualifyTimeout !== Infinity) {
					return this.sendReply("Usage: " + cmd + " <minutes|off>; The current automatic disqualify timer is set to " + (tournament.autoDisqualifyTimeout / 1000 / 60) + " minute(s)");
				} else {
					return this.sendReply("Usage: " + cmd + " <minutes|off>");
				}
			}
			if (params[0].toLowerCase() === 'infinity' || params[0] === '0') params[0] = 'off';
			let timeout = params[0].toLowerCase() === 'off' ? Infinity : params[0] * 60 * 1000;
			if (timeout === tournament.autoDisqualifyTimeout) return this.errorReply("The automatic tournament disqualify timer is already set to " + params[0] + " minute(s).");
			if (tournament.setAutoDisqualifyTimeout(timeout, this)) {
				this.privateModCommand("(The tournament auto disqualify timer was set to " + params[0] + " by " + user.name + ")");
			}
		},
		runautodq: function (tournament) {
			tournament.runAutoDisqualify(this);
		},
		remind: function (tournament, user) {
			let users = tournament.generator.getAvailableMatches().toString().split(',');
			let offlineUsers = [];
			for (let u in users) {
				let targetUser = Users.get(users[u]);
				if (!targetUser) {
					offlineUsers.push(users[u]);
					continue;
				} else if (!targetUser.connected) {
					offlineUsers.push(targetUser.userid);
					continue;
				} else {
					targetUser.popup('You have a tournament battle in the room "' + tournament.room.title + '". If you do not start soon you may be disqualified.');
				}
			}
			tournament.room.addRaw('<b>Players have been reminded of their tournament battles by ' + Tools.escapeHTML(user.name) + '.</b>');
			if (offlineUsers.length > 0 && offlineUsers !== '') tournament.room.addRaw('<b>The following users are currently offline: ' + offlineUsers.join(', ') + '.</b>');
		},
		scout: 'setscouting',
		scouting: 'setscouting',
		setscout: 'setscouting',
		setscouting: function (tournament, user, params, cmd) {
			if (params.length < 1) {
				if (tournament.scouting) {
					return this.sendReply("This tournament allows spectating other battles while in a tournament.");
				} else {
					return this.sendReply("This tournament disallows spectating other battles while in a tournament.");
				}
			}

			let option = params[0].toLowerCase();
			if (option === 'on' || option === 'true' || option === 'allow' || option === 'allowed') {
				if (tournament.scouting) return this.errorReply("Scouting for this tournament is already set to allowed.");
				tournament.scouting = true;
				tournament.modjoin = false;
				this.room.add('|tournament|scouting|allow');
				this.privateModCommand("(The tournament was set to allow scouting by " + user.name + ")");
			} else if (option === 'off' || option === 'false' || option === 'disallow' || option === 'disallowed') {
				if (!tournament.scouting) return this.errorReply("Scouting for this tournament is already disabled.");
				tournament.scouting = false;
				tournament.modjoin = true;
				this.room.add('|tournament|scouting|disallow');
				this.privateModCommand("(The tournament was set to disallow scouting by " + user.name + ")");
			} else {
				return this.sendReply("Usage: " + cmd + " <allow|disallow>");
			}
		},
		modjoin: 'setmodjoin',
		setmodjoin: function (tournament, user, params, cmd) {
			if (params.length < 1) {
				if (tournament.modjoin) {
					return this.sendReply("This tournament allows players to modjoin their battles.");
				} else {
					return this.sendReply("This tournament does not allow players to modjoin their battles.");
				}
			}

			let option = params[0].toLowerCase();
			if (option === 'on' || option === 'true' || option === 'allow' || option === 'allowed') {
				if (tournament.modjoin) return this.errorReply("Modjoining is already allowed for this tournament.");
				tournament.modjoin = true;
				this.room.add('Modjoining is now allowed (Players can modjoin their tournament battles).');
				this.privateModCommand("(The tournament was set to allow modjoin by " + user.name + ")");
			} else if (option === 'off' || option === 'false' || option === 'disallow' || option === 'disallowed') {
				if (!tournament.modjoin) return this.errorReply("Modjoining is already not allowed for this tournament.");
				tournament.modjoin = false;
				this.room.add('Modjoining is now banned (Players cannot modjoin their tournament battles).');
				this.privateModCommand("(The tournament was set to disallow modjoin by " + user.name + ")");
			} else {
				return this.sendReply("Usage: " + cmd + " <allow|disallow>");
			}
		},
		prize: 'prizemoney',
		setprize: 'prizemoney',
		prizemoney: function (tournament, user, params, cmd) {
			if (!this.can('bucks')) return false;
			if (!params[0]) return this.sendReply("Usage: " + cmd + " [bucks prize], [optional second place prize]");
			params[0] = params[0];
			if (isNaN(Number(params[0])) || ~params[0].indexOf('.') || params[0] < 1 || params[0] > 500) return this.errorReply("'" + params[0] + "' is not a valid integer that is between 1 and 500.");
			tournament.prizeMoney = [];
			tournament.prizeMoney.push(Number(params[0]));
			if (params[1]) {
				params[1] = params[1];
				if (isNaN(Number(params[1])) || ~params[1].indexOf('.') || params[1] < 1 || params[1] > 500) return this.errorReply("'" + params[1] + "' is not a valid integer that is between 1 and 500.");
				tournament.prizeMoney.push(Number(params[1]));
			}
			this.privateModCommand("(" + user.name + " has set the prize for this tournament to be " + tournament.prizeMoney.join(', ') + " bucks.)");
			Economy.logTransaction(user.name + " has set the prize for the tournament in " + this.room.id + " to be " + tournament.prizeMoney.join(', ') + " bucks.");
		},
	},
};

CommandParser.commands.tour = 'tournament';
CommandParser.commands.tours = 'tournament';
CommandParser.commands.tournaments = 'tournament';
CommandParser.commands.tournament = function (paramString, room, user) {
	let cmdParts = paramString.split(' ');
	let cmd = cmdParts.shift().trim().toLowerCase();
	let params = cmdParts.join(' ').split(',').map(param => param.trim());
	if (!params[0]) params = [];

	if (cmd === '') {
		if (!this.runBroadcast()) return;
		this.sendReply('|tournaments|info|' + JSON.stringify(Object.keys(exports.tournaments).filter(tournament => {
			tournament = exports.tournaments[tournament];
			return !tournament.room.isPrivate && !tournament.room.isPersonal && !tournament.room.staffRoom;
		}).map(tournament => {
			tournament = exports.tournaments[tournament];
			return {room: tournament.room.id, format: tournament.format, generator: tournament.generator.name, isStarted: tournament.isTournamentStarted};
		})));
	} else if (cmd === 'help') {
		return this.parse('/help tournament');
	} else if (cmd === 'on' || cmd === 'enable') {
		if (!this.can('tournamentsmanagement', null, room)) return;
		if (room.toursEnabled) {
			return this.errorReply("Tournaments are already enabled.");
		}
		room.toursEnabled = true;
		if (room.chatRoomData) {
			room.chatRoomData.toursEnabled = true;
			Rooms.global.writeChatRoomData();
		}
		return this.sendReply("Tournaments enabled.");
	} else if (cmd === 'off' || cmd === 'disable') {
		if (!this.can('tournamentsmanagement', null, room)) return;
		if (!room.toursEnabled) {
			return this.errorReply("Tournaments are already disabled.");
		}
		delete room.toursEnabled;
		if (room.chatRoomData) {
			delete room.chatRoomData.toursEnabled;
			Rooms.global.writeChatRoomData();
		}
		return this.sendReply("Tournaments disabled.");
	} else if (cmd === 'announce' || cmd === 'announcements') {
		if (!this.can('tournamentsmanagement', null, room)) return;
		if (!Config.tourannouncements.includes(room.id)) {
			return this.errorReply("Tournaments in this room cannot be announced.");
		}
		if (params.length < 1) {
			if (room.tourAnnouncements) {
				return this.sendReply("Tournament announcements are enabled.");
			} else {
				return this.sendReply("Tournament announcements are disabled.");
			}
		}

		let option = params[0].toLowerCase();
		if (option === 'on' || option === 'enable') {
			if (room.tourAnnouncements) return this.errorReply("Tournament announcements are already enabled.");
			room.tourAnnouncements = true;
			this.privateModCommand("(Tournament announcements were enabled by " + user.name + ")");
		} else if (option === 'off' || option === 'disable') {
			if (!room.tourAnnouncements) return this.errorReply("Tournament announcements are already disabled.");
			room.tourAnnouncements = false;
			this.privateModCommand("(Tournament announcements were disabled by " + user.name + ")");
		} else {
			return this.sendReply("Usage: " + cmd + " <on|off>");
		}

		if (room.chatRoomData) {
			room.chatRoomData.tourAnnouncements = room.tourAnnouncements;
			Rooms.global.writeChatRoomData();
		}
	} else if (cmd === 'create' || cmd === 'new') {
		if (room.toursEnabled) {
			if (!this.can('tournaments', null, room)) return;
		} else {
			if (!user.can('tournamentsmanagement', null, room)) {
				return this.errorReply("Tournaments are disabled in this room (" + room.id + ").");
			}
		}
		if (params.length < 2) {
			return this.sendReply("Usage: " + cmd + " <format>, <type> [, <comma-separated arguments>]");
		}

		let format = params.shift();
		let generator = params.shift();
		let playerCap = params.shift();

		let tour = createTournament(room, format, generator, (toId(generator) === 'buyin' ? Infinity : playerCap), Config.istournamentsrated, params, this, (toId(generator) === 'buyin' ? playerCap : false));
		if (tour) {
			this.privateModCommand("(" + user.name + " created a tournament in " + tour.format + " format.)");
			if (room.tourAnnouncements) {
				let tourRoom = Rooms.search(Config.tourroom || 'tournaments');
				if (tourRoom && tourRoom !== room) tourRoom.addRaw('<div class="infobox"><a href="/' + room.id + '" class="ilink"><strong>' + Tools.escapeHTML(Tools.getFormat(tour.format).name) + '</strong> tournament created in <strong>' + Tools.escapeHTML(room.title) + '</strong>.</a></div>').update();
			}
		}
	} else {
		let tournament = getTournament(room.id);
		if (!tournament) {
			return this.sendReply("There is currently no tournament running in this room.");
		}

		let commandHandler = null;
		if (commands.basic[cmd]) {
			commandHandler = typeof commands.basic[cmd] === 'string' ? commands.basic[commands.basic[cmd]] : commands.basic[cmd];
		}

		if (commands.creation[cmd]) {
			if (room.toursEnabled) {
				if (!this.can('tournaments', null, room)) return;
			} else {
				if (!user.can('tournamentsmanagement', null, room)) {
					return this.errorReply("Tournaments are disabled in this room (" + room.id + ").");
				}
			}
			commandHandler = typeof commands.creation[cmd] === 'string' ? commands.creation[commands.creation[cmd]] : commands.creation[cmd];
		}

		if (commands.moderation[cmd]) {
			if (!user.can('tournamentsmoderation', null, room)) {
				return this.errorReply(cmd + " -  Access denied.");
			}
			commandHandler = typeof commands.moderation[cmd] === 'string' ? commands.moderation[commands.moderation[cmd]] : commands.moderation[cmd];
		}

		if (!commandHandler) {
			this.errorReply(cmd + " is not a tournament command.");
		} else {
			commandHandler.call(this, tournament, user, params, cmd);
		}
	}
};
CommandParser.commands.tournamenthelp = function (target, room, user) {
	if (!this.runBroadcast()) return;
	return this.sendReplyBox(
		"- create/new &lt;format>, &lt;type> [, &lt;comma-separated arguments>]: Creates a new tournament in the current room.<br />" +
		"- settype &lt;type> [, &lt;comma-separated arguments>]: Modifies the type of tournament after it's been created, but before it has started.<br />" +
		"- end/stop/delete: Forcibly ends the tournament in the current room.<br />" +
		"- begin/start: Starts the tournament in the current room.<br />" +
		"- autostart/setautostart &lt;on|minutes|off>: Sets the automatic start timeout.<br />" +
		"- dq/disqualify &lt;user>: Disqualifies a user.<br />" +
		"- autodq/setautodq &lt;minutes|off>: Sets the automatic disqualification timeout.<br />" +
		"- runautodq: Manually run the automatic disqualifier.<br />" +
		"- scouting &lt;allow|disallow>: Specifies whether joining tournament matches while in a tournament is allowed.<br />" +
		"- modjoin &lt;allow|disallow>: Specifies whether players can modjoin their battles.<br />" +
		"- getusers: Lists the users in the current tournament.<br />" +
		"- on/off: Enables/disables allowing mods to start tournaments in the current room.<br />" +
		"- announce/announcements &lt;on|off>: Enables/disables tournament announcements for the current room.<br />" +
		"- setprize [prize] - Manually sets the prize (bucks) for a tournament. Requires &, ~<br />" +
		"More detailed help can be found <a href=\"https://www.smogon.com/forums/threads/3570628/#post-6777489\">here</a>"
	);
};

exports.Tournament = Tournament;
exports.TournamentGenerators = TournamentGenerators;

exports.createTournament = createTournament;
exports.deleteTournament = deleteTournament;
exports.get = getTournament;

exports.commands = commands;
