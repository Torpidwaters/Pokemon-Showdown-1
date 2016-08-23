'use strict';

exports.BattleAbilities = {
	//Custom abilities for wssb
	//admins + jd
	//jd
	/*"imnotstaff": {
		isNonstandard: true,
		onStart: function (target) {
			this.useMove('stealthrock', target);
			this.useMove('spikes', target);
			this.useMove('spikes', target);
			this.useMove('spikes', target);
			this.useMove("imnotsupposedtobehere", target);
		},
		id: "imnotstaff",
		name: 'I\'m Not Staff',
	},*/
	//Kanabae
	"guardskillharmonics": {
		isNonstandard: true,
		onBeforeSwitchIn: function (pokemon) {
			pokemon.illusion = null;
			let i;
			for (i = pokemon.side.pokemon.length - 1; i > pokemon.position; i--) {
				if (!pokemon.side.pokemon[i]) continue;
				if (!pokemon.side.pokemon[i].fainted) break;
			}
			if (!pokemon.side.pokemon[i]) return;
			if (pokemon === pokemon.side.pokemon[i]) return;
			pokemon.illusion = pokemon.side.pokemon[i];
		},
		onPrepareHit: function (source, target, move) {
			let type = move.type;
			if (type && type !== '???' && source.getTypes().join() !== type) {
				if (!source.setType(type)) return;
				this.add('-start', source, 'typechange', type, '[from] Guard Skill: Harmonics');
			}
		},
		onAnyModifyBoost: function (boosts, target) {
			let source = this.effectData.target;
			if (source === target) return;
			if (source === this.activePokemon && target === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (target === this.activePokemon && source === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		onModifyAtk: function (atk) {
			return this.chainModify(2);
		},
		id: "guardskillharmonics",
		name: "Guard Skill: Harmonics",
	},
	//Tailz
	"imafk": {
		isNonstandard: true,
		onResidualOrder: 26,
		onResidualSubOrder: 1,
		onResidual: function (pokemon) {
			if (pokemon.activeTurns) {
				this.boost({evasion: 2});
			}
			let stats = [];
			let boost = {};
			for (let statPlus in pokemon.boosts) {
				if (pokemon.boosts[statPlus] < 6) {
					stats.push(statPlus);
				}
			}
			let randomStat = stats.length ? stats[this.random(stats.length)] : "";
			if (randomStat) boost[randomStat] = 1;

			stats = [];

			this.boost(boost);
		},
		id: "imafk",
		name: "I\'m Afk",
	},
	//leaders
	//Felicette
	"doodles": {
		onResidualOrder: 26,
		onResidualSubOrder: 1,
		onResidual: function (pokemon) {
			if (pokemon.activeTurns) {
				this.boost({def: 1, spa: 1, spd: 1, spe: 2});
				pokemon.heal(pokemon.maxhp / 4);
			}
		},
		id: "doodles",
		name: "Doodles",
	},
	//Nii Sama
	"goodnight": {
		isNonstandard: true,
		onStart: function (pokemon) {
			let foeactive = pokemon.side.foe.active;
			let activated = false;
			for (let i = 0; i < foeactive.length; i++) {
				if (!foeactive[i] || !this.isAdjacent(foeactive[i], pokemon)) continue;
				if (!activated) this.useMove("dark void", pokemon, foeactive[i]);
			}
		},
		onImmunity: function (type, pokemon) {
			if (type === 'slp') return false;
		},
		onAllyModifyMove: function (move) {
			if (typeof move.accuracy === "number") move.accuracy = true;
		},
		id: "goodnight",
		name: "Goodnight",
	},
	//mods
	//13490ufd
	"pikapower": {
		isNonstandard: true,
		onStart: function (pokemon) {
			this.boost({atk: 1, def: 2, spa: 1, spd: 2, spe: 1, accuracy: 1});
			let foeactive = pokemon.side.foe.active;
			let activated = false;
			for (let i = 0; i < foeactive.length; i++) {
				if (!foeactive[i] || !this.isAdjacent(foeactive[i], pokemon)) continue;
				if (!activated) this.boost({atk: -6, spa: -6}, foeactive[i], pokemon);
			}
		},
		id: "pikapower",
		name: "Pika-Power",
	},
	//Alpha Ninja
	"420blazeit": {
		onStart: function (pokemon) {
			this.boost({spa:3});
		},
		onResidualOrder: 26,
		onResidualSubOrder: 1,
		onResidual: function (pokemon) {
			if (pokemon.activeTurns) {
				this.boost({spe:1});
			}
		},
		id: "420blazeit",
		name: "420 Blaze It",
	},
	//Doctor Charizard
	"dragonsflames": {
		isNonstandard: true,
		desc: "Use and Find Out",
		shortDesc: "Use and Find Out",
		onStart: function (pokemon) {
			this.boost({atk: 2, spe: 2});
		},
		id: "dragonsflames",
		name: "Dragon's Flames",
	},
	//lotuschamptorpid
	"stopbeingop": {
		isNonstandard: true,
		onAnyModifyBoost: function (boosts, target) {
			let source = this.effectData.target;
			if (source === target) return;
			if (source === this.activePokemon && target === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (target === this.activePokemon && source === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		onSourceModifyDamage: function (damage, source, target, move) {
			if (move.priority > 0) {
				this.debug('Stop being OP weaken');
				return this.chainModify(1 / (move.priority + 1));
			}
		},
		onSourceFaint: function (target, source, effect) {
			//this.add('-activate', pokemon, 'ability: Stop being OP');
			if (effect && effect.effectType === 'Move') {
				this.boost({def:1, spa:1}, source);
			}
			//this.useMove('sacrificetothegods', target);
			this.add('-ability', target, 'sacrificetothegods', '[from] move: Now I\'m OP');
		},
		id: "stopbeingop",
		name: "Stop Being OP",
	},
	"sacrificetothegods": {
		id:"sacrificetothegods",
		name:"Sacrifice to the Gods",
	},
	"nowimop": {
		isNonstandard: true,
		onAnyModifyBoost: function (boosts, target) {
			let source = this.effectData.target;
			if (source === target) return;
			if (source === this.activePokemon && target === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (target === this.activePokemon && source === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		onSourceModifyDamage: function (damage, source, target, move) {
			if (move.priority > 0) {
				this.debug('Stop being OP weaken');
				return this.chainModify(1 / (move.priority + 1));
			}
		},
		onSourceFaint: function (source, effect, pokemon) {
			//this.add('-activate', pokemon, 'ability: Stop being OP');
			if (effect && effect.effectType === 'Move') {
				this.boost({def:1, spa:1}, source);
			}
		},
		id: "nowimop",
		name: "Now I'm OP",
	},
	//rabinov
	"dreadarmour": {
		isNonstandard: true,
		onStart: function (pokemon) {
			this.boost({def: 2, spd: 2});
		},
		onDamage: function (damage, target, source, effect) {
			if (effect.id === 'psn' || effect.id === 'tox' || effect.id === 'brn' || effect.id === 'par' || effect.id === 'slp' || effect.id === 'frz') {
				this.heal(target.maxhp / 8);
				return false;
			}
		},
		onModifyMove: function (move) {
			if (!move || !move.flags['contact']) return;
			if (!move.secondaries) {
				move.secondaries = [];
			}
			let randSecondaryRoll = this.random(7);
			if (randSecondaryRoll === 0) {
				move.secondaries.push({
					chance: 100,
					status: 'psn',
				});
			} else if (randSecondaryRoll === 1) {
				move.secondaries.push({
					chance: 100,
					status: 'tox',
				});
			} else if (randSecondaryRoll === 2) {
				move.secondaries.push({
					chance: 100,
					status: 'frz',
				});
			} else if (randSecondaryRoll === 3) {
				move.secondaries.push({
					chance: 100,
					status: 'par',
				});
			} else if (randSecondaryRoll === 4) {
				move.secondaries.push({
					chance: 100,
					status: 'brn',
				});
			} else if (randSecondaryRoll === 5) {
				move.secondaries.push({
					chance: 100,
					status: 'slp',
				});
			} else if (randSecondaryRoll === 6) {
				move.secondaries.push({
					chance: 100,
					volatileStatus: 'confusion',
				});
			}
		},
		id: "dreadarmour",
		name: "Dread Armour",
	},
	//wispbot
	"hotmemes": {
		isNonstandard: true,
		onStart: function (source) {
			this.setWeather('desolateland');
		},
		onAnySetWeather: function (target, source, weather) {
			if (this.getWeather().id === 'desolateland' && !(weather.id in {desolateland:1, primordialsea:1, deltastream:1})) return false;
		},
		onEnd: function (pokemon) {
			if (this.weatherData.source !== pokemon) return;
			for (let i = 0; i < this.sides.length; i++) {
				for (let j = 0; j < this.sides[i].active.length; j++) {
					let target = this.sides[i].active[j];
					if (target === pokemon) continue;
					if (target && target.hp && target.hasAbility('desolateland')) {
						this.weatherData.source = target;
						return;
					}
				}
			}
			this.clearWeather();
		},
		onTryHitPriority: 1,
		onTryHit: function (target, source, move) {
			if (target !== source && move.type === 'Ground') {
				if (!this.boost({})) {
					this.add('-immune', target, '[msg]', '[from] ability: Hot Memes');
				}
				return null;
			}
		},
		onModifySpe: function (spe) {
			if (this.isWeather(['sunnyday', 'desolateland'])) {
				return this.chainModify(2);
			}
		},
		id: "hotmemes",
		name: "Hot Memes",
	},
	//viktria
	"marionettesmayhem": {
		isNonstandard: true,
		onStart: function (pokemon) {
			this.add('-ability', pokemon, 'Mold Breaker');
			this.boost({def: 4, spe: 4});
			this.useMove("curse", pokemon);
			this.useMove("wish", pokemon);
			this.useMove("trickortreat", pokemon);
		},
		stopAttackEvents: true,
		onModifyPriority: function (priority, pokemon, target, move) {
			if (move && move.category === 'Status') {
				return priority + 1;
			}
		},
		onModifyMove: function (move) {
			move.infiltrates = true;
		},
		onFoeTrapPokemon: function (pokemon) {
			if (!pokemon.hasAbility('marionettesmayhem') && this.isAdjacent(pokemon, this.effectData.target)) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon: function (pokemon, source) {
			if (!source) source = this.effectData.target;
			if (!pokemon.hasAbility('marionettesmayhem') && this.isAdjacent(pokemon, source)) {
				pokemon.maybeTrapped = true;
			}
		},
		id: "marionettesmayhem",
		name: "Marionette\'s Mayhem",
	},
	//drivers
	//alankh
	"biofuel": {
		onStart: function (pokemon) {
			this.boost({spa: 2, spe: 2});
		},
		onTryHitPriority: 1,
		onTryHit: function (target, source, move) {
			if (target !== source && move.type === 'Ground') {
				if (!this.boost({})) {
					this.add('-immune', target, '[msg]', '[from] ability: Bio-Fuel');
				}
				return null;
			}
		},
		id: "biofuel",
		name: "Bio-Fuel",
	},
	//Chief Sokka
	"painkillers": {
		isNonstandard: true,
		onStart: function (pokemon) {
			this.boost({spd:1});
		},
		onModifyDefPriority: 6,
		onModifyDef: function (def) {
			return this.chainModify(2);
		},
		id: "painkillers",
		name: "Pain Killers",
	},
	//Chimechoo
	"emotional": {
		onModifySpePriority: 7,
		onModifySpe: function (spe, pokemon) {
			return this.chainModify(spe, 3);
		},
		onModifySpdPriority: 6,
		onModifySpD: function (spd, pokemon) {
			return this.chainModify(spd, 3);
		},
		onModifySpaPriority: 5,
		onModifySpa: function (spa, pokemon) {
			this.debug("Emotional Boost");
			return this.chainModify(spa, 3);
		},
		onDamage: function (damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				return false;
			}
		},
		onAnyModifyBoost: function (boosts, target) {
			let source = this.effectData.target;
			if (source === target) return;
			if (source === this.activePokemon && target === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (target === this.activePokemon && source === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		onAnyTryPrimaryHit: function (target, source, move) {
			if (target === source || move.category === 'Status') return;
			if (move.type === 'Fairy') {
				source.addVolatile('aura');
			}
		},
		id: "emotional",
		name: "Emotional",
	},
	//combo breaker
	"combobreaker": {
		onStart: function (pokemon) {
			this.useMove("haze", pokemon);
			this.useMove("defog", pokemon);
		},
		onModifyMovePriority: -1,
		onModifyMove: function (move, pokemon) {
			if (move.type === 'Normal' && move.id !== 'naturalgift') {
				move.type = 'Fairy';
				if (move.category !== 'Status') pokemon.addVolatile('pixilate');
			}
		},
		effect: {
			duration: 1,
			onBasePowerPriority: 8,
			onBasePower: function (basePower, pokemon, target, move) {
				return this.chainModify([0x14CD, 0x1000]);
			},
		},
		 onDamage: function (damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				return false;
			}
		},
		id: "comobreaker",
		name: "combobreaker",
	 },
	//Emg TechP Volco
	"volcanicash": {
		isNonstandard: true,
		desc: "Use and Find Out",
		shortDesc: "Use and Find Out",
		onStart: function (pokemon) {
			this.boost({spa: 1, spe: 2});
		},
		onModifyMove: function (move) {
			move.stab = 2;
		},
		onUpdate: function (pokemon) {
			if (pokemon.status === 'par') {
				this.add('-activate', pokemon, 'ability: Volcanic Ash');
				pokemon.cureStatus();
			}
		},
		onImmunity: function (type, pokemon) {
			if (type === 'par') return false;
		},
		id: "volcanicash",
		name: "Volcanic Ash",
	},
	//iSandman
	"godsforce": {
		isNonstandard: true,
		onModifyMove: function (move, pokemon) {
			if (move.secondaries) {
				delete move.secondaries;
				// Actual negation of `AfterMoveSecondary` effects implemented in scripts.js
				pokemon.addVolatile('sheerforce');
			}
		},
		effect: {
			duration: 1,
			onBasePowerPriority: 8,
			onBasePower: function (basePower, pokemon, target, move) {
				return this.chainModify([0x14CD, 0x1000]);
			},
		},
		id: "godsforce",
		name: "God's Force",
	},
	//Master Float
	"magicaura": {
		isNonstandard: true,
		onStart: function (pokemon) {
			this.boost({atk:2});
		},
		onTryHit: function (pokemon, target, move) {
			if (move.id === 'captivate' || move.id === 'taunt' || move.id === 'disable') {
				this.add('-immune', pokemon, '[msg]', '[from] Magic Immunity');
				return null;
			}
		},
		onDamage: function (damage, target, source, effect) {
			if (effect.effectType !== 'Move') return false;
		},
		onUpdate: function (pokemon) {
			if (pokemon.status === 'brn' || pokemon.status === 'slp' || pokemon.status === 'psn' || pokemon.status === 'tox' || pokemon.status === 'par' || pokemon.status === 'frz') {
				pokemon.cureStatus();
			}
			if (pokemon.volatiles['attract']) {
				pokemon.removeVolatile('attract');
				this.add('-end', pokemon, 'move: Attract');
			}
			if (pokemon.volatiles['taunt']) {
				pokemon.removeVolatile('taunt');
				// Taunt's volatile already sends the -end message when removed
			}
		},
		onImmunity: function (type, pokemon) {
			if (type === 'brn' || type === 'slp' || type === 'psn' || type === 'tox' || type === 'par' || type === 'frz' || type === 'attract') {
				this.add('-immune', pokemon, '[from] Master Guard');
				return false;
			}
		},
		onFlinch: function () {
			return false;
		},
		id: "magicaura",
		name: "Magic Aura",
	},
	//snow
	"furyofnature": {
		isNonstandard: true,
		onStart: function (pokemon) {
			this.boost({spa:3, spe:3, def:-2, spd:-2});
			let foeactive = pokemon.side.foe.active;
			let activated = false;
			for (let i = 0; i < foeactive.length; i++) {
				if (!foeactive[i] || !this.isAdjacent(foeactive[i], pokemon)) continue;
				if (!activated) this.boost({spd: -2, spe: -2}, foeactive[i], pokemon);
			}
		},
		id: "furyofnature",
		name: "Fury of Nature",
	},
	//SuperJeenius
	"imbue": {
		onStart: function (pokemon, source) {
			this.boost({spa: 3, spe: 1});
		},
		onAnyAccuracy: function (accuracy, target, source, move) {
			if (move && (source === this.effectData.target || target === this.effectData.target)) {
				return true;
			}
			return accuracy;
		},
		id: "imbue",
		name: "Imbue",
	},
	//voices
	//AB Dominicarus
	"elementalnoguard": {
		onAnyAccuracy: function (accuracy, target, source, move) {
			if (move && (source === this.effectData.target || target === this.effectData.target)) {
				return true;
			}
			return accuracy;
		},
		onSourceHit: function (target, source, move) {
			this.boost({atk:1}, source);
		},
	},
	//Alliance Aegis
	"regaleye": {
		onStart: function (pokemon, source) {
			this.boost({def: -2, spe: -1});
		},
		onBoost: function (boost) {
			for (let i in boost) {
				boost[i] *= -1;
			}
		},
		onTryHitPriority: 1,
		onTryHit: function (target, source, move) {
			if (target === source || move.hasBounced || !move.flags['reflectable']) {
				return;
			}
			let newMove = this.getMoveCopy(move.id);
			newMove.hasBounced = true;
			this.useMove(newMove, target, source);
			return null;
		},
		onDamage: function (damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				return false;
			}
		},
		id: "regaleye",
		name: "Regal Eye",
	},
	//ArkenCiel
	"abyss": {
		isNonstandard: true,
		onDamage: function (damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				return false;
			}
		},
		onModifyPriority: function (priority, pokemon, target, move) {
			if (move.priority !== 0) return -priority;
		},
		onModifyMove: function (move, pokemon) {
			if (move.type === 'Normal' && move.id !== 'naturalgift') {
				move.type = 'Ghost';
				if (move.category !== 'Status') pokemon.addVolatile('abyss');
			}
		},
		effect: {//duplicate key 'effect'
			duration: 1,
			onBasePowerPriority: 8,
			onBasePower: function (basePower, pokemon, target, move) {
				return this.chainModify([0x14CD, 0x1000]);
			},
		},
		onStart: function (target, source, effect) {
			this.addPseudoWeather('abyss', target);
			this.pseudoWeather['abyss'].duration = 0;
		},
		//effect: {//duplicate key 'effect'
			//duration: 0,
			//onModifyPriority: function (priority, pokemon, target, move) {
				//if (move.priority !== 0) return -priority;
			//},
		//},
		onEnd: function (pokemon, effect) {
			let target = pokemon.side.foe.active[pokemon.side.foe.active.length - 1 - pokemon.position];
			if (!target.hasAbility('abyss')) this.removePseudoWeather('abyss');
		},
		id: "abyss",
		name: "Abyss",
	},
	//Crystal Xman
	"tipper": {
		onModifyMove: function (move) {
			move.stab = 2;
		},
		onResidualOrder: 26,
		onResidualSubOrder: 1,
		onResidual: function (pokemon) {
			if (pokemon.activeTurns) {
				this.boost({spe:1});
			}
		},
		id: "tipper",
		name: "TIPPER!",
	},
	//Escoffier
	"sanic": {
		isNonstandard: true,
		onStart: function (pokemon) {
			this.boost({atk: 3, spa: 3, spe: 1});
		},
		onResidualOrder: 26,
		onResidualSubOrder: 1,
		onResidual: function (pokemon) {
			if (pokemon.activeTurns) {
				this.boost({spe:1});
			}
		},
		id: "sanic",
		name: "Sanic",
	 },
	//Skyla (Full)
	//Midnight Prof EXO // no longer staff
	/*"twilightshield": {
		isNonstandard: true,
		onCriticalHit: false,
		onTryHitPriority: 1,
		onTryHit: function (target, source, move) {
			if (target === source || move.hasBounced || !move.flags['reflectable']) {
				return;
			}
			let newMove = this.getMoveCopy(move.id);
			newMove.hasBounced = true;
			this.useMove(newMove, target, source);
			return null;
		},
		onAllyTryHitSide: function (target, source, move) {
			if (target.side === source.side || move.hasBounced || !move.flags['reflectable']) {
				return;
			}
			let newMove = this.getMoveCopy(move.id);
			newMove.hasBounced = true;
			this.useMove(newMove, target, source);
			return null;
		},
		effect: {
			duration: 1,
		},
		id: "twilightshield",
		name: "Twilight Shield",
	},*/
	//Pegasus jane
	"goddessofseas": {
		isNonstandard: true,
		onStart: function (pokemon) {
			this.boost({def: 2, spd: 2});
			this.setWeather('primordialsea');
		},
		onAnySetWeather: function (target, source, weather) {
			if (this.getWeather().id === 'primordialsea' && !(weather.id in {desolateland:1, primordialsea:1, deltastream:1})) return false;
		},
		onEnd: function (pokemon) {
			if (this.weatherData.source !== pokemon) return;
			for (let i = 0; i < this.sides.length; i++) {
				for (let j = 0; j < this.sides[i].active.length; j++) {
					let target = this.sides[i].active[j];
					if (target === pokemon) continue;
					if (target && target.hp && target.hasAbility('primordialsea')) {
						this.weatherData.source = target;
						return;
					}
				}
			}
			this.clearWeather();
		},
		onResidual: function (pokemon) {
			if (pokemon.status && this.isWeather(['raindance', 'primordialsea'])) {
				this.add('-activate', pokemon, 'ability: Goddess Of Seas');
				pokemon.cureStatus();
			}
		},
		onWeather: function (target, source, effect) {
			if (effect.id === 'raindance' || effect.id === 'primordialsea') {
				this.heal(target.maxhp / 16);
			} else if (effect.id === 'sunnyday' || effect.id === 'desolateland') {
				this.damage(target.maxhp / 8, target, target);
			}
		},
		onTryHit: function (target, source, move) {
			if (target !== source && move.type === 'Water') {
				if (!this.heal(target.maxhp / 4)) {
					this.add('-immune', target, '[msg]', '[from] ability: Goddess Of Seas');
				}
				return null;
			}
		},
		onBasePowerPriority: 7,
		onFoeBasePower: function (basePower, attacker, defender, move) {
			if (this.effectData.target !== defender) return;
			if (move.type === 'Fire') {
				return this.chainModify(1.25);
			}
		},
		onModifySpe: function (spe, pokemon) {
			if (this.isWeather(['raindance', 'primordialsea'])) {
				return this.chainModify(2);
			}
		},
		id: "goddessofseas",
		name: "Goddess Of Seas",
	},
	//Sam Crowe
	"crowebat": {
		isNonstandard: true,
		onModifyMove: function (move) {
			move.infiltrates = true;
		},
		onDamage: function (damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				return false;
			}
		},
		id: "crowebat",
		name: "Crowe Bat",
	},
	//Silveee
	"dankaura": {
		isNonstandard: true,
		onStart: function (pokemon) {
			this.add('-ability', pokemon, 'Dank Aura');
		},
		onAnyTryPrimaryHit: function (target, source, move) {
			if (target === source || move.category === 'Status') return;
			if (move.type === 'Dark') {
				source.addVolatile('aura');
			}
		},
		onModifyMove: function (move, pokemon) {
			if (move.type === 'Normal' && move.id !== 'naturalgift') {
				move.type = 'Fairy';
				if (move.category !== 'Status') pokemon.addVolatile('pixilate');
			}
		},
		effect: {
			duration: 1,
			onBasePowerPriority: 8,
			onBasePower: function (basePower, pokemon, target, move) {
				return this.chainModify([0x14CD, 0x1000]);
			},
		},
		id: "dankaura",
		name: "Dank Aura",
	},
	//stskymfall
	"fallingskies": {
		isNonstandard: true,
		onStart: function (pokemon) {
			this.useMove("gitgudfam", pokemon);
		},
		stopAttackEvents: true,
		id: "fallingskies",
		name: "Falling Skies",
	},
	//honorary mentions
	//Wando
	// no longer staff
	/*"memes": {
		isNonstandard: true,
		onStart: function (pokemon, source) {
			this.boost({atk: 6});
		},
		onModifyMove: function (move) {
			move.stab = 2;
		},
		onDamage: function (damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				return false;
			}
		},
		onFoeTrapPokemon: function (pokemon) {
			if (!pokemon.hasAbility('memes') && this.isAdjacent(pokemon, this.effectData.target)) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon: function (pokemon, source) {
			if (!source) source = this.effectData.target;
			if (!pokemon.hasAbility('memes') && this.isAdjacent(pokemon, source)) {
				pokemon.maybeTrapped = true;
			}
		},
		id: "memes",
		name: "memes",
	},*/
};
