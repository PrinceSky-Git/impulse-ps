import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { getBalance, setBalance, CURRENCY_NAME } from './economy';
import { Table } from '../../impulse-utils';
import { nameColor } from '../customization/custom-color';

const SHOP_FILE = 'impulse/db/roomshop.json';
const LOGS_FILE = 'impulse/db/roomshop-logs.json';

interface ShopItem {
	description: string;
	cost: number;
}

interface ShopConfig {
	enabled: boolean;
	bank: string | null;
	items: Record<string, ShopItem>;
}

interface LogEntry {
	user: string;
	item: string;
	timestamp: number;
}

let shopData: Record<string, ShopConfig> = {};
let shopLogs: Record<string, LogEntry[]> = {};

const RoomShopManager = {
	async init() {
		try {
			const [shopRaw, logsRaw] = await Promise.all([
				FS(SHOP_FILE).readIfExists(),
				FS(LOGS_FILE).readIfExists(),
			]);
			if (shopRaw) shopData = JSON.parse(shopRaw);
			if (logsRaw) shopLogs = JSON.parse(logsRaw);
		} catch (e) {
			console.error('RoomShop init failed:', e);
		}
	},

	save() {
		FS(SHOP_FILE).writeUpdate(() => JSON.stringify(shopData));
		FS(LOGS_FILE).writeUpdate(() => JSON.stringify(shopLogs));
	},

	cleanLogs(roomid: string) {
		if (!shopLogs[roomid]) return;
		const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
		const initial = shopLogs[roomid].length;
		shopLogs[roomid] = shopLogs[roomid].filter(log => log.timestamp > cutoff);
		if (shopLogs[roomid].length !== initial) this.save();
	},

	getRoomData(roomid: string): ShopConfig {
		if (!shopData[roomid]) {
			shopData[roomid] = { enabled: false, bank: null, items: {} };
		}
		return shopData[roomid];
	},
};

void RoomShopManager.init();

