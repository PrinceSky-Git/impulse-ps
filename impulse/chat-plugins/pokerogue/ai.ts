import { Utils } from '../../../lib';

/* * Dev Note: Omniscient Minimax Engine
 * This AI operates with "Full Knowledge," simulating futures based on the 
 * player's actual movesets and stats retrieved from the server side.
 * * Logic Flow:
 * 1. Root: Evaluate all legal AI actions (Moves and Switches).
 * 2. Min Node (Player Turn): Simulate the player's optimal response using their real moves.
 * 3. Max Node (AI Turn): Search for the AI's best counter-play to that response.
 * 4. Evaluation: Score based on HP preservation, Speed-tier advantage, and KO potential.
 */

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
	ability?: string;
}

export interface SimState {
	aiActive: SimPokemon;
	aiBench: SimPokemon[];
	playerActive: SimPokemon;
	playerBench: SimPokemon[];
}

export class PokeRogueAI {
	private request: any;
	private playerTeamData: SimPokemon[];
	private readonly MAX_DEPTH = 2; 

	constructor(requestJson: string, playerTeam: SimPokemon[]) {
		this.playerTeamData = playerTeam;
		try {
			this.request = JSON.parse(requestJson.startsWith('|request|') ? requestJson.slice(9) : requestJson);
		} catch {
			this.request = null;
		}
	}

	/**
	 * Main Entry Point
	 */
	public async decide(): Promise<string> {
		if (!this.request || this.request.wait) return 'pass';
		if (this.request.teamPreview) return this.handleTeamPreview();
		if (this.request.forceSwitch) return this.handleForceSwitch();
		if (this.request.active) return this.runMinimax();
		return 'move 1';
	}

	private runMinimax(): string {
		const state = this.buildSimState();
		const aiActions = this.getLegalActions(this.request.side?.pokemon, this.request.active?.[0]);
		
		let bestAction = aiActions[0];
		let bestScore = -Infinity;

		for (const action of aiActions) {
			// Start Alpha-Beta Pruning search
			const score = this.minNode(state, action, 0, -Infinity, Infinity);
			if (score > bestScore) {
				bestScore = score;
				bestAction = action;
			}
		}
		return `${bestAction.type} ${bestAction.slot}`;
	}

	private minNode(state: SimState, aiAction: Action, depth: number, alpha: number, beta: number): number {
		// Player's turn: We assume the player will choose the action that results in the LOWEST score for the AI.
		const playerActions = this.getPlayerActions(state);
		let minScore = Infinity;

		for (const pAction of playerActions) {
			const nextState = this.simulateTurn(state, aiAction, pAction);
			const score = this.maxNode(nextState, depth + 1, alpha, beta);
			
			if (score < minScore) minScore = score;
			if (minScore <= alpha) return minScore; // Alpha Cut-off
			if (minScore < beta) beta = minScore;
		}
		return minScore;
	}

	private maxNode(state: SimState, depth: number, alpha: number, beta: number): number {
		// Terminal node check
		if (depth >= this.MAX_DEPTH || state.aiActive.isFainted || state.playerActive.isFainted) {
			return this.evaluateState(state);
		}

		// AI's turn: The AI chooses the action that results in the HIGHEST score.
		const aiActions = this.generateSimActions(state.aiActive, state.aiBench);
		let maxScore = -Infinity;

		for (const action of aiActions) {
			const score = this.minNode(state, action, depth, alpha, beta);
			
			if (score > maxScore) maxScore = score;
			if (maxScore >= beta) return maxScore; // Beta Cut-off
			if (maxScore > alpha) alpha = maxScore;
		}
		return maxScore;
	}

	/**
	 * The Heuristic Evaluator
	 */
	private evaluateState(state: SimState): number {
		// Immediate win/loss conditions
		if (state.playerActive.isFainted) return 10000;
		if (state.aiActive.isFainted) return -10000;

		// 1. HP Resource Valuation
		let score = (state.aiActive.hpRatio * 100) - (state.playerActive.hpRatio * 100);
		
		// 2. Bench Health
		for (const p of state.aiBench) score += p.hpRatio * 30;
		for (const p of state.playerBench) score -= p.hpRatio * 30;

		// 3. Positional Advantage: Being faster is a huge plus in Rogue-likes
		if (state.aiActive.baseStats.spe > state.playerActive.baseStats.spe) score += 20;

		return score;
	}

	private simulateTurn(state: SimState, aiAction: Action, pAction: Action): SimState {
		const nextState: SimState = JSON.parse(JSON.stringify(state));

		// Resolve Switches (Switches happen before attacks)
		if (aiAction.type === 'switch') {
			const newActive = nextState.aiBench.find(p => p.species === aiAction.id);
			if (newActive) nextState.aiActive = newActive;
		}
		if (pAction.type === 'switch') {
			const newActive = nextState.playerBench.find(p => p.species === pAction.id);
			if (newActive) nextState.playerActive = newActive;
		}

		// Resolve Attacks
		if (aiAction.type === 'move' && pAction.type === 'move') {
			const aiM = Dex.moves.get(aiAction.id);
			const pM = Dex.moves.get(pAction.id);

			const aiFirst = nextState.aiActive.baseStats.spe >= nextState.playerActive.baseStats.spe;
			
			if (aiFirst) {
				this.applyDamage(nextState.aiActive, nextState.playerActive, aiM);
				if (!nextState.playerActive.isFainted) {
					this.applyDamage(nextState.playerActive, nextState.aiActive, pM);
				}
			} else {
				this.applyDamage(nextState.playerActive, nextState.aiActive, pM);
				if (!nextState.aiActive.isFainted) {
					this.applyDamage(nextState.aiActive, nextState.playerActive, aiM);
				}
			}
		} else if (aiAction.type === 'move') {
			this.applyDamage(nextState.aiActive, nextState.playerActive, Dex.moves.get(aiAction.id));
		} else if (pAction.type === 'move') {
			this.applyDamage(nextState.playerActive, nextState.aiActive, Dex.moves.get(pAction.id));
		}

		return nextState;
	}

