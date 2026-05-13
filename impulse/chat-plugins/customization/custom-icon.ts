import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { Customization } from './manager';
import { nameColor } from './custom-color';

const DATA_FILE = 'impulse/db/custom-icons.json' as const;

const DEFAULTS = {
	SIZE: 24,
	MIN: 1,
	MAX: 100,
} as const;

interface IconEntry {
	url: string;
	size: number;
	setBy: string;
	createdAt: number;
	updatedAt: number;
}

type ValidationResult =
	| { valid: true, size: number } |
	{ valid: false, size: 0, error: string };

let iconData: Record<string, IconEntry> = {};

const IconManager = {
	init(): void {
		try {
			const raw = FS(DATA_FILE).readIfExistsSync();
			if (raw) iconData = JSON.parse(raw) as Record<string, IconEntry>;
		} catch {
			iconData = {};
		}

		Customization.register({
			name: 'icon',
			startTag: '/* ICONS START */',
			endTag: '/* ICONS END */',
			generateCSS: () => Object.entries(iconData)
				.map(([userId, entry]) => {
					const size = entry.size || DEFAULTS.SIZE;
					return `[id$="-userlist-user-${userId}"] { background: url("${entry.url}") right no-repeat !important; background-size: ${size}px !important; }`;
				})
				.join('\n'),
		});
	},

	save(): void {
		FS(DATA_FILE).writeUpdate(() => JSON.stringify(iconData));
	},

	validateSize(sizeStr?: string): ValidationResult {
		if (!sizeStr) return { valid: true, size: DEFAULTS.SIZE };
		const size = parseInt(sizeStr);
		if (isNaN(size) || size < DEFAULTS.MIN || size > DEFAULTS.MAX) {
			return { valid: false, size: 0, error: `Invalid size. Use ${DEFAULTS.MIN}-${DEFAULTS.MAX}px.` };
		}
		return { valid: true, size };
	},
} as const;

void IconManager.init();

export const commands: Chat.ChatCommands = {
	ic: 'icon',
	usericon: 'icon',
	icon: {
		async set(target, room, user) {
			this.checkCan('roomowner');
			const [name, url, sizeStr] = target.split(',').map(s => s.trim());
			if (!name || !url) return this.parse('/icon help');

			const targetId = toID(name);
			if (targetId.length > 19) throw new Chat.ErrorMessage("Username too long.");
			if (iconData[targetId]) throw new Chat.ErrorMessage("User already has an icon. Use '/icon update' or '/icon delete'.");

			const result = IconManager.validateSize(sizeStr);
			if (!result.valid) return this.errorReply(result.error);

			const now = Date.now();
			iconData[targetId] = {
				url,
				size: result.size,
				setBy: user.id,
				createdAt: now,
				updatedAt: now,
			};

			IconManager.save();
			await Customization.updateCSS();

			const sizeInfo = result.size !== DEFAULTS.SIZE ? ` (${result.size}px)` : '';
			this.sendReply(`|raw|Icon set for ${nameColor(name, true)}.`);
			Customization.notify(user, name, 'set', `set userlist icon for ${name}${sizeInfo}.`);
		},

		async update(target, room, user) {
			this.checkCan('roomowner');
			const [name, url, sizeStr] = target.split(',').map(s => s.trim());
			const targetId = toID(name);

			if (!iconData[targetId]) throw new Chat.ErrorMessage("This user does not have an icon set.");

			if (url) iconData[targetId].url = url;
			if (sizeStr) {
				const result = IconManager.validateSize(sizeStr);
				if (!result.valid) return this.errorReply(result.error);
				iconData[targetId].size = result.size;
			}

			iconData[targetId].updatedAt = Date.now();
			IconManager.save();
			await Customization.updateCSS();

			this.sendReply(`|raw|Icon updated for ${nameColor(name, true)}.`);
			Customization.notify(user, name, 'updated', `updated userlist icon for ${name}.`);
		},

		async delete(target, room, user) {
			this.checkCan('roomowner');
			const targetId = toID(target);

			if (!iconData[targetId]) throw new Chat.ErrorMessage("User has no icon.");

			delete iconData[targetId];
			IconManager.save();
			await Customization.updateCSS();

			this.sendReply(`Icon removed for ${targetId}.`);
			Customization.notify(user, target, 'removed', `removed userlist icon for ${target}.`);
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<b><center>Custom Icon Commands</b></center><hr>` +
				`<b>/icon set [user], [url], [size]</b>: Set a user's icon (${DEFAULTS.MIN}-${DEFAULTS.MAX}px).<hr>` +
				`<b>/icon update [user], [url], [size]</b>: Update an existing icon.<hr>` +
				`<b>/icon delete [user]</b>: Remove an icon.`
			);
		},
	},
	iconhelp: 'icon.help',
};
