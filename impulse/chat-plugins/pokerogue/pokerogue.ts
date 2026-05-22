import { Utils } from '../../../lib';
import { type PokemonEntry, type PokeRogueState, type StatusCondition, type GameMode, type ModeConfig } from './types';
import { type AIPokemonSet } from './pokemon';
import { MODE_CONFIGS, MODE_REGISTRY } from './config';
import { CATCH_RATES } from './pokemon-basic-data';
import { SHOP_ITEMS, genItem } from './items';
import {
	getState, setState, deleteState, saveAllData,
	getUserData, saveUserData, globalStats, saveGlobalStats, setActiveMode,
} from './state';
import {
	pickStarterOptions, expForLevel, applyExpAndLevelUp, getLevelUpEvo,
	getLevelUpMoves, getMovesLearnedBetween, calcKillExp, getExpType, getExpYield, botLevel,
	packTeam, genPokemon, getRewardMoney, getItemPrice, getRerollCost, generateDraftOptions,
	getLevelScaling
} from './pokemon';
import { activeMatches, startBattle, destroyBotUser } from './battle';
import { renderGamePage, refreshGamePage } from './render';
import { devCommands } from './dev-tools';

const LADDER_RESET_CONFIRM_WINDOW = 2 * 60 * 1000;
const pendingLadderResetConfirmations = new Map<ID, number>();

const EXP_SHARE_NAME = 'Exp. All';
const EV_STAT_LABELS: Record<string, string> = {
	hp: 'HP', atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed',
};
const MAX_EV_TOTAL = 508;
const MAX_EV_STAT = 252;
const EV_VITAMIN_GAIN = 10;

const RESIDUAL_FROM_TAGS: Record<string, true> = {
	'Leech Seed': true, 'Salt Cure': true, 'Infestation': true, 'Whirlpool': true,
	'Bind': true, 'Wrap': true, 'Clamp': true, 'Fire Spin': true, 'Sand Tomb': true,
	'Magma Storm': true, 'Snap Trap': true, 'Thunder Cage': true, 'Octolock': true,
	'Curse': true, 'Nightmare': true, 'Bad Dreams': true, 'Perish Song': true,
	'Future Sight': true, 'Doom Desire': true,
};

const SELF_KO_MOVES = new Set([
	'explosion', 'selfdestruct', 'mistyexplosion', 'memento',
	'healingwish', 'lunardance', 'finalgambit',
]);

function repairEmptyPendingChoice(state: PokeRogueState, userId: string): void {
	if (!state.pendingChoice || state.pendingChoice.length) return;
	const modeData = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];
	state.pendingChoice = pickStarterOptions(modeData.starters);
	setState(userId, state);
}

function isBossFloorBoundary(floor: number, bossInterval = 10): boolean {
	return floor % bossInterval === 0;
}

function parseFloorRange(range: string): { start: number, end: number } | null {
	const match = /^(\d+)-(\d+)$/.exec(range.trim());
	if (!match) return null;
	return { start: parseInt(match[1]), end: parseInt(match[2]) };
}

function pickNextBiome(
	currentBiome: string,
	data: { transitions: Record<string, { biome: string, weight: number }[]>, excludedBiomes?: string[], biomes: Record<string, any> },
	startingBiome: string
): string {
	const excluded = new Set(data.excludedBiomes ?? []);
	const options = (data.transitions[currentBiome] ?? []).filter(t => !excluded.has(t.biome));

	if (options.length > 0) {
		const totalWeight = options.reduce((sum, t) => sum + t.weight, 0);
		let roll = Math.random() * totalWeight;
		for (const t of options) {
			roll -= t.weight;
			if (roll <= 0) return t.biome;
		}
		return options[options.length - 1].biome;
	}

	const fallbackOptions = Object.keys(data.biomes).filter(b => b !== startingBiome && !excluded.has(b));
	return fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)] || startingBiome;
}

function clearStaleBattleRoom(state: PokeRogueState, userId: string): void {
	if (!state.battleRoomId) return;
	const bRoom = Rooms.get(state.battleRoomId as RoomID);
	if (!bRoom?.battle || bRoom.battle.ended) {
		delete state.battleRoomId;
		setState(userId, state);
	}
}

function processLevelUp(
	mon: PokemonEntry,
	oldLevel: number,
	oldSpecies: string,
	evolved: boolean,
	teamIdx: number,
	state: PokeRogueState,
	genNumber: number,
): string[] {
	const detailMsgs: string[] = [];

	const oldName = Dex.species.get(toID(oldSpecies)).name;
	const currentName = Dex.species.get(toID(mon.species)).name;

	if (evolved) {
		detailMsgs.push(`&nbsp;&nbsp;↳ <b>${oldName}</b> evolved into <b>${currentName}</b> and reached Lv. ${mon.level}!`);
	} else if (mon.level > oldLevel) {
		detailMsgs.push(`&nbsp;&nbsp;↳ <b>${currentName}</b> reached Lv. ${mon.level}!`);
	}

	if (!mon.moves) mon.moves = getLevelUpMoves(mon.species, oldLevel, genNumber);

	const newMoves = getMovesLearnedBetween(oldSpecies, oldLevel, mon.level, false, genNumber);
	if (evolved) {
		const evoMoves = getMovesLearnedBetween(mon.species, oldLevel, mon.level, true, genNumber);
		for (const m of evoMoves) if (!newMoves.includes(m)) newMoves.push(m);
	}

	state.pendingMoves = state.pendingMoves ?? [];

	for (const move of newMoves) {
		if (mon.moves.includes(move)) continue;
		if (state.pendingMoves.some(p => p.pokemonIndex === teamIdx && p.move === move)) continue;

		if (mon.moves.length < 4) {
			mon.moves.push(move);
			detailMsgs.push(`&nbsp;&nbsp;↳ <b>${currentName}</b> learned <b>${Dex.moves.get(move).name}</b>!`);
		} else {
			state.pendingMoves.push({ pokemonIndex: teamIdx, move, speciesName: mon.species });
		}
	}

	return detailMsgs;
}

function parseKillExp(
	logLines: string[],
	state: PokeRogueState,
	floor: number,
	isBossFloor: boolean,
	isTrainerBattle: boolean
): { expMap: Map<number, number>, baseShareExpMap: Map<number, number> } {
	const expMap = new Map<number, number>();
	const baseShareExpMap = new Map<number, number>();

	for (const line of logLines) {
		if (!line.includes('PR_EXP|')) continue;

		const parts = line.split('|');
		const dataIndex = parts.indexOf('PR_EXP') + 1;
		const enemySpecies = parts[dataIndex];
		const enemyLevel = parseInt(parts[dataIndex + 1]);
		const participantSpeciesIds = parts[dataIndex + 2] ? parts[dataIndex + 2].split(',') : [];

		const participantIndices = new Set<number>();
		for (const sid of participantSpeciesIds) {
			const idx = state.team.findIndex(m => toID(m.species) === sid && (m.currentHp ?? 100) > 0);
			if (idx !== -1) participantIndices.add(idx);
		}

		if (participantIndices.size === 0 && state.team.length > 0) {
			participantIndices.add(0);
		}

		const validParticipantCount = Math.max(1, participantIndices.size);
		const b = getExpYield(enemySpecies);

		const a = (isBossFloor || isTrainerBattle) ? 1.5 : 1;
		const rawKillExp = Math.floor(Math.floor((b * enemyLevel) / 5 + 1) * a);
		const basePerParticipant = Math.max(1, Math.floor(rawKillExp / validParticipantCount));

		for (const teamIdx of participantIndices) {
			const mon = state.team[teamIdx];
			if (!mon) continue;
			const hasLuckyEgg = mon.heldItem === 'luckyegg';
			const exp = calcKillExp(enemySpecies, enemyLevel, validParticipantCount, isBossFloor, hasLuckyEgg, isTrainerBattle);
			expMap.set(teamIdx, (expMap.get(teamIdx) ?? 0) + exp);
		}

		for (let i = 0; i < state.team.length; i++) {
			if (participantIndices.has(i)) continue;
			if ((state.team[i].currentHp ?? 100) <= 0) continue;
			baseShareExpMap.set(i, (baseShareExpMap.get(i) ?? 0) + basePerParticipant);
		}
	}

	return { expMap, baseShareExpMap };
}

function applyExpShare(
	expMap: Map<number, number>,
	baseShareExpMap: Map<number, number>,
	state: PokeRogueState,
): Map<number, number> {
	const expAllItem = Object.values(SHOP_ITEMS).find(i => i.name === EXP_SHARE_NAME);
	const expAllMax = expAllItem?.maxStack ?? 5;
	const expAllStacks = Math.min(expAllMax, state.keyItems?.[EXP_SHARE_NAME] || 0);
	const expCharmStacks = state.keyItems?.['Exp. Charm'] || 0;
	const charmMult = expCharmStacks > 0 ? (1 + 0.25 * expCharmStacks) : 1;
	const result = new Map<number, number>();
	for (const [teamIdx, baseExp] of expMap) {
		result.set(teamIdx, Math.max(1, Math.floor(baseExp * charmMult)));
	}
	if (expAllStacks === 0) return result;
	for (const [teamIdx, basePerParticipant] of baseShareExpMap) {
		if (expMap.has(teamIdx)) continue;
		const mon = state.team[teamIdx];
		if (!mon || (mon.currentHp ?? 100) <= 0) continue;
		let benchedExp = Math.floor(basePerParticipant * expAllStacks * 0.2);
		const hasLuckyEgg = mon.heldItem === 'luckyegg';
		if (hasLuckyEgg) benchedExp = Math.floor(benchedExp * 1.4);
		benchedExp = Math.max(1, Math.floor(benchedExp * charmMult));
		result.set(teamIdx, benchedExp);
	}
	return result;
}

function processBattleExperience(
	logLines: string[],
	state: PokeRogueState,
	floor: number,
	isBossFloor: boolean,
	isTrainerBattle: boolean,
	config: ModeConfig
): string[] {
	const detailMsgs: string[] = [];
	const { expMap: rawExpMap, baseShareExpMap } = parseKillExp(logLines, state, floor, isBossFloor, isTrainerBattle);
	const expMap = applyExpShare(rawExpMap, baseShareExpMap, state);

	if (expMap.size > 0) {
		for (const [teamIdx, expGained] of expMap) {
			const mon = state.team[teamIdx];
			if (!mon || (mon.currentHp ?? 100) === 0) continue;

			const oldSpecies = mon.species;
			const spName = Dex.species.get(toID(oldSpecies)).name;

			const isActive = rawExpMap.has(teamIdx);
			const sourceTag = !isActive ? ' <span style="color:#8ab4f8;font-size:10px">(Exp. All)</span>' : '';

			detailMsgs.push(`<b>${spName}</b> gained ${expGained} Exp.${sourceTag}`);

			const { evolved, oldLevel } = applyExpAndLevelUp(mon, expGained, floor, config);
			detailMsgs.push(...processLevelUp(mon, oldLevel, oldSpecies, evolved, teamIdx, state, config.generation || 9));
		}
	}

	return detailMsgs;
}

