import { FS } from '../../../lib';
import { type PokeRogueState, type UserSaveData, type GlobalStatEntry, type GameMode } from './types';

const STATS_FILE = 'impulse/db/pokerogue-stats.json';
const USERS_DIR = 'impulse/db/pokerogue-users/';

export let globalStats: Record<string, GlobalStatEntry> = {};

export const userCache: Record<string, UserSaveData> = {};

export function loadGlobalStats(): void {
	try {
		const raw = FS(STATS_FILE).readIfExistsSync();
		if (raw) globalStats = JSON.parse(raw);
	} catch {
		globalStats = {};
	}
}

export function saveGlobalStats(): void {
	FS(STATS_FILE).writeUpdate(() => JSON.stringify(globalStats), { throttle: 3000 });
}

export function getUserData(userid: string): UserSaveData {
	if (userCache[userid]) return userCache[userid];

	try {
		const raw = FS(`${USERS_DIR}${userid}.json`).readIfExistsSync();
		if (raw) {
			const data: UserSaveData = JSON.parse(raw);
			for (const sid in data.starters) {
				const s = data.starters[sid];
				if (!s.unlockedNatures) s.unlockedNatures = s.nature ? [s.nature] : [];
				if (!s.unlockedAbilities) s.unlockedAbilities = s.ability ? [s.ability] : [];
				if (!s.unlockedTeraTypes) s.unlockedTeraTypes = s.teraType ? [s.teraType] : [];
				if (!s.selectedNature && s.nature) s.selectedNature = s.nature;
				if (!s.selectedAbility && s.ability) s.selectedAbility = s.ability;
			}
			for (const runMode in data.runs) {
				const run = data.runs[runMode as GameMode];
				if (run && Array.isArray(run.keyItems)) {
					const newKeyItems: Record<string, number> = {};
					for (const item of run.keyItems) {
						newKeyItems[item] = (newKeyItems[item] || 0) + 1;
					}
					run.keyItems = newKeyItems as any;
				}
			}
			for (const slotId in data.saveSlots) {
				const slot = data.saveSlots[slotId];
				if (slot && Array.isArray(slot.keyItems)) {
					const newKeyItems: Record<string, number> = {};
					for (const item of slot.keyItems) {
						newKeyItems[item] = (newKeyItems[item] || 0) + 1;
					}
					slot.keyItems = newKeyItems as any;
				}
			}
			userCache[userid] = data;
			return userCache[userid];
		}
	} catch {}

	const newData: UserSaveData = {
		displayName: userid,
		activeMode: 'classic',
		starters: {},
		runs: {},
		saveSlots: {},
	};
	userCache[userid] = newData;
	return newData;
}

export function saveUserData(userid: string): void {
	if (!userCache[userid]) return;
	FS(`${USERS_DIR}${userid}.json`).writeUpdate(() => JSON.stringify(userCache[userid]), { throttle: 3000 });
}

export function saveAllData(): void {
	saveGlobalStats();
	for (const userid in userCache) {
		saveUserData(userid);
	}
}

export function getState(userid: string): PokeRogueState | null {
	const user = getUserData(userid);

	if (user.activeMode && user.runs[user.activeMode]) {
		return user.runs[user.activeMode]!;
	}

	const existingMode = Object.keys(user.runs)[0] as GameMode | undefined;
	if (existingMode) {
		user.activeMode = existingMode;
		return user.runs[existingMode]!;
	}
	return null;
}

export function setState(userid: string, state: PokeRogueState): void {
	const user = getUserData(userid);
	user.activeMode = state.gameMode;
	user.runs[state.gameMode] = state;
	saveUserData(userid);
}

export function deleteState(userid: string): void {
	const user = getUserData(userid);
	if (user.activeMode) {
		delete user.runs[user.activeMode];
		saveUserData(userid);
	}
}

export function setActiveMode(userid: string, mode: GameMode): void {
	const user = getUserData(userid);
	user.activeMode = mode;
	saveUserData(userid);
}

loadGlobalStats();
