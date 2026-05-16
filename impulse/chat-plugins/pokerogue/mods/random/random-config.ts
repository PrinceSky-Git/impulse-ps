import { type ModeConfig, type ModeData, type PokeRogueState } from '../../types';

// Random mode also pulls data assets from the classic folder
import { BIOMES as ClassicBiomes, BIOME_TRANSITIONS as ClassicTransitions } from '../classic/biomes';
import { TRAINERS as ClassicTrainers } from '../classic/trainers';
import { CLASSIC_STARTERS } from '../classic/classic-config';

export const randomConfig: ModeConfig = {
	biomeRotationInterval: 10,
	bossInterval: 10,
	hasTrainers: true,
	randomizeMoves: true, // Specific to Random Mode
	randomizeAbilities: true, // Specific to Random Mode
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
	lastBiome: {
		biome: 'End',
		floor: '191-200',
	},
	// Assuming you want the same victory screen as Classic
	victoryConfig: {
		name: 'Champion',
		dialog: 'You have conquered all 200 floors of the Random run! A true master of chaos!',
	},
};

export const randomData: ModeData = {
	biomes: ClassicBiomes,
	transitions: ClassicTransitions,
	trainers: ClassicTrainers,
	starters: CLASSIC_STARTERS,
	excludedBiomes: ['End'],
	
	resolveTrainer: (floor: number, state: PokeRogueState, config: ModeConfig) => {
		const routing = config.storyRouting;
		let trainerKey: string | null = null;
		
		// 1. Check fixed story waves
		if (routing?.fixedTrainerWaves?.includes(floor)) {
			trainerKey = `fixed_${floor}`;
		} 
		// 2. Check Gym Leaders (Boss Floors)
		else if (floor % config.bossInterval === 0 && routing?.gymLeaderInterval) {
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
		} 
		// 3. Check Random Standard Encounters (15% chance on standard floors)
		else if (Math.random() < 0.15) {
			if (floor <= 30) trainerKey = 'random_early';
			else if (floor <= 100) trainerKey = 'random_mid';
			else trainerKey = 'random_late';
		}

		// If a key was found, pick a random trainer from that tier
		if (trainerKey && ClassicTrainers[trainerKey]) {
			const trainerNames = Object.keys(ClassicTrainers[trainerKey]);
			const selectedTrainer = trainerNames[Math.floor(Math.random() * trainerNames.length)];
			return { key: trainerKey, name: selectedTrainer };
		}

		return null;
	}
};
