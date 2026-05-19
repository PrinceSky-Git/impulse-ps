import { type GameMode, type ModeConfig, type ModeData } from './types';

import { classicConfig, classicData } from './mods/classic/classic-config';

import { randomConfig, randomData } from './mods/random/random-config';

export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
	classic: classicConfig,

	random: randomConfig,

};

export const MODE_REGISTRY: Record<GameMode, ModeData> = {
	classic: classicData,

	random: randomData,

};

export function getModeConfig(mode?: GameMode): ModeConfig {
	if (mode && MODE_CONFIGS[mode]) return MODE_CONFIGS[mode];
	return MODE_CONFIGS.classic;
}

export function getModeData(mode?: GameMode): ModeData {
	if (mode && MODE_REGISTRY[mode]) return MODE_REGISTRY[mode];
	return MODE_REGISTRY.classic;
}
