import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { Table } from '../../impulse-utils';
import { nameColor } from '../customization/custom-color';

const ECONOMY_FILE = 'impulse/db/economy.json';
const DAILY_FILE = 'impulse/db/daily-rewards.json';

const CONFIG = {
	CURRENCY: 'coins',
	STARTING_BALANCE: 0,
	DAILY_MIN: 1,
	DAILY_MAX: 5,
	DAILY_COOLDOWN: 24 * 60 * 60 * 1000,
};

let ecoData: Record<string, number> = {};
let dailyData: Record<string, number> = {};

const EconomyManager = {
	async init() {
		try {
			const [ecoRaw, dailyRaw] = await Promise.all([
				FS(ECONOMY_FILE).readIfExists(),
				FS(DAILY_FILE).readIfExists(),
			]);
			if (ecoRaw) ecoData = JSON.parse(ecoRaw);
			if (dailyRaw) dailyData = JSON.parse(dailyRaw);
		} catch (e) {
			console.error('Economy init failed:', e);
		}
	},

	save() {
		FS(ECONOMY_FILE).writeUpdate(() => JSON.stringify(ecoData));
		FS(DAILY_FILE).writeUpdate(() => JSON.stringify(dailyData));
	},

	getBal(userid: string): number {
		return ecoData[userid] ?? CONFIG.STARTING_BALANCE;
	},

	updateBal(userid: string, amount: number) {
		ecoData[userid] = this.getBal(userid) + amount;
		if (ecoData[userid] < 0) ecoData[userid] = 0;
		this.save();
	},

	notify(user: User | string, message: string) {
		const target = typeof user === 'string' ? Users.get(user) : user;
		if (target?.connected) target.popup(`|html|${message}`);
	},
};

void EconomyManager.init();

export const CURRENCY_NAME = CONFIG.CURRENCY;

export const getBalance = (userid: string): number => EconomyManager.getBal(userid);

export const setBalance = (userid: string, amount: number) => {
	ecoData[userid] = amount < 0 ? 0 : amount;
	EconomyManager.save();
};

export const commands: Chat.ChatCommands = {
	bal: 'balance',
	atm: 'balance',
	balance(target, room, user) {
		if (!this.runBroadcast()) return;
		const targetId = toID(target) || user.id;
		const balance = EconomyManager.getBal(targetId);
		this.sendReplyBox(`${nameColor(targetId, true)} has <b>${balance}</b> ${CONFIG.CURRENCY}.`);
	},

	daily(target, room, user) {
		const now = Date.now();
		const lastDaily = dailyData[user.id] || 0;
		const remaining = (lastDaily + CONFIG.DAILY_COOLDOWN) - now;

		if (remaining > 0) {
			const timeParts = Chat.toDurationString(remaining, { precision: true });
			return this.errorReply(`You've already claimed your daily ${CONFIG.CURRENCY}. Please wait ${timeParts}.`);
		}

		const reward = Math.floor(Math.random() * (CONFIG.DAILY_MAX - CONFIG.DAILY_MIN + 1)) + CONFIG.DAILY_MIN;
		dailyData[user.id] = now;
		EconomyManager.updateBal(user.id, reward);

		this.sendReply(`You received <b>${reward}</b> daily ${CONFIG.CURRENCY}! Your new balance: <b>${EconomyManager.getBal(user.id)}</b>.`);
	},

	transfer(target, room, user) {
		const [targetName, amountStr] = target.split(',').map(s => s.trim());
		const amount = parseInt(amountStr);
		const targetId = toID(targetName);

		if (!targetId || isNaN(amount) || amount <= 0) return this.errorReply("Usage: /transfer [user], [amount]");
		if (targetId === user.id) return this.errorReply("You cannot transfer to yourself.");

		const senderBal = EconomyManager.getBal(user.id);
		if (senderBal < amount) return this.errorReply(`You don't have enough ${CONFIG.CURRENCY}.`);

		EconomyManager.updateBal(user.id, -amount);
		EconomyManager.updateBal(targetId, amount);

		this.sendReply(`Sent <b>${amount}</b> ${CONFIG.CURRENCY} to ${targetName}.`);
		EconomyManager.notify(targetId, `${nameColor(user.name, true)} sent you <b>${amount}</b> ${CONFIG.CURRENCY}.`);
	},

	givemoney(target, room, user) {
		this.checkCan('roomowner');
		const [targetName, amountStr] = target.split(',').map(s => s.trim());
		const amount = parseInt(amountStr);
		const targetId = toID(targetName);

		if (!targetId || isNaN(amount) || amount <= 0) return this.errorReply("Usage: /givemoney [user], [amount]");

		EconomyManager.updateBal(targetId, amount);
		this.sendReply(`Gave <b>${amount}</b> ${CONFIG.CURRENCY} to ${targetName}.`);

		Rooms.get('staff')?.add(`|html|<div class="infobox">${user.name} gave <b>${amount}</b> ${CONFIG.CURRENCY} to ${targetName}.</div>`).update();
		EconomyManager.notify(targetId, `You received <b>${amount}</b> ${CONFIG.CURRENCY} from staff.`);
	},

	takemoney(target, room, user) {
		this.checkCan('roomowner');
		const [targetName, amountStr] = target.split(',').map(s => s.trim());
		const amount = parseInt(amountStr);
		const targetId = toID(targetName);

		if (!targetId || isNaN(amount) || amount <= 0) return this.errorReply("Usage: /takemoney [user], [amount]");

		EconomyManager.updateBal(targetId, -amount);
		this.sendReply(`Took <b>${amount}</b> ${CONFIG.CURRENCY} from ${targetName}.`);

		Rooms.get('staff')?.add(`|html|<div class="infobox">${user.name} took <b>${amount}</b> ${CONFIG.CURRENCY} from ${targetName}.</div>`).update();
		EconomyManager.notify(targetId, `Staff took <b>${amount}</b> ${CONFIG.CURRENCY} from your balance.`);
	},

	richu: 'richestusers',
	richestusers(target, room, user) {
		if (!this.runBroadcast()) return;
		const sorted = Object.entries(ecoData)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 50);

		if (!sorted.length) return this.sendReplyBox("No economy data found.");

		const dataRows = sorted.map(([id, bal], i) => [
			`${i + 1}`,
			nameColor(id, true),
			`${bal}`,
		]);

		const html = Table("Richest Users", ["Rank", "User", CONFIG.CURRENCY], dataRows);
		this.sendReply(`|raw|${html}`);
	},

	ecohelp() {
		this.runBroadcast();
		this.sendReplyBox(
			`<center><b>Economy Commands</b></center><hr>` +
			`<b>/bal [user]</b>: Check balance.<hr>` +
			`<b>/daily</b>: Claim 1-5 ${CONFIG.CURRENCY} every 24h.<hr>` +
			`<b>/transfer [user], [amt]</b>: Send ${CONFIG.CURRENCY}.<hr>` +
			`<b>/richu</b>: See leaderboard.<hr>` +
			`<b>/givemoney/takemoney [user], [amt]</b>: Staff only.`
		);
	},
};
