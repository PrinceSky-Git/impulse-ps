export const LEGENDARY_TAGS = new Set<string>([
	'Sub-Legendary', 'Restricted Legendary', 'Mythical', 'Ultra Beast', 'Paradox',
]);

export type StatusCondition = 'brn' | 'psn' | 'tox' | 'par' | 'slp' | 'frz';

export type GameMode = 'classic' | 'random';

export type RarityTier =
	| 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Ultra Rare'
	| 'Boss' | 'Boss Rare' | 'Boss Super Rare' | 'Boss Ultra Rare';

export interface BiomeEntry {
	species: string;
	weight: number;
}

export interface TrainerMon {
	species: string;
	moves?: string[];
	ivs?: any;
	evs?: any;
	ability?: string;
	teraType?: string;
	item?: string;
}

export interface TrainerData {
	teamSize: number;
	pool?: (string | TrainerMon)[];
	random?: boolean;
	chance?: number;
	spriteUrl?: string;
	dialog?: string;
}

export type BiomePool = Partial<Record<RarityTier, BiomeEntry[]>>;

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

	// Optional custom level scaling function.
	// Returns the exact level cap, and the min/max range for wild encounters on that floor.
	levelScalingFn?: (floor: number) => { cap: number, min: number, max: number };

	// Optional pool filter — replaces the default single-stage filter logic.
	// Return a filtered version of the pool; isBoss indicates if it's a boss floor.
	poolFilterFn?: (pool: BiomeEntry[], floor: number, isBoss: boolean) => BiomeEntry[];

	// Optional empty pool fallback — replaces the default cross-biome fallback logic.
	// Called when the resolved pool is empty after filtering.
	emptyPoolFallbackFn?: (floor: number, rarity: string, isBoss: boolean, biomes: Record<string, BiomePool>) => BiomeEntry[];

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

	// Feature Unlocks for AI
	mechanicUnlocks?: {
		terastallize?: number;
		mega?: number;
	};

	// maxFloor for victory condition
	maxFloor?: number;

	// Victory screen config, used when maxFloor is reached
	victoryConfig?: {
		name?: string;
		spriteUrl?: string;
		dialog?: string;
	};

	// Forces a specific biome for a floor range, e.g. 'End' for floors 191-200.
	// Ignored if ModeData.resolveBiome is provided.
	lastBiome?: {
		biome: string;
		floor: string; // format: 'start-end' e.g '191-200'
	};
}

export interface BiomeTransition {
	biome: string;
	weight: number;
}

// The Data Registry interface
export interface ModeData {
	biomes: Record<string, BiomePool>;
	transitions: Record<string, BiomeTransition[]>;
	trainers: Record<string, any>;
	starters: string[];
	excludedBiomes?: string[];

	// Optional custom shop override
	shop?: Record<string, any>;

	// Optional biome resolver — replaces the default lastBiome + currentBiome logic.
	// Return the biome name that should be used for pool lookups on this floor.
	resolveBiome?: (floor: number, currentBiome: string, config: ModeConfig) => string;

	// The engine will call this to ask the Mode if a trainer appears on this floor
	resolveTrainer?: (floor: number, state: PokeRogueState, config: ModeConfig) => { key: string, name: string } | null;

	// The engine will call this to see if a wild boss should override the biome pool
	resolveBoss?: (floor: number, currentBiome: string, config: ModeConfig) => TrainerMon[] | null;
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
