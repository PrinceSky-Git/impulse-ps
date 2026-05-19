import { type ModeConfig, type ModeData, type PokeRogueState, type TrainerMon } from '../types';

import { BIOMES as ClassicBiomes, BIOME_TRANSITIONS as ClassicTransitions } from './classic/biomes';
import { TRAINERS as ClassicTrainers } from './classic/trainers';
import { CLASSIC_BOSSES } from './classic/classic-bosses';

type ModeConfigOverrides = Omit<Partial<ModeConfig>, 'economy' | 'storyRouting' | 'mechanicUnlocks'> & {
	economy?: Partial<ModeConfig['economy']>;
	storyRouting?: Partial<NonNullable<ModeConfig['storyRouting']>>;
	mechanicUnlocks?: Partial<NonNullable<ModeConfig['mechanicUnlocks']>>;
};

export function createBaseModeConfig(overrides: ModeConfigOverrides): ModeConfig {
	const { economy, storyRouting, mechanicUnlocks, ...configOverrides } = overrides;

	return {
		biomeRotationInterval: 10,
		bossInterval: 10,
		hasTrainers: true,
		randomizeMoves: false,
		randomizeAbilities: false,
		startingBiome: 'Town',
		starterLevel: 5,
		generation: 9,
		baseFormat: '[Gen 9] PokeRogue',
		doublesFormat: '[Gen 9] PokeRogue Doubles',
		economy: {
			startingBP: economy?.startingBP ?? 50,
			bpPerWin: economy?.bpPerWin ?? 10,
			bpPerBoss: economy?.bpPerBoss ?? 10,
			doubleBpFloor: economy?.doubleBpFloor ?? 100,
			startingKeyItems: economy?.startingKeyItems ?? ['Exp. All', 'Exp. All', 'Exp. All'],
			startingInventory: economy?.startingInventory ?? { pokeball: 5, greatball: 0, ultraball: 0, masterball: 0 },
		},
		storyRouting: {
			fixedTrainerWaves: storyRouting?.fixedTrainerWaves ?? [5, 8, 25, 35, 55, 62, 64, 66, 95, 112, 114, 115, 145, 164, 165, 182, 184, 186, 188, 190, 195, 200],
			gymLeaderInterval: storyRouting?.gymLeaderInterval ?? 30,
			maxGymLeaderTier: storyRouting?.maxGymLeaderTier ?? 5,
			firstGymLeaderWaves: storyRouting?.firstGymLeaderWaves ?? [20, 30],
		},
		mechanicUnlocks: {
			terastallize: mechanicUnlocks?.terastallize ?? 25,
			mega: mechanicUnlocks?.mega,
		},
		milestoneRewards: [
			{ floor: 50, interval: true, itemType: 'inventory', itemName: 'masterball', amount: 1 },
			{ floor: 10, interval: false, itemType: 'keyItem', itemName: 'Exp. Charm', amount: 1 },
		],
		lastBiome: {
			biome: 'End',
			floor: '191-200',
		},
		...configOverrides,
	};
}

export function resolveClassicStyleTrainer(
	floor: number, state: PokeRogueState, config: ModeConfig
): { key: string, name: string } | null {
	const routing = config.storyRouting;
	let trainerKey: string | null = null;

	if (routing?.fixedTrainerWaves?.includes(floor)) {
		trainerKey = `fixed_${floor}`;
	} else if (floor % config.bossInterval === 0 && routing?.gymLeaderInterval) {
		const firstWaves = routing.firstGymLeaderWaves || [];

		if (!state.firstGymLeaderWave && firstWaves.includes(floor)) {
			if (Math.random() < 0.5 || floor === firstWaves[firstWaves.length - 1]) {
				state.firstGymLeaderWave = floor;
			}
		}

		if (state.firstGymLeaderWave && (floor - state.firstGymLeaderWave) % routing.gymLeaderInterval === 0) {
			const encounterNum = 1 + ((floor - state.firstGymLeaderWave) / routing.gymLeaderInterval);
			trainerKey = `gym_leader_tier_${Math.min(routing.maxGymLeaderTier || 5, encounterNum)}`;
		}
	} else if (state.currentBiome !== config.startingBiome && Math.random() < 0.15) {
		const lastTrainer = state.lastTrainerFloor || -99;

		if (floor - lastTrainer >= 3) {
			if (floor <= 30) trainerKey = 'random_early';
			else if (floor <= 100) trainerKey = 'random_mid';
			else trainerKey = 'random_late';
		}
	}

	if (trainerKey && ClassicTrainers[trainerKey]) {
		const trainerNames = Object.keys(ClassicTrainers[trainerKey]);
		const selectedTrainer = trainerNames[Math.floor(Math.random() * trainerNames.length)];

		if (trainerKey.startsWith('random_')) {
			state.lastTrainerFloor = floor;
		}

		return { key: trainerKey, name: selectedTrainer };
	}

	return null;
}

export function resolveClassicStyleBoss(floor: number): TrainerMon[] | null {
	const floorKey = floor.toString();

	if (CLASSIC_BOSSES[floorKey]) {
		const bossNames = Object.keys(CLASSIC_BOSSES[floorKey]);
		const selectedBoss = bossNames[Math.floor(Math.random() * bossNames.length)];
		return CLASSIC_BOSSES[floorKey][selectedBoss].pool;
	}

	return null;
}

export const CLASSIC_STYLE_MODE_DATA_BASE: Omit<ModeData, 'starters'> = {
	biomes: ClassicBiomes,
	transitions: ClassicTransitions,
	trainers: ClassicTrainers,
	excludedBiomes: ['End'],
};
