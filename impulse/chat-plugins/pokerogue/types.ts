export type StatusCondition = 'brn' | 'psn' | 'tox' | 'par' | 'slp' | 'frz';

export type GameMode = 'classic' | 'random';

export type RarityTier =
	| 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Ultra Rare' |
	'Boss' | 'Boss Rare' | 'Boss Super Rare' | 'Boss Ultra Rare';

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
	doubles?: boolean;
}

export type BiomePool = Partial<Record<RarityTier, BiomeEntry[]>>;

export interface ModeConfig {
	biomeRotationInterval: number;
	bossInterval: number;
	hasTrainers?: boolean;
	randomizeMoves?: boolean;
	randomizeAbilities?: boolean;
	startingBiome: string;
	starterLevel?: number;
	generation: number;
	baseFormat: string;
	doublesFormat?: string;
	milestoneRewards?: { floor: number, interval: boolean, itemType: string, itemName: string, amount: number }[];

	levelScalingFn?: (floor: number) => { cap: number, min: number, max: number };

	poolFilterFn?: (pool: BiomeEntry[], floor: number, isBoss: boolean) => BiomeEntry[];

	emptyPoolFallbackFn?: (floor: number, rarity: string, isBoss: boolean, biomes: Record<string, BiomePool>) => BiomeEntry[];

	economy: {
		startingMoney: number,
		startingKeyItems?: Record<string, number>,
		startingInventory?: Record<string, number>,
		draftChoicesCount?: number,
		maxDraftChoicesCount?: number,

	};

	storyRouting?: {
		fixedTrainerWaves?: number[],
		gymLeaderInterval?: number,
		maxGymLeaderTier?: number,
		firstGymLeaderWaves?: number[],
	};

	mechanicUnlocks?: {
		terastallize?: number,
		mega?: number,
	};

	maxFloor?: number;
	maxLevel?: number;

	victoryConfig?: {
		name?: string,
		spriteUrl?: string,
		dialog?: string,
	};

	lastBiome?: {
		biome: string,
		floor: string,
	};
}

export interface BiomeTransition {
	biome: string;
	weight: number;
}

export interface ModeData {
	biomes: Record<string, BiomePool>;
	transitions: Record<string, BiomeTransition[]>;
	trainers: Record<string, any>;
	starters: string[];
	useNewStarterSelectionUI?: boolean;
	excludedBiomes?: string[];

	shop?: Record<string, any>;

	resolveBiome?: (floor: number, currentBiome: string, config: ModeConfig) => string;

	resolveTrainer?: (floor: number, state: PokeRogueState, config: ModeConfig) => { key: string, name: string } | null;

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
	status?: StatusCondition;
	ball?: string;
	nature?: string;
	evs?: { hp: number, atk: number, def: number, spa: number, spd: number, spe: number };
	ability?: string;
	ivs?: { hp: number, atk: number, def: number, spa: number, spd: number, spe: number };
	teraType?: string;
	gender?: 'M' | 'F' | 'N';
	shiny?: boolean;
	happiness?: number;
	nickname?: string;
	originalTrainer?: string;
	otId?: string;
	metLocation?: string;
	metLevel?: number;
	metDate?: number;
	marks?: string[];

	unlockedNatures?: string[];
	unlockedAbilities?: string[];
	selectedNature?: string;
	selectedAbility?: string;
}

export interface PokeRogueState {
	starterSearch?: string;
	gameWon?: boolean;
	floor: number;
	gameMode: GameMode;
	currentBiome?: string;
	team: PokemonEntry[];

	money: number;
	pendingRewardDraft?: string[];
	rerollCount?: number;
	luck?: number;

	timesRerolled: number;
	rotationalShop: string[];
	keyItems: Record<string, number>;
	inventory?: Record<string, number>;
	lureCharges?: number;
	caughtPokemon?: PokemonEntry;
	pendingChoice?: string[];
	pendingChoiceType?: 'starter' | 'add';
	pendingSwap?: PokemonEntry;
	pendingMoves?: { pokemonIndex: number, move: string, speciesName: string }[];
	purchasedItem?: string;
	pendingConsumableType?: 'healHP' | 'revive' | 'cureStatus' | 'vitamin' | 'tm' | 'evolveItem' | 'mint';
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
	lastTrainerFloor?: number;
	notification?: string;
	pendingChoiceFloor?: number;
	pendingMoveSlot?: number;
	pendingReleaseSlot?: number;
	pendingTrainer?: string;
	firstGymLeaderWave?: number;
	pendingTrainerKey?: string;

	pendingStatsSlot?: number;
	statsTab?: number;
	lastThrowTime?: number;
	isConfiguringStarter?: boolean;
}

export interface GlobalStatEntry {
	highestFloor: number;
	displayName: string;
	recordTeam: PokemonEntry[];
}

export interface UserSaveData {
	displayName: string;
	activeMode: GameMode;
	starters: Record<string, PokemonEntry>;
	runs: Partial<Record<GameMode, PokeRogueState>>;
	saveSlots: Partial<Record<number, PokeRogueState>>;
}
