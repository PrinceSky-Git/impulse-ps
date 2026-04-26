/****************************************
* PokemonShowdown Impulse Server
* Economy & Shop chat-plugin
* Includes Economy, Shop and Room Shop
* @author PrinceSky-Git
****************************************/

import { FS } from '../../lib';
import { Table } from '../impulse-utils';

const ECONOMY_PATH        = 'impulse/db/economy.json';
const ECONOMY_LOGS_PATH   = 'impulse/db/economy-logs.json';
const SHOP_PATH           = 'impulse/db/shop.json';
const SHOP_LOGS_PATH      = 'impulse/db/shop-logs.json';
const ROOM_SHOP_PATH      = 'impulse/db/roomshop.json';
const ROOM_SHOP_LOGS_PATH = 'impulse/db/roomshop-logs.json';

export const CURRENCY_NAME  = 'coins';
const STARTING_BALANCE      = 0;
const SEVEN_DAYS_MS         = 7 * 24 * 60 * 60 * 1000;

type EconomyData = Record<string, number>;

let economyData: EconomyData = {};

const saveEconomy = (): void => {
	FS(ECONOMY_PATH).writeUpdate(() => JSON.stringify(economyData));
};

const loadEconomy = async (): Promise<void> => {
	try {
		const raw = await FS(ECONOMY_PATH).readIfExists();
		if (raw) economyData = JSON.parse(raw);
	} catch (e) {
		console.error('Failed to load economy data:', e);
		economyData = {};
	}
};

export function getBalance(userid: string): number {
	return economyData[userid] ?? STARTING_BALANCE;
}

export function setBalance(userid: string, amount: number): void {
	economyData[userid] = amount;
	saveEconomy();
}

type EconomyLogAction = 'transfer' | 'givemoney' | 'takemoney';

interface EconomyLogEntry {
	action: EconomyLogAction;
	from: string;
	to: string;
	amount: number;
	timestamp: number;
}

type EconomyLogData = Record<string, EconomyLogEntry[]>;

let economyLogs: EconomyLogData = {};

const saveEconomyLogs = (): void => {
	FS(ECONOMY_LOGS_PATH).writeUpdate(() => JSON.stringify(economyLogs));
};

const loadEconomyLogs = async (): Promise<void> => {
	try {
		const raw = await FS(ECONOMY_LOGS_PATH).readIfExists();
		if (raw) economyLogs = JSON.parse(raw);
	} catch (e) {
		console.error('Failed to load economy logs:', e);
		economyLogs = {};
	}
};

const cleanEconomyLogs = (userid: string): void => {
	if (!economyLogs[userid]) return;
	const initial = economyLogs[userid].length;
	const now = Date.now();
	economyLogs[userid] = economyLogs[userid].filter(l => (now - l.timestamp) <= SEVEN_DAYS_MS);
	if (economyLogs[userid].length !== initial) saveEconomyLogs();
};

function addEconomyLog(entry: EconomyLogEntry): void {
	if (!economyLogs[entry.to]) economyLogs[entry.to] = [];
	economyLogs[entry.to].push(entry);
	saveEconomyLogs();
}

interface ShopItem {
	description: string;
	cost: number;
}

interface ShopLogEntry {
	user: string;
	item: string;
	timestamp: number;
}

type ShopData = Record<string, ShopItem>;

let shopData: ShopData       = {};
let shopLogs: ShopLogEntry[] = [];

const saveShop = (): void => {
	FS(SHOP_PATH).writeUpdate(() => JSON.stringify(shopData));
};

const saveShopLogs = (): void => {
	FS(SHOP_LOGS_PATH).writeUpdate(() => JSON.stringify(shopLogs));
};

const loadShop = async (): Promise<void> => {
	try {
		const raw = await FS(SHOP_PATH).readIfExists();
		if (raw) shopData = JSON.parse(raw);
	} catch (e) {
		console.error('Failed to load shop data:', e);
		shopData = {};
	}
};

const loadShopLogs = async (): Promise<void> => {
	try {
		const raw = await FS(SHOP_LOGS_PATH).readIfExists();
		if (raw) shopLogs = JSON.parse(raw);
	} catch (e) {
		console.error('Failed to load shop logs:', e);
		shopLogs = [];
	}
};

