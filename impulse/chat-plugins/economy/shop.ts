import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { getBalance, setBalance, CURRENCY_NAME } from './economy';
import { Table } from '../../impulse-utils';
import { nameColor } from '../customization/custom-color';

const SHOP_FILE = 'impulse/db/shop.json';
const LOGS_FILE = 'impulse/db/shop-logs.json';

interface ShopItem {
	description: string;
	cost: number;
}

interface LogEntry {
	user: string;
	item: string;
	timestamp: number;
}

let shopData: Record<string, ShopItem> = {};
let shopLogs: LogEntry[] = [];

const GlobalShopManager = {
	async init() {
		try {
			const [shopRaw, logsRaw] = await Promise.all([
				FS(SHOP_FILE).readIfExists(),
				FS(LOGS_FILE).readIfExists(),
			]);
			if (shopRaw) shopData = JSON.parse(shopRaw);
			if (logsRaw) shopLogs = JSON.parse(logsRaw);
		} catch (e) {
			console.error('Global Shop init failed:', e);
		}
	},

	save() {
		FS(SHOP_FILE).writeUpdate(() => JSON.stringify(shopData));
		FS(LOGS_FILE).writeUpdate(() => JSON.stringify(shopLogs));
	},

	cleanLogs() {
		const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
		const initial = shopLogs.length;
		shopLogs = shopLogs.filter(log => log.timestamp > cutoff);
		if (shopLogs.length !== initial) this.save();
	},
};

void GlobalShopManager.init();

export const commands: Chat.ChatCommands = {
	shop: {
		''(target, room, user) {
			if (!this.runBroadcast()) return;

			const sorted = Object.entries(shopData).sort(([a], [b]) => a.localeCompare(b));
			if (!sorted.length) return this.sendReplyBox("The shop is currently empty.");

			const dataRows = sorted.map(([name, item]) => [
				`<b>${Utils.escapeHTML(name)}</b>`,
				Utils.escapeHTML(item.description),
				`<button class="button" name="send" value="/shop buy ${name}">${item.cost} ${CURRENCY_NAME}</button>`,
			]);

			const html = Table("Global Shop", ["Item", "Description", "Cost"], dataRows);
			this.sendReply(`|raw|${html}`);
		},

		buy(target, room, user) {
			const itemName = target.trim();
			const item = shopData[itemName];
			if (!item) return this.errorReply(`Item "${itemName}" not found.`);

			const bal = getBalance(user.id);
			if (bal < item.cost) return this.errorReply(`Insufficient ${CURRENCY_NAME}. (Cost: ${item.cost}, Bal: ${bal})`);

			setBalance(user.id, bal - item.cost);

			shopLogs.push({ user: user.name, item: itemName, timestamp: Date.now() });
			GlobalShopManager.save();

			this.sendReply(`Purchased <b>${itemName}</b> for <b>${item.cost}</b> ${CURRENCY_NAME}.`);

			const staffRoom = Rooms.get('staff');
			if (staffRoom) {
				staffRoom.add(`|html|<div class="infobox">${nameColor(user.name, true)} bought <b>${itemName}</b>.</div>`).update();
			}
		},

		add: 'edit',
		edit(target, room, user) {
			this.checkCan('roomowner');
			const [name, desc, costStr] = target.split(',').map(s => s.trim());
			const cost = parseInt(costStr);

			if (!name || !desc || isNaN(cost) || cost <= 0) return this.errorReply("Usage: /shop add [name], [desc], [cost]");

			shopData[name] = { description: desc, cost };
			GlobalShopManager.save();
			this.sendReply(`Item <b>${name}</b> has been added/updated.`);
		},

		remove(target, room, user) {
			this.checkCan('roomowner');
			const name = target.trim();
			if (!shopData[name]) return this.errorReply(`Item "${name}" not found.`);

			delete shopData[name];
			GlobalShopManager.save();
			this.sendReply(`Item "${name}" removed from the global shop.`);
		},

		logs(target, room, user) {
			this.checkCan('roomowner');
			GlobalShopManager.cleanLogs();
			if (!shopLogs.length) return this.sendReplyBox("No shop logs found.");

			let html = `<div class="infobox" style="max-height: 200px; overflow-y: auto;"><strong>Global Shop Logs</strong><hr />`;
			for (const log of [...shopLogs].reverse()) {
				const date = new Date(log.timestamp).toLocaleDateString();
				html += `<small>[${date}]</small> <b>${Utils.escapeHTML(log.user)}</b> bought <b>${log.item}</b><br />`;
			}
			html += `</div>`;
			this.sendReplyBox(html);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Global Shop Commands</b></center><hr>` +
				`<b>/shop</b>: View all items.<hr>` +
				`<b>/shop buy [item]</b>: Purchase an item.<hr>` +
				`<b>/shop add [name], [desc], [cost]</b>: Add/Edit item. (~)<hr>` +
				`<b>/shop remove [item]</b>: Delete an item. (~)<hr>` +
				`<b>/shop logs</b>: View purchase history. (~)`
			);
		},
	},
	shophelp: 'shop.help',
};
