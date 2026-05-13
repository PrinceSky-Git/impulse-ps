import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { Customization } from './manager';
import { nameColor } from './custom-color';

const DATA_FILE = 'impulse/db/custom-symbol.json' as const;
const BLOCKED_SYMBOLS = ['➦', '~', '&', '#', '@', '%', '*', '+'] as const;

interface CustomSymbolEntry {
	symbol: string;
	setBy: string;
	createdAt: number;
	updatedAt: number;
}

type ValidationResult =
	| { valid: true } |
	{ valid: false, error: string };

let symbolData: Record<string, CustomSymbolEntry> = {};

const SymbolManager = {
	async init(): Promise<void> {
		try {
			const raw = await FS(DATA_FILE).readIfExists();
			if (raw) symbolData = JSON.parse(raw) as Record<string, CustomSymbolEntry>;
		} catch {
			symbolData = {};
		}

		Customization.register({
			name: 'symbol',
			startTag: '/* SYMBOLS START */',
			endTag: '/* SYMBOLS END */',
			onIdentityUpdate: (user, identity, room) => {
				const entry = symbolData[user.id];
				if (!entry) return identity;

				const { symbol } = entry;
				if (user.locked || user.namelocked) return identity;

				if (room) {
					if (room.isMuted(user)) return identity;
					const roomGroup = room.auth.get(user);
					if (roomGroup === user.tempGroup || roomGroup === ' ') return symbol + user.name;
					return roomGroup + user.name;
				}

				if (user.semilocked) return identity;

				return symbol + user.name;
			},
		});
	},

	save(): void {
		FS(DATA_FILE).writeUpdate(() => JSON.stringify(symbolData));
	},

	validate(symbol: string): ValidationResult {
		if (!symbol || symbol.length !== 1) {
			return { valid: false, error: 'Symbol must be a single character.' };
		}
		if ((BLOCKED_SYMBOLS as readonly string[]).includes(symbol)) {
			return { valid: false, error: `The following symbols are blocked: ${BLOCKED_SYMBOLS.join(' ')}` };
		}
		return { valid: true };
	},

	apply(userid: string): void {
		Users.get(userid)?.updateIdentity();
	},
} as const;

void SymbolManager.init();

export const commands: Chat.ChatCommands = {
	cs: 'symbol',
	customsymbol: 'symbol',
	symbol: {
		set(target, room, user) {
			this.checkCan('roomowner');
			const [name, symbol] = target.split(',').map(s => s.trim());
			if (!name || !symbol) return this.parse('/cs help');

			const targetId = toID(name);
			if (targetId.length > 19) throw new Chat.ErrorMessage("Username too long.");
			if (symbolData[targetId]) throw new Chat.ErrorMessage("User already has a custom symbol. Use '/cs update'.");

			const validation = SymbolManager.validate(symbol);
			if (!validation.valid) throw new Chat.ErrorMessage(validation.error);

			const now = Date.now();
			symbolData[targetId] = { symbol, setBy: user.id, createdAt: now, updatedAt: now };

			SymbolManager.save();
			SymbolManager.apply(targetId);

			this.sendReply(`|raw|Custom symbol set for ${nameColor(name, true)}.`);
			Customization.notify(user, name, 'set', `set custom symbol for ${name} to <strong>${symbol}</strong>.`);
		},

		update(target, room, user) {
			this.checkCan('roomowner');
			const [name, symbol] = target.split(',').map(s => s.trim());
			const targetId = toID(name);

			if (!symbolData[targetId]) throw new Chat.ErrorMessage("User does not have a custom symbol.");

			const validation = SymbolManager.validate(symbol);
			if (!validation.valid) throw new Chat.ErrorMessage(validation.error);

			symbolData[targetId].symbol = symbol;
			symbolData[targetId].updatedAt = Date.now();

			SymbolManager.save();
			SymbolManager.apply(targetId);

			this.sendReply(`|raw|Custom symbol updated for ${nameColor(name, true)}.`);
			Customization.notify(user, name, 'updated', `updated custom symbol for ${name} to <strong>${symbol}</strong>.`);
		},

		delete(target, room, user) {
			this.checkCan('roomowner');
			const targetId = toID(target);

			if (!symbolData[targetId]) throw new Chat.ErrorMessage("User has no custom symbol.");

			delete symbolData[targetId];
			SymbolManager.save();
			SymbolManager.apply(targetId);

			this.sendReply(`Custom symbol removed for ${targetId}.`);
			Customization.notify(user, target, 'removed', `removed custom symbol for ${target}.`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Custom Symbol Commands</b></center><hr>` +
				`<b>/cs set [user], [symbol]</b>: Set a custom symbol.<hr>` +
				`<b>/cs update [user], [symbol]</b>: Update the symbol.<hr>` +
				`<b>/cs delete [user]</b>: Remove the symbol.<hr>` +
				`<center><small>Blocked: ${BLOCKED_SYMBOLS.join(' ')}</small></center>`
			);
		},

		'': 'help',
	},
	symbolhelp: 'symbol.help',
};

export const loginfilter: Chat.LoginFilter = user => {
	SymbolManager.apply(user.id);
};
