// --- Data Registry Imports ---
import { BIOMES as ClassicBiomes, BIOME_TRANSITIONS as ClassicTransitions } from './pokemon-biomes-data';
import { TRAINERS as ClassicTrainers } from './pokemon-trainers-data';

// IMPORTANT: Create these files to support the Gen 1 mode, or comment these out temporarily!
import { BIOMES as Gen1Biomes, BIOME_TRANSITIONS as Gen1Transitions } from './pokemon-biomes-gen1';
import { TRAINERS as Gen1Trainers } from './pokemon-trainers-gen1';

export const LEGENDARY_TAGS = new Set<string>([
	'Sub-Legendary', 'Restricted Legendary', 'Mythical', 'Ultra Beast', 'Paradox',
]);

export type StatusCondition = 'brn' | 'psn' | 'tox' | 'par' | 'slp' | 'frz';

// --- Game Mode Architecture ---

export type GameMode = 'classic' | 'endless' | 'random' | 'gen1';

// The universal ruleset interface
export interface ModeConfig {
	biomeRotationInterval: number; // e.g., 10 or 5
	bossInterval: number;          // e.g., 10
	hasTrainers: boolean;          // true for Classic, false for Endless
	randomizeMoves: boolean;       // true for Random mode
	randomizeAbilities: boolean;   // true for Random mode
	townEscapeFloor: number;       // e.g., 10 for Classic, 5 for Endless
}

// The Data Registry interface
export interface ModeData {
	biomes: Record<string, any>;
	transitions: Record<string, string[]>;
	trainers: Record<string, any>;
	starters: string[]; // <--- NEW: Mode-specific starters pool
}

// --- Mode-Specific Starter Pools ---

const CLASSIC_STARTERS = [
	'bulbasaur', 'charmander', 'squirtle', 'pikachu', 'eevee',
	'chikorita', 'cyndaquil', 'totodile',
	'treecko', 'torchic', 'mudkip',
	'turtwig', 'chimchar', 'piplup',
	'snivy', 'tepig', 'oshawott',
	'chespin', 'fennekin', 'froakie',
	'rowlet', 'litten', 'popplio',
	'grookey', 'scorbunny', 'sobble',
	'sprigatito', 'fuecoco', 'quaxly',
];

const GEN1_STARTERS = [
	'bulbasaur', 'charmander', 'squirtle', 'pikachu', 'eevee',
];

// Map the modes to their specific rulesets
export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
	classic: {
		biomeRotationInterval: 10,
		bossInterval: 10,
		hasTrainers: true,
		randomizeMoves: false,
		randomizeAbilities: false,
		townEscapeFloor: 10,
	},
	endless: {
		biomeRotationInterval: 5,
		bossInterval: 10,
		hasTrainers: false,
		randomizeMoves: false,
		randomizeAbilities: false,
		townEscapeFloor: 5,
	},
	random: {
		biomeRotationInterval: 10,
		bossInterval: 10,
		hasTrainers: true,
		randomizeMoves: true,
		randomizeAbilities: true,
		townEscapeFloor: 10,
	},
	gen1: {
		biomeRotationInterval: 10,
		bossInterval: 10,
		hasTrainers: true,
		randomizeMoves: false,
		randomizeAbilities: false,
		townEscapeFloor: 10,
	},
};

// Map the modes to their specific content cartridges
export const MODE_REGISTRY: Record<GameMode, ModeData> = {
	classic: {
		biomes: ClassicBiomes,
		transitions: ClassicTransitions,
		trainers: ClassicTrainers,
		starters: CLASSIC_STARTERS,
	},
	endless: {
		biomes: ClassicBiomes, // Endless reuses classic biomes
		transitions: ClassicTransitions,
		trainers: {},          // Endless has no trainers
		starters: CLASSIC_STARTERS,
	},
	random: {
		biomes: ClassicBiomes, // Random reuses classic biomes
		transitions: ClassicTransitions,
		trainers: ClassicTrainers,
		starters: CLASSIC_STARTERS,
	},
	gen1: {
		biomes: Gen1Biomes,
		transitions: Gen1Transitions,
		trainers: Gen1Trainers,
		starters: GEN1_STARTERS,
	},
};

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
	gameMode: GameMode;    // Keeps track of the ruleset for the run
	currentBiome?: string; // Keeps track of map traversal
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