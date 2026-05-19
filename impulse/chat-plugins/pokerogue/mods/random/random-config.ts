import { type ModeConfig, type ModeData } from '../../types';

import { CLASSIC_STARTERS } from '../classic/classic-config';
import {
	CLASSIC_STYLE_MODE_DATA_BASE,
	createBaseModeConfig,
	resolveClassicStyleBoss,
	resolveClassicStyleTrainer,
} from '../shared';

export const randomConfig: ModeConfig = createBaseModeConfig({
	randomizeMoves: true,
	randomizeAbilities: true,
	economy: {
		startingBP: 20,
		bpPerWin: 5,
		bpPerBoss: 5,
	},
	victoryConfig: {
		name: 'Champion',
		dialog: 'You have conquered all 200 floors of the Random run! A true master of chaos!',
	},
});

export const randomData: ModeData = {
	...CLASSIC_STYLE_MODE_DATA_BASE,
	starters: CLASSIC_STARTERS,
	resolveTrainer: resolveClassicStyleTrainer,
	resolveBoss: resolveClassicStyleBoss,
};
