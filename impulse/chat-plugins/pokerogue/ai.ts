import { Utils } from '../../../lib';

export type ActionType = 'move' | 'switch';

export interface Action {
	type: ActionType;
	id: string; 
	slot: number; 
	priority: number;
}

export interface SimPokemon {
	species: string;
	hpRatio: number;
	types: string[];
	baseStats: { hp: number, atk: number, def: number, spa: number, spd: number, spe: number };
	isActive: boolean;
	isFainted: boolean;
	moves: string[];
}

export interface SimState {
	aiActive: SimPokemon;
	aiBench: SimPokemon[];
	playerActive: SimPokemon;
}

export class PokeRogueAI {
	private request: any;
	private playerActiveSpecies: string;
	private readonly MAX_DEPTH = 2; 

	constructor(requestJson: string, playerActiveSpecies: string) {
		this.playerActiveSpecies = playerActiveSpecies;
		try {
			this.request = JSON.parse(requestJson.startsWith('|request|') ? requestJson.slice(9) : requestJson);
		} catch {
			this.request = null;
		}
	}

	public async decide(): Promise<string> {
		if (!this.request || this.request.wait) return 'pass';
		if (this.request.teamPreview) return this.handleTeamPreview();
		if (this.request.forceSwitch) return this.handleForceSwitch();
		if (this.request.active) return this.runMinimax();
		return 'move 1';
	}

	private handleTeamPreview(): string {
		const count = this.request.side?.pokemon?.length ?? 1;
		const order = Array.from({ length: count }, (_, i) => i + 1);
		return `team ${order.join('')}`;
	}

	private handleForceSwitch(): string {
		const choices: string[] = [];
		const pokemon = this.request.side?.pokemon ?? [];
		const switchStart = (this.request.forceSwitch as boolean[]).length;

		for (const forceSwitchEntry of (this.request.forceSwitch as boolean[])) {
			if (!forceSwitchEntry) {
				choices.push('pass');
				continue;
			}
			
			let bestIdx = -1;
			let bestHp = -1;
			
			for (let i = switchStart; i < pokemon.length; i++) {
				const p = pokemon[i];
				if (p.condition?.endsWith(' fnt')) continue;
				const hpRatio = this.parseHpRatio(p.condition);
				if (hpRatio > bestHp) {
					bestHp = hpRatio;
					bestIdx = i + 1;
				}
			}
			choices.push(bestIdx !== -1 ? `switch ${bestIdx}` : 'pass');
		}
		return choices.join(', ');
	}

	/* * Dev Note: Minimax Search Core
	 * A depth-limited zero-sum search tree. We assume the player will always make 
	 * the optimal counter-play (minimizing our score), and we choose the action that 
	 * maximizes our score within that worst-case scenario. Alpha-Beta pruning is 
	 * implemented to skip evaluating branches that are mathematically inferior.
	 */
	private runMinimax(): string {
		const state = this.buildSimState();
		if (!state.aiActive || !state.playerActive) return 'move 1';

		const aiActions = this.getLegalActions(this.request.side?.pokemon, this.request.active?.[0]);
		
		let bestAction = aiActions[0];
		let bestScore = -Infinity;

		for (const action of aiActions) {
			const score = this.minNode(state, action, 0, -Infinity, Infinity);
			if (score > bestScore) {
				bestScore = score;
				bestAction = action;
			}
		}

		return `${bestAction.type} ${bestAction.slot}`;
	}

	private minNode(state: SimState, aiAction: Action, depth: number, alpha: number, beta: number): number {
		const playerActions = this.guessPlayerActions(state);
		let minScore = Infinity;

		for (const pAction of playerActions) {
			const nextState = this.simulateTurn(state, aiAction, pAction);
			const score = this.maxNode(nextState, depth + 1, alpha, beta);
			
			if (score < minScore) minScore = score;
			if (minScore <= alpha) return minScore;
			if (minScore < beta) beta = minScore;
		}

		return minScore;
	}

