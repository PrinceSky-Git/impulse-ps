import * as crypto from 'node:crypto';
import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { Customization } from './manager';

const DATA_FILE = 'impulse/db/custom-colors.json' as const;

interface CustomColors {
	[userid: string]: string;
}

let customColors: CustomColors = {};
const colorCache: Record<string, string> = {};

const ColorManager = {
	init(): void {
		try {
			const raw = FS(DATA_FILE).readIfExistsSync();
			if (raw) customColors = JSON.parse(raw) as CustomColors;
		} catch {
			customColors = {};
		}

		Customization.register({
			name: 'color',
			startTag: '/* COLORS START */',
			endTag: '/* COLORS END */',
			generateCSS: () => Object.entries(customColors)
				.map(([id, color]) => ColorManager.generateCSS(id, color))
				.join('\n'),
		});
	},

	save(): void {
		FS(DATA_FILE).writeUpdate(() => JSON.stringify(customColors));
	},

	validateHex(color: string): boolean {
		return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
	},

	hslToRgb(h: number, s: number, l: number): string {
		const c = (100 - Math.abs(2 * l - 100)) * s / 100 / 100;
		const x = c * (1 - Math.abs((h / 60) % 2 - 1));
		const m = l / 100 - c / 2;
		let r = 0, g = 0, b = 0;

		const hCase = Math.floor(h / 60);
		if (hCase === 0) { r = c; g = x; } else if (hCase === 1) { r = x; g = c; } else if (hCase === 2) { g = c; b = x; } else if (hCase === 3) { g = x; b = c; } else if (hCase === 4) { r = x; b = c; } else if (hCase === 5) { r = c; b = x; }

		const toHex = (val: number): string =>
			Math.round((val + m) * 255).toString(16).padStart(2, '0');

		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	},

	generateCSS(userid: string, color: string): string {
		const selector = [
			`[class$="chatmessage-${userid}"] strong`,
			`[class$="chatmessage-${userid} mine"] strong`,
			`[class$="chatmessage-${userid} highlighted"] strong`,
			`[id$="-userlist-user-${userid}"] button:not([data-away]) strong`,
			`[id$="-userlist-user-${userid}"] button:not([data-away]) strong em`,
			`[id$="-userlist-user-${userid}"] button:not([data-away]) span`,
		].join(', ');
		return `${selector} { color: ${color} !important; }`;
	},
} as const;

void ColorManager.init();

export const hashColor = (name: string): string => {
	const id = toID(name);
	if (customColors[id]) return customColors[id];
	if (colorCache[id]) return colorCache[id];

	const hash = crypto.createHash('md5').update(id).digest('hex');
	const h = parseInt(hash.slice(4, 8), 16) % 360;
	const s = (parseInt(hash.slice(0, 4), 16) % 50) + 40;
	const l = Math.floor(parseInt(hash.slice(8, 12), 16) % 20 + 30);

	const color = ColorManager.hslToRgb(h, s, l);
	colorCache[id] = color;
	return color;
};

export const nameColor = (name: string, bold = true, userGroup = false): string => {
	const userId = toID(name);
	const symbol = userGroup && Users.globalAuth.get(userId) ?
		`<font color="#948A88">${Users.globalAuth.get(userId)}</font>` :
		'';
	const userName = Utils.escapeHTML(Users.getExact(name)?.name || name);
	return `${symbol}${bold ? '<b>' : ''}<font color="${hashColor(name)}">${userName}</font>${bold ? '</b>' : ''}`;
};

export const reloadCSS = async (): Promise<void> => {
	ColorManager.init();
	for (const key in colorCache) delete colorCache[key];
	await Customization.updateCSS();
};

export const commands: Chat.ChatCommands = {
	cc: 'customcolor',
	customcolor: {
		async set(target, room, user) {
			this.checkCan('roomowner');
			const [name, color] = target.split(',').map(t => t.trim());
			if (!name || !color) return this.parse('/cc help');

			const targetId = toID(name);
			if (!ColorManager.validateHex(color)) throw new Chat.ErrorMessage("Invalid hex format (#RRGGBB).");

			customColors[targetId] = color;
			colorCache[targetId] = color;
			ColorManager.save();
			await Customization.updateCSS();

			Customization.notify(user, name, 'set', `set custom color for <b>${Utils.escapeHTML(name)}</b> to <font color="${color}">${color}</font>.`);
			this.sendReply(`|raw|Color set for <b><font color="${color}">${Utils.escapeHTML(name)}</font></b>.`);
		},

		async delete(target, room, user) {
			this.checkCan('roomowner');
			const targetId = toID(target);
			if (!customColors[targetId]) throw new Chat.ErrorMessage(`${target} has no custom color.`);

			delete customColors[targetId];
			delete colorCache[targetId];
			ColorManager.save();
			await Customization.updateCSS();

			Customization.notify(user, target, 'removed', `removed custom color for <b>${targetId}</b>.`);
			this.sendReply(`Custom color removed for ${targetId}.`);
		},

		preview(target) {
			if (!this.runBroadcast()) return;
			const [name, color] = target.split(',').map(t => t.trim());
			if (!name || !ColorManager.validateHex(color)) return this.errorReply("Usage: /cc preview [user], [hex]");
			this.sendReplyBox(`<b><font size="3" color="${color}">${Utils.escapeHTML(name)}</font></b>`);
		},

		async reload(target, room, user) {
			this.checkCan('roomowner');
			await reloadCSS();
			this.privateModAction(`(${user.name} reloaded custom colors.)`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Custom Color Commands</b></center><hr>` +
				`<b>/cc set [user], [hex]</b>: Set color.<hr>` +
				`<b>/cc delete [user]</b>: Remove color.<hr>` +
				`<b>/cc preview [user], [hex]</b>: Preview color.`
			);
		},
	},
};