export const commands: Chat.ChatCommands = {
	roomshop: {
		''(target, room, user) {
			if (!room || room.battle) return this.errorReply("This command must be used in a chat room.");
			const data = RoomShopManager.getRoomData(room.roomid);
			if (!data.enabled) return this.errorReply("The shop is not enabled for this room.");

			if (!this.runBroadcast()) return;

			const sorted = Object.entries(data.items).sort(([a], [b]) => a.localeCompare(b));
			if (!sorted.length) return this.sendReplyBox("The room shop is currently empty.");

			const dataRows = sorted.map(([name, item]) => [
				`<b>${Utils.escapeHTML(name)}</b>`,
				Utils.escapeHTML(item.description),
				`<button class="button" name="send" value="/roomshop buy ${name}">${item.cost} ${CURRENCY_NAME}</button>`,
			]);

			const html = Table(`${room.title} Shop`, ["Item", "Description", "Cost"], dataRows);
			this.sendReply(`|raw|${html}`);
		},

		buy(target, room, user) {
			if (!room || room.battle) return this.errorReply("This command must be used in a chat room.");
			const data = RoomShopManager.getRoomData(room.roomid);
			const itemName = target.trim();

			if (!data.enabled) return this.errorReply("Shop is disabled.");
			if (!data.bank) return this.errorReply("No bank set for this room.");

			const item = data.items[itemName];
			if (!item) return this.errorReply(`Item "${itemName}" not found.`);

			const bal = getBalance(user.id);
			if (bal < item.cost) return this.errorReply(`Insufficient ${CURRENCY_NAME}. (Cost: ${item.cost}, Bal: ${bal})`);

			setBalance(user.id, bal - item.cost);
			setBalance(data.bank, getBalance(data.bank) + item.cost);

			if (!shopLogs[room.roomid]) shopLogs[room.roomid] = [];
			shopLogs[room.roomid].push({ user: user.name, item: itemName, timestamp: Date.now() });
			RoomShopManager.save();

			this.sendReply(`Purchased <b>${itemName}</b> for <b>${item.cost}</b> ${CURRENCY_NAME}.`);
		},

		bank(target, room, user) {
			if (!room || room.battle) return this.errorReply("Use this in a room.");
			this.checkCan('roommod', null, room);
			const targetId = toID(target);
			if (!targetId) return this.errorReply("Usage: /roomshop bank [user]");

			const data = RoomShopManager.getRoomData(room.roomid);
			data.bank = targetId;
			RoomShopManager.save();
			this.sendReply(`|raw|Room bank set to: ${nameColor(targetId, true)}`);
		},

		showbank(target, room, user) {
			if (!room || room.battle) return this.errorReply("Use this in a room.");
			const data = RoomShopManager.getRoomData(room.roomid);
			if (!data.bank) return this.sendReplyBox("No bank has been set for this room.");
			this.sendReplyBox(`The current bank for this room is: ${nameColor(data.bank, true)}`);
		},

		add: 'edit',
		edit(target, room, user) {
			if (!room || room.battle) return this.errorReply("Use this in a room.");
			this.checkCan('roommod', null, room);
			const [name, desc, costStr] = target.split(',').map(s => s.trim());
			const cost = parseInt(costStr);

			if (!name || !desc || isNaN(cost) || cost <= 0) return this.errorReply("Usage: /roomshop add [name], [desc], [cost]");

			const data = RoomShopManager.getRoomData(room.roomid);
			if (!data.enabled) return this.errorReply("Room shop is not enabled.");

			data.items[name] = { description: desc, cost };
			RoomShopManager.save();
			this.sendReply(`Item <b>${name}</b> has been added/updated.`);
		},

		remove(target, room, user) {
			if (!room || room.battle) return this.errorReply("Use this in a room.");
			this.checkCan('roommod', null, room);
			const data = RoomShopManager.getRoomData(room.roomid);
			const name = target.trim();

			if (!data.items[name]) return this.errorReply(`Item "${name}" not found.`);
			delete data.items[name];
			RoomShopManager.save();
			this.sendReply(`Item "${name}" removed.`);
		},

		enable(target, room, user) {
			this.checkCan('lockdown');
			if (!room || room.battle) return this.errorReply("Use this in a room.");
			const data = RoomShopManager.getRoomData(room.roomid);
			data.enabled = true;
			RoomShopManager.save();
			this.sendReply("Room Shop enabled.");
		},

		disable(target, room, user) {
			this.checkCan('lockdown');
			if (!room || room.battle) return this.errorReply("Use this in a room.");
			const data = RoomShopManager.getRoomData(room.roomid);
			data.enabled = false;
			RoomShopManager.save();
			this.sendReply("Room Shop disabled.");
		},

		logs(target, room, user) {
			if (!room || room.battle) return this.errorReply("Use this in a room.");
			this.checkCan('roommod', null, room);
			RoomShopManager.cleanLogs(room.roomid);
			const logs = shopLogs[room.roomid] || [];
			if (!logs.length) return this.sendReplyBox("No shop logs found.");

			let html = `<div class="infobox" style="max-height: 200px; overflow-y: auto;"><strong>Shop Logs: ${room.title}</strong><hr />`;
			for (const log of [...logs].reverse()) {
				const date = new Date(log.timestamp).toLocaleDateString();
				html += `<small>[${date}]</small> <b>${Utils.escapeHTML(log.user)}</b> bought <b>${log.item}</b><br />`;
			}
			html += `</div>`;
			this.sendReplyBox(html);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Room Shop Commands</b></center><hr>` +
				`<b>/roomshop</b>: View items.<hr>` +
				`<b>/roomshop buy [item]</b>: Purchase item.<hr>` +
				`<b>/roomshop showbank</b>: See who receives the coins.<hr>` +
				`<b>/roomshop bank [user]</b>: Set room bank. (#)<hr>` +
				`<b>/roomshop add [name], [desc], [cost]</b>: Add item. (#)<hr>` +
				`<b>/roomshop logs</code>: View purchases. (#)`
			);
		},
	},
	roomshophelp: 'roomshop.help',
	showbank: 'roomshop.showbank',
};