const cleanShopLogs = (): void => {
	const initial = shopLogs.length;
	const now = Date.now();
	shopLogs = shopLogs.filter(l => (now - l.timestamp) <= SEVEN_DAYS_MS);
	if (shopLogs.length !== initial) saveShopLogs();
};

interface RoomShopItem {
	description: string;
	cost: number;
}

interface RoomShopConfig {
	enabled: boolean;
	bank: string | null;
	items: Record<string, RoomShopItem>;
}

interface RoomShopLogEntry {
	user: string;
	item: string;
	timestamp: number;
}

type RoomShopData    = Record<string, RoomShopConfig>;
type RoomShopLogData = Record<string, RoomShopLogEntry[]>;

let roomShopData: RoomShopData    = {};
let roomShopLogs: RoomShopLogData = {};

const saveRoomShop = (): void => {
	FS(ROOM_SHOP_PATH).writeUpdate(() => JSON.stringify(roomShopData));
};

const saveRoomShopLogs = (): void => {
	FS(ROOM_SHOP_LOGS_PATH).writeUpdate(() => JSON.stringify(roomShopLogs));
};

const loadRoomShop = async (): Promise<void> => {
	try {
		const raw = await FS(ROOM_SHOP_PATH).readIfExists();
		if (raw) roomShopData = JSON.parse(raw);
	} catch (e) {
		console.error('Failed to load room shop data:', e);
		roomShopData = {};
	}
};

const loadRoomShopLogs = async (): Promise<void> => {
	try {
		const raw = await FS(ROOM_SHOP_LOGS_PATH).readIfExists();
		if (raw) roomShopLogs = JSON.parse(raw);
	} catch (e) {
		console.error('Failed to load room shop logs:', e);
		roomShopLogs = {};
	}
};

const cleanRoomShopLogs = (roomid: string): void => {
	if (!roomShopLogs[roomid]) return;
	const initial = roomShopLogs[roomid].length;
	const now = Date.now();
	roomShopLogs[roomid] = roomShopLogs[roomid].filter(l => (now - l.timestamp) <= SEVEN_DAYS_MS);
	if (roomShopLogs[roomid].length !== initial) saveRoomShopLogs();
};

function formatDate(timestamp: number): string {
	const d = new Date(timestamp);
	return [
		String(d.getDate()).padStart(2, '0'),
		String(d.getMonth() + 1).padStart(2, '0'),
		d.getFullYear(),
	].join('-');
}

void (async () => {
	await loadEconomy();
	await loadEconomyLogs();
	await loadShop();
	await loadShopLogs();
	await loadRoomShop();
	await loadRoomShopLogs();
})();

