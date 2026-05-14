import { ObjectReadWriteStream } from '../../../lib/streams';
import { StreamWorker } from '../../../lib/process-manager';
import { type PokeRogueState } from './types';
import { genAIPokemon, packAITeam, packTeam } from './pokemon';
import { setState, getState } from './state';
import { getBestMove, type SimPokemon } from './ai';

class NoopStream extends ObjectReadWriteStream<string> {
	override _write(_data: string): void {}
}

const noopWorker = new StreamWorker(new NoopStream());
let botCounter = 0;
const botBattleHandlers = new Map<string, (roomid: string, requestLine: string) => void>();
const TRAINER_NAME = 'PokéRogue Challenger';

export function destroyBotUser(botUser: User): void {
	botBattleHandlers.delete(botUser.id);
	for (const c of botUser.connections.slice()) c.onDisconnect();
	if (Users.get(botUser.id) === botUser) Users.delete(botUser);
}

function createBotUser(playerId: string): User {
	const uid = ++botCounter;
	const conn = new Users.Connection(`pokerogue-bot-${uid}`, noopWorker, String(uid), null, '127.0.0.1', null);
	const botUser = new Users.User(conn);
	conn.user = botUser;
	botUser.forceRename(`pokeroguebot${uid}`, true);
	(botUser as any).name = TRAINER_NAME;

	(botUser as any).sendTo = function (roomid: RoomID | BasicRoom | null, data: string) {
		if (typeof data !== 'string') return;
		const lines = data.split('\n');
		const roomidStr = typeof roomid === 'string' ? roomid : (roomid as any)?.roomid ?? '';
		
		for (const line of lines) {
			if (line.startsWith('|request|')) {
				setTimeout(async () => {
					const roomObj = Rooms.get(roomidStr as RoomID);
					const battle = roomObj?.battle;
					if (!battle) return;

					// SCRAPE OMNISCIENT DATA: Using sides[0] to avoid alias issues
					const playerSide = battle.sides[0];
					if (!playerSide || !playerSide.pokemon || !playerSide.pokemon.length) return;

					const playerTeam: SimPokemon[] = playerSide.pokemon.map(p => {
						const stats = p.getStats();
						return {
							species: p.species.id,
							hpRatio: p.maxhp > 0 ? (p.hp / p.maxhp) : 0,
							types: p.species.types,
							baseStats: {
								hp: p.maxhp || 100,
								atk: stats.atk || 50,
								def: stats.def || 50,
								spa: stats.spa || 50,
								spd: stats.spd || 50,
								spe: stats.spe || 50,
							},
							isActive: !!p.active,
							isFainted: !!p.fainted,
							moves: p.moveSlots.map(m => m.id),
							ability: p.getAbility().id
						};
					});

					const choice = await getBestMove(line, playerTeam);
					// FAILSAFE: Ensure the turn advances even if the AI engine stalls
					void battle.stream.write(`>p2 ${choice || "move 1"}`);
				}, 150);
				break;
			} else if (line.startsWith('|error|[Invalid choice]')) {
				setTimeout(() => {
					void Rooms.get(roomidStr as RoomID)?.battle?.stream.write(`>p2 move 1`);
				}, 50);
			}
		}
	};
	return botUser;
}

export const activeMatches = new Map<RoomID, ActiveRougeMatch>();

interface ActiveRougeMatch {
	userId: ID;
	botUserId: ID;
	floor: number;
	lastPanelTurn?: number;
	isTrainerBattle?: boolean;
}

function buildBotTeam(state: PokeRogueState): { packedTeam: string, isTrainer: boolean, trainerName?: string } {
	const result = genAIPokemon(1, state.floor, state.luck ?? 0, state.pendingTrainer, state.pendingTrainerKey);
	return { packedTeam: packAITeam(result.team), isTrainer: result.isTrainer, trainerName: result.trainerName };
}

export function startBattle(user: User, state: PokeRogueState): boolean {
	const livingTeam = state.team.filter(m => (m.currentHp ?? 100) > 0);
	if (!livingTeam.length) return false;

	const botTeamData = buildBotTeam(state);
	const botUser = createBotUser(user.id);
	if (botTeamData.isTrainer && botTeamData.trainerName) botUser.name = botTeamData.trainerName;

	let battleRoom: AnyObject | null = null;
	try {
		battleRoom = Rooms.createBattle({
			format: state.floor >= 15 ? '[Gen 9] PokeRogue' : '[Gen 9] PokeRogue Early',
			players: [{ user, team: packTeam(livingTeam) }, { user: botUser, team: botTeamData.packedTeam }],
			rated: false,
			title: `PokéRogue Floor ${state.floor}: vs ${botUser.name}`,
		});
	} catch (e) {
		destroyBotUser(botUser);
		return false;
	}

	if (state.pendingTrainer) delete state.pendingTrainer;
	if (state.pendingTrainerKey) delete state.pendingTrainerKey;

	state.battleRoomId = battleRoom!.roomid;
	setState(user.id, state);
	activeMatches.set(battleRoom!.roomid, { userId: user.id, botUserId: botUser.id, floor: state.floor, isTrainerBattle: botTeamData.isTrainer });

	return true;
}
