import { type TrainerMon } from './pokemon';

export interface BossData {
	pool: TrainerMon[];
}

export const BOSSES: Record<string, Record<string, BossData>> = {
	'200': {
		'Brock': {
			pool: [
				{ species: 'eternatus' },
			],
		},
	},
};
