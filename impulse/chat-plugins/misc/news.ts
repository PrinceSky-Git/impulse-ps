import { FS, Utils } from '../../../lib';
import { toID } from '../../../sim/dex';
import { nameColor } from '../customization/custom-color';

const DATA_FILE = 'impulse/db/server-news.json';
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
	},

	save() {
		FS(DATA_FILE).safeWriteSync(JSON.stringify(data));
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

		return newsList.map(entry => (
			`<div style="border-left: 3px solid #2a75bb; padding-left: 10px; margin-bottom: 8px;">` +
			`<strong>${Utils.escapeHTML(entry.title)}</strong><br />` +
			`${entry.desc}<br />` +
			`<small>— ${nameColor(entry.postedBy, true)} on ${entry.postTime}</small>` +
			`</div>`
		)).join('<hr />');
	},

	onConnect(user: User) {
		if (!Object.keys(data.news).length || data.blocks[user.id]) return;

		const display = this.generateDisplay();
		user.send(`|pm| ${SERVER_NAME} News|${user.getIdentity()}|/raw <div class="infobox"><strong>${SERVER_NAME} News:</strong><hr />${display}</div>`);
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
