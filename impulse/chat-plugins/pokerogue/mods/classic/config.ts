import { type ModeConfig, type ModeData } from '../../types';
import { BIOMES as ClassicBiomes, BIOME_TRANSITIONS as ClassicTransitions } from './biomes';
import { TRAINERS as ClassicTrainers } from './trainers';

export const CLASSIC_STARTERS = [
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

export const classicConfig: ModeConfig = {
	biomeRotationInterval: 10,
	bossInterval: 10,
	hasTrainers: true,
	randomizeMoves: false,
	randomizeAbilities: false,
	townEscapeFloor: 10,
	startingBiome: 'Town',
	endlessFloorRange: { start: 191, end: 200 },
	starterLevel: 5,
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
};

export const classicData: ModeData = {
	biomes: ClassicBiomes,
	transitions: ClassicTransitions,
	trainers: ClassicTrainers,
	starters: CLASSIC_STARTERS,
	excludedBiomes: ['Endless'],
};
