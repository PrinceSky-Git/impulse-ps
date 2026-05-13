import * as https from 'node:https';
import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';

export const CONFIG_PATH = 'config/custom.css' as const;

const reloadCSS = (): void => {
	if (global.Config?.serverid) {
		const url = `https://play.pokemonshowdown.com/customcss.php?server=${Config.serverid}&invalidate`;
		const req = https.get(url, () => {});
		req.on('error', () => {});
		req.end();
	}
};

export interface CustomizationModule {
	name: string;
	startTag: string;
	endTag: string;
	generateCSS?: () => string;
	onIdentityUpdate?: (user: User, identity: string, room: BasicRoom | null) => string;
}

export class CustomizationManager {
	readonly modules = new Map<string, CustomizationModule>();
	private initialized = false;

	register(module: CustomizationModule): void {
		this.modules.set(module.name, module);
	}

	async updateCSS(): Promise<void> {
		let css = await FS(CONFIG_PATH).readIfExists();

		for (const module of this.modules.values()) {
			if (!module.generateCSS) continue;

			const content = module.generateCSS();
			const block = `${module.startTag}\n${content}\n${module.endTag}`;

			if (!css.includes(module.startTag)) {
				css = `${css.trimEnd()}\n\n${block}\n`;
			} else {
				const startIndex = css.indexOf(module.startTag);
				const endIndex = css.indexOf(module.endTag) + module.endTag.length;
				css = css.slice(0, startIndex) + block + css.slice(endIndex);
			}
		}

		await FS(CONFIG_PATH).safeWrite(css);
		reloadCSS();
	}

	getIdentity(user: User, identity: string, room: BasicRoom | null = null): string {
		let newIdentity = identity;
		for (const module of this.modules.values()) {
			if (module.onIdentityUpdate) {
				newIdentity = module.onIdentityUpdate(user, newIdentity, room);
			}
		}
		return newIdentity;
	}

	init(): void {
		if (this.initialized) return;
		this.initialized = true;

		if (!(Users.User.prototype as any)._originalGetIdentity) {
			(Users.User.prototype as any)._originalGetIdentity = Users.User.prototype.getIdentity;
		}

		const originalGetIdentity = (Users.User.prototype as any)._originalGetIdentity as (room: BasicRoom | null) => string;
		Users.User.prototype.getIdentity = function (this: User, room: BasicRoom | null = null) {
			const identity = originalGetIdentity.call(this, room);
			if (typeof Customization !== 'undefined') return Customization.getIdentity(this, identity, room);
			return identity;
		};
	}

	notify(setter: User, targetName: string, action: string, message: string): void {
		Rooms.get('staff')
			?.add(`|html|<div class="infobox"><b>${Utils.escapeHTML(setter.name)}</b> ${message}</div>`)
			.update();

		const targetUser = Users.get(toID(targetName));
		if (targetUser?.connected) {
			targetUser.popup(`|html|${Utils.escapeHTML(setter.name)} has ${action} your customization.<br />${message}`);
		}
	}
}

export const Customization = new CustomizationManager();

declare global {

	var Customization: CustomizationManager;
}

global.Customization = Customization;

Customization.init();
