import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { Table } from '../../impulse-utils';
import { nameColor } from '../customization/custom-color';

const DATA_FILE = 'impulse/db/seen.json';

interface SeenData {
	[userid: string]: number;
}

let seenData: SeenData = Object.create(null);
let isLoaded = false;

const SeenManager = {
	async init() {
		try {
			const raw = await FS(DATA_FILE).readIfExists();
			if (raw) {
				const parsed = JSON.parse(raw);
				for (const id in parsed) {
					if (typeof parsed[id] === 'number') seenData[id] = parsed[id];
				}
			}
		} catch (e) {
			seenData = Object.create(null);
		} finally {
			isLoaded = true;
		}
	},

	save() {
		FS(DATA_FILE).writeUpdate(() => JSON.stringify(seenData), { throttle: 5000 });
	},

	update(userid: string) {
		seenData[userid] = Date.now();
		this.save();
	},

	format(name: string, date: number | null): string {
		const coloredName = nameColor(name, true, true);
		const user = Users.get(name);

		if (user?.connected) {
			return `${coloredName} is <b><font color="limegreen">Online</font></b>`;
		}
		if (!date) {
			return `${coloredName} has <b><font color="red">never</font></b> been online.`;
		}

		const duration = Chat.toDurationString(Date.now() - date, { precision: true });
		return `${coloredName} was last seen <b>${duration}</b> ago.`;
	},
};

void SeenManager.init();

export const handlers: Chat.Handlers = {
	onDisconnect(user) {
		if (user.named && !user.connections.length) {
			SeenManager.update(user.id);
		}
	},
};

export const commands: Chat.ChatCommands = {
	seen: {
		''(target, room, user) {
			if (!this.runBroadcast()) return;
			if (!isLoaded) throw new Chat.ErrorMessage("Seen data is still loading...");

			const targetId = toID(target);
			if (!targetId || targetId.length > 18) return this.parse('/seen help');

			const lastSeen = seenData[targetId] || null;
			this.sendReplyBox(SeenManager.format(target, lastSeen));
		},
		recent: 'recentseen',
		recentseen(target, room, user) {
			this.checkCan('roomowner');
			if (!this.runBroadcast()) return;
			if (!isLoaded) throw new Chat.ErrorMessage("Seen data is still loading...");

			const limit = Math.min(parseInt(target) || 25, 100);
			const recent = Object.entries(seenData)
				.sort((a, b) => b[1] - a[1])
				.slice(0, limit);

			if (!recent.length) return this.sendReply("No history found.");

			const dataRows = recent.map(([id, date]) => {
				const u = Users.get(id);
				const status = u?.connected ?
					`<b style="color: limegreen">Online</b>` :
					Chat.toDurationString(Date.now() - date) + ' ago';

				return [nameColor(id, true), status];
			});

			const html = Table(`Recently Seen (${recent.length})`, ["User", "Last Seen"], dataRows);
			this.sendReply(`|raw|${html}`);
		},

		cleanup(target, room, user) {
			this.checkCan('roomowner');
			const days = parseInt(target) || 365;
			if (days < 30) throw new Chat.ErrorMessage("Minimum cleanup threshold is 30 days.");

			const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
			let count = 0;

			for (const id in seenData) {
				if (seenData[id] < cutoff) {
					delete seenData[id];
					count++;
				}
			}

			if (count) SeenManager.save();
			this.sendReply(`Deleted ${count} records older than ${days} days.`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Seen Commands</b></center><hr>` +
				`<b>/seen [user]</b>: Check last connection time.<hr>` +
				`<b>/seen recent [limit]</b>: Show recently active users (Staff only).<hr>` +
				`<b>/seen cleanup [days]</b>: Clear old records (Staff only).`
			);
		},
	},
	recentseen: 'seen.recentseen',
	seenhelp: 'seen.help',
};
