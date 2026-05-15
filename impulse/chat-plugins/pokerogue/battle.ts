import { ObjectReadWriteStream } from '../../../lib/streams';
import { StreamWorker } from '../../../lib/process-manager';
import { type PokeRogueState } from './types';
import {
	genAIPokemon, packAITeam, packTeam,
	type AIPokemonSet, botLevel,
} from './pokemon';
import { setState, getState } from './state';

class NoopStream extends ObjectReadWriteStream<string> {
	override _write(_data: string): void {}
}

const noopWorker = new StreamWorker(new NoopStream());
let botCounter = 0;

const botBattleHandlers = new Map<string, (roomid: string, requestLine: string) => void>();
const TRAINER_NAME = 'PokéRogue Challenger';

export function destroyBotUser(botUser: User): void {
	botBattleHandlers.delete(botUser.id);
	for (const c of botUser.connections.slice()) {
		c.onDisconnect();
	}
	if (Users.get(botUser.id) === botUser) {
		Users.delete(botUser);
	}
}

/* * Dev Note: Bot User Initialization
 * Creates a ghost User object hooked directly into the Showdown connection layer.
 * Added an |error| interceptor: If the bot accidentally makes an illegal move (e.g., switching while trapped),
 * it will catch the error and forcefully use 'move 1' to prevent the room from permanently hanging.
 */
function createBotUser(playerId: string): User {
	const uid = ++botCounter;
	const connId = `pokerogue-bot-${uid}`;
	const botInternalName = `pokeroguebot${uid}`;

	let staleRoomId: RoomID | undefined;
	for (const [roomId, match] of activeMatches) {
		if (match.userId === toID(playerId)) {
			staleRoomId = roomId;
			break;
		}
	}
	if (staleRoomId !== undefined) {
		const room = Rooms.get(staleRoomId);
		const battleEnded = !room?.battle || room.battle.ended;
		if (battleEnded) {
			const staleMatch = activeMatches.get(staleRoomId);
			if (staleMatch) {
				const staleBot = Users.get(staleMatch.botUserId);
				if (staleBot) destroyBotUser(staleBot);
			}
			activeMatches.delete(staleRoomId);
		}
	}

	const conn = new Users.Connection(
		connId,
		noopWorker,
		String(uid),
		null,
		'127.0.0.1',
		null
	);

	const botUser = new Users.User(conn);
	conn.user = botUser;

	botUser.forceRename(botInternalName, true);
	(botUser as any).name = TRAINER_NAME;
	(botUser as any).named = false;

	(botUser as any).sendTo = function (roomid: RoomID | BasicRoom | null, data: string) {
		if (typeof data === 'string') {
			const lines = data.split('\n');
			const roomidStr = typeof roomid === 'string' ? roomid : (roomid as any)?.roomid ?? '';

			for (const line of lines) {
				if (line.startsWith('|request|')) {
					setTimeout(() => {
						const handler = botBattleHandlers.get(botUser.id);
						if (handler) handler(roomidStr, line);
					}, 150);
					break;
				} else if (line.startsWith('|error|[Invalid choice]')) {
					setTimeout(() => {
						void Rooms.get(roomidStr as RoomID)?.battle?.stream.write(`>p2 move 1`);
					}, 50);
				}
			}
		}
	};

	return botUser;
}

// ─── Hardcoded Gen 9 Type Chart ───────────────────────────────────────────────
// Values: 0 = immune, 0.5 = not very effective, 1 = neutral (omitted), 2 = super effective
// Row = attacking type, Col = defending type

const TYPES = [
	'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
	'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
	'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
] as const;

type TypeName = typeof TYPES[number];