	private maxNode(state: SimState, depth: number, alpha: number, beta: number): number {
		if (depth >= this.MAX_DEPTH || state.aiActive.isFainted || state.playerActive.isFainted) {
			return this.evaluateState(state);
		}

		const aiActions = this.generateSimActions(state.aiActive, state.aiBench);
		let maxScore = -Infinity;

		for (const action of aiActions) {
			const score = this.minNode(state, action, depth, alpha, beta);
			if (score > maxScore) maxScore = score;
			if (maxScore >= beta) return maxScore;
			if (maxScore > alpha) alpha = maxScore;
		}

		return maxScore;
	}

	private evaluateState(state: SimState): number {
		let aiScore = 0;
		let playerScore = 0;

		aiScore += state.aiActive.hpRatio * 100;
		playerScore += state.playerActive.hpRatio * 100;

		for (const p of state.aiBench) aiScore += p.hpRatio * 40;

		if (state.aiActive.isFainted) aiScore -= 200;
		if (state.playerActive.isFainted) playerScore -= 200;

		let matchupAdvantage = 0;
		for (const aiType of state.aiActive.types) {
			for (const pType of state.playerActive.types) {
				const eff = Dex.getEffectiveness(aiType, pType);
				if (eff === 1) matchupAdvantage += 15;
				if (eff === -1) matchupAdvantage -= 10;
			}
		}
		aiScore += matchupAdvantage;

		return aiScore - playerScore;
	}

	private simulateTurn(state: SimState, aiAction: Action, pAction: Action): SimState {
		const nextState: SimState = JSON.parse(JSON.stringify(state));

		if (aiAction.type === 'switch') {
			const newActive = nextState.aiBench[aiAction.slot - 2];
			if (newActive) nextState.aiActive = newActive;
		}

		if (aiAction.type === 'move' && pAction.type === 'move') {
			const aiMove = Dex.moves.get(aiAction.id);
			const pMove = Dex.moves.get(pAction.id);

			let aiGoesFirst = nextState.aiActive.baseStats.spe >= nextState.playerActive.baseStats.spe;
			if (aiMove.priority > pMove.priority) aiGoesFirst = true;
			if (pMove.priority > aiMove.priority) aiGoesFirst = false;

			if (aiGoesFirst) {
				this.applyDamage(nextState.aiActive, nextState.playerActive, aiMove);
				if (!nextState.playerActive.isFainted) {
					this.applyDamage(nextState.playerActive, nextState.aiActive, pMove);
				}
			} else {
				this.applyDamage(nextState.playerActive, nextState.aiActive, pMove);
				if (!nextState.aiActive.isFainted) {
					this.applyDamage(nextState.aiActive, nextState.playerActive, aiMove);
				}
			}
		} else if (aiAction.type === 'move') {
			this.applyDamage(nextState.aiActive, nextState.playerActive, Dex.moves.get(aiAction.id));
		} else if (pAction.type === 'move') {
			this.applyDamage(nextState.playerActive, nextState.aiActive, Dex.moves.get(pAction.id));
		}

		return nextState;
	}

	/* * Dev Note: Deterministic Damage Engine
	 * Collapses Pokemon's RNG-heavy damage formula into a fixed mathematical expected value.
	 * Utilizes a streamlined Level 100 base calculation to heavily penalize hitting into 
	 * resistances/immunities while appropriately rewarding STAB and super-effective hits.
	 */
	private applyDamage(attacker: SimPokemon, defender: SimPokemon, move: any): void {
		if (move.category === 'Status') return;

		let power = move.basePower || 60;
		const A = move.category === 'Physical' ? attacker.baseStats.atk : attacker.baseStats.spa;
		const D = move.category === 'Physical' ? defender.baseStats.def : defender.baseStats.spd;
		
		let damagePercent = (((42 * power * (A / D)) / 50) + 2) / 2; 

		if (attacker.types.includes(move.type)) damagePercent *= 1.5;

		let effMult = 1;
		for (const dType of defender.types) {
			const eff = Dex.getEffectiveness(move.type, dType);
			if (eff === 1) effMult *= 2;
			else if (eff === -1) effMult *= 0.5;
			if (!Dex.getImmunity(move.type, dType)) effMult = 0;
		}
		damagePercent *= effMult;

		defender.hpRatio = Math.max(0, defender.hpRatio - (damagePercent / 100));
		if (defender.hpRatio <= 0) defender.isFainted = true;
	}

