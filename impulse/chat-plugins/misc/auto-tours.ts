import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { Table } from '../../impulse-utils';

const DATA_FILE = 'impulse/db/autotour-configs.json';

interface PerRoomAutotourConfig {
	roomid: RoomID;
	formats: string[];
	types: string[];
	interval: number;
	autostart: number;
	autodq: number;
	playerCap: string;
	enabled: boolean;
	lastTourTime: number;
}

const ALL_TOUR_TYPES = ['elimination', 'roundrobin'];

const DEFAULTS: Omit<PerRoomAutotourConfig, 'roomid'> = {
	formats: ['gen9randombattle'],
	types: [...ALL_TOUR_TYPES],
	interval: 60,
	autostart: 5,
	autodq: 2,
	playerCap: '',
	enabled: false,
	lastTourTime: 0,
};

let tourConfigs: Record<string, PerRoomAutotourConfig> = {};
const tourTimers: Record<string, { timer: NodeJS.Timeout, isInterval: boolean }> = {};

const AutotourManager = {
	async init() {
		try {
			const raw = await FS(DATA_FILE).readIfExists();
			if (raw) tourConfigs = JSON.parse(raw);
			for (const id in tourConfigs) {
				if (tourConfigs[id].enabled) this.startScheduler(id as RoomID);
			}
		} catch (e) {
			tourConfigs = {};
		}
	},

	save() {
		FS(DATA_FILE).writeUpdate(() => JSON.stringify(tourConfigs));
	},

	getConfig(roomid: RoomID): PerRoomAutotourConfig {
		if (!tourConfigs[roomid]) tourConfigs[roomid] = { roomid, ...DEFAULTS };
		return tourConfigs[roomid];
	},

	stopScheduler(roomid: RoomID) {
		const session = tourTimers[roomid];
		if (session) {
			if (session.isInterval) clearInterval(session.timer);
			else clearTimeout(session.timer);
			delete tourTimers[roomid];
		}
	},

	startScheduler(roomid: RoomID) {
		this.stopScheduler(roomid);
		const config = this.getConfig(roomid);
		if (!config.enabled) return;

		const intervalMs = Math.max(1, config.interval) * 60 * 1000;
		const delay = config.lastTourTime === 0 ? 0 : Math.max(0, (config.lastTourTime + intervalMs) - Date.now());

		tourTimers[roomid] = {
			isInterval: false,
			timer: setTimeout(() => {
				this.execute(roomid);
				tourTimers[roomid] = {
					isInterval: true,
					timer: setInterval(() => {
						const room = Rooms.get(roomid);
						if (room?.game?.gameid === 'tournament') return; // Wait for current tour
						this.execute(roomid);
					}, intervalMs),
				};
			}, delay),
		};
	},

	execute(roomid: RoomID) {
		const config = this.getConfig(roomid);
		const room = Rooms.get(roomid);
		if (!config.enabled || !room || room.game?.gameid === 'tournament') return;

		const format = config.formats[Math.floor(Math.random() * config.formats.length)];
		const type = config.types[Math.floor(Math.random() * config.types.length)];
		const modifier = (type === 'elimination' && Math.random() < 0.2) ? '2' : undefined;

		const mockContext = {
			sendReply: (m: string) => room.add(m).update(),
			errorReply: (m: string) => room.add(`|error|${m}`).update(),
			user: { id: 'autotour', name: 'Autotour' },
			room,
		} as any;

		try {
			const tour = Tournaments.createTournament(room, format, type, config.playerCap || undefined, false, modifier, undefined, mockContext);
			if (tour) {
				if (config.autostart > 0) tour.setAutoStartTimeout(config.autostart * 60 * 1000, mockContext);
				if (config.autodq > 0) tour.setAutoDisqualifyTimeout(config.autodq * 60 * 1000, mockContext);
				config.lastTourTime = Date.now();
				this.save();
			}
		} catch (e: any) {
			room.add(`|error|[Autotour] Failed: ${e.message}`).update();
		}
	},
};

void AutotourManager.init();

export const commands: Chat.ChatCommands = {
	at: 'autotour',
	autotour: {
		enable(target, room) {
			const config = AutotourManager.getConfig(this.requireRoom().roomid);
			this.checkCan('declare', null, room);
			config.enabled = true;
			AutotourManager.save();
			AutotourManager.startScheduler(room!.roomid);
			this.sendReply(`Autotours enabled for ${room!.roomid}.`);
		},

		disable(target, room) {
			const config = AutotourManager.getConfig(this.requireRoom().roomid);
			this.checkCan('declare', null, room);
			config.enabled = false;
			AutotourManager.save();
			AutotourManager.stopScheduler(room!.roomid);
			this.sendReply(`Autotours disabled for ${room!.roomid}.`);
		},

		interval(target, room) {
			const config = AutotourManager.getConfig(this.requireRoom().roomid);
			this.checkCan('declare', null, room);
			const val = parseInt(target);
			if (isNaN(val) || val < 1) return this.errorReply("Interval must be at least 1 minute.");
			config.interval = val;
			AutotourManager.save();
			if (config.enabled) AutotourManager.startScheduler(room!.roomid);
			this.sendReply(`Tournament interval set to ${val} minutes.`);
		},

		formats(target, room) {
			const config = AutotourManager.getConfig(this.requireRoom().roomid);
			this.checkCan('declare', null, room);
			const formats = target.split(',').map(f => toID(f)).filter(Boolean);
			if (!formats.length) return this.errorReply("Usage: /at formats [format1], [format2]");
			config.formats = formats;
			AutotourManager.save();
			this.sendReply(`Rotation formats updated.`);
		},

		show(target, room) {
			const roomid = this.requireRoom().roomid;
			this.checkCan('declare', null, room);
			const config = AutotourManager.getConfig(roomid);
			const dataRows = [
				[`<b>Enabled:</b>`, config.enabled ? 'Yes' : 'No'],
				[`<b>Formats:</b>`, config.formats.join(', ')],
				[`<b>Interval:</b>`, `${config.interval} min`],
				[`<b>Auto-Start/DQ:</b>`, `${config.autostart}m / ${config.autodq}m`],
			];
			const html = Table(`Autotour: ${roomid}`, ["Setting", "Value"], dataRows);
			this.sendReply(`|raw|${html}`);
		},

		next(target, room) {
			const roomid = this.requireRoom().roomid;
			const config = AutotourManager.getConfig(roomid);
			if (!config.enabled) return this.errorReply("Autotour is not enabled here.");
			const next = (config.lastTourTime + (config.interval * 60000)) - Date.now();
			const remaining = next > 0 ? Math.floor(next / 60000) : 0;
			this.sendReply(`The next tournament in ${roomid} is scheduled in ~${remaining} minute(s).`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Autotour Commands</b></center><hr>` +
				`<b>/at enable/disable</b>: Toggle autotours.<hr>` +
				`<b>/at formats [f1], [f2]</b>: Set format rotation.<hr>` +
				`<b>/at interval [min]</b>: Set time between tours.<hr>` +
				`<b>/at show</b>: View current config.<hr>` +
				`<b>/at next</b>: Time until next tour.`
			);
		},
	},
};

export const destroy = () => {
	for (const id in tourTimers) AutotourManager.stopScheduler(id as RoomID);
};
