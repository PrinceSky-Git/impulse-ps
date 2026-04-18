/**
 * Shop Plugin
 * Commands: shop, shophelp
 */

import { FS } from '../../../lib';
import { Table } from '../../impulse-utils';
import { getBalance, setBalance, CURRENCY_NAME } from './economy';

const SHOP_PATH = 'impulse/db/shop.json';

/*************************************************************
 * Data helpers
 *************************************************************/

interface ShopItem {
	description: string;
	cost: number;
}

type ShopData = Record<string, ShopItem>;

let data: ShopData = {};

const saveData = (): void => {
	FS(SHOP_PATH).writeUpdate(() => JSON.stringify(data));
};

const loadData = async (): Promise<void> => {
	try {
		const raw = await FS(SHOP_PATH).readIfExists();
		if (raw) data = JSON.parse(raw);
	} catch (e) {
		console.error('Failed to load shop data:', e);
		data = {};
	}
};

void (async () => {
	await loadData();
})();

/*************************************************************
 * Commands
 *************************************************************/

export const commands: ChatCommands = {
	shop: {
		''(target, room, user) {
			if (!this.runBroadcast()) return;

			const sorted = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));

			if (!sorted.length) {
				return this.sendReplyBox(`<strong>The shop is currently empty.</strong>`);
			}

			const rows = sorted.map(([name, item]) => [
				Chat.escapeHTML(name),
				Chat.escapeHTML(item.description),
				`<button class="button" name="send" value="/shop buy ${name}">${item.cost} ${CURRENCY_NAME}</button>`,
			]);

			this.sendReplyBox(Table(
				`Shop`,
				['Name', 'Description', 'Cost'],
				rows
			));
		},

		buy(target, room, user) {
			const itemName = target.trim();
			if (!itemName) return this.errorReply(`Usage: /shop buy [item name]`);

			const item = data[itemName];
			if (!item) return this.errorReply(`Item "${itemName}" does not exist in the shop.`);

			const balance = getBalance(user.id);
			if (balance < item.cost) {
				return this.errorReply(`You do not have enough ${CURRENCY_NAME}. Your balance: ${balance}. Cost: ${item.cost}.`);
			}

			setBalance(user.id, balance - item.cost);

			this.sendReply(`|raw|You purchased <strong>${itemName}</strong> for <strong>${item.cost}</strong> ${CURRENCY_NAME}. Your new balance: <strong>${balance - item.cost}</strong>.`);

			const staffRoom = Rooms.get('staff');
			if (staffRoom) {
				const date = new Date().toUTCString();
				staffRoom.add(
					`|html|<div class="infobox">${Impulse.nameColor(user.name, true, true)} purchased <strong>${itemName}</strong> for <strong>${item.cost}</strong> ${CURRENCY_NAME}. Remaining balance: <strong>${balance - item.cost}</strong>. <small>(${date})</small></div>`
				).update();
			}
		},

		add(target, room, user) {
			this.checkCan('roomowner');
			const parts = target.split(',').map(s => s.trim());
			if (parts.length < 3) {
				return this.errorReply(`Usage: /shop add [name], [description], [cost]`);
			}

			const [name, description, costArg] = parts;
			const cost = parseInt(costArg);
			if (isNaN(cost) || cost <= 0) {
				return this.errorReply(`Cost must be a positive number.`);
			}

			if (data[name]) {
				return this.errorReply(`Item "${name}" already exists. Use /shop edit to update it.`);
			}

			data[name] = { description, cost };
			saveData();

			this.sendReply(`|raw|Added item <strong>${name}</strong> to the shop for <strong>${cost}</strong> ${CURRENCY_NAME}.`);
		},

		remove(target, room, user) {
			this.checkCan('roomowner');
			const name = target.trim();
			if (!name) return this.errorReply(`Usage: /shop remove [item name]`);

			if (!data[name]) {
				return this.errorReply(`Item "${name}" does not exist in the shop.`);
			}

			delete data[name];
			saveData();

			this.sendReply(`Removed item "${name}" from the shop.`);
		},

		edit(target, room, user) {
			this.checkCan('roomowner');
			const parts = target.split(',').map(s => s.trim());
			if (parts.length < 3) {
				return this.errorReply(`Usage: /shop edit [name], [description], [cost]`);
			}

			const [name, description, costArg] = parts;
			const cost = parseInt(costArg);
			if (isNaN(cost) || cost <= 0) {
				return this.errorReply(`Cost must be a positive number.`);
			}

			if (!data[name]) {
				return this.errorReply(`Item "${name}" does not exist. Use /shop add to create it.`);
			}

			data[name] = { description, cost };
			saveData();

			this.sendReply(`|raw|Updated item <strong>${Impulse.nameColor(name, true, true)}</strong>: "${description}" for <strong>${cost}</strong> ${CURRENCY_NAME}.`);
		},

		help(target, room, user) {
			if (!this.runBroadcast()) return;
			this.sendReplyBox(
				`<div style="max-height: 350px; overflow-y: auto;"><center><strong><h4>Shop Commands</h4></strong><hr></center>` +
				`<b>/shop</b> - View all available items in the shop.<hr>` +
				`<b>/shop buy [item name]</b> - Purchase an item from the shop.<hr>` +
				`<b>/shop add [name], [description], [cost]</b> - Add an item to the shop. Requires: ~<hr>` +
				`<b>/shop remove [item name]</b> - Remove an item from the shop. Requires: ~<hr>` +
				`<b>/shop edit [name], [description], [cost]</b> - Edit an existing shop item. Requires: ~</div>`
			);
		},
	},

	shophelp: 'shop.help',
};
