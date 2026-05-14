import { ObjectReadWriteStream } from '../../../lib/streams';
import { StreamWorker } from '../../../lib/process-manager';
import { type PokeRogueState } from './types';
import {
	genAIPokemon, packAITeam, packTeam,
	type AIPokemonSet, botLevel,
} from './pokemon';
import { setState, getState } from './state';
import { getBestMove } from './ai';

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
 * Hooks directly into the Showdown connection layer. 
 * Intercepts |request| messages to trigger the async Minimax engine and 
 * catches |error| messages to provide a failsafe move if the AI makes an invalid choice.
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
					setTimeout(async () => {
						const roomObj = Rooms.get(roomidStr as RoomID);
						if (roomObj) {
							const playerActiveSpecies = toID(roomObj.battle?.p1?.active?.[0]?.species?.name ?? 'rattata');
							
							const choice = await getBestMove(line, playerActiveSpecies);
							
							void roomObj.battle?.stream.write(`>p2 ${choice}`);
						}
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
	
	const result = genAIPokemon(size, floor, luck, state.pendingTrainer, trainerKey);
	
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

	if (state.pendingTrainer) delete state.pendingTrainer;
	if (state.pendingTrainerKey) delete state.pendingTrainerKey;

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
					const catchHTML = `<div class="pr-catch-panel" style="padding:8px; background:rgba(0,0,0,0.2); border-radius:6px; text-align:center; margin-top:5px;">` +
						`<div style="font-weight:bold; margin-bottom:6px; color:#ddd;">Wild Encounter!</div>` +
						`<button name="send" value="/pokerogue catch pokeball" class="button" ${inv['pokeball'] ? '' : 'disabled'}>Poké Ball (${inv['pokeball'] || 0})</button> ` +
						`<button name="send" value="/pokerogue catch greatball" class="button" ${inv['greatball'] ? '' : 'disabled'}>Great Ball (${inv['greatball'] || 0})</button> ` +
						`<button name="send" value="/pokerogue catch ultraball" class="button" ${inv['ultraball'] ? '' : 'disabled'}>Ultra Ball (${inv['ultraball'] || 0})</button> ` +
						`<button name="send" value="/pokerogue catch masterball" class="button" ${inv['masterball'] ? '' : 'disabled'}>Master Ball (${inv['masterball'] || 0})</button>` +
						`</div>`;

					const playerUser = Users.get(match.userId);
					if (playerUser) {
						if (match.lastPanelTurn) playerUser.sendTo(room, `|uhtmlchange|catchpanel-${match.lastPanelTurn}|`);
						playerUser.sendTo(room, `|uhtml|catchpanel-${turn}|${catchHTML}`);
					}
					match.lastPanelTurn = turn;
				}
			}
		}
	});

	state.battleRoomId = battleRoom.roomid;
	setState(user.id, state);

	activeMatches.set(battleRoom.roomid, {
		userId: user.id,
		botUserId: botUser.id,
		floor: state.floor,
		isTrainerBattle: isTrainer,
	});

	return true;
}
