export const LEGENDARY_TAGS = new Set<string>([
	'Sub-Legendary', 'Restricted Legendary', 'Mythical', 'Ultra Beast', 'Paradox',
]);

export type StatusCondition = 'brn' | 'psn' | 'tox' | 'par' | 'slp' | 'frz';

export type GameMode = 'classic' | 'endless' | 'random' | 'gen1';

// The universal ruleset interface
export interface ModeConfig {
	biomeRotationInterval: number;
	bossInterval: number;
	hasTrainers: boolean;
	randomizeMoves: boolean;
	randomizeAbilities: boolean;
	startingBiome: string;
	starterLevel?: number;
	generation: number;
	baseFormat: string;
	milestoneRewards?: { floor: number, interval: boolean, itemType: string, itemName: string, amount: number }[];
	// Optional custom scaling function. 
	// Returns the exact level cap, and the min/max range for wild encounters on that floor.
	levelScalingFn?: (floor: number) => { cap: number, min: number, max: number };
	// Economy & Pacing
	economy: {
		startingBP: number;
		bpPerWin: number;
		bpPerBoss: number;
		doubleBpFloor?: number;
		startingKeyItems?: string[];
		startingInventory?: Record<string, number>;
	};
	// Story Routing
	storyRouting?: {
		fixedTrainerWaves?: number[];
		gymLeaderInterval?: number;
		maxGymLeaderTier?: number;
		firstGymLeaderWaves?: number[];
	};
	// Feature Unlocks For Ai
	mechanicUnlocks?: {
		terastallize?: number;
		mega?: number;
	};
	// maxFloor for victory and custom victory ui (check wwlcome ui for reference)
	maxFloor?: number;
	victoryConfig?: {
		name?: string;
		spriteUrl?: string;
		dialog?: string;
	};
	
	lastBiome?: {
		biome: string;
		floor: string; // format: 'start-end' e.g '191-200'
	};
}

// The Data Registry interface
export interface ModeData {
	biomes: Record<string, any>;
	transitions: Record<string, string[]>;
	trainers: Record<string, any>;
	starters: string[];
	excludedBiomes?: string[];	
	// Optional custom shop override
	shop?: Record<string, any>; 
}

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
	ability?: string;
}

/* * Dev Note: Trainer Progression State
 * `firstGymLeaderWave` dynamically calculates the 30-wave interval for Gym Leaders.
 * `pendingTrainerKey` acts as the bridge between prebattle routing and bot team generation.
 */
export interface PokeRogueState {
	gameWon?: boolean;
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
