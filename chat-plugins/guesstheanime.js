'use strict';

const ID = "silvy-46dh7";
const SECRET_ID = "Mhz6vrcHF8qPS8v2mA7j3vaXl";

const nani = require('nani').init(ID, SECRET_ID);
const fs = require('fs');

const INACTIVE_END_TIME = 15 * 1000; //15 seconds

let animeList;
let isLoading = false;
try {
	animeList = JSON.parse(fs.readFileSync('config/chat-plugins/animelist.json'));
} catch (err) {
	animeList = [];
	isLoading = true;
	let count = 0;
	new Promise((resolve, reject) => {
		for (let i = 1; i <= 3; i++) {
			nani.get('browse/anime?type=Tv&sort=score-desc&page=' + i).then(data => {
				animeList = animeList.concat(data);
				count++;
				if (count >= 3) resolve(animeList);
			});
		}
	}).then(animeList => {
		fs.writeFileSync('config/chat-plugins/animelist.json', JSON.stringify(animeList, null, 1));
		isLoading = false;
	});
}

class GuessTheAnime {
	constructor(room, winNum) {
		this.room = room;
		this.winNum = winNum;
		this.guesses = new Map();
		this.guessed = [];
		this.points = new Map();
		this.usedChars = [];
		this.inactiveCount = 0;

		this.getAnime().then(() => {
			this.room.add('|html|<div class = "infobox"><center>A game of <b>Guess the Anime</b> has been started!<br>' +
				'The first player to get <b>' + this.winNum + '</b> correct answers wins!<br>' +
				'<small>How to play: Use /guessanime or /gan [anime] to guess the anime the character is from. You only get 2 guesses per round!</small><br><br>' +
				'Character: <b>' + this.char + '</b></center>'
			).update();
			this.canGuess = true;
			this.resetTimer();
		}).catch(err => {
			this.room.add('|html|This game of Guess the Anime has been ended due to an error.').update();
			this.end();
		});
	}
	getAnime() {
		let rand = Math.floor(Math.random() * animeList.length);
		let info = animeList[rand];

		return Promise.resolve(
			nani.get('anime/' + info.id + '/page').then(anime => {
				if (!anime.characters.length) return this.getAnime();

				let chars = anime.characters.filter(data => data.role === "Main");
				let randChar = chars[Math.floor(Math.random() * chars.length)];
				this.char = randChar.name_first + ' ' + randChar.name_last;

				return Promise.resolve(
					nani.get('character/' + randChar.id + '/page').then(char => {
						this.answers = [];
						let anime = char.anime.filter(anime => toId(anime.type) === 'tv' && !anime.adult);
						let manga = char.manga.filter(manga => toId(manga.type) in {'manga': 1, 'novel': 1} && !manga.adult);
						let weebshit = anime.concat(manga);
						for (let i in weebshit) {
							let ans = [weebshit[i].title_romaji, weebshit[i].title_english].concat(weebshit[i].synonyms);
							this.answers = this.answers.concat(ans).filter(name => name.length <= 60);
						}
						this.answers = this.answers.filter((ans, i, arr) => {
							return i === arr.map(toId).indexOf(toId(ans));
						});

						//anilist's api's kinda shit, so I'm gonna have to add these manually :/
						//I might create commands for anime aliases sooner or later
						if (this.answers.includes('Mahou Shoujo Madoka★Magica')) {
							this.answers.unshift('Madoka Magica');
						} else if (this.answers.includes('CODE GEASS: Hangyaku no Lelouch')) {
							this.answers.unshift('Code Geass');
						} else if (this.answers.includes('Higurashi no Naku Koro ni')) {
							this.answers.unshift('Higurashi');
						} else if (this.answers.includes('Gyakkyou Burai Kaiji: Ultimate Survivor')) {
							this.answers.unshift('Gyakkyou Burai Kaiji');
						} else if (this.answers.includes('The Melancholy of Haruhi Suzumiya')) {
							this.answers.unshift('Haruhi Suzumiya');
							this.answers.unshift('Haruhi');
						} else if (this.answers.includes('Kino no Tabi: The Beautiful World')) {
							this.answers.unshift('Kino no Tabi');
						} else if (this.answers.includes('Assassination Classroom')) {
							this.answers.unshift('AssClass');
						} else if (this.answers.includes('Neon Genesis Evangelion')) {
							this.answers.unshift('NGE');
							this.answers.unshift('Evangelion');
						}
					})
				);
			})
		);
	}
	update(self) {
		let pointTotal = [];
		this.points.forEach((points, user) => {
			pointTotal.push('<i>' + user.name + ':</i> <span style = "color:green">' + points + '</span>');
		});
		let msg = '|html|<div class = "infobox"><center><b><i>Points:</i></b> ' + (pointTotal.length ? pointTotal.join(", ") : '<i>None</i>') + '<br>' + 'Character: <b>' + this.char + '</b></center>';
		if (self) return self.sendReply(msg);
		this.room.add(msg).update();
	}
	proceed() {
		this.canGuess = false;
		this.getAnime().then(() => {
			this.canGuess = true;
			this.guesses = new Map();
			this.resetTimer();
			this.update();
		}).catch(err => {
			this.room.add('This game of Guess the Anime has been ended due to an error.').update();
			this.end();
		});
	}
	guess(user, guess, self) {
		if (!guess || !guess.trim()) return self.sendReply("/guessanime [anime name] - Guesses the anime a character is from.");
		if (!this.canGuess) return self.errorReply("This round is already over.");
		if (this.guesses.get(user) >= 2) return self.sendReply("You've already guessed twice this round!");
		if (guess.length > 60) return self.sendReply("Your answer cannot be more than 60 characters long.");
		if (this.guessed.includes(toId(guess))) return self.sendReply("'" + guess + "' has already been guessed.");

		if (this.answers.map(toId).includes(toId(guess))) {
			this.room.add('|html|<b style = "color:' + Wisp.hashColor(user.userid) + ';">' + Tools.escapeHTML(user.name) + '</b> guessed <b>' + guess + '</b>, which was the correct answer!').update();
			this.points.set(user, (this.points.get(user) || 0) + 1);
			if (this.points.get(user) >= this.winNum) return this.win(user);
			clearTimeout(this.timer);
			this.proceed();
		} else {
			this.room.add('|html|<b style = "color:' + Wisp.hashColor(user.userid) + ';">' + Tools.escapeHTML(user.name) + "</b> guessed <b>" + guess + "</b>, but was incorrect...").update();
			this.guessed.push(toId(guess));
			this.guesses.set(user, (this.guesses.get(user) || 0) + 1);
		}
		this.inactiveCount = 0;
	}
	getAnswers() {
		if (!this.answers.length) return;
		let answers;
		if (this.answers.length === 1) {
			answers = 'The answer was <b>' + this.answers[0] + '</b>.';
		} else {
			answers = 'The answers were ' + this.answers.sort((a, b) => a.length - b.length).splice(0, 3).map(ans => '<b>' + ans + '</b>').join(', ') + '.';
		}
		return answers;
	}
	resetTimer() {
		if (this.timer) clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			let answers = this.getAnswers();
			if (++this.inactiveCount < 5) {
				this.room.add('|html|Time\'s up for this round! ' + answers).update();
				this.proceed();
			} else {
				this.room.add('|html|This game of Guess the Anime has been ended due to inactivity. ' + answers).update();
				this.end();
			}
		}, INACTIVE_END_TIME);
	}
	win(user) {
		if (!this.points.has(user)) return;

		this.room.add('|html|<div class = "infobox"><center>The winner of this game of Guess the Anime is <b style = "color:' + Wisp.hashColor(user.userid) + ';">' + Tools.escapeHTML(user.name) + '!</b> Gratz!</center>');
		this.end();
	}
	skip(user, self) {
		if (!this.canGuess) return self.errorReply("This round is already over.");

		this.resetTimer();

		this.room.add('|html|' +
			'This round has been skipped by <b style = "color:' + Wisp.hashColor(user.userid) + ';">' + Tools.escapeHTML(user.name) + '</b>. ' + this.getAnswers()
		).update();
		this.proceed();
	}
	end(user) {
		clearTimeout(this.timer);
		if (user) this.room.add('|html|This game of <b>Guess the Anime</b> has been forcibly ended by <b style = "color:' + Wisp.hashColor(user.userid) + ';">' + Tools.escapeHTML(user.name) + '.</b>');
		delete this.room.guesstheanime;
	}
}

