import { type GameMode, type ModeConfig, type ModeData } from './types';

import { classicConfig, classicData } from './mods/classic/classic-config';

import { randomConfig, randomData } from './mods/random/random-config';

import { endlessConfig, endlessData } from './mods/endless/endless-config';

export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
	classic: classicConfig,

	random: randomConfig,

	endless: endlessConfig,

};

export const MODE_REGISTRY: Record<GameMode, ModeData> = {
	classic: classicData,

	random: randomData,

	endless: endlessData,

};
