import { getState, setState, deleteState, getUserData, saveUserData, globalStats, saveGlobalStats, userCache } from './state';
import { getLevelUpEvo, getExpType, getLevelUpMoves, expForLevel } from './pokemon';
import { type PokeRogueState, type PokemonEntry } from './types';
import { nameColor } from '../customization/custom-color';
import { refreshGamePage } from './render';
import { SHOP_ITEMS } from './items';

const LADDER_RESET_CONFIRM_WINDOW = 2 * 60 * 1000;
const pendingLadderResetConfirmations = new Map<ID, number>();

const notifyUser = (userId: string, message: string): void => {
	const targetSocket = Users.get(userId);
	if (targetSocket) {
		targetSocket.popup(`|html|${message}`);
		refreshGamePage(targetSocket);
	}
};

export const devCommands: Chat.ChatCommands = {
	givemoney(target, room, user) {
		this.checkCan("bypassall");
		let [name, amt] = target.split(',').map(s => s?.trim());
		if (!amt && !isNaN(parseInt(name))) { amt = name; name = user.id; }
		const tId = toID(name) || user.id;
		const s = getState(tId);
		if (s) {
			const amount = parseInt(amt || '1000');
			if (isNaN(amount) || amount <= 0) {
				return this.errorReply(`Amount must be a positive number.`);
			}
			s.money = (s.money ?? 0) + amount;
			setState(tId, s);
			this.sendReply(`Gave $${amount} to ${tId}.`);
			const staffName = nameColor(user.name, false, true);
			notifyUser(tId, `You have been given <b>$${amount}</b> by ${staffName}.`);
		} else {
			return this.errorReply(`${tId} does not have an active run.`);
		}
	},

	removemoney(target, room, user) {
		this.checkCan("bypassall");
		let [name, amt] = target.split(',').map(s => s?.trim());
		if (!amt && !isNaN(parseInt(name))) { amt = name; name = user.id; }
		const tId = toID(name) || user.id;
		const s = getState(tId);
		if (s) {
			const amount = parseInt(amt || '1000');
			if (isNaN(amount) || amount <= 0) {
				return this.errorReply(`Amount must be a positive number.`);
			}
			s.money = Math.max(0, (s.money ?? 0) - amount);
			setState(tId, s);
			this.sendReply(`Removed $${amount} from ${tId}.`);
			const staffName = nameColor(user.name, false, true);
			notifyUser(tId, `${staffName} has removed <b>$${amount}</b> from you.`);
		} else {
			return this.errorReply(`${tId} does not have an active run.`);
		}
	},

	giveitem(target, room, user) {
		this.checkCan("bypassall");
		let [name, itemName, amt] = target.split(',').map(s => s?.trim());

		if (!amt && itemName && !isNaN(parseInt(itemName))) {
			amt = itemName;
			itemName = name;
			name = user.id;
		} else if (!itemName && !amt) {
			itemName = name;
			name = user.id;
			amt = '1';
		}

		if (!itemName) return this.errorReply(`Usage: /pokerogue giveitem [user], [item], [amount]`);

		const tId = toID(name) || user.id;
		const s = getState(tId);
		if (!s) return this.errorReply(`${tId} does not have an active run.`);

		const itemKey = toID(itemName);
		const item = SHOP_ITEMS[itemKey];

		if (!item) return this.errorReply(`Item "${itemName}" does not exist in the PokéRogue Shop DB.`);

		const amount = parseInt(amt || '1');
		if (isNaN(amount) || amount <= 0) return this.errorReply(`Amount must be a positive number.`);

		if (item.type === 'pokeball') {
			s.inventory = s.inventory || {};
			const current = s.inventory[itemKey] || 0;
			const maxStack = item.maxStack ?? 99;
			const added = Math.min(amount, maxStack - current);

			if (added <= 0) return this.errorReply(`${tId} is already at the maximum stack size for ${item.name}.`);
			s.inventory[itemKey] = current + added;

			this.sendReply(`Gave ${added}x ${item.name} to ${tId}.`);
			notifyUser(tId, `${nameColor(user.name, false, true)} gave you <b>${added}x ${item.name}</b>.`);
		} else if (item.type === 'key') {
			s.keyItems = s.keyItems || {};
			const current = s.keyItems[item.name] || 0;
			const maxStack = item.maxStack ?? 1;
			const added = Math.min(amount, maxStack - current);

			if (added <= 0) return this.errorReply(`${tId} is already at the maximum stack size for ${item.name}.`);
			s.keyItems[item.name] = current + added;

			this.sendReply(`Gave ${added}x ${item.name} to ${tId}.`);
			notifyUser(tId, `${nameColor(user.name, false, true)} gave you <b>${added}x ${item.name}</b>.`);
		} else {
			return this.errorReply(`Only Pokeballs and Key Items can be directly given via this command.`);
		}

		setState(tId, s);
	},

	givevoucher(target, room, user) {
		this.checkCan("bypassall");
		let [name, type, amt] = target.split(',').map(s => s?.trim());

		const validTypes = ['regular', 'plus', 'premium', 'gold'];

		if (!amt && type && !isNaN(parseInt(type))) {
			amt = type;
			type = name;
			name = user.id;
		} else if (!type && !amt) {
			type = name;
			name = user.id;
			amt = '1';
		}

		type = type?.toLowerCase();
		if (!type || !validTypes.includes(type)) {
			return this.errorReply(`Usage: /pokerogue givevoucher [user], [type], [amount]. Valid types: regular, plus, premium, gold.`);
		}

		const tId = toID(name) || user.id;
		const userData = getUserData(tId);

		const amount = parseInt(amt || '1');
		if (isNaN(amount) || amount <= 0) return this.errorReply(`Amount must be a positive number.`);

		if (!userData.vouchers) userData.vouchers = { regular: 0, plus: 0, premium: 0, gold: 0 };
		
		userData.vouchers[type as keyof typeof userData.vouchers] = (userData.vouchers[type as keyof typeof userData.vouchers] || 0) + amount;
		saveUserData(tId);

		const displayType = type.charAt(0).toUpperCase() + type.slice(1);
		this.sendReply(`Gave ${amount}x Egg Voucher ${displayType} to ${tId}.`);
		notifyUser(tId, `${nameColor(user.name, false, true)} gave you <b>${amount}x Egg Voucher ${displayType}</b>.`);
	},

	addmon(target, room, user) {
		this.checkCan("bypassall");
		const [name, mon, lvl] = target.split(',').map(s => s?.trim() || '');
		const tId = toID(name) || user.id;
		let s = getState(tId);

		if (!s || s.gameOver) {
			const highestFloor = s?.highestFloor || 0;
			const displayName = s?.displayName || name;
			const recordTeam = s?.recordTeam || [];
			s = {
				floor: 1,
				gameMode: 'classic',
				team: [],
				money: 0,
				timesRerolled: 0,
				rotationalShop: [],
				keyItems: {},
				inventory: { pokeball: 5 },
				highestFloor,
				displayName,
				recordTeam,
			} as PokeRogueState;
		}

		if (s.pendingChoiceType === 'starter') {
			delete s.pendingChoiceType;
			s.pendingChoice = [];
		}

		if (s.team.length >= 6) return this.errorReply(`${tId}'s team is full.`);
		const species = Dex.species.get(toID(mon));
		if (!species.exists) return this.errorReply("Invalid Pokémon.");

		const level = parseInt(lvl) || 1;
		let finalSpecies: string = species.id;
		while (true) {
			const evo = getLevelUpEvo(finalSpecies);
			if (!evo || level < evo.evoLevel) break;
			finalSpecies = evo.evoTo;
		}

		const finalExpType = getExpType(finalSpecies);
		const moves = getLevelUpMoves(finalSpecies, level);
		const natures = Dex.natures.all().map(n => n.name);
		const displayNature = natures[Math.floor(Math.random() * natures.length)] ?? 'Hardy';
		const gender = species.gender || (Math.random() < 0.5 ? 'M' : 'F');

		s.team.push({
			species: finalSpecies,
			level,
			exp: expForLevel(level, finalExpType),
			expType: finalExpType,
			moves,
			nature: displayNature,
			ability: (Dex.species.get(finalSpecies).abilities as any)['0'] || '',
			ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
			evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
			gender: gender as any,
			teraType: Dex.species.get(finalSpecies).types[0],
			happiness: 120,
			shiny: false,
			ball: 'masterball',
			originalTrainer: s.displayName || tId,
			otId: '000000',
			metLevel: level,
			metLocation: 'Dev Command',
			metDate: Date.now(),
			marks: [],
		} as PokemonEntry);

		setState(tId, s);
		this.sendReply(`Added ${finalSpecies} to ${tId}'s team.`);
		const staffName = nameColor(user.name, false, true);
		const speciesName = Dex.species.get(toID(finalSpecies)).name;
		notifyUser(tId, `${staffName} added <b>${speciesName}</b> to your PokéRogue team.`);
	},

	setfloor(target, room, user) {
		this.checkCan("bypassall");
		let [name, fl] = target.split(',').map(s => s?.trim());
		if (!fl && !isNaN(parseInt(name))) { fl = name; name = user.id; }
		const tId = toID(name) || user.id;
		const s = getState(tId);
		if (s) {
			const floor = parseInt(fl || '1');
			if (isNaN(floor) || floor < 1) {
				return this.errorReply(`Floor must be a positive number.`);
			}
			s.floor = floor;
			setState(tId, s);
			this.sendReply(`Set floor for ${tId} to ${floor}.`);
			const staffName = nameColor(user.name, false, true);
			notifyUser(tId, `Your PokéRogue floor has been set to <b>${floor}</b> by ${staffName}.`);
		} else {
			return this.errorReply(`${tId} does not have an active run.`);
		}
	},

	healteam(target, room, user) {
		this.checkCan("bypassall");
		const tId = toID(target) || user.id;
		const s = getState(tId);
		if (s) {
			for (const m of s.team) {
				m.currentHp = 100;
				delete m.status;
			}
			setState(tId, s);
			this.sendReply(`Healed team for ${tId}.`);
			const staffName = nameColor(user.name, false, true);
			notifyUser(tId, `Your PokéRogue team has been fully healed by ${staffName}.`);
		} else {
			return this.errorReply(`${tId} does not have an active run.`);
		}
	},

	removemon(target, room, user) {
		this.checkCan("bypassall");
		const tId = toID(target) || user.id;
		if (getState(tId)) {
			deleteState(tId);
			this.sendReply(`Wiped active run data for ${tId}.`);
			const staffName = nameColor(user.name, false, true);
			notifyUser(tId, `Your PokéRogue run has been wiped by ${staffName}.`);
		} else {
			return this.errorReply(`${tId} does not have an active run.`);
		}
	},

	resetladder(target, room, user) {
		this.checkCan("bypassall");
		const trimmedTarget = target.trim();
		if (!trimmedTarget) {
			return this.errorReply(`Usage: /pokerogue resetladder [user|all]`);
		}

		const [scope, ...rest] = trimmedTarget.split(' ').map(t => t.trim()).filter(Boolean);
		const normalizedScope = toID(scope);

		if (normalizedScope === 'all') {
			const token = toID(rest[0] || '');
			const now = Date.now();
			const pendingAt = pendingLadderResetConfirmations.get(user.id);
			if (token !== 'confirm') {
				pendingLadderResetConfirmations.set(user.id, now);
				return this.errorReply(
					`This will reset highestFloor and recordTeam for every PokéRogue user. ` +
					`If you're sure, run /pokerogue resetladder all confirm within 2 minutes.`
				);
			}
			if (!pendingAt || now - pendingAt > LADDER_RESET_CONFIRM_WINDOW) {
				pendingLadderResetConfirmations.delete(user.id);
				return this.errorReply(
					`No pending ladder reset confirmation found. Run /pokerogue resetladder all first.`
				);
			}
			pendingLadderResetConfirmations.delete(user.id);

			const staffName = nameColor(user.name, false, true);
			let affectedUsers = 0;

			for (const key in globalStats) {
				delete globalStats[key];
			}

			for (const userid in userCache) {
				const userData = userCache[userid];
				for (const mode in userData.runs) {
					if (userData.runs[mode as any]) {
						userData.runs[mode as any]!.highestFloor = 0;
						userData.runs[mode as any]!.recordTeam = [];
					}
				}
				notifyUser(userid, `Your PokéRogue ladder data has been reset by ${staffName}.`);
				affectedUsers++;
			}

			saveAllData();
			this.modlog('POKEROGUE RESETLADDER ALL');
			this.privateModAction(`${user.name} reset PokéRogue ladder data (highestFloor and recordTeam) for ${affectedUsers} user(s).`);
			return this.sendReply(`Reset PokéRogue ladder data for ${affectedUsers} user(s).`);
		}

		const targetId = toID(trimmedTarget);
		if (!targetId) {
			return this.errorReply(`Usage: /pokerogue resetladder [user|all]`);
		}

		const state = getState(targetId);
		if (!state) return this.errorReply(`No active run found for ${targetId}.`);

		state.highestFloor = 0;
		state.recordTeam = [];
		if (globalStats[targetId]) delete globalStats[targetId];

		setState(targetId, state);
		saveGlobalStats();

		this.modlog('POKEROGUE RESETLADDER', targetId);
		this.privateModAction(`${user.name} reset PokéRogue ladder data for ${targetId}.`);
		const staffName = nameColor(user.name, false, true);
		notifyUser(targetId, `Your PokéRogue ladder data has been reset by ${staffName}.`);
		return this.sendReply(`Reset PokéRogue ladder data for ${targetId}.`);
	},
};