function syncBattleOutcome(
	logLines: string[],
	state: PokeRogueState,
): { consumedItems: string[] } {
	const slotToTeamIdx: Record<string, number> = {};
	const activelyAssigned = new Set<number>();
	const teamHp: Record<number, number> = {};
	const teamStatus: Record<number, StatusCondition | ''> = {};
	const faintedIndices = new Set<number>();
	const idxOf = (slot: string): number | undefined => slotToTeamIdx[slot];

	for (const line of logLines) {
		const switchMatch = /^\|(?:switch|drag|replace)\|p1([a-z]): [^|]+\|([^|,]+)[^|]*\|(\d+)(?:\/\d+)?/.exec(line);
		if (switchMatch) {
			const slot = 'p1' + switchMatch[1];
			const sid = toID(switchMatch[2].trim());
			const hp = parseInt(switchMatch[3]);

			const prev = slotToTeamIdx[slot];
			if (prev !== undefined) activelyAssigned.delete(prev);

			let matched = -1;
			for (let i = 0; i < state.team.length; i++) {
				if (!activelyAssigned.has(i) && toID(state.team[i].species) === sid && !faintedIndices.has(i) && (state.team[i].currentHp ?? 100) > 0) {
					matched = i;
					break;
				}
			}

			if (matched !== -1) {
				slotToTeamIdx[slot] = matched;
				activelyAssigned.add(matched);
				teamHp[matched] = hp;

				const statusInSwitch = /\|\d+\/\d+ (brn|psn|tox|par|slp|frz)/.exec(line);
				teamStatus[matched] = statusInSwitch ? statusInSwitch[1] as StatusCondition : (teamStatus[matched] ?? '');
			}
			continue;
		}

		const hpMatch = /^\|(?:-damage|-heal)\|p1([a-z]): [^|]+\|(\d+)(?:\/\d+)?( (brn|psn|tox|par|slp|frz))?/.exec(line);
		if (hpMatch) {
			const idx = idxOf('p1' + hpMatch[1]);
			if (idx !== undefined) {
				teamHp[idx] = parseInt(hpMatch[2]);
				if (hpMatch[4]) teamStatus[idx] = hpMatch[4].trim() as StatusCondition;
			}
			continue;
		}

		const statusApply = /^\|-status\|p1([a-z]): [^|]+\|(brn|psn|tox|par|slp|frz)/.exec(line);
		if (statusApply) {
			const idx = idxOf('p1' + statusApply[1]);
			if (idx !== undefined) teamStatus[idx] = statusApply[2] as StatusCondition;
			continue;
		}

		const statusCure = /^\|-curestatus\|p1([a-z]): /.exec(line);
		if (statusCure) {
			const idx = idxOf('p1' + statusCure[1]);
			if (idx !== undefined) teamStatus[idx] = '';
			continue;
		}

		const faintP1 = /^\|faint\|p1([a-z]):/.exec(line);
		if (faintP1) {
			const slot = 'p1' + faintP1[1];
			const idx = idxOf(slot);
			if (idx !== undefined) {
				teamHp[idx] = 0;
				teamStatus[idx] = '';
				faintedIndices.add(idx);
				activelyAssigned.delete(idx);
				delete slotToTeamIdx[slot];
			}
			continue;
		}
	}

	for (const [idxStr, hp] of Object.entries(teamHp)) {
		const idx = Number(idxStr);
		const mon = state.team[idx];
		if (!mon) continue;

		if (faintedIndices.has(idx)) {
			mon.currentHp = 0;
		} else {
			const spData = Dex.species.get(toID(mon.species));
			const bs = spData.baseStats ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
			const ivHp = mon.ivs?.hp ?? 31;
			const evHp = mon.evs?.hp ?? 0;
			const maxHp = spData.id === 'shedinja' ? 1 : Math.floor((2 * bs.hp + ivHp + Math.floor(evHp / 4)) * mon.level / 100) + mon.level + 10;
			
			mon.currentHp = Math.max(1, Math.round((hp / maxHp) * 100));
			if (mon.currentHp > 100) mon.currentHp = 100;
		}
	}
	for (const idx of faintedIndices) {
		state.team[idx].currentHp = 0;
	}

	for (const [idxStr, status] of Object.entries(teamStatus)) {
		const idx = Number(idxStr);
		if (status) {
			state.team[idx].status = status;
		} else {
			delete state.team[idx].status;
		}
	}

	const consumedItems: string[] = [];
	const itemSlotMap: Record<string, number> = {};
	const itemAssigned = new Set<number>();
	for (const line of logLines) {
		const sw = /^\|(?:switch|drag|replace)\|p1([a-z]): [^|]+\|([^|,]+)/.exec(line);
		if (sw) {
			const slot = 'p1' + sw[1];
			const sid = toID(sw[2].trim());
			const prev = itemSlotMap[slot];
			if (prev !== undefined) itemAssigned.delete(prev);
			const logBase = toID(Dex.species.get(sid).baseSpecies || sid);
			for (let i = 0; i < state.team.length; i++) {
				const teamBase = toID(Dex.species.get(state.team[i].species).baseSpecies || state.team[i].species);
				if (!itemAssigned.has(i) && teamBase === logBase && !faintedIndices.has(i) && (state.team[i].currentHp ?? 100) > 0) {
					itemSlotMap[slot] = i;
					itemAssigned.add(i);
					break;
				}
			}
			continue;
		}
		const endItemMatch = /^\|-enditem\|p1([a-z]): [^|]+\|([^|]+)/.exec(line);
		if (endItemMatch) {
			if (line.includes('[from] move: Knock Off') || line.includes('[from] move: Thief') || line.includes('[from] move: Incinerate')) continue;
			const slot = 'p1' + endItemMatch[1];
			const itemId = toID(endItemMatch[2].trim());
			const teamIdx = itemSlotMap[slot];
			if (teamIdx !== undefined && state.team[teamIdx].heldItem === itemId) {
				delete state.team[teamIdx].heldItem;
				const dexItem = Dex.items.get(itemId);
				consumedItems.push(dexItem.name || itemId);
			}
			continue;
		}
		const itemMatch = /^\|-item\|p1([a-z]): [^|]+\|([^|]+)/.exec(line);
		if (itemMatch) {
			const slot = 'p1' + itemMatch[1];
			const itemId = toID(itemMatch[2].trim());
			const teamIdx = itemSlotMap[slot];
			if (teamIdx !== undefined) {
				state.team[teamIdx].heldItem = itemId;
				const dexItem = Dex.items.get(itemId);
				const consumedIdx = consumedItems.indexOf(dexItem.name || itemId);
				if (consumedIdx > -1) {
					consumedItems.splice(consumedIdx, 1);
				}
			}
			continue;
		}
	}

	return { consumedItems };
}

function processFloorRewards(
	state: PokeRogueState,
	clearedFloor: number,
	config: ModeConfig,
	userId: string
): { extraNotifs: string[] } {
	const extraNotifs: string[] = [];
	if (clearedFloor > (state.highestFloor ?? 0)) {
		state.highestFloor = clearedFloor;
		state.recordTeam = JSON.parse(JSON.stringify(state.team));
		globalStats[userId] = {
			highestFloor: clearedFloor,
			displayName: state.displayName || userId,
			recordTeam: state.recordTeam,
		};
		saveGlobalStats();
	}
	if (config.milestoneRewards) {
		for (const reward of config.milestoneRewards) {
			const trigger = reward.interval ? clearedFloor % reward.floor === 0 : clearedFloor === reward.floor;
			if (trigger) {
				if (reward.itemType === 'keyItem') {
					state.keyItems = state.keyItems ?? {};
					const shopItemEntry = Object.values(SHOP_ITEMS).find(item => item.name === reward.itemName);
					const maxStack = shopItemEntry?.maxStack ?? 1;
					let added = 0;
					for (let i = 0; i < reward.amount; i++) {
						const currentCount = state.keyItems[reward.itemName] || 0;
						if (currentCount >= maxStack) continue;
						state.keyItems[reward.itemName] = currentCount + 1;
						added++;
					}
					if (added > 0) {
						extraNotifs.push(`<div style="text-align: center;"><b>Milestone Reward: Received ${added}x ${reward.itemName} for clearing Floor ${clearedFloor}!</b></div>`);
					}
				} else if (reward.itemType === 'inventory') {
					const ballType = reward.itemName.replace(' ', '').toLowerCase();
					state.inventory = state.inventory || {};
					state.inventory[ballType] = (state.inventory[ballType] || 0) + reward.amount;
					extraNotifs.push(`<div style="text-align: center;"><b>Milestone Reward: Received ${reward.amount}x ${reward.itemName} for clearing Floor ${clearedFloor}!</b></div>`);
				}
			}
		}
	}
	if (isBossFloorBoundary(clearedFloor, config.bossInterval)) {
		for (const mon of state.team) {
			mon.currentHp = 100;
			delete mon.status;
		}
		extraNotifs.push(`<div style="text-align: center;"><b>Zone Boss Defeated! Full heal!</b></div>`);
	}
	return { extraNotifs };
}

function handleBattleLoss(state: PokeRogueState, floor: number, userId: string): void {
	delete state.pendingMoves;
	delete state.pendingSwap;
	delete state.moveToLearn;
	delete state.pendingItemName;
	delete state.itemOptions;
	delete state.purchasedItem;
	delete state.caughtPokemon;
	delete state.pendingTrainer;
	delete state.pendingTrainerKey;
	delete state.pendingRewardDraft;
	delete state.rerollCount;

	if (state.keyItems?.['Revive'] > 0) {
		state.keyItems['Revive']--;
		state.notification = (state.notification ?? '') +
			`<br><b>Revive used!</b> Retrying Floor ${floor}`;
	} else {
		if (floor > (state.highestFloor ?? 0)) {
			state.highestFloor = floor;
			state.recordTeam = JSON.parse(JSON.stringify(state.team));

			globalStats[userId] = {
				highestFloor: floor,
				displayName: state.displayName || userId,
				recordTeam: state.recordTeam,
			};
			saveGlobalStats();
		}
		state.gameOver = true;
		state.lastRunFloor = floor;
		state.floor = 1;
		state.team = [];
	}
}

