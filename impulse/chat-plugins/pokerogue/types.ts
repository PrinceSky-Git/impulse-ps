export const LEGENDARY_TAGS = new Set<string>([
	'Sub-Legendary', 'Restricted Legendary', 'Mythical', 'Ultra Beast', 'Paradox',
]);

export type StatusCondition = 'brn' | 'psn' | 'tox' | 'par' | 'slp' | 'frz';

// --- Game Mode Architecture ---

export type GameMode = 'classic' | 'endless' | 'random' | 'gen1';

// The universal ruleset interface
export interface ModeConfig {
	biomeRotationInterval: number;
	bossInterval: number;
	hasTrainers: boolean;
	randomizeMoves: boolean;
	randomizeAbilities: boolean;
	townEscapeFloor: number;
	startingBiome: string;
	endlessFloorRange?: { start: number, end: number };

	// Core Engine Rules
	generation: number;
	baseFormat: string;

	// Economy & Pacing
	economy: {
		startingBP: number;
		bpPerWin: number;
		bpPerBoss: number;
		doubleBpFloor?: number;
	};

	// Story Routing
	storyRouting?: {
		fixedTrainerWaves?: number[];
		gymLeaderInterval?: number;
		maxGymLeaderTier?: number;
		firstGymLeaderWaves?: number[];
	};

	// Feature Unlocks
	mechanicUnlocks?: {
		terastallize?: number;
		mega?: number;
	};

	// Item Milestones
	milestoneRewards?: { floor: number, interval: boolean, itemType: string, itemName: string, amount: number }[];
}

// The Data Registry interface
export interface ModeData {
	biomes: Record<string, any>;
	transitions: Record<string, string[]>;
	trainers: Record<string, any>;
	starters: string[];
	excludedBiomes?: string[];
}

// --- Core Data Structures ---

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

/* * Dev Note: Trainer Progression State
 * `firstGymLeaderWave` dynamically calculates the 30-wave interval for Gym Leaders.
 * `pendingTrainerKey` acts as the bridge between prebattle routing and bot team generation.
 */
export interface PokeRogueState {
	floor: number;
	gameMode: GameMode;
	currentBiome?: string;
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
	firstGymLeaderWave?: number;
	pendingTrainerKey?: string;
}

export type SavedData = Record<string, PokeRogueState>;