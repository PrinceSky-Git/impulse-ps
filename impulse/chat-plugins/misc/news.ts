import * as https from 'node:https';
import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';

const DATA_FILE = 'impulse/db/server-news.json';
const CONFIG_PATH = 'config/custom.css';
const SERVER_NAME = 'Impulse';

interface NewsEntry {
	id: string;
	title: string;
	postedBy: string;
	desc: string;
	postTime: string;
	timestamp: number;
}

interface ServerNewsData {
	news: Record<string, NewsEntry>;
	blocks: Record<string, boolean>;
}

let data: ServerNewsData = { news: {}, blocks: {} };

const NewsManager = {
	async init() {
		try {
			const raw = await FS(DATA_FILE).readIfExists();
			if (raw) {
				const json = JSON.parse(raw);
				data = {
					news: json.news || {},
					blocks: json.blocks || {},
				};
			}
		} catch (e) {
			data = { news: {}, blocks: {} };
		}

		try {
			const serverId = toID(SERVER_NAME);
			const startTag = '/* SERVER NEWS START */';
			const endTag = '/* SERVER NEWS END */';
			
			const cssContent = 
				`}\n` +
				`.pm-window-${serverId}news .challenge { display: none !important; }\n` +
				`.pm-window-${serverId}news .pm-buttonbar { display: none !important; }\n` +
				`.pm-window-${serverId}news .pm-log-add { display: none !important; }\n` +
				`.pm-window-${serverId}news form { display: none !important; }\n` +
				`.pm-window-${serverId}news .pm-log { bottom: 0 !important; }`;

			const block = `${startTag}\n${cssContent}\n${endTag}`;
			let css = await FS(CONFIG_PATH).readIfExists();

			if (!css.includes(startTag)) {
				css = `${css.trimEnd()}\n\n${block}\n`;
			} else {
				const startIndex = css.indexOf(startTag);
				const endIndex = css.indexOf(endTag) + endTag.length;
				css = css.slice(0, startIndex) + block + css.slice(endIndex);
			}

			await FS(CONFIG_PATH).safeWrite(css);
			this.reloadClientCSS();
		} catch (err) {
			console.error(`Error updating server news CSS: ${err}`);
		}
	},

	save() {
		FS(DATA_FILE).writeUpdate(() => JSON.stringify(data));
	},

	reloadClientCSS() {
		if (global.Config?.serverid) {
			const url = `https://play.pokemonshowdown.com/customcss.php?server=${Config.serverid}&invalidate`;
			const req = https.get(url, () => {});
			req.on('error', () => {});
			req.end();
		}
	},
	
	formatDate(date = new Date()) {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
	},

	generateDisplay(limit = 2) {
		const newsList = Object.values(data.news)
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, limit);

		if (!newsList.length) return `<center><em>No recent news.</em></center>`;

		const content = newsList.map(entry => (
			`<div style="margin-bottom: 8px; padding: 5px;">` +
			`<strong>${Utils.escapeHTML(entry.title)}</strong><br><br>` +
			`${entry.desc}<br><br>` +
			`<small>— ${Utils.escapeHTML(entry.postedBy)} on ${entry.postTime}</small>` +
			`</div>`
		)).join('<hr>');

		const serverId = toID(SERVER_NAME);
		return `<div class="${serverId}-news-box">${content}</div>`;
	},

	onConnect(user: User) {
		if (!Object.keys(data.news).length || data.blocks[user.id]) return;

		const display = this.generateDisplay();
		user.send(`|pm|${SERVER_NAME} News|${user.getIdentity()}|/raw ${display}`);
	},
};

void NewsManager.init();

export const loginfilter: Chat.LoginFilter = user => {
	NewsManager.onConnect(user);
};

export const commands: Chat.ChatCommands = {
	svn: 'servernews',
	servernews: {
		view(target, room, user) {
			if (!this.runBroadcast()) return;
			const display = NewsManager.generateDisplay();
			this.sendReplyBox(`<strong>${SERVER_NAME} News:</strong><hr />${display}`);
		},

		add(target, room, user) {
			this.checkCan('roomowner');
			const [title, ...descParts] = target.split(',').map(s => s.trim());
			const desc = descParts.join(',');

			if (!title || !desc) return this.parse('/svn help');
			const id = toID(title);

			if (data.news[id]) throw new Chat.ErrorMessage(`A news entry titled "${title}" already exists.`);

			data.news[id] = {
				id,
				title,
				postedBy: user.name,
				desc,
				postTime: NewsManager.formatDate(),
				timestamp: Date.now(),
			};

			NewsManager.save();
			this.sendReply(`Added news: "${title}"`);
		},

		delete: 'remove',
		remove(target, room, user) {
			this.checkCan('roomowner');
			const id = toID(target);
			if (!id) return this.parse('/svn help');

			if (!data.news[id]) throw new Chat.ErrorMessage(`News entry "${target}" not found.`);

			delete data.news[id];
			NewsManager.save();
			this.sendReply(`Deleted news entry: "${target}"`);
		},

		block(target, room, user) {
			if (data.blocks[user.id]) throw new Chat.ErrorMessage("You have already blocked server news.");
			data.blocks[user.id] = true;
			NewsManager.save();
			this.sendReply("You will no longer receive news popups on login.");
		},

		unblock(target, room, user) {
			if (!data.blocks[user.id]) throw new Chat.ErrorMessage("You do not have server news blocked.");
			delete data.blocks[user.id];
			NewsManager.save();
			this.sendReply("You will now receive news popups on login.");
		},

		help() {
			this.runBroadcast();
			this.sendReplyBox(
				`<center><b>Server News Commands</b></center><hr>` +
				`<b>/svn view</b>: View the latest news.<hr>` +
				`<b>/svn add [title], [desc]</b>: Add a news entry.<hr>` +
				`<b>/svn remove [title]</b>: Delete a news entry.<hr>` +
				`<b>/svn block/unblock</b>: Toggle login notifications.`
			);
		},
	},
	svnhelp: 'servernews.help',
};
