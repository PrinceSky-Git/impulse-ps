import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { Customization } from './manager';
import { nameColor } from './custom-color';

const DATA_FILE = 'impulse/db/custom-symbol-colors.json' as const;
const HEX_REGEX = /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/ as const;

interface SymbolColorEntry {
	color: string;
	setBy: string;
	createdAt: number;
	updatedAt: number;
}

let symbolData: Record<string, SymbolColorEntry> = {};

const SymbolColorManager = {
	init(): void {
		try {
			const raw = FS(DATA_FILE).readIfExistsSync();
			if (raw) symbolData = JSON.parse(raw) as Record<string, SymbolColorEntry>;
		} catch {
			symbolData = {};
		}

		Customization.register({
			name: 'symbol-color',
			startTag: '/* SYMBOLCOLORS START */',
			endTag: '/* SYMBOLCOLORS END */',
			generateCSS: () => Object.entries(symbolData)
				.map(([userId, entry]) => {
					const selector = `[id$="-userlist-user-${userId}"] button > em.group`;
					const chatSelector = `[class$="chatmessage-${userId}"] strong small, .groupsymbol`;
					return `${selector} { color: ${entry.color} !important; }\n${chatSelector} { color: ${entry.color} !important; }`;
				})
				.join('\n'),
		});
	},

	save(): void {
		FS(DATA_FILE).writeUpdate(() => JSON.stringify(symbolData));
	},

	validateColor(color: string): boolean {
		return HEX_REGEX.test(color);
	},
} as const;

void SymbolColorManager.init();

export const commands: Chat.ChatCommands = {
	sc: 'symbolcolor',
	symbolcolor: {
		async set(target, room, user) {
			this.checkCan('roomowner');
			const [name, color] = target.split(',').map(s => s.trim());
			if (!name || !color) return this.parse('/sc help');

			const targetId = toID(name);
			if (targetId.length > 19) throw new Chat.ErrorMessage("Username too long.");
			if (!SymbolColorManager.validateColor(color)) throw new Chat.ErrorMessage("Invalid hex color format.");
			if (symbolData[targetId]) throw new Chat.ErrorMessage("User already has a symbol color.");

			const now = Date.now();
			symbolData[targetId] = { color, setBy: user.id, createdAt: now, updatedAt: now };

			SymbolColorManager.save();
			await Customization.updateCSS();

			this.sendReply(`|raw|Symbol color set for ${nameColor(name, true)}.`);
			Customization.notify(user, name, 'set', `set symbol color for ${name} to <font color="${color}">${color}</font>.`);
		},

		async update(target, room, user) {
			this.checkCan('roomowner');
			const [name, color] = target.split(',').map(s => s.trim());
			const targetId = toID(name);

			if (!symbolData[targetId]) throw new Chat.ErrorMessage("User does not have a symbol color.");
			if (!SymbolColorManager.validateColor(color)) throw new Chat.ErrorMessage("Invalid hex color format.");

			symbolData[targetId].color = color;
			symbolData[targetId].updatedAt = Date.now();

			SymbolColorManager.save();
			await Customization.updateCSS();

			this.sendReply(`|raw|Symbol color updated for ${nameColor(name, true)}.`);
			Customization.notify(user, name, 'updated', `updated symbol color for ${name} to <font color="${color}">${color}</font>.`);
		},

		async delete(target, room, user) {
			this.checkCan('roomowner');
			const targetId = toID(target);

			if (!symbolData[targetId]) throw new Chat.ErrorMessage("User has no symbol color.");

			delete symbolData[targetId];
			SymbolColorManager.save();
			await Customization.updateCSS();

			this.sendReply(`Symbol color removed for ${targetId}.`);
			Customization.notify(user, target, 'removed', `removed symbol color for ${target}.`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Custom Symbol Color Commands</b></center><hr>` +
				`<b>/sc set [user], [hex]</b>: Set a user's symbol color.<hr>` +
				`<b>/sc update [user], [hex]</b>: Update symbol color.<hr>` +
				`<b>/sc delete [user]</b>: Remove symbol color.`
			);
		},

		'': 'help',
	},
};