	private applyDamage(attacker: SimPokemon, defender: SimPokemon, move: any): void {
		if (move.category === 'Status') return;

		let power = move.basePower || 60;
		const A = move.category === 'Physical' ? attacker.baseStats.atk : attacker.baseStats.spa;
		const D = move.category === 'Physical' ? defender.baseStats.def : defender.baseStats.spd;
		
		// Simplified Standard Damage Formula
		let dmg = (((42 * power * (A / D)) / 50) + 2) / 2;

		// STAB Bonus
		if (attacker.types.includes(move.type)) dmg *= 1.5;

		// Type Effectiveness
		for (const t of defender.types) {
			const eff = Dex.getEffectiveness(move.type, t);
			if (eff > 0) dmg *= 2;
			else if (eff < 0) dmg *= 0.5;
			if (!Dex.getImmunity(move.type, t)) dmg = 0;
		}

		defender.hpRatio = Math.max(0, defender.hpRatio - (dmg / 100));
		if (defender.hpRatio <= 0) defender.isFainted = true;
	}

	private buildSimState(): SimState {
		const aiMons = this.request.side?.pokemon ?? [];
		const playerActive = this.playerTeamData.find(p => p.isActive) || this.playerTeamData[0];
		
		return {
			aiActive: this.parseSimPokemon(aiMons[0], true),
			aiBench: aiMons.slice(1).map((p: any) => this.parseSimPokemon(p, false)),
			playerActive: playerActive,
			playerBench: this.playerTeamData.filter(p => !p.isActive)
		};
	}

	private getPlayerActions(state: SimState): Action[] {
		const actions: Action[] = [];
		// The AI now has access to the REAL moveset of the player
		for (let i = 0; i < state.playerActive.moves.length; i++) {
			const m = Dex.moves.get(state.playerActive.moves[i]);
			actions.push({ type: 'move', id: m.id, slot: i + 1, priority: m.priority ?? 0 });
		}
		return actions.length ? actions : [{ type: 'move', id: 'struggle', slot: 1, priority: 0 }];
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
		// Switching check (check for traps)
		if (!(activeRequest?.trapped || activeRequest?.maybeTrapped)) {
			for (let i = 1; i < pokemonArray.length; i++) {
				const p = pokemonArray[i];
				if (!p.condition?.endsWith(' fnt')) {
					actions.push({ type: 'switch', id: toID(p.details), slot: i + 1, priority: 6 });
				}
			}
		}

		// Move check
		const moves = activeRequest?.moves ?? [];
		for (let i = 0; i < moves.length; i++) {
			const m = moves[i];
			if (!m.disabled && (m.pp ?? 1) > 0) {
				actions.push({ type: 'move', id: m.id, slot: i + 1, priority: Dex.moves.get(m.id).priority ?? 0 });
			}
		}

		return actions.length ? actions : [{ type: 'move', id: 'struggle', slot: 1, priority: 0 }];
	}

	private generateSimActions(active: SimPokemon, bench: SimPokemon[]): Action[] {
		const actions: Action[] = [];
		for (let i = 0; i < bench.length; i++) {
			if (!bench[i].isFainted) {
				actions.push({ type: 'switch', id: bench[i].species, slot: i + 2, priority: 6 });
			}
		}
		for (let i = 0; i < active.moves.length; i++) {
			const mData = Dex.moves.get(active.moves[i]);
			actions.push({ type: 'move', id: active.moves[i], slot: i + 1, priority: mData.priority ?? 0 });
		}
		return actions.length ? actions : [{ type: 'move', id: 'struggle', slot: 1, priority: 0 }];
	}

	private parseHpRatio(condition: string | undefined): number {
		if (!condition || condition.endsWith(' fnt')) return 0;
		const match = /^(\d+)\/(\d+)/.exec(condition);
		if (!match) return 1;
		return parseInt(match[1]) / parseInt(match[2]);
	}

	private handleTeamPreview(): string {
		const count = this.request.side?.pokemon?.length ?? 1;
		const order = Array.from({ length: count }, (_, i) => i + 1);
		return `team ${order.join('')}`;
	}

	private handleForceSwitch(): string {
		const pokemon = this.request.side?.pokemon ?? [];
		for (let i = 0; i < pokemon.length; i++) {
			if (!pokemon[i].condition?.endsWith(' fnt')) return `switch ${i + 1}`;
		}
		return 'pass';
	}
}

/**
 * Worker-Ready Bridge
 */
export async function getBestMove(requestJson: string, playerTeam: SimPokemon[]): Promise<string> {
	const ai = new PokeRogueAI(requestJson, playerTeam);
	return ai.decide();
}
