import { type ModeConfig, type ModeData } from '../../types';

// Endless pulls data assets from the classic folder to avoid duplicating them
import { BIOMES as ClassicBiomes, BIOME_TRANSITIONS as ClassicTransitions } from '../classic/biomes';
import { CLASSIC_STARTERS } from '../classic/config';

export const endlessConfig: ModeConfig = {
	biomeRotationInterval: 5,
	bossInterval: 10,
	hasTrainers: false,
	randomizeMoves: false,
	randomizeAbilities: false,
	townEscapeFloor: 5,
	startingBiome: 'Town',
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
	mechanicUnlocks: {
		terastallize: 25,
	},
	milestoneRewards: [
		{ floor: 50, interval: true, itemType: 'inventory', itemName: 'masterball', amount: 1 },
		{ floor: 10, interval: false, itemType: 'keyItem', itemName: 'Exp. Charm', amount: 1 },
	],
};

export const endlessData: ModeData = {
	biomes: ClassicBiomes,
	transitions: ClassicTransitions,
	trainers: {}, // No trainers in Endless
	starters: CLASSIC_STARTERS,
	// No excludedBiomes — endless mode uses all biome pools
};