export const commands: ChatCommands = {

	balance(target, room, user) {
		if (!this.runBroadcast()) return;
		const targetId    = target.trim() ? toID(target) : user.id;
		const displayName = target.trim() ? target.trim() : user.name;
		const balance     = getBalance(targetId);
		this.sendReplyBox(
			`<strong>${Impulse.nameColor(displayName, true, true)}</strong> has <strong>${balance}</strong> ${CURRENCY_NAME}.`
		);
	},

	transfer(target, room, user) {
		const [targetArg, amountArg] = target.split(',').map(s => s.trim());
		if (!targetArg || !amountArg) return this.errorReply(`Usage: /transfer [user], [amount]`);

		const targetId = toID(targetArg);
		if (targetId === user.id) return this.errorReply(`You cannot transfer ${CURRENCY_NAME} to yourself.`);

		const amount = parseInt(amountArg);
		if (isNaN(amount) || amount <= 0) return this.errorReply(`Amount must be a positive number.`);

		const senderBalance = getBalance(user.id);
		if (senderBalance < amount) {
			return this.errorReply(`You do not have enough ${CURRENCY_NAME}. Your balance: ${senderBalance}.`);
		}

		setBalance(user.id, senderBalance - amount);
		setBalance(targetId, getBalance(targetId) + amount);

		addEconomyLog({ action: 'transfer', from: user.name, to: targetId, amount, timestamp: Date.now() });

		this.sendReply(
			`You transferred <strong>${amount}</strong> ${CURRENCY_NAME} to <strong>${Impulse.nameColor(targetArg, true, true)}</strong>.`
		);

		const targetUserObj = Users.get(targetId);
		if (targetUserObj?.connected) {
			targetUserObj.popup(
				`|html|${Impulse.nameColor(user.name, true, true)} has sent you <strong>${amount}</strong> ${CURRENCY_NAME}.`
			);
		}
	},

	givemoney(target, room, user) {
		this.checkCan('roomowner');
		const [targetArg, amountArg] = target.split(',').map(s => s.trim());
		if (!targetArg || !amountArg) return this.errorReply(`Usage: /givemoney [user], [amount]`);

		const amount = parseInt(amountArg);
		if (isNaN(amount) || amount <= 0) return this.errorReply(`Amount must be a positive number.`);

		const targetId   = toID(targetArg);
		const newBalance = getBalance(targetId) + amount;
		setBalance(targetId, newBalance);

		addEconomyLog({ action: 'givemoney', from: user.name, to: targetId, amount, timestamp: Date.now() });

		this.sendReply(
			`|raw|You gave <strong>${amount}</strong> ${CURRENCY_NAME} to <strong>${Impulse.nameColor(targetArg, true, true)}</strong>. Their new balance: <strong>${newBalance}</strong>.`
		);

		const staffRoom = Rooms.get('staff');
		if (staffRoom) {
			staffRoom.add(
				`|html|<div class="infobox">${Impulse.nameColor(user.name, true, true)} gave <strong>${amount}</strong> ${CURRENCY_NAME} to ${Impulse.nameColor(targetArg, true, false)}. New balance: <strong>${newBalance}</strong>.</div>`
			).update();
		}

		const targetUserObj = Users.get(targetId);
		if (targetUserObj?.connected) {
			targetUserObj.popup(
				`|html|${Impulse.nameColor(user.name, true, true)} has given you <strong>${amount}</strong> ${CURRENCY_NAME}. Your new balance: <strong>${newBalance}</strong>.`
			);
		}
	},

	takemoney(target, room, user) {
		this.checkCan('roomowner');
		const [targetArg, amountArg] = target.split(',').map(s => s.trim());
		if (!targetArg || !amountArg) return this.errorReply(`Usage: /takemoney [user], [amount]`);

		const amount = parseInt(amountArg);
		if (isNaN(amount) || amount <= 0) return this.errorReply(`Amount must be a positive number.`);

		const targetId       = toID(targetArg);
		const currentBalance = getBalance(targetId);
		if (currentBalance < amount) {
			return this.errorReply(`${targetArg} only has ${currentBalance} ${CURRENCY_NAME}.`);
		}

		const newBalance = currentBalance - amount;
		setBalance(targetId, newBalance);

		addEconomyLog({ action: 'takemoney', from: user.name, to: targetId, amount, timestamp: Date.now() });

		this.sendReply(
			`|raw|You took <strong>${amount}</strong> ${CURRENCY_NAME} from <strong>${Impulse.nameColor(targetArg, true, true)}</strong>. Their new balance: <strong>${newBalance}</strong>.`
		);

		const staffRoom = Rooms.get('staff');
		if (staffRoom) {
			staffRoom.add(
				`|html|<div class="infobox">${Impulse.nameColor(user.name, true, true)} took <strong>${amount}</strong> ${CURRENCY_NAME} from ${Impulse.nameColor(targetArg, true, false)}. New balance: <strong>${newBalance}</strong>.</div>`
			).update();
		}

		const targetUserObj = Users.get(targetId);
		if (targetUserObj?.connected) {
			targetUserObj.popup(
				`|html|${Impulse.nameColor(user.name, true, true)} has taken <strong>${amount}</strong> ${CURRENCY_NAME} from you. Your new balance: <strong>${newBalance}</strong>.`
			);
		}
	},

	richestusers(target, room, user) {
		if (!this.runBroadcast()) return;

		const sorted = Object.entries(economyData)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 100);

		if (!sorted.length) return this.sendReplyBox(`No economy data found.`);

		const rows = sorted.map(([userid, balance], i) => [
			String(i + 1),
			Impulse.nameColor(userid, true, true),
			String(balance),
		]);

		this.sendReplyBox(Table(
			`Top 100 Richest Users`,
			['Rank', 'User', CURRENCY_NAME.charAt(0).toUpperCase() + CURRENCY_NAME.slice(1)],
			rows
		));
	},

	economy: {
		logs(target, room, user) {
			this.checkCan('roommod');

			const targetId = toID(target);
			if (!targetId) return this.errorReply(`Usage: /economy logs [user]`);

			cleanEconomyLogs(targetId);

			const userLogs = economyLogs[targetId] || [];

			if (!userLogs.length) {
				return this.sendReplyBox(
					`<div style="max-height: 350px; overflow-y: auto;">` +
					`<center><strong><h4>Economy Logs — ${Chat.escapeHTML(target)}</h4></strong><hr></center>` +
					`No recent economy logs found for this user.` +
					`</div>`
				);
			}

			const sortedLogs = [...userLogs].sort((a, b) => b.timestamp - a.timestamp);

			const actionLabel: Record<EconomyLogAction, string> = {
				transfer:  'transferred to',
				givemoney: 'given to',
				takemoney: 'taken from',
			};

			const formattedLogs = sortedLogs.map(log => {
				const label = actionLabel[log.action];
				return (
					`<strong>${Chat.escapeHTML(log.from)}</strong> ` +
					`<strong>${log.amount}</strong> ${CURRENCY_NAME} ${label} ` +
					`<strong>${Chat.escapeHTML(log.to)}</strong> ` +
					`on ${formatDate(log.timestamp)}`
				);
			});

			let html = `<div style="max-height: 350px; overflow-y: auto;">`;
			html += `<center><strong><h4>Economy Logs — ${Chat.escapeHTML(target)}</h4></strong><hr></center>`;
			html += formattedLogs.join('<hr>');
			html += `</div>`;

			this.sendReplyBox(html);
		},
	},

	atm:     'balance',
	bal:     'balance',
	richu:   'richestusers',
	eco:     'economy',
	ecologs: 'economy',

	ecohelp(target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReplyBox(
			`<div style="max-height: 350px; overflow-y: auto;"><center><strong><h4>Economy Commands</h4></strong><hr><b>Aliases: /bal, /atm, /richu, /eco</b></center><hr>` +
			`<b>/balance [user]</b> - Check your balance or another user's balance.<hr>` +
			`<b>/transfer [user], [amount]</b> - Transfer ${CURRENCY_NAME} to another user.<hr>` +
			`<b>/richestusers</b> - View the top 100 richest users.<hr>` +
			`<b>/economy logs [user]</b> - View economy logs (transfer/give/take) for a user. Requires: %<hr>` +
			`<b>/givemoney [user], [amount]</b> - Give ${CURRENCY_NAME} to a user. Requires: ~<hr>` +
			`<b>/takemoney [user], [amount]</b> - Take ${CURRENCY_NAME} from a user. Requires: ~</div>`
		);
	},

	shop: {
		''(target, room, user) {
			if (!this.runBroadcast()) return;

			const sorted = Object.entries(shopData).sort(([a], [b]) => a.localeCompare(b));
			if (!sorted.length) return this.sendReplyBox(`<strong>The shop is currently empty.</strong>`);

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

			const item = shopData[itemName];
			if (!item) return this.errorReply(`Item "${itemName}" does not exist in the shop.`);

			const balance = getBalance(user.id);
			if (balance < item.cost) {
				return this.errorReply(`You do not have enough ${CURRENCY_NAME}. Your balance: ${balance}. Cost: ${item.cost}.`);
			}

			setBalance(user.id, balance - item.cost);

			shopLogs.push({ user: user.name, item: itemName, timestamp: Date.now() });
			saveShopLogs();

			this.sendReply(
				`|raw|You purchased <strong>${itemName}</strong> for <strong>${item.cost}</strong> ${CURRENCY_NAME}. Your new balance: <strong>${balance - item.cost}</strong>.`
			);

			const staffRoom = Rooms.get('staff');
			if (staffRoom) {
				staffRoom.add(
					`|html|<div class="infobox">${Impulse.nameColor(user.name, true, true)} purchased <strong>${itemName}</strong> for <strong>${item.cost}</strong> ${CURRENCY_NAME}. Remaining balance: <strong>${balance - item.cost}</strong>. <small>(${new Date().toUTCString()})</small></div>`
				).update();
			}
		},

		add(target, room, user) {
			this.checkCan('roomowner');
			const parts = target.split(',').map(s => s.trim());
			if (parts.length < 3) return this.errorReply(`Usage: /shop add [name], [description], [cost]`);

			const [name, description, costArg] = parts;
			const cost = parseInt(costArg);
			if (isNaN(cost) || cost <= 0) return this.errorReply(`Cost must be a positive number.`);
			if (shopData[name]) return this.errorReply(`Item "${name}" already exists. Use /shop edit to update it.`);

			shopData[name] = { description, cost };
			saveShop();
			this.sendReply(`|raw|Added item <strong>${name}</strong> to the shop for <strong>${cost}</strong> ${CURRENCY_NAME}.`);
		},

		remove(target, room, user) {
			this.checkCan('roomowner');
			const name = target.trim();
			if (!name) return this.errorReply(`Usage: /shop remove [item name]`);
			if (!shopData[name]) return this.errorReply(`Item "${name}" does not exist in the shop.`);

			delete shopData[name];
			saveShop();
			this.sendReply(`Removed item "${name}" from the shop.`);
		},

		edit(target, room, user) {
			this.checkCan('roomowner');
			const parts = target.split(',').map(s => s.trim());
			if (parts.length < 3) return this.errorReply(`Usage: /shop edit [name], [description], [cost]`);

			const [name, description, costArg] = parts;
			const cost = parseInt(costArg);
			if (isNaN(cost) || cost <= 0) return this.errorReply(`Cost must be a positive number.`);
			if (!shopData[name]) return this.errorReply(`Item "${name}" does not exist. Use /shop add to create it.`);

			shopData[name] = { description, cost };
			saveShop();
			this.sendReply(`|raw|Updated item <strong>${Impulse.nameColor(name, true, true)}</strong>: "${description}" for <strong>${cost}</strong> ${CURRENCY_NAME}.`);
		},

		logs(target, room, user) {
			this.checkCan('roomowner');
			cleanShopLogs();

			if (!shopLogs.length) {
				return this.sendReplyBox(
					`<div style="max-height: 350px; overflow-y: auto;"><center><strong><h4>Shop Logs</h4></strong><hr></center>No recent shop logs found.</div>`
				);
			}

			const sortedLogs = [...shopLogs].sort((a, b) => b.timestamp - a.timestamp);
			const formattedLogs = sortedLogs.map(log =>
				`<strong>${Chat.escapeHTML(log.user)}</strong> purchased <strong>${Chat.escapeHTML(log.item)}</strong> on ${formatDate(log.timestamp)}`
			);

			let html = `<div style="max-height: 350px; overflow-y: auto;">`;
			html += `<center><strong><h4>Shop Logs</h4></strong><hr></center>`;
			html += formattedLogs.join('<hr>');
			html += `</div>`;

			this.sendReplyBox(html);
		},

		help(target, room, user) {
			if (!this.runBroadcast()) return;
			this.sendReplyBox(
				`<div style="max-height: 350px; overflow-y: auto;"><center><strong><h4>Shop Commands</h4></strong><hr></center>` +
				`<b>/shop</b> - View all available items in the shop.<hr>` +
				`<b>/shop buy [item name]</b> - Purchase an item from the shop.<hr>` +
				`<b>/shop add [name], [description], [cost]</b> - Add an item to the shop. Requires: ~<hr>` +
				`<b>/shop remove [item name]</b> - Remove an item from the shop. Requires: ~<hr>` +
				`<b>/shop edit [name], [description], [cost]</b> - Edit an existing shop item. Requires: ~<hr>` +
				`<b>/shop logs</b> - View shop purchase logs (auto-deletes after 7 days). Requires: ~</div>`
			);
		},
	},

	shophelp: 'shop.help',

	roomshop: {
		''(target, room, user) {
			if (!room || room.roomid.startsWith('cmd-') || room.roomid === 'global') {
				return this.errorReply(`This command must be used in a chat room.`);
			}

			const config = roomShopData[room.roomid];
			if (!config || !config.enabled) return this.errorReply(`The shop is not enabled for this room.`);
			if (!this.runBroadcast()) return;

			const sorted = Object.entries(config.items).sort(([a], [b]) => a.localeCompare(b));
			if (!sorted.length) return this.sendReplyBox(`<strong>The room shop is currently empty.</strong>`);

			const rows = sorted.map(([name, item]) => [
				Chat.escapeHTML(name),
				Chat.escapeHTML(item.description),
				`<button class="button" name="send" value="/roomshop buy ${name}">${item.cost} ${CURRENCY_NAME}</button>`,
			]);

			this.sendReplyBox(Table(
				`${room.title} Shop`,
				['Name', 'Description', 'Cost'],
				rows
			));
		},

		enable(target, room, user) {
			this.checkCan('lockdown');
			if (!room || room.roomid.startsWith('cmd-') || room.roomid === 'global') {
				return this.errorReply(`This command must be used in a chat room.`);
			}

			if (!roomShopData[room.roomid]) {
				roomShopData[room.roomid] = { enabled: true, bank: null, items: {} };
			} else {
				roomShopData[room.roomid].enabled = true;
			}

			saveRoomShop();
			this.sendReply(`|raw|<strong>Room Shop</strong> has been <strong>enabled</strong> for this room.`);
		},

		disable(target, room, user) {
			this.checkCan('lockdown');
			if (!room || room.roomid.startsWith('cmd-') || room.roomid === 'global') {
				return this.errorReply(`This command must be used in a chat room.`);
			}
			if (!roomShopData[room.roomid]) return this.errorReply(`The room shop is not configured here yet.`);

			roomShopData[room.roomid].enabled = false;
			saveRoomShop();
			this.sendReply(`|raw|<strong>Room Shop</strong> has been <strong>disabled</strong> for this room.`);
		},

		bank(target, room, user) {
			if (!room || room.roomid.startsWith('cmd-') || room.roomid === 'global') {
				return this.errorReply(`This command must be used in a chat room.`);
			}
			this.checkCan('roommod');

			const targetId = toID(target);
			if (!targetId) return this.errorReply(`Usage: /roomshop bank [username/id]`);

			if (!roomShopData[room.roomid]) {
				roomShopData[room.roomid] = { enabled: false, bank: targetId, items: {} };
			} else {
				roomShopData[room.roomid].bank = targetId;
			}

			saveRoomShop();
			this.sendReply(`|raw|The room shop bank for this room has been set to <strong>${Impulse.nameColor(target, true, true)}</strong>.`);
		},

		add(target, room, user) {
			if (!room || room.roomid.startsWith('cmd-') || room.roomid === 'global') {
				return this.errorReply(`This command must be used in a chat room.`);
			}
			this.checkCan('roommod');

			const config = roomShopData[room.roomid];
			if (!config || !config.enabled) {
				return this.errorReply(`The shop must be enabled by a global admin first using /roomshop enable.`);
			}

			const parts = target.split(',').map(s => s.trim());
			if (parts.length < 3) return this.errorReply(`Usage: /roomshop add [name], [description], [cost]`);

			const [name, description, costArg] = parts;
			const cost = parseInt(costArg);
			if (isNaN(cost) || cost <= 0) return this.errorReply(`Cost must be a positive number.`);
			if (config.items[name]) return this.errorReply(`Item "${name}" already exists. Use /roomshop edit to update it.`);

			config.items[name] = { description, cost };
			saveRoomShop();
			this.sendReply(`|raw|Added item <strong>${name}</strong> to the room shop for <strong>${cost}</strong> ${CURRENCY_NAME}.`);
		},

		remove(target, room, user) {
			if (!room || room.roomid.startsWith('cmd-') || room.roomid === 'global') {
				return this.errorReply(`This command must be used in a chat room.`);
			}
			this.checkCan('roommod');

			const config = roomShopData[room.roomid];
			if (!config || !config.enabled) return this.errorReply(`The shop must be enabled by a global admin first.`);

			const name = target.trim();
			if (!name) return this.errorReply(`Usage: /roomshop remove [item name]`);
			if (!config.items[name]) return this.errorReply(`Item "${name}" does not exist in this room's shop.`);

			delete config.items[name];
			saveRoomShop();
			this.sendReply(`Removed item "${name}" from the room shop.`);
		},

		edit(target, room, user) {
			if (!room || room.roomid.startsWith('cmd-') || room.roomid === 'global') {
				return this.errorReply(`This command must be used in a chat room.`);
			}
			this.checkCan('roommod');

			const config = roomShopData[room.roomid];
			if (!config || !config.enabled) return this.errorReply(`The shop must be enabled by a global admin first.`);

			const parts = target.split(',').map(s => s.trim());
			if (parts.length < 3) return this.errorReply(`Usage: /roomshop edit [name], [description], [cost]`);

			const [name, description, costArg] = parts;
			const cost = parseInt(costArg);
			if (isNaN(cost) || cost <= 0) return this.errorReply(`Cost must be a positive number.`);
			if (!config.items[name]) return this.errorReply(`Item "${name}" does not exist. Use /roomshop add to create it.`);

			config.items[name] = { description, cost };
			saveRoomShop();
			this.sendReply(`|raw|Updated room shop item <strong>${Impulse.nameColor(name, true, true)}</strong>: "${description}" for <strong>${cost}</strong> ${CURRENCY_NAME}.`);
		},

		buy(target, room, user) {
			if (!room || room.roomid.startsWith('cmd-') || room.roomid === 'global') {
				return this.errorReply(`This command must be used in a chat room.`);
			}

			const config = roomShopData[room.roomid];
			if (!config || !config.enabled) return this.errorReply(`The shop is not enabled for this room.`);

			if (!config.bank) {
				return this.errorReply(`This room's shop does not have a bank set up yet. A Room Owner must configure one using /roomshop bank before purchases can be made.`);
			}

			const itemName = target.trim();
			if (!itemName) return this.errorReply(`Usage: /roomshop buy [item name]`);

			const item = config.items[itemName];
			if (!item) return this.errorReply(`Item "${itemName}" does not exist in this room's shop.`);

			const balance = getBalance(user.id);
			if (balance < item.cost) {
				return this.errorReply(`You do not have enough ${CURRENCY_NAME}. Your balance: ${balance}. Cost: ${item.cost}.`);
			}

			setBalance(user.id, balance - item.cost);
			setBalance(config.bank, getBalance(config.bank) + item.cost);

			if (!roomShopLogs[room.roomid]) roomShopLogs[room.roomid] = [];
			roomShopLogs[room.roomid].push({ user: user.name, item: itemName, timestamp: Date.now() });
			saveRoomShopLogs();

			this.sendReply(
				`|raw|You purchased <strong>${itemName}</strong> for <strong>${item.cost}</strong> ${CURRENCY_NAME}. Your new balance: <strong>${balance - item.cost}</strong>.`
			);
		},

		logs(target, room, user) {
			if (!room || room.roomid.startsWith('cmd-') || room.roomid === 'global') {
				return this.errorReply(`This command must be used in a chat room.`);
			}
			this.checkCan('roommod');
			cleanRoomShopLogs(room.roomid);

			const roomLogs = roomShopLogs[room.roomid] || [];

			if (!roomLogs.length) {
				return this.sendReplyBox(
					`<div style="max-height: 350px; overflow-y: auto;"><center><strong><h4>Room Shop Logs</h4></strong><hr></center>No recent shop logs found for this room.</div>`
				);
			}

			const sortedLogs = [...roomLogs].sort((a, b) => b.timestamp - a.timestamp);
			const formattedLogs = sortedLogs.map(log =>
				`<strong>${Chat.escapeHTML(log.user)}</strong> purchased <strong>${Chat.escapeHTML(log.item)}</strong> on ${formatDate(log.timestamp)}`
			);

			let html = `<div style="max-height: 350px; overflow-y: auto;">`;
			html += `<center><strong><h4>Room Shop Logs</h4></strong><hr></center>`;
			html += formattedLogs.join('<hr>');
			html += `</div>`;

			this.sendReplyBox(html);
		},

		help(target, room, user) {
			if (!this.runBroadcast()) return;
			this.sendReplyBox(
				`<div style="max-height: 350px; overflow-y: auto;"><center><strong><h4>Room Shop Commands</h4></strong><hr></center>` +
				`<b>/roomshop</b> - View all available items in the current room's shop.<hr>` +
				`<b>/roomshop buy [item name]</b> - Purchase an item from the current room's shop.<hr>` +
				`<center><strong>Room Owner Commands (#)</strong><hr></center>` +
				`<b>/roomshop add [name], [description], [cost]</b> - Add an item to the room shop.<hr>` +
				`<b>/roomshop remove [item name]</b> - Remove an item from the room shop.<hr>` +
				`<b>/roomshop edit [name], [description], [cost]</b> - Edit an existing room shop item.<hr>` +
				`<b>/roomshop bank [username/id]</b> - Set the user who receives ${CURRENCY_NAME} when an item is purchased.<hr>` +
				`<b>/roomshop logs</b> - View room shop purchase logs (auto-deletes after 7 days).<hr>` +
				`<center><strong>Admin Commands (~)</strong><hr></center>` +
				`<b>/roomshop enable</b> - Enable the room shop for the current room.<hr>` +
				`<b>/roomshop disable</b> - Disable the room shop for the current room.</div>`
			);
		},
	},

	roomshophelp: 'roomshop.help',
};
