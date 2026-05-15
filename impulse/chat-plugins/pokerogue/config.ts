import { BIOMES as ClassicBiomes, BIOME_TRANSITIONS as ClassicTransitions } from './mods/classic/biomes';
import { TRAINERS as ClassicTrainers } from './mods/classic/trainers';
import { type GameMode, type ModeConfig, type ModeData } from './types';

// IMPORTANT: Create these files to support the Gen 1 mode, or comment these out temporarily!
/*import { BIOMES as Gen1Biomes, BIOME_TRANSITIONS as Gen1Transitions } from './pokemon-biomes-gen1';
import { TRAINERS as Gen1Trainers } from './pokemon-trainers-gen1';*/

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
		startingBiome: 'Town',
		endlessFloorRange: { start: 191, end: 200 },
		generation: 9,
		baseFormat: '[Gen 9] PokeRogue',
		economy: {
			startingBP: 20,
			bpPerWin: 5,
			bpPerBoss: 5,
			doubleBpFloor: 100,
			startingKeyItems: ['Exp. All', 'Exp. All', 'Exp. All'],
			startingInventory: { pokeball: 5, greatball: 0, ultraball: 0, masterball: 0 },
		},
		storyRouting: {
			fixedTrainerWaves: [5, 8, 25, 35, 55, 62, 64, 66, 95, 112, 114, 115, 145, 164, 165, 182, 184, 186, 188, 190, 195, 200],
			gymLeaderInterval: 30,
			maxGymLeaderTier: 5,
			firstGymLeaderWaves: [20, 30],
		},
		mechanicUnlocks: {
			terastallize: 25,
		},
		milestoneRewards: [
			{ floor: 50, interval: true, itemType: 'inventory', itemName: 'masterball', amount: 1 },
			{ floor: 10, interval: false, itemType: 'keyItem', itemName: 'Exp. Charm', amount: 1 },
		],
	},
	endless: {
		biomeRotationInterval: 5,
		bossInterval: 10,
		hasTrainers: false,
		randomizeMoves: false,
		randomizeAbilities: false,
		townEscapeFloor: 5,
		startingBiome: 'Town',
		generation: 9,
		baseFormat: '[Gen 9] PokeRogue',
		economy: {
			startingBP: 20,
			bpPerWin: 5,
			bpPerBoss: 5,
			doubleBpFloor: 100,
			startingKeyItems: ['Exp. All', 'Exp. All', 'Exp. All'],
			startingInventory: { pokeball: 5, greatball: 0, ultraball: 0, masterball: 0 },			
		},
		mechanicUnlocks: {
			terastallize: 25,
		},
		milestoneRewards: [
			{ floor: 50, interval: true, itemType: 'inventory', itemName: 'masterball', amount: 1 },
			{ floor: 10, interval: false, itemType: 'keyItem', itemName: 'Exp. Charm', amount: 1 },
		],
	},
	random: {
		biomeRotationInterval: 10,
		bossInterval: 10,
		hasTrainers: true,
		randomizeMoves: true,
		randomizeAbilities: true,
		townEscapeFloor: 10,
		startingBiome: 'Town',
		endlessFloorRange: { start: 191, end: 200 },
		generation: 9,
		baseFormat: '[Gen 9] PokeRogue',
		economy: {
			startingBP: 20,
			bpPerWin: 5,
			bpPerBoss: 5,
			doubleBpFloor: 100,
			startingKeyItems: ['Exp. All', 'Exp. All', 'Exp. All'],
			startingInventory: { pokeball: 5, greatball: 0, ultraball: 0, masterball: 0 },
		},
		storyRouting: {
			fixedTrainerWaves: [5, 8, 25, 35, 55, 62, 64, 66, 95, 112, 114, 115, 145, 164, 165, 182, 184, 186, 188, 190, 195, 200],
			gymLeaderInterval: 30,
			maxGymLeaderTier: 5,
			firstGymLeaderWaves: [20, 30],
		},
		mechanicUnlocks: {
			terastallize: 25,
		},
		milestoneRewards: [
			{ floor: 50, interval: true, itemType: 'inventory', itemName: 'masterball', amount: 1 },
			{ floor: 10, interval: false, itemType: 'keyItem', itemName: 'Exp. Charm', amount: 1 },
		],
	},
	/*gen1: {
		biomeRotationInterval: 10,
		bossInterval: 10,
		hasTrainers: true,
		randomizeMoves: false,
		randomizeAbilities: false,
		townEscapeFloor: 10,
		startingBiome: 'Town',
		endlessFloorRange: { start: 191, end: 200 },
	},*/
};

// Map the modes to their specific content cartridges
export const MODE_REGISTRY: Record<GameMode, ModeData> = {
	classic: {
		biomes: ClassicBiomes,
		transitions: ClassicTransitions,
		trainers: ClassicTrainers,
		starters: CLASSIC_STARTERS,
		excludedBiomes: ['Endless'],
	},
	endless: {
		biomes: ClassicBiomes,
		transitions: ClassicTransitions,
		trainers: {},
		starters: CLASSIC_STARTERS,
		// No excludedBiomes — endless mode uses all biome pools
	},
	random: {
		biomes: ClassicBiomes,
		transitions: ClassicTransitions,
		trainers: ClassicTrainers,
		starters: CLASSIC_STARTERS,
		excludedBiomes: ['Endless'],
	},
	/*gen1: {
		biomes: Gen1Biomes,
		transitions: Gen1Transitions,
		trainers: Gen1Trainers,
		starters: GEN1_STARTERS,
		excludedBiomes: ['Endless'],
	},*/
};
