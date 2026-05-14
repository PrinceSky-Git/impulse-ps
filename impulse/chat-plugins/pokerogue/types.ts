export const LEGENDARY_TAGS = new Set<string>([
	'Sub-Legendary', 'Restricted Legendary', 'Mythical', 'Ultra Beast', 'Paradox',
]);

export type StatusCondition = 'brn' | 'psn' | 'tox' | 'par' | 'slp' | 'frz';

export interface PokemonEntry {
	species: string;
	level: number;
	exp: number;
	expType?: string;
	heldItem?: string;
	moves: string[];
	currentHp?: number;
	ppLeft?: number[];
	status?: StatusCondition;
	ball?: string;
	nature?: string;
	evs?: { hp: number, atk: number, def: number, spa: number, spd: number, spe: number };
}

export interface PokeRogueState {
	floor: number;
	team: PokemonEntry[];
	battlePoints: number;
	timesRerolled: number;
	rotationalShop: string[];
	keyItems: string[];
	luck?: number;
	inventory?: Record<string, number>;
	caughtPokemon?: PokemonEntry;
	pendingChoice?: string[];
	pendingChoiceType?: 'starter' | 'add';
	pendingSwap?: PokemonEntry;
	pendingMoves?: { pokemonIndex: number, move: string, speciesName: string }[];
	purchasedItem?: string;
	pendingConsumableType?: 'healHP' | 'revive' | 'cureStatus';
	pendingItemName?: string;
	pendingItemIsEvo?: boolean;
	isRotationalItem?: boolean;
	moveToLearn?: string;
	pokemonForTM?: number;
	moveForgotten?: string;
	itemOptions?: string[];
	battleRoomId?: string;
	streaksWon?: number;
	highestFloor?: number;
	displayName?: string;
	recordTeam?: PokemonEntry[];
	gameOver?: boolean;
	lastRunFloor?: number;
	lastRunStreaks?: number;
	notification?: string;
	pendingChoiceFloor?: number;
	pendingMoveSlot?: number;
	pendingReleaseSlot?: number;
	pendingTrainer?: string;

	// --- NEW ADDITIONS FOR TRAINER PROGRESSION ---
	
	/**
	 * Tracks the wave the player encountered their first Gym Leader (either 20 or 30).
	 * Used to calculate the strict 30-wave interval for all subsequent Gym Leaders.
	 */
	firstGymLeaderWave?: number;
	
	/**
	 * Stores the specific database key (e.g., 'fixed_8', 'gym_leader_tier_2', 'random_mid')
	 * so the battle builder knows exactly which pool to pull the trainer's team from.
	 */
	pendingTrainerKey?: string;
}

export type SavedData = Record<string, PokeRogueState>;