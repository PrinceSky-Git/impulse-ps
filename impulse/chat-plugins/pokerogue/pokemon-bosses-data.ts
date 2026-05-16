import { type TrainerMon } from './types';

export interface BossData {
	pool: TrainerMon[];
}

export const BOSSES: Record<string, Record<string, BossData>> = {
	'200': {
		'Eternatus': {
			pool: [
				{ species: 'eternatus' },
			],
		},
	},
};