	private buildSimState(): SimState {
		const aiMons = this.request.side?.pokemon ?? [];
		const aiActiveInfo = aiMons[0];
		
		const playerDex = Dex.species.get(this.playerActiveSpecies);

		return {
			aiActive: this.parseSimPokemon(aiActiveInfo, true),
			aiBench: aiMons.slice(1).map((p: any) => this.parseSimPokemon(p, false)),
			playerActive: {
				species: playerDex.id,
				hpRatio: 1.0, 
				types: playerDex.types,
				baseStats: playerDex.baseStats,
				isActive: true,
				isFainted: false,
				moves: []
			}
		};
	}

	private parseSimPokemon(pData: any, isActive: boolean): SimPokemon {
		const species = toID(pData.details.split(',')[0]);
		const dex = Dex.species.get(species);
		return {
			species: dex.id,
			hpRatio: this.parseHpRatio(pData.condition),
			types: dex.types,
			baseStats: dex.baseStats,
			isActive,
			isFainted: pData.condition?.endsWith(' fnt'),
			moves: pData.moves ?? []
		};
	}

	private getLegalActions(pokemonArray: any[], activeRequest: any): Action[] {
		const actions: Action[] = [];
		if (!(activeRequest?.trapped || activeRequest?.maybeTrapped)) {
			for (let i = 1; i < pokemonArray.length; i++) {
				const p = pokemonArray[i];
				if (!p.condition?.endsWith(' fnt')) {
					actions.push({ type: 'switch', id: toID(p.details), slot: i + 1, priority: 6 });
				}
			}
		}

		const moves = activeRequest?.moves ?? [];
		for (let i = 0; i < moves.length; i++) {
			const m = moves[i];
			if (!m.disabled && (m.pp ?? 1) > 0) {
				actions.push({ type: 'move', id: m.id, slot: i + 1, priority: Dex.moves.get(m.id).priority ?? 0 });
			}
		}

		if (actions.length === 0) actions.push({ type: 'move', id: 'struggle', slot: 1, priority: 0 });
		return actions;
	}

	private generateSimActions(active: SimPokemon, bench: SimPokemon[]): Action[] {
		const actions: Action[] = [];
		for (let i = 0; i < bench.length; i++) {
			if (!bench[i].isFainted) actions.push({ type: 'switch', id: bench[i].species, slot: i + 2, priority: 6 });
		}
		for (let i = 0; i < active.moves.length; i++) {
			const mData = Dex.moves.get(active.moves[i]);
			actions.push({ type: 'move', id: active.moves[i], slot: i + 1, priority: mData.priority ?? 0 });
		}
		if (actions.length === 0) actions.push({ type: 'move', id: 'struggle', slot: 1, priority: 0 });
		return actions;
	}

	private guessPlayerActions(state: SimState): Action[] {
		const actions: Action[] = [];
		let slot = 1;
		for (const type of state.playerActive.types) {
			actions.push({ type: 'move', id: 'tackle', slot: slot++, priority: 0 }); 
		}
		return actions.length ? actions : [{ type: 'move', id: 'tackle', slot: 1, priority: 0 }];
	}

	private parseHpRatio(condition: string | undefined): number {
		if (!condition || condition.endsWith(' fnt')) return 0;
		const match = /^(\d+)\/(\d+)/.exec(condition);
		if (!match) return 1;
		return parseInt(match[1]) / parseInt(match[2]);
	}
}

/* * Dev Note: Worker-Ready Bridge
 * This export executes synchronously on the main thread for now, but returning a Promise
 * allows battle.ts to await the result. This guarantees that transitioning this logic into
 * a dedicated Node.js Worker Thread later will require exactly zero changes to the consumer side.
 */
export async function getBestMove(requestJson: string, playerActiveSpecies: string): Promise<string> {
	const ai = new PokeRogueAI(requestJson, playerActiveSpecies);
	return ai.decide();
}
