import { FS, Utils } from '../../../lib';
import { Table } from '../../impulse-utils';
import { nameColor } from '../customization/custom-color';

const DATA_FILE = 'impulse/db/emoticons.json';

const CONFIG = {
	MIN_SIZE: 16,
	MAX_SIZE: 256,
	DEFAULT_SIZE: 32,
	MAX_NAME_LENGTH: 10,
	VALID_URL: /^https:\/\/[^\s"'<>]+\.(?:png|gif|jpg|jpeg|webp)(?:\?[^\s"'<>]*)?$/i,
	VALID_NAME: /^[\w:)(|-]{1,10}$/,
};

interface EmoticonEntry {
	readonly url: string;
	readonly addedBy: string;
	readonly addedAt: number;
}

interface EmoticonData {
	emoticons: Record<string, EmoticonEntry>;
	emoteSize: number;
	ignores: Record<string, boolean>;
}

let data: EmoticonData = {
	emoticons: {},
	emoteSize: CONFIG.DEFAULT_SIZE,
	ignores: {},
};

let emoteRegex = /^$/g;

const EmoteManager = {
	async init() {
		try {
			const raw = await FS(DATA_FILE).readIfExists();
			if (raw) {
				const json = JSON.parse(raw);
				data = {
					emoticons: json.emoticons ?? {},
					emoteSize: json.emoteSize ?? CONFIG.DEFAULT_SIZE,
					ignores: json.ignores ?? {},
				};
			}
			this.buildRegex();
		} catch (e) {
			data = { emoticons: {}, emoteSize: CONFIG.DEFAULT_SIZE, ignores: {} };
		}
	},

	save() {
		FS(DATA_FILE).safeWriteSync(JSON.stringify(data));
	},

	buildRegex() {
		const keys = Object.keys(data.emoticons);
		emoteRegex = keys.length > 0 ?
			new RegExp(`(${keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g') :
			/^$/g;
	},

	parseMarkdown(raw: string): string {
		let out = Utils.escapeHTML(raw).replace(/&#x2f;/g, '/');

		// Code blocks
		out = out.replace(/``(.+?)``|`(.+?)`/g, (_, a, b) => `<code>${Utils.escapeHTML(a ?? b)}</code>`);
		// Bold/Italic/Strike
		out = out.replace(/\*\*(.+?)\*\*|__(.+?)__/g, (_, a, b) => `<b>${a ?? b}</b>`);
		out = out.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, (_, a, b) => `<i>${a ?? b}</i>`);
		out = out.replace(/~~(.+?)~~/g, (_, a) => `<s>${a}</s>`);
		// Links
		out = out.replace(/\[([^\]]*)\]\((https:\/\/[^\s)"'<>]+)\)/g, (_, l, u) => `<a href="${Utils.escapeHTML(u)}" rel="noopener" target="_blank">${l}</a>`);
		out = out.replace(/(?<!href=")https?:\/\/[^\s"'<>)]+/g, m => `<a href="${m}" rel="noopener" target="_blank">${m}</a>`);

		return out;
	},

	parseEmotes(message: string): string | false {
		emoteRegex.lastIndex = 0;
		if (!emoteRegex.test(message)) return false;

		const size = data.emoteSize;
		const parsed = this.parseMarkdown(message).replace(emoteRegex, match => {
			const entry = data.emoticons[match];
			if (!entry) return Utils.escapeHTML(match);
			return `<img src="${Utils.escapeHTML(entry.url)}" title="${Utils.escapeHTML(match)}" height="${size}" width="${size}" style="vertical-align:middle" loading="lazy">`;
		});

		return parsed;
	},
};

void EmoteManager.init();

export const parseMessage = (msg: string) => msg.startsWith('/html') ? msg.slice(5).replace(/&#x2f;/g, '/') : EmoteManager.parseMarkdown(msg);

export const chatfilter: Chat.ChatFilter = (message, user, room) => {
	if (room?.disableEmoticons || data.ignores[user.id]) return message;
	const parsed = EmoteManager.parseEmotes(message);
	return parsed ? `/html ${parsed}` : message;
};

export const commands: Chat.ChatCommands = {
	emote: 'emoticon',
	emotes: 'emoticon',
	emoticons: 'emoticon',
	emoticon: {
		add(target, room, user) {
			this.checkCan('roomowner');
			const [name, url] = target.split(',').map(s => s.trim());
			if (!name || !url) return this.parse('/emote help');

			if (!CONFIG.VALID_NAME.test(name)) throw new Chat.ErrorMessage(`Names must be 1-${CONFIG.MAX_NAME_LENGTH} chars (letters/numbers/:_-|()).`);
			if (!CONFIG.VALID_URL.test(url)) throw new Chat.ErrorMessage("Invalid image URL (must be HTTPS and PNG/GIF/JPG/WEBP).");
			if (data.emoticons[name]) throw new Chat.ErrorMessage(`"${name}" already exists.`);

			data.emoticons[name] = { url, addedBy: user.id, addedAt: Date.now() };
			EmoteManager.save();
			EmoteManager.buildRegex();

			this.sendReply(`|raw|Emoticon <b>${Utils.escapeHTML(name)}</b> added.`);
		},

		delete(target, room, user) {
			this.checkCan('roomowner');
			const name = target.trim();
			if (!data.emoticons[name]) throw new Chat.ErrorMessage("Emoticon not found.");

			delete data.emoticons[name];
			EmoteManager.save();
			EmoteManager.buildRegex();
			this.sendReply(`Emoticon "${name}" deleted.`);
		},

		size(target, room, user) {
			this.checkCan('roomowner');
			const size = parseInt(target);
			if (isNaN(size) || size < CONFIG.MIN_SIZE || size > CONFIG.MAX_SIZE) {
				throw new Chat.ErrorMessage(`Size must be between ${CONFIG.MIN_SIZE} and ${CONFIG.MAX_SIZE}.`);
			}
			data.emoteSize = size;
			EmoteManager.save();
			this.sendReply(`Emoticon size set to ${size}px.`);
		},

		ignore(target, room, user) {
			if (data.ignores[user.id]) throw new Chat.ErrorMessage("Already ignoring emoticons.");
			data.ignores[user.id] = true;
			EmoteManager.save();
			this.sendReply("You are now ignoring emoticons.");
		},

		unignore(target, room, user) {
			if (!data.ignores[user.id]) throw new Chat.ErrorMessage("You aren't ignoring emoticons.");
			delete data.ignores[user.id];
			EmoteManager.save();
			this.sendReply("You are no longer ignoring emoticons.");
		},

		toggle(target, room, user) {
			room = this.requireRoom();
			this.checkCan('roommod');
			room.disableEmoticons = !room.disableEmoticons;
			this.privateModAction(`(${user.name} ${room.disableEmoticons ? 'disabled' : 'enabled'} emoticons in this room.)`);
			if (room.persist) Rooms.global.writeChatRoomData();
		},

		info(target) {
			if (!this.runBroadcast()) return;
			const name = target.trim();
			const emote = data.emoticons[name];
			if (!emote) throw new Chat.ErrorMessage("Emoticon not found.");

			this.sendReplyBox(
				`<strong>Emoticon Info: ${Utils.escapeHTML(name)}</strong><br />` +
				`<img src="${emote.url}" width="40" height="40"><br />` +
				`URL: ${Utils.escapeHTML(emote.url)}<br />` +
				`Added by: ${nameColor(emote.addedBy, true)}`
			);
		},

		''(target, room, user) {
			if (!this.runBroadcast()) return;
			const keys = Object.keys(data.emoticons);
			if (!keys.length) return this.sendReplyBox("No emoticons added.");

			const size = data.emoteSize;
			const items = keys.map(key =>
				`<div style="display:inline-block;text-align:center;padding:6px;width:80px;vertical-align:top;box-sizing:border-box">` +
				`<img src="${Utils.escapeHTML(data.emoticons[key].url)}" width="${size}" height="${size}" title="${Utils.escapeHTML(key)}" style="display:block;margin:0 auto 4px" loading="lazy">` +
				`<span style="font-size:10px;word-break:break-all;display:block">${Utils.escapeHTML(key)}</span>` +
				`</div>`
										 ).join('');

			const html =
				`<div style="background:#2a2d3a;border-radius:8px;padding:12px;">` +
				`<div style="text-align:center;font-weight:bold;font-size:14px;margin-bottom:10px">Emoticons (${keys.length})</div>` +
				`<div style="font-size:0">${items}</div>` +
				`</div>`;
			this.sendReply(`|raw|${html}`);
		},
		
		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Emoticon Commands</b></center><hr>` +
				`<b>/emote add [name], [url]</b>: Add an emote.<hr>` +
				`<b>/emote delete [name]</b>: Remove an emote.<hr>` +
				`<b>/emote size [px]</b>: Set display size.<hr>` +
				`<b>/emote toggle</b>: Enable/disable in room.<hr>` +
				`<b>/emote ignore/unignore</b>: Toggle your personal view.`
			);
		},
	},
};