const TYPE_CHART: Record<TypeName, Partial<Record<TypeName, number>>> = {
	Normal:   { Rock: 0.5, Ghost: 0, Steel: 0.5 },
	Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
	Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
	Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
	Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
	Ice:      { Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
	Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
	Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
	Ground:   { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
	Flying:   { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
	Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
	Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
	Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
	Ghost:    { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
	Dragon:   { Dragon: 2, Steel: 0.5, Fairy: 0 },
	Dark:     { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
	Steel:    { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
	Fairy:    { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

/**
 * Returns the combined type multiplier for an attacking type against one or two defending types.
 * Handles dual-type defenders correctly (e.g. Water/Flying vs Electric = 2*0.5 = 1... wait, no:
 * Electric vs Water = 2, Electric vs Flying = 2, so combined = 4).
 * Immunities short-circuit immediately and return 0.
 */
function getTypeMultiplier(atkType: string, defTypes: string[]): number {
	const chart = TYPE_CHART[atkType as TypeName];
	let multiplier = 1;
	for (const defType of defTypes) {
		const val = chart?.[defType as TypeName] ?? 1;
		if (val === 0) return 0; // immune — short-circuit
		multiplier *= val;
	}
	return multiplier;
}

const ABILITY_IMMUNITIES: Record<string, string[]> = {
	levitate: ['Ground'],
	flashfire: ['Fire'],
	voltabsorb: ['Electric'],
	waterabsorb: ['Water'],
	dryskin: ['Water'],
	stormdrain: ['Water'],
	lightningrod: ['Electric'],
	motordrive: ['Electric'],
	sapsipper: ['Grass'],
	wonderguard: [],
	eartheater: ['Ground'],
	wellbakedbody: ['Fire'],
	windpower: [],
	purifyingsalt: ['Ghost'],
	bulletproof: [],
	soundproof: [],
};

const BULLETPROOF_MOVES = new Set([
	'aurasphere', 'barrage', 'beachballfall', 'beedrillrage', 'cannonball',
	'electroball', 'energyball', 'focusblast', 'gyroball', 'iceball',
	'magnetbomb', 'mindblown', 'mistball', 'mudbomb', 'octazooka',
	'paleowave', 'payday', 'pollenpuff', 'rockblast', 'rockwrecker',
	'seedbomb', 'shadowball', 'sludgebomb', 'weatherball', 'zingzap',
]);

const SOUNDPROOF_MOVES = new Set([
	'boomburst', 'bugbuzz', 'chatter', 'clangingscales', 'clangoroussoul',
	'disarmingvoice', 'echoedvoice', 'grasswhistle', 'growl', 'healbell',
	'howl', 'hypervoice', 'meloettaspiritedstep', 'nobleroar', 'overdrive',
	'perishsong', 'relicsong', 'roar', 'round', 'screech', 'shadowball',
	'sing', 'snarl', 'snore', 'sparklingsurge', 'supersonic', 'uproar',
]);

function getMoveEffectiveness(
	moveData: any,
	targetDex: any,
	targetAbility: string,
): number {
	const moveType = moveData.type as string;
	const moveId = moveData.id as string;

	if (targetAbility === 'wonderguard') {
		const eff = getTypeMultiplier(moveType, targetDex.types);
		return eff > 1 ? eff : 0;
	}

	if (targetAbility === 'bulletproof' && BULLETPROOF_MOVES.has(moveId)) return 0;
	if (targetAbility === 'soundproof' && SOUNDPROOF_MOVES.has(moveId)) return 0;

	const immuneTypes = ABILITY_IMMUNITIES[targetAbility];
	if (immuneTypes && immuneTypes.includes(moveType)) return 0;

	return getTypeMultiplier(moveType, targetDex.types);
}

function getStatCategoryModifier(moveData: any, pokemon: any): number {
	if (moveData.category === 'Status') return 1;

	const stats = pokemon.stats;
	if (!stats) return 1;

	if (moveData.category === 'Physical') {
		return stats.atk >= stats.spa ? 1.1 : 0.85;
	} else {
		return stats.spa >= stats.atk ? 1.1 : 0.85;
	}
}

function getDefensiveScore(switchInSpecies: string, oppMoveTypes: string[]): number {
	const dex = Dex.species.get(switchInSpecies);
	if (!dex.exists) return 0;
	let score = 0;
	for (const atkType of oppMoveTypes) {
		const eff = getTypeMultiplier(atkType, dex.types);
		if (eff === 0) score += 3;
		else if (eff < 1) score += 1;
		else if (eff > 1) score -= 1.5;
	}
	return score;
}

function getOpponentMoveTypes(room: AnyObject | null | undefined, slot: number): string[] {
	try {
		const oppActive = (room?.battle)?.p1?.active?.[slot];
		if (!oppActive) return [];
		const species = Dex.species.get(oppActive.species?.name ?? '');
		return species.exists ? species.types : [];
	} catch {
		return [];
	}
}

/* * Dev Note: Move Scoring Heuristic
 * Calculates an effective priority score for each move. Factors in STAB,
 * type effectiveness, recoil, multi-hit, and basic ability immunities.
 */
function scoreMove(
	move: any,
	userSpecies: string,
	targetSpecies: string,
	targetAbility: string,
	userPokemon: any,
	turn: number,
	battleContext: BattleContext,
): number {
	const moveData = Dex.moves.get(move.id);
	if (!moveData.exists) return 0;

	if (moveData.category === 'Status') {
		return scoreStatusMove(move.id, userPokemon, turn, battleContext);
	}

	const userDex = Dex.species.get(userSpecies);
	const targetDex = Dex.species.get(targetSpecies);

	const effectiveness = targetDex.exists ?
		getMoveEffectiveness(moveData, targetDex, targetAbility) :
		1;

	if (effectiveness === 0) return -Infinity;

	let basePower = moveData.basePower ?? 0;
	if (basePower === 0) {
		basePower = estimateVariablePower(move.id, userPokemon);
	}
	if (basePower === 0) return 5;

	let score = basePower * effectiveness;

	// STAB bonus
	if (userDex.exists && userDex.types.includes(moveData.type)) {
		score *= 1.5;
	}

	score *= getStatCategoryModifier(moveData, userPokemon);

	const acc = moveData.accuracy;
	if (typeof acc === 'number') {
		score *= acc / 100;
	}

	if (moveData.recoil || moveData.mindBlownRecoil) score *= 0.85;
	if (moveData.struggle) score *= 0.5;

	if (moveData.multihit) score *= 1.25;

	// Priority moves: good finishers at low HP, minor bonus otherwise
	if ((moveData.priority ?? 0) > 0) {
		const hpRatio = parseHpRatio(userPokemon?.condition);
		const targetHpRatio = parseHpRatio(battleContext.targetCondition);
		// Most useful when we can finish off a weakened opponent
		if (targetHpRatio < 0.25) score *= 1.4;
		else if (hpRatio < 0.35) score *= 1.2;
		else score *= 0.95; // slight penalty when not needed — prefer full-power moves
	}

	if (moveData.flags?.charge && !moveData.flags?.recharge) score *= 0.75;

	if (moveData.flags?.recharge) score *= 0.8;

	// Drain moves get a bonus when HP is low since they recover health
	if (moveData.drain && parseHpRatio(userPokemon?.condition) < 0.5) score *= 1.15;

	return score;
}

interface BattleContext {
	boosts: Record<string, number>;
	oppStatus: string;
	targetCondition: string;
	hazardsSet: Set<string>;
	screensSet: Set<string>;
	allyFainted: boolean;
}

function getBattleContext(room: AnyObject | null | undefined, slot: number, pokemon: any): BattleContext {
	const boosts: Record<string, number> = pokemon?.boosts ?? {};
	let oppStatus = '';
	let targetCondition = '';
	try {
		const oppActive = (room?.battle)?.p1?.active?.[slot];
		oppStatus = oppActive?.status ?? '';
		targetCondition = oppActive?.condition ?? '';
	} catch {}

	// Track which hazards/screens are already active on the opponent's side
	const hazardsSet = new Set<string>();
	const screensSet = new Set<string>();
	try {
		const p1SideConditions = (room?.battle)?.p1?.sideConditions ?? {};
		for (const cond of Object.keys(p1SideConditions)) {
			hazardsSet.add(cond);
		}
		const p2SideConditions = (room?.battle)?.p2?.sideConditions ?? {};
		for (const cond of Object.keys(p2SideConditions)) {
			screensSet.add(cond);
		}
	} catch {}

	const allyFainted = (room?.battle)?.p2?.pokemon?.some((p: any) => p?.fainted) ?? false;

	return { boosts, oppStatus, targetCondition, hazardsSet, screensSet, allyFainted };
}

function scoreStatusMove(moveId: string, pokemon: any, turn: number, ctx: BattleContext): number {
	const hpRatio = parseHpRatio(pokemon?.condition);
	const boosts = ctx.boosts;

	// Don't re-apply a status that's already on the opponent
	const alreadyStatused = !!ctx.oppStatus;

	if (['thunderwave', 'glare', 'stunspore'].includes(moveId)) {
		return alreadyStatused ? -Infinity : 55;
	}

	if (['spore', 'sleeppowder', 'hypnosis', 'lovelykiss', 'sing', 'darkvoid'].includes(moveId)) {
		return alreadyStatused ? -Infinity : 65;
	}

	if (['willowisp', 'scald'].includes(moveId)) {
		return alreadyStatused ? -Infinity : 50;
	}

	if (['toxic', 'poisongas', 'poisonpowder'].includes(moveId)) {
		return alreadyStatused ? -Infinity : 45;
	}

	// Entry hazards: skip if already set
	if (moveId === 'stealthrock') {
		return ctx.hazardsSet.has('stealthrock') ? -Infinity : 40;
	}
	if (moveId === 'spikes') {
		const count = (ctx.hazardsSet.has('spikes') ? 1 : 0); // simplified; avoid stacking beyond 3
		return count >= 3 ? -Infinity : 38;
	}
	if (moveId === 'toxicspikes') {
		return ctx.hazardsSet.has('toxicspikes') ? -Infinity : 35;
	}
	if (moveId === 'stickyweb') {
		return ctx.hazardsSet.has('stickyweb') ? -Infinity : 36;
	}

	// Screens: skip if already active on our side
	if (moveId === 'reflect') return ctx.screensSet.has('reflect') ? -Infinity : 35;
	if (moveId === 'lightscreen') return ctx.screensSet.has('lightscreen') ? -Infinity : 35;
	if (moveId === 'auroraveil') return ctx.screensSet.has('auroraveil') ? -Infinity : 38;

	// Setup moves: diminishing returns if already boosted, worthless if very boosted
	const setupMoves: Record<string, number> = {
		swordsdance: 75, nastyplot: 75, calmmind: 70, dragondance: 80,
		quiverdance: 80, shellsmash: 85, growth: 60, bulkup: 65,
		coilingcurrent: 70, tidyup: 65, victorydance: 80,
		agility: 55, rockpolish: 55,
	};
	if (setupMoves[moveId] !== undefined) {
		// Primary offensive stat boost for this move
		const relevantBoost = ['calmmind', 'nastyplot', 'quiverdance', 'growth'].includes(moveId)
			? (boosts['spa'] ?? 0)
			: (boosts['atk'] ?? 0);

		// Hard cap: don't set up past +3 (it's already very strong, use the turns to attack)
		if (relevantBoost >= 3) return -Infinity;

		// Reduce value the more we've already boosted
		const boostPenalty = relevantBoost * 15;
		const baseScore = turn <= 3 ? setupMoves[moveId] : setupMoves[moveId] * 0.5;
		return Math.max(0, baseScore - boostPenalty);
	}

	// Recovery: scale with how badly we need it; don't heal at nearly full HP
	if (['recover', 'roost', 'moonlight', 'morningsun', 'synthesis', 'slackoff',
		'milkdrink', 'softboiled', 'shoreup', 'lifedew', 'healorder'].includes(moveId)) {
		if (hpRatio > 0.75) return -5; // actively discourage wasting a turn at high HP
		if (hpRatio < 0.35) return 80;  // urgent
		if (hpRatio < 0.55) return 60;
		return 30;
	}

	if (moveId === 'taunt') return 30;

	return 15;
}

// Fix: eruption/waterspout scale with current HP; other variable-power moves unchanged
function estimateVariablePower(moveId: string, pokemon?: any): number {
	if ((moveId === 'eruption' || moveId === 'waterspout') && pokemon) {
		const hp = parseHpRatio(pokemon.condition);
		return Math.max(1, Math.floor(150 * hp));
	}

	const estimates: Record<string, number> = {
		gyroball: 60, electroball: 60, heatcrash: 60, heavyslam: 60,
		lowkick: 60, grassknot: 60, waterspout: 100, eruption: 100,
		reversal: 50, flail: 50, magnitude: 70, naturalgift: 70,
		trumpcard: 40, returnn: 102, frustration: 102,
		hiddenpower: 60, weatherball: 50, terrainpulse: 50,
		powertrip: 40, storedpower: 40, punishment: 60,
		knockoff: 65, acrobatics: 55, fling: 50,
	};
	return estimates[moveId] ?? 0;
}

function parseHpRatio(condition: string | undefined): number {
	if (!condition || condition.endsWith(' fnt')) return 0;
	const match = /^(\d+)\/(\d+)/.exec(condition);
	if (!match) return 1;
	return parseInt(match[1]) / parseInt(match[2]);
}

function getOpponentAbility(room: AnyObject | null | undefined, slot: number): string {
	try {
		const oppActive = (room?.battle)?.p1?.active?.[slot];
		if (!oppActive) return '';
		return toID(oppActive.ability ?? oppActive.baseAbility ?? '');
	} catch {
		return '';
	}
}

function getOpponentSpecies(room: AnyObject | null | undefined, slot: number): string {
	try {
		const oppActive = (room?.battle)?.p1?.active?.[slot];
		if (!oppActive) return '';
		return toID(oppActive.species?.name ?? '');
	} catch {
		return '';
	}
}

function shouldSwitch(
	request: any,
	activeIdx: number,
	targetSpecies: string,
	targetAbility: string,
	room: AnyObject | null | undefined,
	alreadyChosen: number[],
): number {
	const pokemon = request.side?.pokemon ?? [];
	const currentPokemon = pokemon[activeIdx];
	if (!currentPokemon) return 0;

	const active = (request.active as any[])[activeIdx];
	// Respect all forms of trapping
	if (active?.trapped || active?.maybeTrapped || active?.partiallyTrapped) return 0;

	const hpRatio = parseHpRatio(currentPokemon.condition);
	const userSpecies = toID(currentPokemon.details?.split(',')[0] ?? '');
	const userDex = Dex.species.get(userSpecies);
	const targetDex = Dex.species.get(targetSpecies);

	const moves: any[] = active?.moves ?? [];
	const usableMoves = moves.filter((m: any) => !m.disabled && (m.pp ?? 1) > 0);

	let bestMoveScore = 0;
	for (const m of usableMoves) {
		const moveData = Dex.moves.get(m.id);
		if (!moveData.exists || moveData.category === 'Status') continue;
		const eff = targetDex.exists ? getMoveEffectiveness(moveData, targetDex, targetAbility) : 1;
		if (eff > bestMoveScore) bestMoveScore = eff;
	}

	const isWalled = bestMoveScore === 0;

	let worstIncomingEff = 1;
	if (targetDex.exists && userDex.exists) {
		for (const atkType of targetDex.types) {
			const eff = getTypeMultiplier(atkType, userDex.types);
			if (eff > worstIncomingEff) worstIncomingEff = eff;
		}
	}

	const inBadMatchup = worstIncomingEff >= 2;
	const isLowHp = hpRatio < 0.25;
	const isCriticallyLow = hpRatio < 0.15;

	if (!isWalled && !inBadMatchup && !isLowHp) return 0;
	if (hpRatio > 0.65 && !isWalled) return 0;

	const numActive = (request.active as any[]).length;
	const oppMoveTypes = getOpponentMoveTypes(room, activeIdx);

	const bench = pokemon
		.map((p: any, idx: number) => ({ p, idx: idx + 1 }))
		.filter(({ p, idx }: { p: any, idx: number }) =>
			idx > numActive &&
			!p.condition?.endsWith(' fnt') &&
			!alreadyChosen.includes(idx)
		);

	if (!bench.length) return 0;

	const scored = bench.map(({ p, idx }: { p: any, idx: number }) => {
		const benchSpecies = toID(p.details?.split(',')[0] ?? '');
		const benchDex = Dex.species.get(benchSpecies);
		let score = 0;

		score += getDefensiveScore(benchSpecies, oppMoveTypes) * 1.5;

		// Offensive coverage against the current opponent
		if (benchDex.exists && targetDex.exists) {
			for (const atkType of benchDex.types) {
				const eff = getTypeMultiplier(atkType, targetDex.types);
				if (eff > 1) score += eff * 2;
			}
		}

		score += parseHpRatio(p.condition) * 8;

		if (targetDex.exists && benchDex.exists) {
			for (const atkType of targetDex.types) {
				const eff = getTypeMultiplier(atkType, benchDex.types);
				if (eff >= 2) score -= 3;
				if (eff === 0) score += 2;
			}
		}

		// Penalise switching into a bench mon that is already low HP — not a real improvement
		const benchHp = parseHpRatio(p.condition);
		if (benchHp < 0.3) score -= 4;

		return { idx, score };
	}).sort((a: any, b: any) => b.score - a.score);

	const best = scored[0];

	if (isCriticallyLow && bench.length) return scored[0]?.idx ?? 0;
	if (best && best.score > 3) return best.idx;

	return 0;
}

const recentMoveHistory = new Map<string, Map<number, Map<string, number>>>();

function recordMoveUsed(roomid: string, slot: number, moveId: string, turn: number): void {
	if (!recentMoveHistory.has(roomid)) recentMoveHistory.set(roomid, new Map());
	const slots = recentMoveHistory.get(roomid)!;
	if (!slots.has(slot)) slots.set(slot, new Map());
	slots.get(slot)!.set(moveId, turn);
}

function getLastUsedTurn(roomid: string, slot: number, moveId: string): number {
	return recentMoveHistory.get(roomid)?.get(slot)?.get(moveId) ?? -99;
}

export function clearMoveHistory(roomid: string): void {
	recentMoveHistory.delete(roomid);
}

function makeAIChoice(requestJson: string, roomid: string, turn: number): string {
	let request: any;
	try {
		request = JSON.parse(requestJson.startsWith('|request|') ? requestJson.slice(9) : requestJson);
	} catch {
		return 'move 1';
	}

	if (!request || request.wait) return 'pass';

	if (request.teamPreview) {
		const count = request.side?.pokemon?.length ?? 1;
		const order = Array.from({ length: count }, (_, i) => i + 1);
		return `team ${order.join('')}`;
	}

	if (request.forceSwitch) {
		const choices: string[] = [];
		const pokemon = request.side?.pokemon ?? [];
		const chosen: number[] = [];
		const numActive = (request.forceSwitch as boolean[]).length;

		for (const forceSwitchEntry of (request.forceSwitch as boolean[])) {
			if (!forceSwitchEntry) {
				choices.push('pass');
				continue;
			}

			const available = pokemon
				.map((p: any, idx: number) => ({ p, idx: idx + 1 }))
				.filter(({ p, idx }: { p: any, idx: number }) =>
					idx > numActive &&
					!p.condition?.endsWith(' fnt') &&
					!chosen.includes(idx)
				)
				.sort((a: any, b: any) => {
					const aHp = parseHpRatio(a.p.condition);
					const bHp = parseHpRatio(b.p.condition);
					return bHp - aHp;
				});

			if (available.length) {
				const pick = available[0];
				chosen.push(pick.idx);
				choices.push(`switch ${pick.idx}`);
			} else {
				choices.push('pass');
			}
		}
		return choices.join(', ');
	}

	if (request.active) {
		const choicesList: string[] = [];
		const chosenSwitchTargets: number[] = [];

		const room = Rooms.get(roomid as RoomID);
		const match = activeMatches.get(roomid as RoomID);
		const currentFloor = match?.floor ?? 1;
		const numActive = (request.active as any[]).length;

		for (let i = 0; i < numActive; i++) {
			const active = (request.active as any[])[i];
			const pokemon = request.side?.pokemon?.[i];

			if (!active || !pokemon || pokemon.condition?.endsWith(' fnt') || pokemon.commanding) {
				choicesList.push('pass');
				continue;
			}

			const userSpecies = toID(pokemon.details?.split(',')[0] ?? '');
			const targetSpecies = getOpponentSpecies(room, i);
			const targetAbility = getOpponentAbility(room, i);

			const switchIdx = shouldSwitch(request, i, targetSpecies, targetAbility, room, chosenSwitchTargets);
			if (switchIdx > 0) {
				chosenSwitchTargets.push(switchIdx);
				choicesList.push(`switch ${switchIdx}`);
				continue;
			}

			const moves: any[] = active?.moves ?? [];
			const usableMoves = moves.filter((m: any) => !m.disabled && (m.pp ?? 1) > 0);

			if (!usableMoves.length) {
				choicesList.push('move 1');
				continue;
			}

			const battleCtx = getBattleContext(room, i, pokemon);

			const scored = usableMoves.map((m: any) => {
				let score = scoreMove(m, userSpecies, targetSpecies, targetAbility, pokemon, turn, battleCtx);

				// Softer repetition penalty; skip entirely if only 1 PP left (forced)
				const pp = m.pp ?? 99;
				if (pp > 1) {
					const lastUsed = getLastUsedTurn(roomid, i, m.id);
					const turnsSince = turn - lastUsed;
					if (turnsSince === 1) score *= 0.72;
					else if (turnsSince === 2) score *= 0.88;
					else if (turnsSince === 3) score *= 0.95;
				}

				return { m, originalIdx: moves.indexOf(m) + 1, score };
			});

			scored.sort((a: any, b: any) => b.score - a.score);

			// Small chance to pick the 2nd-best move if scores are close (avoids being predictable)
			let pickIdx = 0;
			if (scored.length > 1 && scored[0].score > 0) {
				const ratio = scored[1].score / scored[0].score;
				if (ratio >= 0.85 && Math.random() < 0.1) pickIdx = 1;
			}

			const pick = scored[pickIdx];
			let chosen: string;

			if (pick.score === -Infinity || pick.score <= 0) {
				const fallback = scored.find((s: any) => s.score > -Infinity && s.score > 0);
				if (fallback) {
					chosen = `move ${fallback.originalIdx}`;
					recordMoveUsed(roomid, i, fallback.m.id, turn);
				} else {
					chosen = 'move 1';
				}
			} else {
				chosen = `move ${pick.originalIdx}`;
				recordMoveUsed(roomid, i, pick.m.id, turn);
			}

			// Only append battle mechanic suffixes to move choices, never to switches
			if (active.canMegaEvo) {
				chosen += ' mega';
			} else if (active.canTerastallize && currentFloor > 25) {
				const targetDex = Dex.species.get(targetSpecies);
				const userDex = Dex.species.get(userSpecies);

				const teraType = active.teraType as string | undefined;
				let teraDefensiveOk = true;
				if (teraType && targetDex.exists) {
					for (const atkType of targetDex.types) {
						const eff = getTypeMultiplier(atkType, [teraType]);
						if (eff >= 2) { teraDefensiveOk = false; break; }
					}
				}

				// Also check if Tera gives an offensive STAB boost on the chosen move
				const chosenMoveId = pick.m?.id ?? '';
				const chosenMoveData = Dex.moves.get(chosenMoveId);
				const teraOffensiveBoost = teraType && chosenMoveData.exists && chosenMoveData.type === teraType;

				let worstIncoming = 1;
				if (targetDex.exists && userDex.exists) {
					for (const atkType of targetDex.types) {
						const eff = getTypeMultiplier(atkType, userDex.types);
						if (eff > worstIncoming) worstIncoming = eff;
					}
				}
				const hpRatio = parseHpRatio(pokemon.condition);

				// Terastallize if defensively safe AND (bad matchup, late game, or offensive STAB boost)
				if (
					teraDefensiveOk &&
					(worstIncoming >= 2 || currentFloor > 40 || teraOffensiveBoost) &&
					hpRatio > 0.3 &&
					Math.random() < 0.7
				) {
					chosen += ' terastallize';
				}
			}

			choicesList.push(chosen);
		}

		return choicesList.join(', ') || 'move 1';
	}

	return 'move 1';
}

interface ActiveRougeMatch {
	userId: ID;
	botUserId: ID;
	floor: number;
	lastPanelTurn?: number;
	isTrainerBattle?: boolean;
}

export const activeMatches = new Map<RoomID, ActiveRougeMatch>();

function buildBotTeam(state: PokeRogueState): { packedTeam: string, isTrainer: boolean, trainerName?: string } {
	const floor = state.floor;
	const isBossFloor = floor % 10 === 0;

	let size = 1;
	if (!isBossFloor) {
		const hasLure = (state.keyItems ?? []).includes('Lure');
		if (hasLure && Math.random() < 0.5) size = 2;
	}

	const luck = state.luck ?? 0;
	const trainerKey = state.pendingTrainerKey;

	const result = genAIPokemon(size, floor, luck, state.pendingTrainer, trainerKey, state.currentBiome || 'Town');
	
	return { packedTeam: packAITeam(result.team), isTrainer: result.isTrainer, trainerName: result.trainerName };
}

export function startBattle(user: User, state: PokeRogueState): boolean {
	const livingTeam = state.team.filter(m => (m.currentHp ?? 100) > 0);

	if (!livingTeam.length) {
		user.popup('All your Pokémon have fainted! Use a Revive from the shop before battling.');
		return false;
	}

	const playerTeam = packTeam(livingTeam);

	const botTeamData = buildBotTeam(state);
	const botTeam = botTeamData.packedTeam;
	const isTrainer = botTeamData.isTrainer;
	const trainerName = botTeamData.trainerName;

	if (state.pendingTrainer) {
		delete state.pendingTrainer;
	}
	if (state.pendingTrainerKey) {
		delete state.pendingTrainerKey;
	}

	const isBoss = state.floor % 10 === 0;
	const botUser = createBotUser(user.id);

	let opponentTitle = isTrainer && trainerName ? trainerName : (isTrainer ? TRAINER_NAME : 'Wild Encounter');
	if (isBoss && !isTrainer) opponentTitle = `BOSS ${opponentTitle}`;

	if (isTrainer && trainerName) {
		botUser.name = trainerName;
	}

	const botSlot = 'p2' as const;
	const format = state.floor >= 15 ? '[Gen 9] PokeRogue' : '[Gen 9] PokeRogue Early';

	let battleRoom: AnyObject | null = null;
	try {
		battleRoom = Rooms.createBattle({
			format,
			players: [
				{ user, team: playerTeam },
				{ user: botUser, team: botTeam },
			],
			rated: false,
			title: `PokéRogue Battle - Floor ${state.floor}: ${user.name} vs ${opponentTitle}`,
		});
	} catch (e) {
		destroyBotUser(botUser);
		user.popup('Failed to start the PokéRogue battle. Please try again.');
		Monitor.crashlog(e as Error, 'PokéRogue battle creation');
		return false;
	}

	if (!battleRoom) {
		destroyBotUser(botUser);
		return false;
	}

	botBattleHandlers.set(botUser.id, (roomid, requestLine) => {
		const room = Rooms.get(roomid as RoomID);
		if (!room?.battle) return;

		const match = activeMatches.get(roomid as RoomID);
		if (match) {
			const activeState = getState(match.userId);
			if (activeState && activeState.floor % 10 !== 0 && !match.isTrainerBattle) {
				const turn = room.battle.turn || 0;

				if (turn > 0 && match.lastPanelTurn !== turn) {
					const inv = activeState.inventory || {};
					const pb = inv['pokeball'] || 0;
					const gb = inv['greatball'] || 0;
					const ub = inv['ultraball'] || 0;
					const mb = inv['masterball'] || 0;

					const catchHTML = `<div class="pr-catch-panel" style="padding:8px; background:rgba(0,0,0,0.2); border-radius:6px; text-align:center; margin-top:5px;">` +
						`<div style="font-weight:bold; margin-bottom:6px; color:#ddd;">Wild Encounter!</div>` +
						`<button name="send" value="/pokerogue catch pokeball" class="button" ${pb ? '' : 'disabled'}>Poké Ball (${pb})</button> ` +
						`<button name="send" value="/pokerogue catch greatball" class="button" ${gb ? '' : 'disabled'}>Great Ball (${gb})</button> ` +
						`<button name="send" value="/pokerogue catch ultraball" class="button" ${ub ? '' : 'disabled'}>Ultra Ball (${ub})</button> ` +
						`<button name="send" value="/pokerogue catch masterball" class="button" ${mb ? '' : 'disabled'}>Master Ball (${mb})</button>` +
						`</div>`;

					const playerUser = Users.get(match.userId);
					if (playerUser) {
						if (match.lastPanelTurn) {
							playerUser.sendTo(room, `|uhtmlchange|catchpanel-${match.lastPanelTurn}|`);
						}
						playerUser.sendTo(room, `|uhtml|catchpanel-${turn}|${catchHTML}`);
					}
					match.lastPanelTurn = turn;
				}
			}
		}

		const turn = room.battle.turn || 0;
		const choice = makeAIChoice(requestLine, roomid, turn);
		void room.battle.stream.write(`>${botSlot} ${choice}`);
	});

	state.battleRoomId = battleRoom.roomid;
	setState(user.id, state);

	activeMatches.set(battleRoom.roomid, {
		userId: user.id,
		botUserId: botUser.id,
		floor: state.floor,
		isTrainerBattle: isTrainer,
	});

	clearMoveHistory(battleRoom.roomid);

	return true;
}