export const commands: Chat.ChatCommands = {
	pokerogue: {
		newgame(target, room, user) {
			const targetParts = target.trim().toLowerCase().split(' ');
			const isConfirm = targetParts.includes('confirm');
			let modeStr = targetParts[0];
			if (isConfirm && targetParts.length > 1) {
				modeStr = targetParts.find(p => p !== 'confirm') || 'classic';
			}

			const requestedMode = (modeStr || 'classic') as GameMode;
			const finalMode = MODE_CONFIGS[requestedMode] ? requestedMode : 'classic';

			const userData = getUserData(user.id);
			const existingInMode = userData.runs[finalMode];

			if (existingInMode?.gameOver || existingInMode?.gameWon) {
				delete existingInMode.gameOver;
				delete existingInMode.gameWon;
				delete existingInMode.lastRunFloor;
				existingInMode.floor = 1;
				setState(user.id, existingInMode);
			}

			const hasProgress = existingInMode && (existingInMode.team?.length > 0 || (existingInMode.floor ?? 1) > 1);

			if (hasProgress && !isConfirm) {
				return this.sendReplyBox(`<b>Warning: Run in progress for ${finalMode}!</b><br><button name="send" value="/pokerogue newgame ${finalMode} confirm" class="button">Yes, start fresh</button>`);
			}

			const config = MODE_CONFIGS[finalMode];
			const modeData = MODE_REGISTRY[finalMode] || MODE_REGISTRY['classic'];
			const modeStarters = modeData.starters;
			const useNewStarterSelectionUI = modeData.useNewStarterSelectionUI !== false;
			const unlockedStarterIds = Object.keys(userData.starters || {});
			const starterPool = useNewStarterSelectionUI ?
				[...new Set([...modeStarters, ...unlockedStarterIds])] :
				modeStarters;

			const highestFloor = existingInMode?.highestFloor || 0;
			const displayName = existingInMode?.displayName || user.name;
			const recordTeam = existingInMode?.recordTeam || [];

			const newState: PokeRogueState = {
				floor: 1,
				gameMode: finalMode,
				currentBiome: config.startingBiome,
				team: [],
				money: config.economy.startingMoney || 0,
				timesRerolled: 0,
				rotationalShop: [],
				keyItems: { ...(config.economy.startingKeyItems || {}) },
				inventory: { ...(config.economy.startingInventory || {}) },
				pendingChoice: useNewStarterSelectionUI ? starterPool : pickStarterOptions(starterPool),
				pendingChoiceType: 'starter',
				highestFloor,
				displayName,
				recordTeam,
			};

			(newState as any).view = useNewStarterSelectionUI ? 'starterselect' : 'main';
			setState(user.id, newState);
			return this.parse('/pokerogue start');
		},

		start(target, room, user) {
			if (!user.named) return this.errorReply("Login required.");
			let state = getState(user.id);

			if (state?.battleRoomId) {
				const bRoom = Rooms.get(state.battleRoomId as RoomID);
				if (!bRoom?.battle || bRoom.battle.ended) {
					state = {
						...state,
						battleRoomId: undefined,
					} as PokeRogueState;
				}
			}

			const hasActiveRun = state && (
				(state.team?.length > 0) ||
				((state.floor ?? 1) > 1) ||
				(state.pendingChoice?.length ?? 0) > 0
			);
			const isGameOver = state?.gameOver;

			if (!state || (!hasActiveRun && !isGameOver)) {
				const highestFloor = state?.highestFloor || 0;
				const displayName = state?.displayName || user.name;
				const recordTeam = state?.recordTeam || [];
				const isFirstEverVisit = !state && highestFloor === 0;

				const defaultConfig = MODE_CONFIGS['classic'];

				state = {
					floor: 1,
					gameMode: 'classic',
					currentBiome: defaultConfig.startingBiome,
					team: [],
					money: defaultConfig.economy.startingMoney || 0,
					timesRerolled: 0,
					rotationalShop: [],
					keyItems: { ...(defaultConfig.economy.startingKeyItems || {}) },
					inventory: { ...(defaultConfig.economy.startingInventory || {}) },
					highestFloor,
					displayName,
					recordTeam,
					view: isFirstEverVisit ? 'welcome' : 'main',
				} as PokeRogueState;

				setState(user.id, state);
			}

			if (state.view !== 'welcome') {
				repairEmptyPendingChoice(state, user.id);
			}

			return this.parse('/join view-pokerogue');
		},

		prebattle(target, room, user) {
			if (!user.named) return this.errorReply("Login required.");
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');
			if (state.gameOver) return this.errorReply("The run is over. Start a new run first.");

			clearStaleBattleRoom(state, user.id);

			if (state.pendingChoice?.length || state.pendingMoves?.length || state.pendingSwap ||
				state.moveToLearn || state.pendingItemName || state.itemOptions?.length || state.pendingConsumableType || state.pendingRewardDraft?.length) {
				return this.errorReply("Resolve all pending choices before starting a battle.");
			}

			if (!state.team.some(m => (m.currentHp ?? 100) > 0)) {
				return this.errorReply("All your Pokémon have fainted! Buy a Revive from the shop before battling.");
			}

			if (state.battleRoomId) {
				return this.errorReply("You are already in a battle.");
			}

			if (state.pendingTrainer && state.pendingTrainerKey) {
				const nextState = {
					...state,
					view: 'trainer' as const,
				};
				setState(user.id, nextState);
				refreshGamePage(user);
				return;
			}

			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			const data = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];

			const floor = state.floor;

			if (config.hasTrainers && data.resolveTrainer) {
				const resolvedTrainer = data.resolveTrainer(floor, state, config);

				if (resolvedTrainer) {
					state.pendingTrainer = resolvedTrainer.name;
					state.pendingTrainerKey = resolvedTrainer.key;

					const trainerData = data.trainers?.[resolvedTrainer.key]?.[resolvedTrainer.name];

					if (trainerData?.spriteUrl || trainerData?.dialog) {
						const nextState = {
							...state,
							view: 'trainer' as const,
						};
						setState(user.id, nextState);
						refreshGamePage(user);
						return;
					}
				}
			}

			setState(user.id, state);
			return this.parse('/pokerogue battle');
		},

		draft(target, room, user) {
			const state = getState(user.id);
			if (!state || state.view !== 'draft' || !state.pendingRewardDraft) return;

			const idx = parseInt(target.trim()) - 1;
			if (isNaN(idx) || idx < 0 || idx >= state.pendingRewardDraft.length) return;

			const itemKey = state.pendingRewardDraft[idx];
			const activeShop = MODE_REGISTRY[state.gameMode]?.shop || SHOP_ITEMS;
			const item = activeShop[itemKey];

			const clearedDraftState = {
				...state,
				pendingRewardDraft: undefined,
				rerollCount: undefined,
			};

			if (item.type === 'pokeball') {
				const currentInventory = clearedDraftState.inventory || {};
				const amountToGive = item.draftAmount ?? 1;

				const nextState = {
					...clearedDraftState,
					inventory: {
						...currentInventory,
						[itemKey]: (currentInventory[itemKey] || 0) + amountToGive,
					},
					notification: `You took ${amountToGive}x <b>${item.name}</b>!`,
					floor: clearedDraftState.floor + 1,
					view: 'main' as const,
				};
				setState(user.id, nextState);
			} else if (item.type === 'key') {
				const currentKeyItems = clearedDraftState.keyItems || {};
				const nextState = {
					...clearedDraftState,
					keyItems: {
						...currentKeyItems,
						[item.name]: (currentKeyItems[item.name] || 0) + 1,
					},
					notification: `Obtained Key Item: <b>${item.name}</b>!`,
					floor: clearedDraftState.floor + 1,
					view: 'main' as const,
				};
				setState(user.id, nextState);
			} else if (item.type === 'itemPack') {
				let updatedNotification = '';
				let updatedMoney = clearedDraftState.money || 0;
				if (itemKey === 'nugget') {
					updatedMoney += 5000;
					updatedNotification = `You sold the Nugget for $5000!`;
				} else if (itemKey === 'big_nugget') {
					updatedMoney += 20000;
					updatedNotification = `You sold the Big Nugget for $20,000!`;
				} else if (itemKey === 'starter_token') {
					updatedNotification = `You unlocked a new Starter!`;
				}
				
				const nextState = {
					...clearedDraftState,
					money: updatedMoney,
					notification: updatedNotification,
					floor: clearedDraftState.floor + 1,
					view: 'main' as const,
				};
				setState(user.id, nextState);
			} else if (item.type === 'item' || item.type === 'evolveItem') {
				const nextState = {
					...clearedDraftState,
					purchasedItem: itemKey,
					pendingItemName: item.name,
					pendingItemIsEvo: item.type === 'evolveItem',
					view: 'main' as const,
				};
				setState(user.id, nextState);
			} else if (['healHP', 'revive', 'cureStatus', 'vitamin', 'tm', 'candy', 'mint', 'teraShard'].includes(item.type)) {
				const nextState = {
					...clearedDraftState,
					purchasedItem: itemKey,
					pendingConsumableType: item.type as any,
					view: 'main' as const,
				};
				setState(user.id, nextState);
			}

			refreshGamePage(user);
		},

		buyshop(target, room, user) {
			const state = getState(user.id);
			if (!state || state.view !== 'draft') return;
			const itemKey = toID(target);
			const activeShop = MODE_REGISTRY[state.gameMode]?.shop || SHOP_ITEMS;
			const item = activeShop[itemKey];
			if (!item || !item.isShopItem) return this.errorReply("Unknown shop item.");
			const price = getItemPrice(state.floor, item.moneyMultiplier ?? 1.0);
			if ((state.money || 0) < price) return this.errorReply(`Not enough money! Need $${price}.`);
			
			const updatedMoney = (state.money || 0) - price;

			if (itemKey === 'sacredash') {
				for (const mon of state.team) {
					if ((mon.currentHp ?? 100) <= 0) {
						mon.currentHp = 100;
						mon.status = undefined;
					}
				}
				const nextState = {
					...state,
					money: updatedMoney,
					notification: `Sacred Ash revived all fainted Pokémon!`,
					view: 'draft' as const,
				};
				setState(user.id, nextState);
				refreshGamePage(user);
				return;
			}

			const nextState = {
				...state,
				money: updatedMoney,
				purchasedItem: itemKey,
				pendingItemName: item.type === 'item' ? item.name : undefined,
				pendingConsumableType: item.type !== 'item' ? item.type as any : undefined,
				view: 'main' as const,
			};
			setState(user.id, nextState);
			refreshGamePage(user);
		},

		saveslot(target, room, user) {
			const state = getState(user.id);
			if (!state || state.gameOver || state.battleRoomId) return this.errorReply("Cannot save right now.");

			if (state.pendingChoice?.length || state.pendingMoves?.length || state.pendingSwap ||
				state.moveToLearn || state.pendingItemName || state.itemOptions?.length || state.pendingConsumableType || state.pendingRewardDraft?.length) {
				return this.errorReply("You must resolve your pending choices before saving.");
			}

			const slot = parseInt(target.trim());
			if (isNaN(slot) || slot < 1 || slot > 3) return this.errorReply("Invalid save slot. Must be 1, 2, or 3.");

			const userData = getUserData(user.id);
			if (!userData.saveSlots) userData.saveSlots = {};

			userData.saveSlots[slot] = JSON.parse(JSON.stringify(state));
			saveUserData(user.id);

			state.notification = `Progress successfully saved to <b>Slot ${slot}</b>!`;
			(state as any).view = 'main';
			setState(user.id, state);
			refreshGamePage(user);
		},

		loadslot(target, room, user) {
			const slot = parseInt(target.trim());
			if (isNaN(slot) || slot < 1 || slot > 3) return this.errorReply("Invalid save slot. Must be 1, 2, or 3.");

			const userData = getUserData(user.id);
			const slotData = userData.saveSlots?.[slot];

			if (!slotData) return this.errorReply("That save slot is empty.");

			const currentState = getState(user.id);
			if (currentState?.battleRoomId) {
				const bRoom = Rooms.get(currentState.battleRoomId as RoomID);
				if (bRoom?.battle && !bRoom.battle.ended) {
					return this.errorReply("You cannot load a game while currently in a battle!");
				}
			}

			const restoredState = JSON.parse(JSON.stringify(slotData));
			userData.runs[restoredState.gameMode] = restoredState;
			userData.activeMode = restoredState.gameMode;
			delete userData.saveSlots[slot];

			saveUserData(user.id);

			const newState = getState(user.id);
			if (newState) {
				newState.notification = `Game loaded successfully from <b>Slot ${slot}</b>!`;
				(newState as any).view = 'main';
				setState(user.id, newState);
			}

			refreshGamePage(user);
		},

		status(target, room, user) {
			if (!this.runBroadcast()) return;
			const tId = toID(target) || user.id;
			const s = getState(tId);
			if (!s) return this.errorReply(`No run found for ${tId}.`);
			const buf = `<b>PokéRogue Status: ${tId}</b><br>Mode: ${s.gameMode || 'classic'} | Floor ${s.floor} | Money: $${s.money ?? 0}<br>${s.team.map(m => `Lv.${m.level} ${m.species}`).join(', ')}`;
			this.sendReplyBox(buf);
		},

		quit(target, room, user) {
			const s = getState(user.id);
			if (s?.battleRoomId) {
				const match = activeMatches.get(s.battleRoomId as RoomID);
				if (match) {
					const bot = Users.get(match.botUserId);
					if (bot) destroyBotUser(bot);
					activeMatches.delete(s.battleRoomId as RoomID);
				}
				Rooms.get(s.battleRoomId)?.battle?.forfeit(user);
			}
			if (s) {
				s.gameOver = true;
				s.lastRunFloor = s.floor;
				s.floor = 1;
				s.team = [];
				delete s.pendingMoves;
				delete s.pendingSwap;
				delete s.pendingChoice;
				delete s.moveToLearn;
				delete s.pendingItemName;
				delete s.itemOptions;
				delete s.purchasedItem;
				delete s.pendingConsumableType;
				delete s.pendingTrainer;
				delete s.pendingTrainerKey;
				delete s.pendingRewardDraft;
				delete s.rerollCount;
				setState(user.id, s);
			}
			refreshGamePage(user);
		},
		
		view(target, room, user) {
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');

			const args = target.trim().split(' ');
			const v = args[0] as PokeRogueView;

			if (['main', 'top', 'resetconfirm', 'welcome', 'stats', 'save', 'load', 'starterselect', 'draft'].includes(v)) {
				if (v === 'main' && !state.isConfiguringStarter && state.pendingChoiceType === 'starter' && state.pendingChoice?.length) {
					const modeData = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];
					if (modeData.useNewStarterSelectionUI !== false) {
						const nextState: StarterSelectViewState = {
							...state,
							view: 'starterselect',
							starterSearch: '',
						};
						setState(user.id, nextState);
						refreshGamePage(user);
						return;
					}
				}

				if (v === 'main' && state.isConfiguringStarter) {
					const userData = getUserData(user.id);
					const modeData = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];
					const unlockedStarterIds = Object.keys(userData.starters || {});
					const starterPool = modeData.useNewStarterSelectionUI !== false
						? [...new Set([...modeData.starters, ...unlockedStarterIds])]
						: modeData.starters;
					
					const nextState: StarterSelectViewState = {
						...state,
						view: 'starterselect',
						team: [],
						pendingChoice: starterPool,
						pendingChoiceType: 'starter',
						starterSearch: '',
						isConfiguringStarter: undefined,
					};
					setState(user.id, nextState);
					refreshGamePage(user);
					return;
				}

				if (v === 'stats') {
					const slot = parseInt(args[1]);
					if (!isNaN(slot) && slot >= 0 && slot < state.team.length) {
						const nextState: StatsViewState = {
							...state,
							view: 'stats',
							pendingStatsSlot: slot,
							statsTab: 0,
						};
						setState(user.id, nextState);
					} else {
						return;
					}
				} else {
					// Safe shallow copy cast while updating structural literal types
					const nextState = { ...state, view: v } as PokeRogueState;
					setState(user.id, nextState);
				}

				refreshGamePage(user);
			}
		},

		statstab(target, room, user) {
			const state = getState(user.id);
			if (!state || state.view !== 'stats') return this.parse('/pokerogue start');
			
			const args = target.trim().split(' ');
			const dir = args[0];
			const TAB_COUNT = 3;
			let current = state.statsTab ?? 0;
			
			if (dir === 'next') {
				current = (current + 1) % TAB_COUNT;
			} else if (dir === 'prev') {
				current = (current - 1 + TAB_COUNT) % TAB_COUNT;
			} else {
				const n = parseInt(dir);
				if (!isNaN(n) && n >= 0 && n < TAB_COUNT) current = n;
			}

			const nextState: StatsViewState = {
				...state,
				statsTab: current,
			};
			setState(user.id, nextState);
			refreshGamePage(user);
		},

		startersearch(target, room, user) {
			const state = getState(user.id);
			if (!state || state.view !== 'starterselect') return;
			
			const nextState: StarterSelectViewState = {
				...state,
				starterSearch: target.trim().toLowerCase(),
			};
			setState(user.id, nextState);
			refreshGamePage(user);
		},

		dismissnotif(target, room, user) {
			const s = getState(user.id);
			if (s?.notification) { delete s.notification; setState(user.id, s); }
			refreshGamePage(user);
		},

		confirmstarter(target, room, user) {
			const state = getState(user.id);
			if (!state || !state.isConfiguringStarter) return;

			delete state.isConfiguringStarter;
			(state as any).view = 'main';
			setState(user.id, state);
			refreshGamePage(user);
		},

		movemon(target, room, user) {
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');
			if (state.gameOver) return this.errorReply("No active run.");
			if (state.battleRoomId) return this.errorReply("Can't organize your team during a battle.");
			if (state.pendingChoice?.length || state.pendingMoves?.length || state.pendingSwap ||
				state.moveToLearn || state.pendingItemName || state.itemOptions?.length || state.pendingConsumableType || state.pendingRewardDraft?.length) {
				return this.errorReply("Resolve pending choices first.");
			}

			const args = target.split(' ').map(s => s.trim());

			if (args[0] === 'cancel') {
				delete state.pendingMoveSlot;
				setState(user.id, state);
				refreshGamePage(user);
				return;
			}

			if (args[0] === 'confirm') {
				if (state.pendingMoveSlot === undefined) return;
				const toSlot = parseInt(args[1]) - 1;
				const fromSlot = state.pendingMoveSlot;

				if (isNaN(toSlot) || toSlot < 0 || toSlot >= state.team.length) return this.errorReply("Invalid slot.");

				const temp = state.team[fromSlot];
				state.team[fromSlot] = state.team[toSlot];
				state.team[toSlot] = temp;

				delete state.pendingMoveSlot;
				setState(user.id, state);
				refreshGamePage(user);
				return;
			}

			const fromSlot = parseInt(args[0]) - 1;
			if (isNaN(fromSlot) || fromSlot < 0 || fromSlot >= state.team.length) return this.errorReply("Invalid slot.");

			state.pendingMoveSlot = fromSlot;
			setState(user.id, state);
			refreshGamePage(user);
		},

		releasemon(target, room, user) {
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');
			if (state.gameOver) return this.errorReply("No active run.");
			if (state.battleRoomId) return this.errorReply("Can't release Pokémon during a battle.");
			if (state.pendingChoice?.length || state.pendingMoves?.length || state.pendingSwap ||
				state.moveToLearn || state.pendingItemName || state.itemOptions?.length || state.pendingConsumableType || state.pendingRewardDraft?.length) {
				return this.errorReply("Resolve pending choices first.");
			}

			const args = target.split(' ').map(s => s.trim());

			if (args[0] === 'cancel') {
				delete state.pendingReleaseSlot;
				setState(user.id, state);
				refreshGamePage(user);
				return;
			}

			if (args[0] === 'confirm') {
				if (state.pendingReleaseSlot === undefined) return;
				const slot = state.pendingReleaseSlot;

				if (slot < 0 || slot >= state.team.length) return this.errorReply("Invalid slot.");
				if (state.team.length <= 1) return this.errorReply("You cannot release your last Pokémon!");

				const mon = state.team[slot];
				const spName = Dex.species.get(toID(mon.species)).name;

				state.team.splice(slot, 1);

				state.notification = `You released <b>${spName}</b>.`;
				delete state.pendingReleaseSlot;
				delete state.pendingMoveSlot;
				delete (state as any).pendingStatsSlot;

				setState(user.id, state);
				refreshGamePage(user);
				return;
			}

			const slot = parseInt(args[0]) - 1;
			if (isNaN(slot) || slot < 0 || slot >= state.team.length) return this.errorReply("Invalid slot.");
			if (state.team.length <= 1) return this.errorReply("You cannot release your last Pokémon!");

			state.pendingReleaseSlot = slot;
			setState(user.id, state);
			refreshGamePage(user);
		},

		transferitem(target, room, user) {
			const state = getState(user.id);
			if (!state || state.battleRoomId) return;

			if (state.pendingChoice?.length || state.pendingMoves?.length || state.pendingSwap ||
				state.moveToLearn || state.pendingItemName || state.itemOptions?.length || state.pendingConsumableType || state.pendingRewardDraft?.length) {
				return this.errorReply("Resolve pending choices first.");
			}

			const parts = target.trim().split(' ');
			const fromSlot = parseInt(parts[0]) - 1;
			const toSlot = parseInt(parts[1]) - 1;

			if (isNaN(fromSlot) || isNaN(toSlot) || fromSlot < 0 || toSlot >= state.team.length) return this.errorReply("Invalid team slot.");

			const fromMon = state.team[fromSlot];
			const toMon = state.team[toSlot];

			if (!fromMon.heldItem) return this.errorReply("That Pokémon isn't holding anything.");

			const temp = toMon.heldItem;
			toMon.heldItem = fromMon.heldItem;
			fromMon.heldItem = temp;

			const fromName = Dex.species.get(toID(fromMon.species)).name;
			const toName = Dex.species.get(toID(toMon.species)).name;
			state.notification = `Swapped held items between ${fromName} and ${toName}!`;

			setState(user.id, state);
			refreshGamePage(user);
		},
		
		reroll(target, room, user) {
			const state = getState(user.id);
			if (!state || (state as any).view !== 'draft') return;

			const cost = getRerollCost(state, false, state.pendingRewardDraft || []);
			
			if ((state.money || 0) < cost) return this.errorReply(`Not enough money! Need $${cost}.`);

			state.money -= cost;
			state.rerollCount = (state.rerollCount || 0) + 1;
			
			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			state.pendingRewardDraft = generateDraftOptions(state, config);

			setState(user.id, state);
			refreshGamePage(user);
		},

		choose(target, room, user) {
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');
			const userData = getUserData(user.id);
			const n = parseInt(target) - 1;
			if (!state?.pendingChoice || isNaN(n) || n < 0 || n >= state.pendingChoice.length) return;
			const choice = state.pendingChoice[n];

			const isStarterChoice = state.pendingChoiceType === 'starter' || !state.team?.length;
			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			const data = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];

			let addedLevel = config.starterLevel ?? 5;
			if (!isStarterChoice) {
				const maxPlayerLevel = state.team.length > 0 ? Math.max(...state.team.map(m => m.level)) : (config.starterLevel ?? 5);
				if (state.floor <= 30) {
					addedLevel = Math.max(1, maxPlayerLevel - 1);
				} else if (state.floor <= 50) {
					addedLevel = Math.max(1, maxPlayerLevel - 2);
				} else {
					const levelDrop = Math.floor(Math.random() * 2) + 2;
					addedLevel = Math.max(1, maxPlayerLevel - levelDrop);
				}
			}

			let finalSpecies = choice;
			if (!isStarterChoice) {
				while (true) {
					const evo = getLevelUpEvo(finalSpecies, 70);
					if (!evo || addedLevel < evo.evoLevel) break;
					finalSpecies = evo.evoTo;
				}
			}

			let newMon: PokemonEntry;
			const savedStarter = isStarterChoice ? userData.starters[toID(finalSpecies)] : null;

			const randomIvs = {
				hp: Math.floor(Math.random() * 32), atk: Math.floor(Math.random() * 32),
				def: Math.floor(Math.random() * 32), spa: Math.floor(Math.random() * 32),
				spd: Math.floor(Math.random() * 32), spe: Math.floor(Math.random() * 32),
			};
			const shiny = savedStarter ? !!savedStarter.shiny : (Math.floor(Math.random() * 4096) === 0);
			const gender = savedStarter?.gender || Dex.species.get(finalSpecies).gender || (Math.random() < 0.5 ? 'M' : 'F');
			const allTypes = Dex.types.all().map(t => t.name);
			const teraType = savedStarter?.teraType || (Math.floor(Math.random() * 20) === 0 ?
				allTypes[Math.floor(Math.random() * allTypes.length)] :
				Dex.species.get(finalSpecies).types[Math.floor(Math.random() * Dex.species.get(finalSpecies).types.length)]);

			const commonProps = {
				ivs: savedStarter?.ivs ? { ...savedStarter.ivs } : randomIvs,
				evs: savedStarter?.evs ? { ...savedStarter.evs } : { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
				shiny,
				gender: gender as any,
				teraType,
				happiness: 120,
				originalTrainer: state.displayName || user.name,
				otId: user.id.substring(0, 6),
				metLocation: "Professor Oak's Lab",
				metLevel: addedLevel,
				metDate: Date.now(),
				marks: savedStarter?.marks ? [...savedStarter.marks] : [],
				ball: savedStarter?.ball || 'pokeball',
			};

			if (config.randomizeMoves || config.randomizeAbilities) {
				const generated = genPokemon(1, addedLevel, true, state.floor, false, 0, [finalSpecies], state.currentBiome, config, data);
				const g = generated[0];
				newMon = {
					species: g.species,
					level: g.level,
					exp: expForLevel(g.level, getExpType(g.species)),
					expType: getExpType(g.species),
					moves: g.moves,
					nature: savedStarter?.selectedNature || savedStarter?.nature || g.nature,
					ability: savedStarter?.selectedAbility || savedStarter?.ability || g.ability,
					...commonProps,
				} as PokemonEntry;
			} else {
				const finalExpType = getExpType(finalSpecies);
				const initialMoves = getLevelUpMoves(finalSpecies, addedLevel, config.generation);
				const natures = Dex.natures.all().map(n => n.name);
				const hash = ((state.floor ?? 1) * 37) + (n * 13) + Dex.species.get(finalSpecies).id.length;
				const displayNature = natures[hash % natures.length] ?? 'Hardy';

				newMon = {
					species: finalSpecies,
					level: addedLevel,
					exp: expForLevel(addedLevel, finalExpType),
					expType: finalExpType,
					moves: initialMoves,
					nature: savedStarter?.selectedNature || savedStarter?.nature || displayNature,
					ability: savedStarter?.selectedAbility || savedStarter?.ability || (Dex.species.get(finalSpecies).abilities as any)['0'] || '',
					...commonProps,
				} as PokemonEntry;
			}

			// Base fields we must clear from selection arrays safely without using delete
			const clearedDraftState = {
				...state,
				pendingChoice: undefined,
				pendingChoiceType: undefined,
				pendingChoiceFloor: undefined,
			};

			if (isStarterChoice) {
				const sid = toID(finalSpecies);
				if (!userData.starters[sid]) {
					userData.starters[sid] = {
						...newMon,
						unlockedNatures: [newMon.nature!],
						unlockedAbilities: [newMon.ability!],
						unlockedTeraTypes: [newMon.teraType!],
						selectedNature: newMon.nature,
						selectedAbility: newMon.ability,
					};
					saveUserData(user.id);
				}

				const nextState = {
					...clearedDraftState,
					team: [newMon],
					view: 'stats' as const,
					pendingStatsSlot: 0,
					statsTab: 0,
					starterSearch: '',
					isConfiguringStarter: true,
				};
				setState(user.id, nextState);
			} else if (state.team.length < 6) {
				const nextState = {
					...clearedDraftState,
					team: [...state.team, newMon],
					view: 'main' as const,
				};
				setState(user.id, nextState);
			} else {
				const nextState = {
					...clearedDraftState,
					pendingSwap: newMon,
					view: 'main' as const,
				};
				setState(user.id, nextState);
			}

			refreshGamePage(user);
		},

		battle(target, room, user) {
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');
			if (state.gameOver) return this.errorReply("The run is over. Start a new run first.");

			clearStaleBattleRoom(state, user.id);

			if (state.pendingChoice?.length || state.pendingMoves?.length || state.pendingSwap ||
				state.moveToLearn || state.pendingItemName || state.itemOptions?.length || state.pendingConsumableType || state.pendingRewardDraft?.length) {
				return this.errorReply("Resolve all pending choices before starting a battle.");
			}

			if (!state.team.some(m => (m.currentHp ?? 100) > 0)) {
				return this.errorReply("All your Pokémon have fainted! Buy a Revive from the shop before battling.");
			}

			if (startBattle(user, state)) {
				(state as any).view = 'main';
				setState(user.id, state);
				refreshGamePage(user);
			}
		},

		cyclestarter(target, room, user) {
			const state = getState(user.id);
			if (!state || !state.isConfiguringStarter) return;
			const userData = getUserData(user.id);

			const [trait, direction] = target.trim().split(' ');
			const mon = state.team[0];

			let baseSpecies = toID(mon.species);
			while (true) {
				const sp = Dex.species.get(baseSpecies);
				const prevo = sp.prevo;
				if (!prevo) break;
				baseSpecies = toID(prevo);
			}

			let starterData = userData.starters[baseSpecies];

			if (!starterData) {
				starterData = {
					unlockedNatures: [mon.nature!],
					unlockedAbilities: [mon.ability!],
					selectedNature: mon.nature!,
					selectedAbility: mon.ability!,
				} as PokemonEntry;
				userData.starters[baseSpecies] = starterData;
			}

			if (trait === 'nature') {
				const pool = starterData.unlockedNatures?.length ? starterData.unlockedNatures : [mon.nature!];
				if (!pool.includes(mon.nature!)) pool.push(mon.nature!);

				if (pool.length <= 1) {
					state.notification = `You haven't unlocked any other Natures for this Pokémon yet! Catch duplicates in the wild to expand your options.`;
				} else {
					let idx = pool.indexOf(mon.nature!);
					if (direction === 'next') idx = (idx + 1) % pool.length;
					if (direction === 'prev') idx = (idx - 1 + pool.length) % pool.length;

					mon.nature = pool[idx];
					starterData.selectedNature = pool[idx];
					starterData.nature = pool[idx];
				}
			} else if (trait === 'ability') {
				const pool = starterData.unlockedAbilities?.length ? starterData.unlockedAbilities : [mon.ability!];
				if (!pool.includes(mon.ability!)) pool.push(mon.ability!);

				if (pool.length <= 1) {
					state.notification = `You haven't unlocked any other Abilities for this Pokémon yet! Catch duplicates in the wild to expand your options.`;
				} else {
					let idx = pool.indexOf(mon.ability!);
					if (direction === 'next') idx = (idx + 1) % pool.length;
					if (direction === 'prev') idx = (idx - 1 + pool.length) % pool.length;

					mon.ability = pool[idx];
					starterData.selectedAbility = pool[idx];
					starterData.ability = pool[idx];
				}
			} else if (trait === 'tera') {
				const pool = starterData.unlockedTeraTypes?.length ? starterData.unlockedTeraTypes : [mon.teraType!];
				if (!pool.includes(mon.teraType!)) pool.push(mon.teraType!);

				if (pool.length <= 1) {
					state.notification = `You haven't unlocked any other Tera Types for this Pokémon yet! Catch duplicates or use Tera Shards to expand your options.`;
				} else {
					let idx = pool.indexOf(mon.teraType!);
					if (direction === 'next') idx = (idx + 1) % pool.length;
					if (direction === 'prev') idx = (idx - 1 + pool.length) % pool.length;

					mon.teraType = pool[idx];
					starterData.teraType = pool[idx];
				}
			}

			saveUserData(user.id);
			setState(user.id, state);
			refreshGamePage(user);
		},

		resolve(target, room, user) {
			const state = getState(user.id);
			if (!state) return this.parse('/pokerogue start');

			const spaceIdx = target.indexOf(' ');
			const action = spaceIdx === -1 ? target.trim() : target.slice(0, spaceIdx).trim();
			const rest = spaceIdx === -1 ? '' : target.slice(spaceIdx + 1).trim();
			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];

			switch (action) {
			case 'learnmove': {
				if (!state.pendingMoves?.length) return;
				const pending = state.pendingMoves[0];
				const mon = state.team[pending.pokemonIndex];
				if (!mon.moves) mon.moves = getLevelUpMoves(mon.species, mon.level, MODE_CONFIGS[state.gameMode]?.generation || 9);
				
				if (rest === 'skip') {
					state.notification = `Your Pokémon gave up on learning <b>${Dex.moves.get(pending.move).name}</b>.`;
				} else {
					const slot = parseInt(rest) - 1;
					if (isNaN(slot) || slot < 0 || slot >= mon.moves.length) return this.errorReply("Invalid move slot.");
					const oldMoveName = Dex.moves.get(mon.moves[slot]).name;
					mon.moves[slot] = pending.move;
					state.notification = `Forgot ${oldMoveName} and learned <b>${Dex.moves.get(pending.move).name}</b>!`;
				}
				state.pendingMoves.shift();
				setState(user.id, state);
				break;
			}

			case 'swapmon': {
				if (!state.pendingSwap) return;
				const newMon = state.pendingSwap;
				const newMonName = Dex.species.get(toID(newMon.species)).name;
				
				let updatedNotification = '';
				if (rest === 'skip') {
					updatedNotification = `You released <b>${newMonName}</b> into the wild.`;
				} else {
					const slot = parseInt(rest) - 1;
					if (isNaN(slot) || slot < 0 || slot >= state.team.length) return this.errorReply("Invalid team slot.");
					const oldMonName = Dex.species.get(toID(state.team[slot].species)).name;
					state.team[slot] = newMon;
					if (state.pendingMoves) state.pendingMoves = state.pendingMoves.filter(p => p.pokemonIndex !== slot);
					updatedNotification = `You replaced ${oldMonName} with <b>${newMonName}</b>!`;
				}

				const nextState = {
					...state,
					notification: updatedNotification,
					pendingSwap: undefined,
				};
				setState(user.id, nextState);
				break;
			}

			case 'pickitem': {
				if (!state.itemOptions?.length) return;
				if (rest === 'skip') {
					const nextState = {
						...state,
						itemOptions: undefined,
						purchasedItem: undefined,
					};
					setState(user.id, nextState);
				} else {
					const dexItem = Dex.items.get(rest);
					if (!dexItem.exists) return this.errorReply("Unknown item.");
					const nextState = {
						...state,
						pendingItemName: dexItem.name,
						itemOptions: undefined,
						purchasedItem: undefined,
					};
					setState(user.id, nextState);
				}
				break;
			}

			case 'giveitem': {
				if (!state.pendingItemName) return this.errorReply("No item pending.");
				const itemKey = state.purchasedItem;

				if (rest === 'skip') {
					let currentMoney = state.money || 0;
					if (itemKey) {
						const activeShop = MODE_REGISTRY[state.gameMode]?.shop || SHOP_ITEMS;
						const item = activeShop[itemKey];
						if (item && item.isShopItem) {
							currentMoney += getItemPrice(state.floor, item.moneyMultiplier ?? 1.0);
						}
					}
					
					if (state.pendingRewardDraft) {
						const nextState = {
							...state,
							money: currentMoney,
							pendingItemName: undefined,
							purchasedItem: undefined,
							pendingItemIsEvo: undefined,
							view: 'draft' as const,
						};
						setState(user.id, nextState);
					} else {
						const nextState = {
							...state,
							money: currentMoney,
							floor: state.floor + 1,
							pendingItemName: undefined,
							purchasedItem: undefined,
							pendingItemIsEvo: undefined,
							view: 'main' as const,
						};
						setState(user.id, nextState);
					}
					break;
				}

				const slot = parseInt(rest) - 1;
				if (isNaN(slot) || slot < 0 || slot >= state.team.length) return this.errorReply("Invalid team slot.");

				const mon = state.team[slot];
				const dexNewItem = Dex.items.get(state.pendingItemName);
				const dexSpecies = Dex.species.get(toID(mon.species));

				if (itemKey === 'memorymushroom') {
					const allMoves = getMovesLearnedBetween(mon.species, 1, mon.level, false, MODE_CONFIGS[state.gameMode]?.generation || 9);
					
					if (allMoves.length === 0) return this.errorReply("This Pokémon has no moves to remember.");

					const nextPendingMoves = [{
						pokemonIndex: slot,
						move: allMoves[Math.floor(Math.random() * allMoves.length)], 
						speciesName: mon.species
					}];
					
					if (state.pendingRewardDraft) {
						const nextState = {
							...state,
							pendingMoves: nextPendingMoves,
							purchasedItem: undefined,
							pendingItemName: undefined,
							view: 'draft' as const,
						};
						setState(user.id, nextState);
					} else {
						const nextState = {
							...state,
							pendingMoves: nextPendingMoves,
							floor: state.floor + 1,
							purchasedItem: undefined,
							pendingItemName: undefined,
							view: 'main' as const,
						};
						setState(user.id, nextState);
					}
					break;
				}

				let evoTarget = '';
				if (state.pendingItemIsEvo) {
					const evoList = dexSpecies.evos;
					const pendingItemId = toID(dexNewItem.name);
					if (evoList) {
						for (const newEvo of evoList) {
							const evoData = Dex.species.get(newEvo);
							const evoItemId = toID(evoData.evoItem);
							const isUseItemEvolution = evoData.evoType === 'useItem' && evoItemId === pendingItemId;
							const isHeldTradeEvolution = evoData.evoType === 'trade' && evoItemId === pendingItemId;
							const isPlainTradeEvolution = evoData.evoType === 'trade' && !evoItemId && pendingItemId === 'linkingcord';
							if (isUseItemEvolution || isHeldTradeEvolution || isPlainTradeEvolution) {
								evoTarget = evoData.id;
								break;
							}
						}
					}
					if (!evoTarget) return this.errorReply("That Pokémon can't evolve with this item.");
				}

				let updatedNotification = '';
				if (state.pendingItemIsEvo) {
					mon.species = evoTarget;
					mon.expType = getExpType(evoTarget);
					const evoName = Dex.species.get(evoTarget).name;
					updatedNotification = `<b>${dexSpecies.name}</b> evolved into <b>${evoName}</b>!`;
				} else {
					if (dexNewItem.forcedForme && dexSpecies.otherFormes?.includes(dexNewItem.forcedForme)) {
						mon.species = toID(dexNewItem.forcedForme);
					} else if (mon.heldItem) {
						const dexOldItem = Dex.items.get(mon.heldItem);
						if (dexOldItem.forcedForme && dexSpecies.otherFormes?.includes(dexOldItem.forcedForme)) {
							mon.species = toID(dexSpecies.changesFrom ?? dexSpecies.baseSpecies);
						}
					}
					mon.heldItem = toID(state.pendingItemName);
					updatedNotification = `Gave <b>${Utils.escapeHTML(dexNewItem.name)}</b> to <b>${dexSpecies.name}</b>!`;
				}

				if (state.pendingRewardDraft) {
					const nextState = {
						...state,
						notification: updatedNotification,
						pendingItemName: undefined,
						purchasedItem: undefined,
						pendingItemIsEvo: undefined,
						view: 'draft' as const,
					};
					setState(user.id, nextState);
				} else {
					const nextState = {
						...state,
						notification: updatedNotification,
						floor: state.floor + 1,
						pendingItemName: undefined,
						purchasedItem: undefined,
						pendingItemIsEvo: undefined,
						view: 'main' as const,
					};
					setState(user.id, nextState);
				}
				break;
			}

			case 'useshopitem': {
				if (!state.purchasedItem) return this.errorReply("No item selected.");
				const itemKey = state.purchasedItem;

				if (rest === 'skip') {
					let currentMoney = state.money || 0;
					if (itemKey) {
						const activeShop = MODE_REGISTRY[state.gameMode]?.shop || SHOP_ITEMS;
						const item = activeShop[itemKey];
						if (item && item.isShopItem) {
							currentMoney += getItemPrice(state.floor, item.moneyMultiplier ?? 1.0);
						}
					}
					
					if (state.pendingRewardDraft) {
						const nextState = {
							...state,
							money: currentMoney,
							purchasedItem: undefined,
							pendingConsumableType: undefined,
							view: 'draft' as const,
						};
						setState(user.id, nextState);
					} else {
						const nextState = {
							...state,
							money: currentMoney,
							floor: state.floor + 1,
							purchasedItem: undefined,
							pendingConsumableType: undefined,
							view: 'main' as const,
						};
						setState(user.id, nextState);
					}
					break;
				}

				const activeShop = MODE_REGISTRY[state.gameMode]?.shop || SHOP_ITEMS;
				const item = activeShop[itemKey];
				if (!item) return this.errorReply("Unknown item.");

				const slot = parseInt(rest) - 1;
				if (isNaN(slot) || slot < 0 || slot >= state.team.length) return this.errorReply("Invalid team slot.");
				const mon = state.team[slot];
				const hp = mon.currentHp ?? 100;

				let updatedNotification = '';

				if (item.type === 'healHP') {
					if (hp <= 0) return this.errorReply("Can't heal a fainted Pokémon. Use a Revive.");
					if (hp >= 100) return this.errorReply("That Pokémon is already at full HP.");
					
					const spData = Dex.species.get(toID(mon.species));
					const bs = spData.baseStats ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
					const evs = mon.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
					const maxHpActual = Math.floor((2 * bs.hp + 31 + Math.floor(evs.hp / 4)) * mon.level / 100) + mon.level + 10;
					
					const healPctCalculated = item.healAmount ? Math.max(item.healPercent || 0, (item.healAmount / maxHpActual) * 100) : (item.healPercent || 0);
					
					mon.currentHp = item.isMax ? 100 : Math.min(100, hp + Math.round(healPctCalculated));
					if (item.curesStatus) mon.status = undefined;
					
					mon.happiness = Math.min(255, (mon.happiness ?? 70) + 3);
					updatedNotification = `<b>${Dex.species.get(toID(mon.species)).name}</b> restored HP! (${hp}% → ${mon.currentHp}%)`;
				} else if (item.type === 'cureStatus') {
					if (hp <= 0) return this.errorReply("Can't cure a fainted Pokémon.");
					if (!mon.status) return this.errorReply("That Pokémon has no status condition.");
					const oldStatus = mon.status;
					mon.status = undefined;
					updatedNotification = `<b>${Dex.species.get(toID(mon.species)).name}</b>'s ${oldStatus.toUpperCase()} was cured!`;
				} else if (item.type === 'revive') {
					if (hp > 0) return this.errorReply("That Pokémon hasn't fainted.");
					const revAmt = item.reviveAmount || 50;
					mon.currentHp = (item.isMax || mon.species === 'shedinja') ? 100 : revAmt;
					mon.status = undefined;
					updatedNotification = `<b>${Dex.species.get(toID(mon.species)).name}</b> was revived${item.isMax ? ' to full health' : ''}!`;
				} else if (item.type === 'vitamin') {
					if (hp <= 0) return this.errorReply("Can't use on a fainted Pokémon.");
					const evStat = (item).evStat as keyof NonNullable<PokemonEntry['evs']>;
					if (!evStat) return this.errorReply("Invalid vitamin.");
					if (!mon.evs) mon.evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
					const totalEvs = Object.values(mon.evs).reduce((a, b) => a + b, 0);
					if (totalEvs >= MAX_EV_TOTAL) return this.errorReply("This Pokémon's EVs are maxed out (508 total).");
					if (mon.evs[evStat] >= MAX_EV_STAT) return this.errorReply(`This Pokémon's ${EV_STAT_LABELS[evStat] ?? evStat} EVs are already at max (252).`);
					const gain = Math.min(EV_VITAMIN_GAIN, MAX_EV_STAT - mon.evs[evStat], MAX_EV_TOTAL - totalEvs);
					mon.evs[evStat] += gain;
					mon.happiness = Math.min(255, (mon.happiness ?? 70) + 5);
					updatedNotification = `<b>${Dex.species.get(toID(mon.species)).name}</b>'s ${EV_STAT_LABELS[evStat] ?? evStat} EVs raised by ${gain}! (Now: ${mon.evs[evStat]}/${MAX_EV_STAT})`;
				} else if (item.type === 'candy') {
					if (hp <= 0) return this.errorReply("Can't use on a fainted Pokémon.");
					let levelsToGain = itemKey === 'rarercandy' ? 3 : 1;
					const candyJars = state.keyItems?.['Candy Jar'] || 0;
					levelsToGain += candyJars;

					const { cap: levelCap } = getLevelScaling(state.floor, config);
					const targetLevel = Math.min(levelCap, mon.level + levelsToGain);
					const expNeeded = expForLevel(targetLevel, mon.expType ?? getExpType(mon.species)) - mon.exp;

					applyExpAndLevelUp(mon, Math.max(0, expNeeded), state.floor, config);

					mon.happiness = Math.min(255, (mon.happiness ?? 70) + 10);
					updatedNotification = `<b>${Dex.species.get(toID(mon.species)).name}</b> grew to Lv. ${mon.level}!`;
				} else if (item.type === 'mint') {
					if (hp <= 0) return this.errorReply("Can't use on a fainted Pokémon.");
					mon.nature = item.nature;
					mon.selectedNature = item.nature;

					const userData = getUserData(user.id);
					let baseSpecies = toID(mon.species);
					while (true) {
						const sp = Dex.species.get(baseSpecies);
						if (!sp.prevo) break;
						baseSpecies = toID(sp.prevo);
					}
					if (userData.starters[baseSpecies] && item.nature) {
						const starterData = userData.starters[baseSpecies];
						if (!starterData.unlockedNatures) starterData.unlockedNatures = [];
						if (!starterData.unlockedNatures.includes(item.nature)) {
							starterData.unlockedNatures.push(item.nature);
						}
						starterData.selectedNature = item.nature;
						starterData.nature = item.nature;
						saveUserData(user.id);
					}

					updatedNotification = `<b>${Dex.species.get(toID(mon.species)).name}</b>'s Nature changed to <b>${item.nature}</b>!`;
				} else if (item.type === 'teraShard') {
					if (hp <= 0) return this.errorReply("Can't use on a fainted Pokémon.");
					mon.teraType = item.teraType;

					const userData = getUserData(user.id);
					let baseSpecies = toID(mon.species);
					while (true) {
						const sp = Dex.species.get(baseSpecies);
						if (!sp.prevo) break;
						baseSpecies = toID(sp.prevo);
					}
					if (userData.starters[baseSpecies] && item.teraType) {
						const starterData = userData.starters[baseSpecies];
						if (!starterData.unlockedTeraTypes) starterData.unlockedTeraTypes = [];
						if (!starterData.unlockedTeraTypes.includes(item.teraType)) {
							starterData.unlockedTeraTypes.push(item.teraType);
						}
						starterData.teraType = item.teraType;
						saveUserData(user.id);
					}

					updatedNotification = `<b>${Dex.species.get(toID(mon.species)).name}</b>'s Tera Type changed to <b>${item.teraType}</b>!`;
				} else if (item.type === 'tm') {
					const moveId = toID(item.name.replace(/^TM\d+\s*/i, ''));
					if (mon.moves.includes(moveId)) return this.errorReply("This Pokémon already knows that move.");

					const fullLearn = Dex.species.getFullLearnset(toID(mon.species));
					const canLearn = fullLearn.some(step => step.learnset[moveId]);
					if (!canLearn) return this.errorReply("This Pokémon cannot learn that move.");

					if (mon.moves.length < 4) {
						mon.moves.push(moveId);
						updatedNotification = `<b>${Dex.species.get(toID(mon.species)).name}</b> learned <b>${Dex.moves.get(moveId).name}</b>!`;
					} else {
						state.pendingMoves = state.pendingMoves || [];
						state.pendingMoves.push({
							pokemonIndex: slot,
							move: moveId,
							speciesName: mon.species
						});
						updatedNotification = `<b>${Dex.species.get(toID(mon.species)).name}</b> is trying to learn <b>${Dex.moves.get(moveId).name}</b>.`;
					}
				}

				if (state.pendingRewardDraft) {
					const nextState = {
						...state,
						notification: updatedNotification,
						purchasedItem: undefined,
						pendingConsumableType: undefined,
						view: 'draft' as const,
					};
					setState(user.id, nextState);
				} else {
					const nextState = {
						...state,
						notification: updatedNotification,
						floor: state.floor + 1,
						purchasedItem: undefined,
						pendingConsumableType: undefined,
						view: 'main' as const,
					};
					setState(user.id, nextState);
				}
				break;
			}

			default:
				return this.errorReply("Unknown resolve action.");
			}

			refreshGamePage(user);
		},

		catch(target, room, user) {
			const state = getState(user.id);
			if (!state || state.gameOver) return this.errorReply("No active run.");
			if (!room?.battle) return this.errorReply("You must be in a battle to catch Pokémon.");

			const catchMatch = activeMatches.get(room.roomid);
			if (!catchMatch || catchMatch.userId !== user.id) {
				return this.errorReply("You can only catch Pokémon in your own battle.");
			}

			if (!room.battle.turn) return this.errorReply("The battle hasnt started yet!");
			if (state.caughtPokemon) return this.errorReply("You already caught this Pokémon!");

			const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
			const floor = state.floor;
			if (floor % config.bossInterval === 0 || catchMatch.isTrainerBattle) {
				return this.errorReply("You cannot catch Trainer or Boss Pokémon!");
			}

			const targetMatch = target.trim().split(' ');
			const ballType = toID(targetMatch[0]);
			const reqSlot = targetMatch[1] ? targetMatch[1].toLowerCase() : '';

			if (!['pokeball', 'greatball', 'ultraball', 'masterball'].includes(ballType)) {
				return this.errorReply("Invalid Poké Ball type.");
			}

			state.inventory = state.inventory || {};
			if ((state.inventory[ballType] || 0) <= 0) return this.errorReply(`You don't have any ${ballType}s left!`);

			const now = Date.now();
			const lastThrow = (state as any).lastThrowTime || 0;
			if (now - lastThrow < 1500) {
				return this.errorReply("Please wait a moment before throwing another Poké Ball.");
			}
			(state as any).lastThrowTime = now;

			const log = room.log?.log || [];

			const p2State = new Map<string, { species: string, level: number, hp: number, maxHp: number, status: string, fainted: boolean, botTeamIndex?: number }>();
			let p1Fainted = false;
			const p2Assigned = new Set<number>();

			for (const line of log) {
				if (/^\|faint\|p1[a-z]:/.test(line)) p1Fainted = true;
				else if (/^\|(?:switch|drag)\|p1[a-z]:/.test(line)) p1Fainted = false;

				const swMatch = /^\|(?:switch|drag|replace)\|(p2[a-z]): [^|]+\|([^|,]+)(?:, L(\d+))?[^|]*\|(\d+)(?:\/(\d+))?(?: (brn|psn|tox|par|slp|frz))?/.exec(line);
				if (swMatch) {
					const parsedSpecies = toID(swMatch[2]);
					const parsedLevel = swMatch[3] ? parseInt(swMatch[3]) : botLevel(floor, config);
					
					let assignedIdx = -1;
					if (catchMatch.botTeam) {
						for (let i = 0; i < catchMatch.botTeam.length; i++) {
							const m = catchMatch.botTeam[i];
							if (!p2Assigned.has(i) && (toID(m.species) === parsedSpecies || toID(m.name) === parsedSpecies) && m.level === parsedLevel) {
								assignedIdx = i;
								p2Assigned.add(i);
								break;
							}
						}
					}
					
					p2State.set(swMatch[1], {
						species: parsedSpecies,
						level: parsedLevel,
						hp: parseInt(swMatch[4]),
						maxHp: swMatch[5] ? parseInt(swMatch[5]) : 100,
						status: swMatch[6] || '',
						fainted: false,
						botTeamIndex: assignedIdx !== -1 ? assignedIdx : undefined
					});
					continue;
				}

				const transformMatch = /^\|-transform\|(p2[a-z]): [^|]+\|([^|]+)/.exec(line);
				if (transformMatch) {
					const s = p2State.get(transformMatch[1]);
					if (s) {
						s.species = toID(transformMatch[2]);
					}
					continue;
				}

				const dmgMatch = /^\|(?:-damage|-heal)\|(p2[a-z]): [^|]+\|(\d+)(?:\/(\d+))?(?: (brn|psn|tox|par|slp|frz))?/.exec(line);
				if (dmgMatch) {
					const s = p2State.get(dmgMatch[1]);
					if (s) {
						s.hp = parseInt(dmgMatch[2]);
						if (dmgMatch[3]) s.maxHp = parseInt(dmgMatch[3]);
						if (dmgMatch[4]) s.status = dmgMatch[4];
					}
					continue;
				}

				const stMatch = /^\|-status\|(p2[a-z]): [^|]+\|(brn|psn|tox|par|slp|frz)/.exec(line);
				if (stMatch) {
					const s = p2State.get(stMatch[1]);
					if (s) s.status = stMatch[2];
					continue;
				}

				const cureMatch = /^\|-curestatus\|(p2[a-z]):/.exec(line);
				if (cureMatch) {
					const s = p2State.get(cureMatch[1]);
					if (s) s.status = '';
					continue;
				}

				const faintMatch = /^\|faint\|(p2[a-z]):/.exec(line);
				if (faintMatch) {
					const s = p2State.get(faintMatch[1]);
					if (s) {
						s.fainted = true;
						s.hp = 0;
					}
					continue;
				}
			}

			let aliveOpponents = 0;
			for (const [, data] of p2State.entries()) {
				if (!data.fainted && data.hp > 0) aliveOpponents++;
			}

			if (aliveOpponents > 1) {
				return this.errorReply("It's no good! It's impossible to aim when there are multiple Pokémon!");
			}

			if (p1Fainted) {
				return this.errorReply("You cannot throw a Poké Ball while your Pokémon is fainted! Please send out a new Pokémon first.");
			}

			let targetMon = null;
			if (reqSlot) {
				targetMon = p2State.get(reqSlot);
				if (!targetMon || targetMon.fainted) return this.errorReply("That target is not available to catch.");
			} else {
				for (const [, data] of p2State.entries()) {
					if (!data.fainted && data.hp > 0) {
						targetMon = data;
						break;
					}
				}
			}

			if (!targetMon || targetMon.fainted) return this.errorReply("There is no active Pokémon to catch.");

			const p2Species = targetMon.species;
			const p2Level = targetMon.level;
			let p2Hp = targetMon.hp;
			let p2MaxHp = targetMon.maxHp;
			let p2Status = targetMon.status;

			if (p2Status === 'none') p2Status = '';
			if (p2Hp === -1) p2Hp = 100;

			state.inventory[ballType]--;
			setState(user.id, state);

			const turn = room.battle.turn || 1;
			const inv = state.inventory;
			const catchHTML = `<div class="pr-catch-panel" style="padding:8px; background:rgba(0,0,0,0.2); border-radius:6px; text-align:center; margin-top:5px;">` +
				`<div style="font-weight:bold; margin-bottom:6px; color:#ddd;">Wild Encounter!</div>` +
				`<button name="send" value="/pokerogue catch pokeball" class="button" ${inv['pokeball'] ? '' : 'disabled'}>Poké Ball (${inv['pokeball'] || 0})</button> ` +
				`<button name="send" value="/pokerogue catch greatball" class="button" ${inv['greatball'] ? '' : 'disabled'}>Great Ball (${inv['greatball'] || 0})</button> ` +
				`<button name="send" value="/pokerogue catch ultraball" class="button" ${inv['ultraball'] ? '' : 'disabled'}>Ultra Ball (${inv['ultraball'] || 0})</button> ` +
				`<button name="send" value="/pokerogue catch masterball" class="button" ${inv['masterball'] ? '' : 'disabled'}>Master Ball (${inv['masterball'] || 0})</button>` +
				`</div>`;

			user.sendTo(room, `|uhtmlchange|catchpanel-${turn}|${catchHTML}`);
			room.add(`|c|~|You threw a ${ballType}!`).update();

			const baseCatchRate = CATCH_RATES[p2Species] || 45;

			let ballBonus = 1;
			if (ballType === 'greatball') ballBonus = 1.5;
			if (ballType === 'ultraball') ballBonus = 2.0;

			let statusBonus = 1;
			if (['slp', 'frz'].includes(p2Status)) statusBonus = 2.5;
			else if (['brn', 'psn', 'tox', 'par'].includes(p2Status)) statusBonus = 1.5;

			const hpPercent = p2Hp / p2MaxHp;
			const modifiedCatchRate = (1 - (2 / 3) * hpPercent) * baseCatchRate * ballBonus * statusBonus;
			const shakeProb = Math.min(65536, Math.floor(65536 * (modifiedCatchRate / 255) ** 0.1875));

			let shakes = 0;
			if (ballType === 'masterball') {
				shakes = 3;
			} else {
				for (let i = 0; i < 3; i++) {
					if (Math.floor(Math.random() * 65536) < shakeProb) {
						shakes++;
					} else {
						break;
					}
				}
			}

			if (shakes === 3) {
				const dexSp = Dex.species.get(p2Species);
				room.add(`|c|~|Gotcha! ${dexSp.name} was caught!`).update();

				const p1Participants = new Set<string>();
				let p2SwitchIdx = 0;

				for (let i = log.length - 1; i >= 0; i--) {
					if (/^\|(?:switch|drag)\|p2[a-z]:/.test(log[i])) {
						p2SwitchIdx = i;
						break;
					}
				}

				for (let i = p2SwitchIdx; i >= 0; i--) {
					const match = /^\|(?:switch|drag)\|p1[a-z]: [^|]+\|([^|,]+)/.exec(log[i]);
					if (match) {
						p1Participants.add(toID(match[1]));
						break;
					}
				}

				for (let i = p2SwitchIdx; i < log.length; i++) {
					const match = /^\|(?:switch|drag)\|p1[a-z]: [^|]+\|([^|,]+)/.exec(log[i]);
					if (match) {
						p1Participants.add(toID(match[1]));
					}
				}

				const participantsStr = Array.from(p1Participants).join(',');
				room.add(`|-message|PR_EXP|${p2Species}|${p2Level}|${participantsStr}`).update();

				const hpPct = Math.max(1, Math.round((p2Hp / p2MaxHp) * 100));
				const natures = Dex.natures.all().map(n => n.name);
				const randomNature = natures[Math.floor(Math.random() * natures.length)];

				let caughtMoves = getLevelUpMoves(p2Species, p2Level, config.generation);
				let caughtAbility = (Dex.species.get(p2Species).abilities as any)['0'] || '';
				let caughtItem = '';

				const freshCaughtIvs = {
					hp: Math.floor(Math.random() * 32), atk: Math.floor(Math.random() * 32),
					def: Math.floor(Math.random() * 32), spa: Math.floor(Math.random() * 32),
					spd: Math.floor(Math.random() * 32), spe: Math.floor(Math.random() * 32),
				};
				let caughtShiny = false;
				let caughtGender = Dex.species.get(p2Species).gender || (Math.random() < 0.5 ? 'M' : 'F');
				let caughtTera = Dex.species.get(p2Species).types[0];

				if (catchMatch.botTeam) {
					let botMon;
					if (targetMon.botTeamIndex !== undefined) {
						botMon = catchMatch.botTeam[targetMon.botTeamIndex];
					} else {
						botMon = catchMatch.botTeam.find(m => (toID(m.species) === p2Species || toID(m.name) === p2Species) && m.level === p2Level);
					}

					if (botMon) {
						if (botMon.moves && botMon.moves.length > 0) caughtMoves = botMon.moves;
						if (botMon.ability) caughtAbility = botMon.ability;
						if (botMon.item) caughtItem = botMon.item;
						if (botMon.shiny) caughtShiny = botMon.shiny;
						if (botMon.gender) caughtGender = botMon.gender;
						if (botMon.teraType) caughtTera = botMon.teraType;
					}
				}

				const caught: any = {
					species: p2Species,
					level: p2Level,
					exp: expForLevel(p2Level, getExpType(p2Species)),
					expType: getExpType(p2Species),
					moves: caughtMoves,
					nature: randomNature,
					currentHp: hpPct,
					ability: caughtAbility,
					ball: ballType,
					ivs: freshCaughtIvs,
					evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
					shiny: caughtShiny,
					gender: caughtGender as any,
					teraType: caughtTera,
					happiness: 70,
					originalTrainer: state.displayName || user.name,
					otId: user.id.substring(0, 6),
					metLocation: `${state.currentBiome || 'Wild Area'} (Floor ${state.floor})`,
					metLevel: p2Level,
					metDate: Date.now(),
					marks: [],
				};

				if (caughtItem) caught.heldItem = caughtItem;
				if (p2Status && p2Status !== 'none') caught.status = p2Status;

				state.caughtPokemon = caught;
				setState(user.id, state);

				const match = activeMatches.get(room.roomid);
				if (match) {
					const botUser = Users.get(match.botUserId);
					if (botUser) {
						setTimeout(() => {
							if (room.battle && !room.battle.ended) (room.battle as any).forfeit(botUser);
						}, 300);
					}
				}
			} else {
				const catchMatch = activeMatches.get(room.roomid);
				const passChoice = catchMatch?.isDoubles ? 'pass, pass' : 'pass';
				void room.battle.stream.write(`>p1 ${passChoice}`);

				let escapeMsg = `|c|~|Oh no! The Pokémon broke free!`;
				if (shakes === 1) escapeMsg = `|c|~|Aww! It appeared to be caught!`;
				if (shakes === 2) escapeMsg = `|c|~|Aargh! Almost had it!`;
				room.add(escapeMsg).update();
			}
		},
		
		help(target, room, user) {
			if (!this.runBroadcast()) return;
			const isStaff = user.can('lock');
			let html = `<b>PokéRogue - Player Commands:</b><br>` +
				`<code>/pokerogue start</code> - Open the game page.<br>` +
				`<code>/pokerogue battle</code> - Start floor battle.<br>` +
				`<code>/pokerogue status</code> - View run info.<br>` +
				`<code>/pokerogue view top</code> - Leaderboard.<br>` +
				`<code>/pokerogue quit</code> - Abandon run.<br>`;
			if (isStaff) {
				html += `<br><b>Staff Commands (Requires: Admin Only):</b><br>` +
					`<code>/pokerogue givemoney [user], [amount]</code> - Gives Money to a user.<br>` +
					`<code>/pokerogue removemoney [user], [amount]</code> - Removes Money from a user.<br>` +
					`<code>/pokerogue setfloor [user], [floor]</code> - Sets the floor for a user's run.<br>` +
					`<code>/pokerogue healteam [user]</code> - Fully heals a user's team.<br>` +
					`<code>/pokerogue addmon [user], [pokemon], [level]</code> - Adds a Pokemon to a user's team.<br>` +
					`<code>/pokerogue removemon [user]</code> - Wipes a user's run data.<br>` +
					`<code>/pokerogue resetladder [user]</code> - resets only that user's highestFloor and best team.<br>` +
					`<code>/pokerogue resetladder all</code> - resets ladder fields for all users (confirmation required).`;
			}
			this.sendReplyBox(html);
		},

		...devCommands,

		'': 'help',
	},
};

