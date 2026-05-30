import { type ModeConfig, type ModeData, type PokeRogueState, type TrainerMon } from '../../types';
import { BIOMES as ClassicBiomes, BIOME_TRANSITIONS as ClassicTransitions } from '../classic/biomes';

// Endless uses the same starter pool concept but all owned starters + base pool
export const ENDLESS_STARTERS = [
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

// Paradox Pokemon pool — spawned as boss every 50 waves
const PARADOX_POOL: string[] = [
	'greatttusk', 'screamtail', 'brutebonnet', 'fluttermane', 'slitherwing',
	'sandyshocks', 'irontreads', 'ironbundle', 'ironhands', 'ironjugulis',
	'ironmoth', 'ironthorns', 'roaringmoon', 'ironvaliant', 'walkingwake',
	'ironleaves', 'gogoat', 'ragingbolt', 'ironboulder', 'ironcrown',
];

// Level scaling formula for endless — no hard cap, grows continuously
// Uses a quadratic curve that matches PokéRogue's enemy level progression
function endlessLevelScaling(floor: number): { cap: number, min: number, max: number, bossLevel?: number } {
	const bossInterval = 10;
	// No cap in endless — set cap high enough that it never restricts
	const cap = 10000;

	// For floors <= 200 use the canonical classic boss levels as anchor points,
	// then switch to a continuous quadratic formula past 200
	const CLASSIC_BOSS_LEVELS: Record<number, number> = {
		0: 3,
		10: 10, 20: 16, 30: 24, 40: 32,
		50: 38, 60: 48, 70: 56, 80: 64, 90: 74,
		100: 84, 110: 94, 120: 104, 130: 114, 140: 126, 150: 138,
		160: 150, 170: 162, 180: 174, 190: 188, 200: 200,
	};

	// Past wave 200 use: level = 200 + (floor - 200) * 0.5 + ((floor - 200) / 50)^2
	// This gives a gradual but accelerating growth beyond the classic cap
	function levelAtFloor(f: number): number {
		if (f <= 0) return 3;
		if (f <= 200) {
			const prevBoss = Math.floor(f / bossInterval) * bossInterval;
			const nextBoss = prevBoss + bossInterval;
			const prevLvl = CLASSIC_BOSS_LEVELS[prevBoss] ?? (3 + prevBoss / 2);
			const nextLvl = CLASSIC_BOSS_LEVELS[nextBoss] ?? (3 + nextBoss / 2);
			const progress = (f % bossInterval) / bossInterval;
			return prevLvl + (nextLvl - prevLvl) * progress;
		}
		const excess = f - 200;
		return 200 + excess * 0.5 + Math.pow(excess / 50, 2);
	}

	if (floor % bossInterval === 0) {
		let bossLevel: number;
		if (floor <= 200 && CLASSIC_BOSS_LEVELS[floor] !== undefined) {
			bossLevel = CLASSIC_BOSS_LEVELS[floor];
		} else {
			bossLevel = Math.max(1, Math.round(levelAtFloor(floor) * 1.2));
		}
		return { cap, min: bossLevel, max: bossLevel, bossLevel };
	}

	const base = Math.max(1, Math.round(levelAtFloor(floor)));
	const min = Math.max(1, base - 1);
	const max = base + 1;
	return { cap, min, max };
}

// Resolve which Paradox Pokemon appears as the boss on a multiples-of-50 wave
function resolveParadoxBoss(floor: number): TrainerMon[] {
	const idx = Math.floor(Math.random() * PARADOX_POOL.length);
	return [{ species: PARADOX_POOL[idx] }];
}

// Eternatus — minor boss every 250 waves (same as PokéRogue)
function resolveEternatusBoss(_floor: number): TrainerMon[] {
	return [{ species: 'eternatus' }];
}

// Eternamax Eternatus — major boss every 1000 waves
function resolveEternamaxBoss(_floor: number): TrainerMon[] {
	return [{ species: 'eternatuseternamax' }];
}

export const endlessConfig: ModeConfig = {
	biomeRotationInterval: 3, // biomes change every 1-4 waves; 3 is the average used as the interval tick
	bossInterval: 10,
	startingBiome: 'Town',
	starterLevel: 5,
	// Endless allows up to 15 points of starters vs classic's 10
	maxStarterCost: 15,

	generation: 9,
	baseFormat: '[Gen 9] PokeRogue Endless',
	doublesFormat: '[Gen 9] PokeRogue Endless Doubles',

	// Endless has no trainers
	hasTrainers: false,
	randomizeMoves: false,
	randomizeAbilities: false,

	economy: {
		startingMoney: 10000,
		// Endless starts with same item loadout as classic
		startingKeyItems: { 'Exp. All': 2, 'Exp. Charm': 1 },
		startingInventory: { pokeball: 5, greatball: 0, ultraball: 0, masterball: 0 },
	},

	mechanicUnlocks: {
		terastallize: 40,
	},

	// No milestone rewards in endless (no rival EXP shares, etc.)
	milestoneRewards: [],

	// No hard floor limit
	maxFloor: undefined,

	levelScalingFn: endlessLevelScaling,
};

export const endlessData: ModeData = {
	// Reuse Classic biomes and transitions exactly
	biomes: ClassicBiomes,
	transitions: ClassicTransitions,
	trainers: {},
	starters: ENDLESS_STARTERS,
	excludedBiomes: ['End'],
	useNewStarterSelectionUI: true,

	// No trainer resolution in endless
	resolveTrainer: (_floor, _state, _config) => null,

	// Boss resolution: Paradox > Eternatus > Eternamax, else null (random wild boss)
	resolveBoss: (floor: number, _currentBiome: string, _config: ModeConfig): TrainerMon[] | null => {
		// Every 1000 waves: Eternamax Eternatus
		if (floor % 1000 === 0) {
			return resolveEternamaxBoss(floor);
		}

		// Every 250 waves: Eternatus
		if (floor % 250 === 0) {
			return resolveEternatusBoss(floor);
		}

		// Every 50 waves: random Paradox Pokemon
		if (floor % 50 === 0) {
			return resolveParadoxBoss(floor);
		}

		// Every 10 waves (standard boss): random wild boss from biome pool (no override)
		return null;
	},

	// Biomes change randomly every 1-4 waves in endless
	// resolveBiome is called when the biome rotation interval triggers
	// We use a random transition each time instead of a fixed 10-wave rotation
	resolveBiome: (floor: number, currentBiome: string, config: ModeConfig): string => {
		const excluded = new Set(['End']);
		const options = (ClassicTransitions[currentBiome] ?? []).filter(t => !excluded.has(t.biome));

		if (options.length === 0) {
			const fallback = Object.keys(ClassicBiomes).filter(b => !excluded.has(b) && b !== currentBiome);
			return fallback[Math.floor(Math.random() * fallback.length)] || currentBiome;
		}

		const totalWeight = options.reduce((sum, t) => sum + t.weight, 0);
		let roll = Math.random() * totalWeight;
		for (const t of options) {
			roll -= t.weight;
			if (roll <= 0) return t.biome;
		}
		return options[options.length - 1].biome;
	},
};
