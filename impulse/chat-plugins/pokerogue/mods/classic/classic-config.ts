import { type ModeConfig, type ModeData } from '../../types';
import {
	CLASSIC_STYLE_MODE_DATA_BASE,
	createBaseModeConfig,
	resolveClassicStyleBoss,
	resolveClassicStyleTrainer,
} from '../shared';

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

export const classicConfig: ModeConfig = createBaseModeConfig({
	maxFloor: 200,
	victoryConfig: {
		name: 'Champion',
		dialog: 'You have conquered all 200 floors of the Classic run! You are a true PokéRogue Champion!',
	},
});

export const classicData: ModeData = {
	...CLASSIC_STYLE_MODE_DATA_BASE,
	starters: CLASSIC_STARTERS,
	useNewStarterSelectionUI: true,
	resolveTrainer: resolveClassicStyleTrainer,
	resolveBoss: resolveClassicStyleBoss,
};