let cmds = {
	'': function (target, room, user) {
		if (!room.guesstheanime) return this.parse("/help guesstheanime");

		if (!this.runBroadcast()) return;
		room.guesstheanime.update(this);
	},
	help: function () {
		return this.parse("/help guesstheanime");
	},
	'new': 'start',
	start: function (target, room, user) {
		if (isLoading) return this.errorReply("Anime data is currently being loaded. Try again in a few seconds.");
		if (room.isMuted(user) || user.locked) return this.errorReply("You cannot use this while unable to speak.");
		if (room.id !== 'otakulair') return this.errorReply("This game is only playable in the Otaku Lair.");
		if (room.guesstheanime) return this.errorReply("There is already a game of Guess the Anime going on in this room.");
		if (!user.can('warn', null, room)) return this.sendReply("You must be ranked $ or higher to start a game of Guess the Anime.");

		if (!target || !target.trim()) {
			target = 5;
		} else if (isNaN(target) || target.includes('.') || target < 1 || target > 25) {
			return this.errorReply("'" + target + "' is not a valid number. The number of points needed to win must be a non-decimal number between 1 to 25.");
		}

		this.privateModCommand("(" + user.name + " started a game of guess the anime)");
		room.guesstheanime = new GuessTheAnime(room, Number(target));
	},
	guess: function (target, room, user) {
		if (!room.guesstheanime) return this.errorReply("There is no game of Guess the Anime going on in this room.");
		if (room.isMuted(user) || user.locked) return this.errorReply("You cannot use this while unable to speak.");

		room.guesstheanime.guess(user, target, this);
	},
	skip: function (target, room, user) {
		if (!room.guesstheanime) return this.errorReply("There is no game of Guess the Anime going on in this room.");
		if (room.isMuted(user) || user.locked) return this.errorReply("You cannot use this while unable to speak.");
		if (!user.can('mute', null, room)) return this.sendReply("You must be ranked % or higher to forcibly skip a round of Guess the Anime.");

		room.guesstheanime.skip(user, this);
	},
	end: function (target, room, user) {
		if (!room.guesstheanime) return this.errorReply("There is no game of Guess the Anime going on in this room.");
		if (room.isMuted(user) || user.locked) return this.errorReply("You cannot use this while unable to speak.");
		if (!user.can('mute', null, room)) return this.sendReply("You must be ranked % or higher to forcibly end a game of Guess the Anime.");

		room.guesstheanime.end(user);
	},
};

exports.commands = {
	guesstheanimu: 'guesstheanime',
	guesstheanime: cmds,
	gan: 'guessanime',
	guessanime: cmds.guess,
	guesstheanimehelp: [
		"/guesstheanime start [points to win] - Starts a game of guess the anime in the room. The first one to get the mentioned number of points (5 by default) wins. Requires $ or higher.",
		"/guesstheanime end - Forcibly ends a game in the room. Requires % or higher.",
		"/guesstheanime skip - Forcibly skips a round. Requires % or higher.",
		"/guesstheanime guess, /guessanime, /gan [anime name] - Guesses the anime a character is from (NOTE: If a character was only introduced in a particular season of an anime, you need to mention the season as well. Ex. SAO II).",
	],
};
