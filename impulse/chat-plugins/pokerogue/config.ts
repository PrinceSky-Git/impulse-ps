import { type GameMode, type ModeConfig, type ModeData } from './types';

// Import the specific configs from their respective core mode folders
import { classicConfig, classicData } from './mods/classic/config';
import { randomConfig, randomData } from './mods/random/config';

// Import custom mod configs (like Gen 1!)
// Make sure the path correctly points to where you created your Gen 1 mod
// import { gen1Config, gen1Data } from '../../../data/mods/pokerogue-gen1/config';

export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
	classic: classicConfig,
	random: randomConfig,
	// gen1: gen1Config,
};

export const MODE_REGISTRY: Record<GameMode, ModeData> = {
	classic: classicData,
	random: randomData,
	// gen1: gen1Data,
};
