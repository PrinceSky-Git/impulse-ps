import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { Table } from '../../impulse-utils';
import { nameColor } from '../customization/custom-color';

const DATA_FILE = 'impulse/db/ontime.json';
const MAX_USERID_LENGTH = 18;

interface OntimeData {
	ontime: Record<string, number>;
	blocks: Record<string, boolean>;
}

let data: OntimeData = { ontime: {}, blocks: {} };

const OntimeManager = {
	async init() {
		try {
			const raw = await FS(DATA_FILE).readIfExists();
			if (raw) {
				const json = JSON.parse(raw);
				data = {
					ontime: json.ontime || {},
					blocks: json.blocks || {},
				};
			}
		} catch (e) {
			data = { ontime: {}, blocks: {} };
		}
	},

	save() {
		FS(DATA_FILE).writeUpdate(() => JSON.stringify(data), { throttle: 5000 });
	},

	convertTime(ms: number) {
		const totalSeconds = Math.max(0, Math.floor(ms / 1000));
		const h = Math.floor(totalSeconds / 3600);
		const m = Math.floor(totalSeconds / 60) % 60;
		const s = totalSeconds % 60;
		return { h, m, s };
	},

	displayTime(ms: number) {
		const t = this.convertTime(ms);
		const parts = [];
		if (t.h > 0) parts.push(`${t.h.toLocaleString()} ${t.h === 1 ? 'hour' : 'hours'}`);
		if (t.m > 0) parts.push(`${t.m.toLocaleString()} ${t.m === 1 ? 'minute' : 'minutes'}`);
		if (t.s > 0) parts.push(`${t.s.toLocaleString()} ${t.s === 1 ? 'second' : 'seconds'}`);
		return parts.length ? parts.join(', ') : '0 seconds';
	},

	getSessionTime(user: User | undefined) {
		if (!user?.connected || !user.lastConnected) return 0;
		return Math.max(0, Date.now() - user.lastConnected);
	},

	update(userid: string, sessionTime: number) {
		if (sessionTime <= 0 || data.blocks[userid]) return;
		data.ontime[userid] = (data.ontime[userid] || 0) + sessionTime;
		this.save();
	},
};

// Initialize
void OntimeManager.init();

export const handlers: Chat.Handlers = {
	onDisconnect(user) {
		if (!user.named || user.connections.length > 0 || user.isPublicBot) return;
		const sessionTime = OntimeManager.getSessionTime(user);
		OntimeManager.update(user.id, sessionTime);
	},
};

export const commands: Chat.ChatCommands = {
	ontime: {
		'': 'check',
		check(target, room, user) {
			if (!this.runBroadcast()) return;
			const targetId = toID(target) || user.id;
			if (targetId.length > MAX_USERID_LENGTH) throw new Chat.ErrorMessage("Invalid username.");

			const targetUser = Users.get(targetId);
			if (targetUser?.isPublicBot) return this.sendReplyBox(`${nameColor(targetId, true)} is a bot and is not tracked.`);
			if (data.blocks[targetId]) return this.sendReplyBox(`${nameColor(targetId, true)} is blocked from tracking ontime.`);

			const savedTime = data.ontime[targetId] || 0;
			const sessionTime = OntimeManager.getSessionTime(targetUser);
			const total = savedTime + sessionTime;

			if (!total) return this.sendReplyBox(`${nameColor(targetId, true)} has no recorded ontime.`);

			let output = `${nameColor(targetId, true)}'s total ontime is <b>${OntimeManager.displayTime(total)}</b>.`;
			if (sessionTime > 0) output += `<br /><small>Current session: ${OntimeManager.displayTime(sessionTime)}</small>`;

			this.sendReplyBox(output);
		},

		ladder(target, room, user) {
			if (!this.runBroadcast()) return;

			const leaderboard = Object.entries(data.ontime)
				.filter(([id]) => !data.blocks[id])
				.map(([id, time]) => {
					const session = OntimeManager.getSessionTime(Users.get(id));
					return { id, total: time + session };
				})
				.sort((a, b) => b.total - a.total)
				.slice(0, 50);

			if (!leaderboard.length) return this.sendReplyBox("The ontime leaderboard is empty.");

			const dataRows = leaderboard.map((entry, i) => [
				`${i + 1}`,
				nameColor(entry.id, true),
				OntimeManager.displayTime(entry.total),
			]);

			const html = Table("Ontime Leaderboard", ["Rank", "User", "Time"], dataRows);
			this.sendReply(`|raw|${html}`);
		},

		block(target, room, user) {
			this.checkCan('roomowner');
			const targetId = toID(target);
			if (!targetId || targetId.length > MAX_USERID_LENGTH) throw new Chat.ErrorMessage("Invalid username.");
			if (data.blocks[targetId]) throw new Chat.ErrorMessage("User is already blocked.");

			data.blocks[targetId] = true;
			OntimeManager.save();
			this.sendReply(`${targetId} has been blocked from ontime tracking.`);
		},

		unblock(target, room, user) {
			this.checkCan('roomowner');
			const targetId = toID(target);
			if (!data.blocks[targetId]) throw new Chat.ErrorMessage("User is not blocked.");

			delete data.blocks[targetId];
			OntimeManager.save();
			this.sendReply(`${targetId} has been unblocked.`);
		},

		blocklist(target, room, user) {
			this.checkCan('roomowner');
			const blocked = Object.keys(data.blocks);
			if (!blocked.length) return this.sendReply("No users are currently blocked.");
			this.sendReply(`Blocked users: ${blocked.join(', ')}`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Ontime Commands</b></center><hr>` +
				`<b>/ontime [user]</b>: Check a user's total time.<hr>` +
				`<b>/ontime ladder</b>: View the top active users.<hr>` +
				`<b>/ontime block/unblock [user]</b>: Toggle tracking for a user.`
			);
		},
	},
};
