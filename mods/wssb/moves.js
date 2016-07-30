'use strict';

exports.BattleMovedex = {
	//custom moves for wssb
	//admins + jd
	//jd
	/*"imnotsupposedtobehere": {
		accuracy: true,
		basePower: 0,
		category: "Special",
		id: "imnotsupposedtobehere",
		name: "I'm not supposed to be here",
		pp: 5,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		selfdestruct: true,
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]explosion');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]explosion');
		},
		onHit: function (target, source, move) {
			this.add('c|jd|How did I get here?');
		},
		secondary: false,
		target: "self",
		type: "Normal",
	},*/
	//Hoopa-U check removed
	"hyperspacefury": {
		num: 621,
		accuracy: true,
		basePower: 100,
		category: "Physical",
		id: "hyperspacefury",
		isViable: true,
		name: "Hyperspace Fury",
		pp: 5,
		priority: 0,
		flags: {mirror: 1, authentic: 1},
		breaksProtect: true,
		self: {
			boosts: {
				def: -1,
			},
		},
		secondary: false,
		target: "normal",
		type: "Dark",
	},

	//Kanabae
	"guardskillhandsonic": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 100,
		defensiveCategory: "Special",
		category: "Physical",
		id: "guardskillhandsonic",
		name: "Guard Skill: Hand Sonic",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]playrough');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]playrough');
		},
		onHit: function (target, source, move) {
			this.add('raw|<img src="https://media.giphy.com/media/1pIuZBbO1cbO8/giphy.gif" height="240" width="500">');
		},
		secondaries: [
			{
				chance: 30,
				volatileStatus: "flinch",
			},
			{
				chance: 100,
				self: {
					boosts: {
						spe: 1,
					},
				},
			},
		],
		target: "normal",
		type: "Fairy",
	},
	//Tailz
	"huh": {
		isNonstandard: true,
		accuracy: true,
		basePower: 0,
		category: "Status",
		id: "huh",
		name: "HUH?",
		pp: 20,
		priority: 0,
		flags: {reflectable: 1, mirror: 1, authentic: 1},
		forceSwitch: true,
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]roar');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]roar');
		},
		onHit: function (target, source, move) {
			this.add('c|~Tailz|Don\'t ebully me');
		},
		secondary: {
			chance: 100,
			self: {
				onHit: function (pokemon, source) {
					this.heal(pokemon.maxhp * 3 / 16, pokemon, pokemon, 'memes');
					let stats = [];
					let boost = {};
					for (let statPlus in pokemon.boosts) {
						if (pokemon.boosts[statPlus] < 6) {
							stats.push(statPlus);
						}
					}
					let randomStat = stats.length ? stats[this.random(stats.length)] : "";
					if (randomStat) boost[randomStat] = 1;
					this.boost(boost);
				},
			},
		},
		target: "normal",
		type: "Normal",
	},
	//leaders
	//Felicette
	"supersketchy": {
		isNonstandard: true,
		accuracy: true,
		basePower:  0,
		category: "Status",
		id: "supersketchy",
		name: "Super Sketchy",
		pp: 15,
		priority: 0,
		flags: {},
		//useTargetOffensive: true,
		onTryHit: function (target, pokemon) {
			this.attrLastMove('[anim]mirrormove');
			if (!target.lastMove || !this.getMove(target.lastMove).flags['mirror']) {
				let statusRoll = this.random(2);
				if (statusRoll === 0) {
					this.add('html|No target move to mirror.  REVENGE PARA!...');
					this.attrLastMove('[anim]thunderwave');
					target.trySetStatus('par');
				} else if (statusRoll === 1) {
					this.add('html|No target move to mirror.  Slipping your foe toxins...');
					this.attrLastMove('[anim]toxic');
					target.trySetStatus('tox');
				}
				return false;
			}
			this.useMove(target.lastMove, pokemon, target);
			this.add('c|&Fеlicette|:3');
			return null;
		},
		secondary: false,
		target: "normal",
		type: "Normal",
	},
	//Nii Sama
	"shadowdrain": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 60,
		basePowerCallback: function (pokemon, target) {
			if (target.status === 'slp') return 120;
			return 60;
		},
		category: "Special",
		id: "shadowdrain",
		name: "Shadow Drain",
		pp: 15,
		priority: 0,
		flags: {protect: 1, mirror: 1, heal: 1},
		drain: [1, 2],
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]darkpulse');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]darkpulse');
		},
		onHit: function (target, source, move) {
			this.add('c|&Nii Sama|Dwell in my shadows!');
		},
		secondary: false,
		target: "normal",
		type: "Dark",
	},
	//mods
	//13490ufd
	"donttouchme": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 0,
		category: "Status",
		id: "donttouchme",
		name: "Don\'t touch me",
		pp: 5,
		priority: 6,
		flags: {protect: 1, mirror: 1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]kingsshield');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]kingsshield');
		},
		onHit: function (target, source, move) {
			this.add('c|@13490ufd|:S');
			this.useMove('King\'s Shield', source);
		},
		secondary: {
			chance: 100,
			boosts: {
				atk: 1,
				def: 1,
				spa: 1,
				spd: 1,
				spe: 1,
				accuracy: 1,
			},
		},
		target: "self",
		type: "Steel",
	},
	//Alpha Ninja
	"memequake": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 100,
		category: "Special",
		id: "memequake",
		name: "Meme Quake",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]earthpower');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]earthpower');
		},
		onHit: function (target, source, move) {
		//	this.add('c|%Alpha Ninja|');
		},
		secondary: {
			chance: 100,
			status: 'par',
		},
		target: "normal",
		type: "Ground",
	},
	//Doctor Charizard
	"dragonsrevenge": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 120,
		id: "dragonsrevenge",
		name: "Dragon's Revenge",
		category: "Physical",
		pp: 15,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]flareblitz');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]flareblitz');
		},
		/*onHit: function (target, source, move) {
			this.add('c|+Mighty Sciz|');
		},*/
		secondary: {
			chance: 10,
			self: {
				boosts: {
					atk: 1,
					spe: 1,
				},
			},
		},
		target: "normal",
		type: "Dragon",
	},
	//lotuschamptorpid
	"memedreams": {
		isNonstandard: true,
		accuracy: true,
		basePower: 0,
		category: "Status",
		isViable: true,
		pp: 30,
		priority: 4,
		flags: {snatch: 1, authentic: 1},
		volatileStatus: 'snatch',
		onHit: function (target, source, move) {
			this.useMove('light screen', source);
			if (!target.volatiles['substitute'] || move.infiltrates) this.boost({evasion:-1});
			let removeTarget = {reflect:1, lightscreen:1, safeguard:1, mist:1, spikes:1, toxicspikes:1, stealthrock:1, stickyweb:1};
			let removeAll = {spikes:1, toxicspikes:1, stealthrock:1, stickyweb:1};
			for (let targetCondition in removeTarget) {
				if (target.side.removeSideCondition(targetCondition)) {
					if (!removeAll[targetCondition]) continue;
					this.add('-sideend', target.side, this.getEffect(targetCondition).name, '[from] move: Defog', '[of] ' + target);
				}
			}
			for (let sideCondition in removeAll) {
				if (source.side.removeSideCondition(sideCondition)) {
					this.add('-sideend', source.side, this.getEffect(sideCondition).name, '[from] move: Defog', '[of] ' + source);
				}
			}
		},
		secondary: false,
		name: "Meme Dreams",
		id: "memedreams",
		target: "normal",
		type: "Flying",
	},
	"sacrificetothegods": {
		isNonstandard: true,
		accuracy: true,
		basePower: 0,
		category: "Status",
		isViable: true,
		pp: 30,
		target: "self",
		type: "Flying",
		name: "Sacrifice to the Gods",
		id: "sacrificetothegods",
	},
	//rabinov
	"miasmicstrike": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 50,
		category: "Physical",
		id: "miasmicstrike",
		name: "Miasmic Strike",
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1},
		multihit: 3,
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]bugbite');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]bugbite');
		},
		onHit: function (target, source, move) {
			this.add('c|+Rabinov|You\'ll never make it out alive!');
			target.clearBoosts();
			this.add('-clearboost', target);
		},
		secondary: {
			chance: 100,
			onHit: function (target, source, move) {
				let statusRoll = this.random(5);
				/*{
					chance: 100,
					volatileStatus: 'confusion',
				}, */
				if (statusRoll === 0) {
					target.trySetStatus('par', source);
				} else if (statusRoll === 1) {
					target.trySetStatus('brn', source);
				} else if (statusRoll === 2) {
					target.trySetStatus('frz', source);
				} else if (statusRoll === 3) {
					target.trySetStatus('slp', source);
				} else if (statusRoll === 4) {
					target.trySetStatus('psn', source);
				}
			},
		},
		target: "normal",
		type: "Bug",
	},
	//wispbot
	"mixtape": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 100,
		category: "Special",
		id: "mixtape",
		name: "Mixtape",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]flamethrower');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]flamethrower');
		},
		onHit: function (target, source, move) {
			this.add('c|@Wisp Bot|My mixtape is hotter than my memes.');
		},
		secondaries: [
			{
				chance: 50,
				status: 'brn',
			},
			{
				chance: 50,
				self: {
					boosts: {
						atk: 1,
						def: 1,
						spa: 1,
						spd: 1,
						spe: 1,
					},
				},
			},
		],
		target: "normal",
		type: "Fire",
	},
	//viktria
	"noticemesenpai": {
		accuracy: 100,
		basePower: 0,
		category: "Status",
		id: "noticemesenpai",
		name: "Notice Me, Senpai ❤ ~  !",
		pp: 5,
		priority: 0,
		flags: {protect: 1, mirror: 1, reflectable: 1},
		volatileStatus: 'attract',
		effect: {
			noCopy: true, // doesn't get copied by Baton Pass
			onStart: function (pokemon, source, effect) {
				this.add('-start', pokemon, 'Attract');
			},
			onUpdate: function (pokemon) {
				if (this.effectData.source && !this.effectData.source.isActive && pokemon.volatiles['attract']) {
					this.debug('Removing Attract volatile on ' + pokemon);
					pokemon.removeVolatile('attract');
				}
			},
			onBeforeMovePriority: 2,
			onBeforeMove: function (pokemon, target, move) {
				this.add('-activate', pokemon, 'Attract', '[of] ' + this.effectData.source);
				if (this.random(2) === 0) {
					this.add('cant', pokemon, 'Attract');
					return false;
				}
			},
			onEnd: function (pokemon) {
				this.add('-end', pokemon, 'Attract', '[silent]');
			},
		},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]attract');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]attract');
		},
		onHit: function (target, source, move) {
			target.addVolatile('attract', source, move);
			target.addVolatile('confusion', source);
			target.trySetStatus('par', source);
			this.add('c|&viktria|/html I knew you\'d fall in love with me eventually!</button><em class="mine"><img src="http://i.imgur.com/Hz4w27G.gif" title="feelskawaii" height="40" width="40" /></em>');
		},
		secondary:	{
			boosts: {
				spd: -1,
				def: -1,
			},
		},
		target: "normal",
		type: "Ghost",
	},
	//drivers
	//alankh
	"divineroots": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 0,
		category: "Status",
		id: "divineroots",
		name: "Divine Roots",
		pp: 10,
		priority: 1,
		flags: {protect: 1, reflectable: 1, mirror: 1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]safeguard');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]safeguard');
		},
		onHit: function (target, source, move) {
			this.add('c|%Alan KH|Prepare to get TREE REX\'D!');
			this.useMove('safeguard', source);
			this.useMove('leech seed', source);
			this.useMove('Amnesia', source);
		},
		secondary: false,
		target: "normal",
		type: "Steel",
	},
	//Chief Sokka
	"clumsysurgeon": {
		isNonstandard: true,
		accuracy: 100,
		basePower:0,
		damage: 'level',
		category: "Physical",
		id: "clumsysurgeon",
		name: "Clumsy Surgeon",
		pp: 15,
		status: 'par',
		priority: 0,
		flags: {protect: 1, mirror:1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]seismictoss');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]seismictoss');
		},
		onHit: function (target, source, move) {
			this.add('c|%Chief Sokka|/html Don\'t worry, I am an expert brain Sergeon!<em class="mine"><img src="http://i.imgur.com/gu3Osve.png" title="feelsok" height="40" width="40" /></em>');
		},
		secondary: [
			{
				chance: 20,
				self: {
					onHit: function (target) {
						let stats = [];
						for (let stat in target.boosts) {
							if (target.boosts[stat] < 6) {
								stats.push(stat);
							}
						}
						if (stats.length) {
							let randomStat = stats[this.random(stats.length)];
							let boost = {};
							boost[randomStat] = 1;
							this.boost(boost);
						} else {
							if (stats.length) {
								let randomStat = stats[this.random(stats.length)];
								let boost = {};
								boost[randomStat] = -1;
								this.boost(boost);
							} else {
								return false;
							}
						}
					},
				},
			},
		],
		target: "normal",
		type: "Fighting",
	},
	//Chimechoo
	"mindshock": {
		isNonstandard: true,
		accuracy: true,
		basePower: 95,
		category: "Special",
		id: "mindshock",
		name: "Mind Shock",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]psychic');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]psychic');
		},
		onHit: function (target, source, move) {
			this.add('c|%Alliancе~Chime|M-My head hurts...');
		},
		secondary: {
			chance: 40,
			status: 'par',
		},
		target: "normal",
		type: "Psychic",
	},
	//Combo Breaker
	"starbomber": {
		isNonstandard: true,
		accuracy: 95,
		basePower: 100,
		id: "starbomber",
		name: "Starbomber",
		category: "Special",
		pp: 15,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]dracometeor');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]dracometeor');
		},
		onHit: function (target, source, move) {
			this.add('c|+Combo Breaker|The stars are falling! D:');
		},
		secondaries: [
			{
				chance: 20,
				boosts: {
					spd: -1,
				},
			},
			{
				chance: 10,
				self: {
					boosts: {
						def: 1,
						spe: 1,
					},
				},
			},
		],
		target: "normal",
		type: "Normal",
	},
	//Emg TechP Volco
	"volcanosrevenge": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 130,
		id: "volcanosrevenge",
		name: "Volcanos Revenge",
		category: "Special",
		defensiveCategory: "Physical",
		desc: "Use and Find Out.",
		shortDesc: "Use and Find Out.",
		pp: 15,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]steameruption');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]steameruption');
		},
		onHit: function (target, source, move) {
			this.add('c|%Emg TechP Volco|I\'LL SEE YOU IN HELL!');
		},
		secondaries: [
			{
				chance: 30,
				volatileStatus: 'confusion',
			},
			{
				chance: 30,
				self: {
					boosts: {
						def: 1,
						spd: 1,
					},
				},
			},
		],
		target: "normal",
		type: "Water",
	},
	//iSandman
	"antigravityfissure": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 110,
		category: "Special",
		id: "antigravityfissure",
		name: "Anti Gravity Fissure",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		ignoreImmunity: {'Ground': true},
		onBasePower: function (basePower, pokemon, target) {
			if (target.types.indexOf("Flying") > -1 || target.ability === "levitate" || toId(target.item || " ") === "airballoon") return this.chainModify(1.25);
		},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]earthpower');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]earthpower');
		},
		onHit: function (target, source, move) {
			this.add('c|%iSandman|WOA WE OUT HERE');
		},
		secondary: {
			chance: 99,
			boosts: {
				spd: -1,
			},
		},
		target: "allAdjacentFoes",
		type: "Ground",
	},
	//Master Float
	"watermirror": {
		isNonstandard: true,
		id: "watermirror",
		name: "Water Mirror",
		accuracy: true,
		category: "Status",
		pp: 10,
		priority: 3,
		flags: {snatch: 1, authentic: 1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]protect');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]protect');
		},
		onHit: function (target, source) {
			this.add('c|%Master Float|/me flops more');
			this.useMove('protect', source);
			let targetBoosts = {};
			for (let i in target.boosts) {
				// copy positive boosts only
				if (target.boosts[i] < 0) continue;
				targetBoosts[i] = target.boosts[i];
			}
			source.setBoost(targetBoosts);
			let volatileList = ['substitute', 'leechseed', 'aquaring', 'magiccoat', 'taunt', 'disable', 'focusenergy', 'torment', 'smackdown', 'curse', 'ingrain', 'magnetrise', 'attract', 'confusion', 'mustrecharge', 'yawn', 'lockon', 'uproar', 'telekenisis', 'nightmare', 'stockpile', 'foresight'];
			volatileList.forEach(function (v) {
				if (target.volatiles[v]) {
					source.addVolatile(v);
				} else if (!target.volatiles[v]) {
					source.removeVolatile(v);
				}
			});
			this.add('-copyboost', source, target, '[from] move: Float\'s Sharingan');
		},
		secondary: false,
		target: "normal",
		type: "Normal",
	},
	//snow
	"windblades": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 70,
		id: "windblades",
		name: "Wind Blades",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]airslash');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]airslash');
		},
		onHit: function (target, source, move) {
			this.add('c|+snow|PREPARE FOR HAX');
		},
		onAfterMoveSecondarySelf: function (source, target, move) {
			if (source && source !== target && move && move.category !== 'Status' && !move.ohko) {
				this.damage(source.maxhp / 5, source, source, this.getItem('lifeorb'));
			}
		},
		secondary: {
			chance: 100,
			volatileStatus: "flinch",
		},
		target: "normal",
		type: "Flying",
	},
	//SuperJeenius
	"cleanwateract": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 80,
		id: "cleanwateract",
		name: "Clean Water Act",
		category: "Special",
		pp: 15,
		priority: 0,
		flags: {protect: 1, mirror: 1, heal: 1},
		drain: [1, 2],
		secondary: {
			chance: 30,
			status: 'brn',
		},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]scald');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]scald');
		},
		onHit: function (target, source, move) {
			this.add('c|%SuperJeenius|/html This is a brand new move <em class="mine"><img src="https://cdn.betterttv.net/emote/562b9101a6646e202bcc5447/2x" title="rarechar" height="40" width="40" /></em>');
		},
		target: "normal",
		type: "Water",
	},
	//voices
	//AB Dominicarus Hurricane of Atomsk: 75% chance to raise Speed
	"hurricaneofatomsk": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 120,
		id: "hurricaneofatomsk",
		name: "Hurricane of Atomsk",
		category: "Special",
		pp: 10,
		flags: {protect: 1, reflectable: 1, mirror: 1},
		onEffectiveness: function (typeMod, type, move) {
			return typeMod + this.getEffectiveness('Fire', type);
		},
		prority: 0,
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]hurricane');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]hurricane');
		},
		onHit: function (target, source, move) {
			this.add('c|+AB Dominicarus|YES! LET ATOMSK CONSUME YOU AS HE DID I!!!');
		},
		secondaries: [
			{
				chance: 75,
				status: 'brn',
			},
			{
				chance: 75,
				self: {
					boosts: {
						spe: 1,
					},
				},
			},
		],
		target: "normal",
		type: "Flying",
	},
	//alliance aegis
	"collapsation": {
		isNonstandard: true,
		accuracy: true,
		basePower: 0,
		id: "collapsation",
		name: "Collapsation",
		category: "Status",
		pp: 15,
		priority: 2,
		flags: {protect: 1, reflectable: 1, mirror: 1},
		onTryHit: function (pokemon) {
			let bannedAbilities = {multitype:1, stancechange:1, truant:1};
			if (bannedAbilities[pokemon.ability]) {
				return false;
			}
		},
		onHit: function (pokemon, target, source, move) {
			this.add('c|+Alliance Aegis|Aaaaand the collapse starts :)');
			this.useMove('meanlook', target);
			let oldAbility = pokemon.setAbility('truant');
			if (oldAbility) {
				this.add('-endability', pokemon, oldAbility, '[from] move:  Collapsation');
				this.add('-ability', pokemon, 'Truant', '[from] move: Collapsation');
				return;
			}
			return false;
		},
		secondary: {
			self: {
				chance: 100,
				boosts: {
					def: -1,
					spd: -1,
				},
			},
		},
		target: "normal",
		type: "Grass",
	},
	//ArkenCiel
	"instillfear": {
		isNonstandard: true,
		accuracy: true,
		basePower: 0,
		category: "Status",
		id: "instillfear",
		name: "Instill Fear",
		pp: 10,
		priority: -7,
		flags: {protect: 1, mirror: 1, authentic: 1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]safeguard');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]safeguard');
		},
		onHit: function (target, source, move) {
			this.add('c|+ArkenCiel|Sacrificing flesh to break bones.');
			this.useMove('endure', source);
			this.useMove('taunt', source);
			this.useMove('haze', source);
			this.useMove('thunderwave', source);
		},
		secondary: false,
		target: "normal",
		type: "Ghost",
	},
	//Crystal Xman
	"shieldbreaker": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 110,
		id: "shieldbreaker",
		name: "Shield Breaker",
		category: "Physical",
		pp: 15,
		priority: 0,
		breaksProtect: true,
		flags: {contact: 1, mirror: 1, punch: 1},
		OnTryHit: function (target, source, move) {
			this.attrLastMove('[anim]icepunch');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]icepunch');
		},
		onHit: function (target, source, move) {
		//	this.add('c|+Crystal Xman|');
		},
		secondary: false,
		target: "normal",
		type: "Ice",
	},
	//Escoffier
	"gottem": {
		isNonstandard: true,
		accuracy: true,
		basePower: 0,
		category: "Status",
		id: "gottem",
		name: "GOTTEM",
		pp: 10,
		priority: 4,
		flags: {},
		stallingMove: true,
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]kingsshield');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]kingsshield');
		},
		onHit: function (target, source, move) {
		//	this.add('c|+Escoffier|');
			this.useMove('Kingsshield', source);
		},
		secondary: {
			chance: 100,
			boosts: {
				def: -2,
				spd:  -2,
			},
		},
		target: "normal",
		type: "Steel",
	},
	//Skyla (Full)
	//Midnight Prof EXO // no longer staff
	/*"darkcausatum": {
		isNonstandard: true,
		accuracy: 100,
		basePower:  80,
		category: "Physical",
		basePowerCallback: function (pokemon, target) {
			if (target.newlySwitched) {
				this.debug('Dark Causatum NOT boosted on a switch');
				return 50;
			}
			if (this.willMove(target)) {
				this.debug('Dark Causatum NOT boosted');
				return 50;
			}
			this.debug('Dark Causatum damage boost');
			return 160;
		},
		id: "darkcausatum",
		name: "Dark Causatum",
		pp: 15,
		priority: 0,
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]payback');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]payback');
		},
		onHit: function (target, source, move) {
		//	this.add('c|+Mіdnight Prоf ΕХΟ|');
		},
		secondary: {
			boosts: {
				def: -1,
				spd: -1,
			},
		},
		target: "normal",
		type: "Dark",
	},*/
	//Pegasus Jane
	"aquaticlight": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 120,
		category: "Special",
		id: "aquaticlight",
		name: "Aquatic Light",
		pp: 10,
		priority: 1,
		flags: {protect: 1, mirror: 1, heal: 1},
		drain: [1, 2],
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]surf');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]surf');
		},
		onHit: function (target, source, move) {
			this.add('c|+Pegasus Jane|Be purified by the powers of the ocean and light.');
			this.useMove('Aqua ring', source);
		},
		secondary: {
			chance:  20,
			volatileStatus: "flinch",
		},
		target: "normal",
		type: "Fairy",
	},
	//Sam Crowe
	"thirstysam": {
		isNonstandard: true,
		accuracy: true,
		basePower: 0,
		category: "Status",
		id: "thirstysam",
		name: "Thirsty Sam",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]taunt');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]taunt');
		},
		onHit: function (target, source, move) {
			this.add('c|+Sam Crowe|Cant let you do that, Starfox');
			this.useMove('taunt', source);
			this.useMove('encore', source);
			this.useMove('dragondance', source);
			this.useMove('superfang', source);
		},
		secondary: false,
		target: "normal",
		type: "Dark",
	},
	//silveee
	"serverbreak": {
		isNonstandard: true,
		accuracy: 100,
		basePower: 140,
		category: "Physical",
		id: "serverbreak",
		name: "Server Break",
		pp: 10,
		priority: 0,
		recoil: [6.9, 100],
		flags: {protect: 1, mirror: 1},
		volatileStatus: 'gastroacid',
		onTryHit: function (pokemon) {
			let bannedAbilities = {multitype:1, stancechange:1};
			if (bannedAbilities[pokemon.ability]) {
				return false;
			}
			this.attrLastMove('[anim]psychoboost');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]psychoboost');
		},
		onHit: function (target, source, move) {
			this.add('raw|<div class="broadcast-red"><b>The battle crashed</b><br />You can keep playing but it might crash again cuz silveee saks. gj u nub >:c</div>');
			this.add('c|+Silveee|.');
			this.add('c|+Silveee|oh');
		},
		onEffectiveness: function (typemod) {
			return -typemod;
		},
		effect: {
			// Ability suppression implemented in BattlePokemon.ignoringAbility() within battle-engine.js
			onStart: function (pokemon) {
				this.add('-endability', pokemon);
				this.singleEvent('End', this.getAbility(pokemon.ability), pokemon.abilityData, pokemon, pokemon, 'serverbreak');
			},
		},
		target: "normal",
		type: "Dark",
	},
	//+St SkyMFall
	"gitgudfam": {
		isNonstandard: true,
		accuracy: true,
		basePower: 999,
		category: "Physical",
		id: "gitgudfam",
		name: "Git Gud Fam",
		pp:10,
		priority: 0,
		selfdestruct: true,
		breaksProtect: true,
		multihit: 2,
		secondary: false,
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]explosion');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]explosion');
		},
		target: 'target',
		type: "Steel",
	},
	//honorary mentions
	//Wando
	// no longer staff
	/*"nuke": {
		accuracy: 100,
		basePower: 350,
		category: "Physical",
		id: "nuke",
		name: "NUKE",
		pp: 5,
		priority: 2,
		breaksProtect: true,
		flags: {mirror: 1},
		selfdestruct: true,
		onTryHit: function (target, source, move) {
			this.attrLastMove('[anim]explosion');
		},
		onMoveFail: function (target, source, move) {
			this.attrLastMove('[anim]explosion');
		},
	/*	onHit: function (target, source, move) {
			this.add('c|&Wаndo|');
		}, */
		/*secondary:	{
			chance: 100,
			status: 'par',
		},
		target: "allAdjacent",
		type: "Electric",
	},*/
};
