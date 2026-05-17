import { FS } from '../../../lib';
import { type PokeRogueState, type UserSaveData, type GlobalStatEntry, type GameMode } from './types';

const STATS_FILE = 'impulse/db/pokerogue-stats.json';
const USERS_DIR = 'impulse/db/pokerogue-users/';

export let globalStats: Record<string, GlobalStatEntry> = {};

// In-memory cache to prevent lag from constant disk reading
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
			userCache[userid] = JSON.parse(raw);
			return userCache[userid];
		}
	} catch {}

	// Create a fresh profile for new users
	const newData: UserSaveData = { 
		displayName: userid, 
		activeMode: 'classic', 
		starters: {}, 
		runs: {},
		saveSlots: {}
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
	// If activeMode is set, use it
	if (user.activeMode && user.runs[user.activeMode]) {
		return user.runs[user.activeMode]!;
	}
	// Fallback: find any existing run (handles missing activeMode after hotpatch)
	const existingMode = Object.keys(user.runs)[0] as GameMode | undefined;
	if (existingMode) {
		user.activeMode = existingMode; // repair it
		return user.runs[existingMode]!;
	}
	return null;
}

// Smart Wrapper: Saves the state directly into the correct mode slot
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

// Helper to switch modes without overwriting data
export function setActiveMode(userid: string, mode: GameMode): void {
	const user = getUserData(userid);
	user.activeMode = mode;
	saveUserData(userid);
}

// Initialize ladder stats on boot
loadGlobalStats();