export const pages: Chat.PageTable = {
	pokerogue(args, user) {
		if (!user.named) return this.errorReply('Login required.');
		const state = getState(user.id);
		if (!state) return `<div class="pr-popup"><div class="pr-popup-header"><h2>PokéRogue</h2></div><div style="text-align:center;padding:16px"><button name="send" value="/pokerogue start" class="button">Start New Run</button></div></div>`;
		const v = (state as any).view || 'main';
		this.title = `PokéRogue - ${v.toUpperCase()}`;
		return renderGamePage(state, user);
	},
};

export const handlers: Chat.Handlers = {
	onBattleEnd(battle, winner, players) {
		const match = activeMatches.get(battle.roomid);
		if (!match) return;
		activeMatches.delete(battle.roomid);
		const botUser = Users.get(match.botUserId);
		if (botUser) destroyBotUser(botUser);
		const state = getState(match.userId);
		if (!state) return;
		const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
		const data = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];
		const isBossFloor = match.floor % config.bossInterval === 0;
		const room = Rooms.get(battle.roomid);
		const logLines: string[] = room?.log?.log ?? [];
		const { consumedItems } = syncBattleOutcome(logLines, state);
		const battleLogMsgs: string[] = [];
		if (consumedItems.length) {
			battleLogMsgs.push(`<b>Consumed items:</b> ${consumedItems.join(', ')}`);
		}
		if (toID(winner) === match.userId) {
			const isTrainerBattle = match.isTrainerBattle ?? false;
			const detailMsgs = processBattleExperience(logLines, state, match.floor, isBossFloor, isTrainerBattle, config);
			const prevFloor = state.floor;
			if (config.maxFloor && prevFloor >= config.maxFloor) {
				const nextState = {
					...state,
					battleRoomId: undefined,
					gameWon: true,
					lastRunFloor: prevFloor,
				};
				if (prevFloor > (state.highestFloor ?? 0)) {
					nextState.highestFloor = prevFloor;
					nextState.recordTeam = JSON.parse(JSON.stringify(state.team));
					globalStats[match.userId] = {
						highestFloor: prevFloor,
						displayName: state.displayName || match.userId,
						recordTeam: nextState.recordTeam,
					};
					saveGlobalStats();
				}
				setState(match.userId, nextState);
				const hUser = Users.get(match.userId);
				if (hUser) refreshGamePage(hUser);
				return;
			}
			const nextFloor = prevFloor + 1;
			if (nextFloor % config.biomeRotationInterval === 1 && nextFloor > config.biomeRotationInterval) {
				if (config.lastBiome && !data.resolveBiome) {
					const range = parseFloorRange(config.lastBiome.floor);
					if (range && nextFloor >= range.start && nextFloor <= range.end) {
						state.currentBiome = config.lastBiome.biome;
						battleLogMsgs.push(`<b>You will enter the ${state.currentBiome} biome!</b>`);
					} else {
						state.currentBiome = pickNextBiome(state.currentBiome || config.startingBiome, data, config.startingBiome);
						battleLogMsgs.push(`<b>You will enter the ${state.currentBiome} biome!</b>`);
					}
				} else if (data.resolveBiome) {
					state.currentBiome = data.resolveBiome(nextFloor, state.currentBiome || config.startingBiome, config);
					battleLogMsgs.push(`<b>You will enter the ${state.currentBiome} biome!</b>`);
				} else {
					state.currentBiome = pickNextBiome(state.currentBiome || config.startingBiome, data, config.startingBiome);
					battleLogMsgs.push(`<b>You will enter the ${state.currentBiome} biome!</b>`);
				}
			} else if (!state.currentBiome) {
				state.currentBiome = config.startingBiome;
			}
			const { extraNotifs } = processFloorRewards(state, prevFloor, config, match.userId);
			if (state.caughtPokemon) {
				const caughtMon = state.caughtPokemon;
				const spName = Dex.species.get(toID(caughtMon.species)).name;
				if (state.team.length < 6) {
					state.team.push(caughtMon);
					battleLogMsgs.push(`<b>Gotcha! ${spName} was caught and joined the team!</b>`);
				} else {
					state.pendingSwap = caughtMon;
					battleLogMsgs.push(`<b>Gotcha! ${spName} was caught! (Team full, swap pending)</b>`);
				}
				const userData = getUserData(match.userId);
				if (state.gameMode === 'classic') {
					let baseSpecies = caughtMon.species;
					while (true) {
						const sp = Dex.species.get(baseSpecies);
						const prevo = sp.prevo;
						if (!prevo) break;
						baseSpecies = toID(prevo);
					}
					const existingStarter = userData.starters[baseSpecies];
					const baseDex = Dex.species.get(baseSpecies);
					const bestIvs = existingStarter?.ivs ? {
						hp: Math.max(existingStarter.ivs.hp, caughtMon.ivs.hp),
						atk: Math.max(existingStarter.ivs.atk, caughtMon.ivs.atk),
						def: Math.max(existingStarter.ivs.def, caughtMon.ivs.def),
						spa: Math.max(existingStarter.ivs.spa, caughtMon.ivs.spa),
						spd: Math.max(existingStarter.ivs.spd, caughtMon.ivs.spd),
						spe: Math.max(existingStarter.ivs.spe, caughtMon.ivs.spe),
					} : { ...caughtMon.ivs };
					const isShiny = existingStarter?.shiny || caughtMon.shiny;
					const unlockedNatures = new Set(existingStarter?.unlockedNatures || []);
					if (existingStarter?.nature) unlockedNatures.add(existingStarter.nature);
					if (existingStarter?.selectedNature) unlockedNatures.add(existingStarter.selectedNature);
					const isNewNature = caughtMon.nature && !unlockedNatures.has(caughtMon.nature);
					if (caughtMon.nature) unlockedNatures.add(caughtMon.nature);
					const unlockedAbilities = new Set(existingStarter?.unlockedAbilities || []);
					if (existingStarter?.ability) unlockedAbilities.add(existingStarter.ability);
					if (existingStarter?.selectedAbility) unlockedAbilities.add(existingStarter.selectedAbility);
					const isNewAbility = caughtMon.ability && !unlockedAbilities.has(caughtMon.ability);
					if (caughtMon.ability) unlockedAbilities.add(caughtMon.ability);
					const unlockedTeraTypes = new Set(existingStarter?.unlockedTeraTypes || []);
					if (existingStarter?.teraType) unlockedTeraTypes.add(existingStarter.teraType);
					const isNewTera = caughtMon.teraType && !unlockedTeraTypes.has(caughtMon.teraType);
					if (caughtMon.teraType) unlockedTeraTypes.add(caughtMon.teraType);
					const selectedNature = existingStarter?.selectedNature || caughtMon.nature;
					const selectedAbility = existingStarter?.selectedAbility || caughtMon.ability;
					const baseCaught = {
						...caughtMon,
						species: baseSpecies,
						level: 5,
						exp: expForLevel(5, getExpType(baseSpecies)),
						expType: getExpType(baseSpecies),
						moves: getLevelUpMoves(baseSpecies, 5, config.generation),
						ability: selectedAbility,
						nature: selectedNature,
						shiny: !!isShiny,
						ivs: bestIvs,
						evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
						metLevel: 5,
						metLocation: `${state.currentBiome || 'Wild Area'} (Floor ${state.floor})`,
						currentHp: 100,
						ball: caughtMon.ball,
						gender: caughtMon.gender,
						teraType: caughtMon.teraType,
						marks: caughtMon.marks ? [...caughtMon.marks] : [],
						unlockedNatures: Array.from(unlockedNatures),
						unlockedAbilities: Array.from(unlockedAbilities),
						unlockedTeraTypes: Array.from(unlockedTeraTypes),
						selectedNature: selectedNature,
						selectedAbility: selectedAbility,
					};
					baseCaught.status = undefined;
					baseCaught.heldItem = undefined;
					userData.starters[baseSpecies] = baseCaught;
					saveUserData(match.userId);
					if (!existingStarter) {
						battleLogMsgs.push(`&nbsp;&nbsp;↳ <b style="color:#fac000">${baseDex.name} has been permanently unlocked as a Starter!</b>`);
					} else {
						const upgrades: string[] = [];
						if (!existingStarter.shiny && caughtMon.shiny) upgrades.push("its Shiny form");
						if (isNewNature) upgrades.push(`new nature ${caughtMon.nature}`);
						if (isNewTera) upgrades.push(`new tera type ${caughtMon.teraType}`);
						if (isNewAbility) {
							const abilityName = Dex.abilities.get(caughtMon.ability).name || caughtMon.ability;
							upgrades.push(`new ability ${abilityName}`);
						}
						if (upgrades.length > 0) {
							battleLogMsgs.push(`&nbsp;&nbsp;↳ <b style="color:#4caf50">${baseDex.name} unlocked:</b> ${upgrades.join(', ')}`);
						} else {
							let ivImproved = false;
							if (existingStarter.ivs) {
								for (const stat of ['hp', 'atk', 'def', 'spa', 'spd', 'spe']) {
									if (caughtMon.ivs[stat] > existingStarter.ivs[stat]) {
										ivImproved = true;
										break;
									}
								}
							}
							if (ivImproved) battleLogMsgs.push(`&nbsp;&nbsp;↳ <span style="color:#8ab4f8">${baseDex.name} upgraded its Starter IVs!</span>`);
						}
					}
				}
				state.caughtPokemon = undefined;
			}
			if (detailMsgs.length) battleLogMsgs.push(...detailMsgs);
			if (extraNotifs.length) battleLogMsgs.push(...extraNotifs);
			let itemMultiplier = 1.0;
			const amuletCoins = state.keyItems?.['Amulet Coin'] || 0;
			const goldenPunches = state.keyItems?.['Golden Punch'] || 0;
			const amuletCoinItem = Object.values(SHOP_ITEMS).find(i => i.name === 'Amulet Coin');
			const goldenPunchItem = Object.values(SHOP_ITEMS).find(i => i.name === 'Golden Punch');
			itemMultiplier += (0.2 * Math.min(amuletCoinItem?.maxStack ?? 5, amuletCoins));
			itemMultiplier += (0.5 * Math.min(goldenPunchItem?.maxStack ?? 5, goldenPunches));
			const rewardMultiplier = (isBossFloor ? 1.0 : 0.2) * itemMultiplier;
			const moneyGained = getRewardMoney(prevFloor, rewardMultiplier);
			state.money = (state.money ?? 0) + moneyGained;
			battleLogMsgs.push(`<div style="color:#fac000; font-weight:bold;">Earned $${moneyGained}!</div>`);
			
			const nextState = {
				...state,
				battleRoomId: undefined,
				displayName: Users.get(match.userId)?.name || match.userId,
				timesRerolled: 0,
				pendingRewardDraft: generateDraftOptions(state, config),
				rerollCount: 0,
				view: 'draft' as const,
			};
			setState(match.userId, nextState);
		} else {
			const lossState = {
				...state,
				battleRoomId: undefined,
			};
			handleBattleLoss(lossState, match.floor, match.userId);
		}
		if (battleLogMsgs.length > 0 && room) {
			const infoboxHtml = `<div class="pr" style="background:transparent; border:none; min-height:0; max-width:100%; margin:4px 0;">` +
				`<div class="pr-card" style="margin: 0; padding: 10px 14px;">` +
				`<div class="pr-choice-heading" style="font-size: 14px; margin-bottom: 6px; text-align: center;">Floor ${match.floor} - Battle Report</div>` +
				`<div style="font-size: 12px; line-height: 1.55;">${battleLogMsgs.join('<br>')}</div>` +
				`</div></div>`;
			room.add(`|html|${infoboxHtml}`).update();
		}
		const hUser = Users.get(match.userId);
		if (hUser) refreshGamePage(hUser);
	}
};
