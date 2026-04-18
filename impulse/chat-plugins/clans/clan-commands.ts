/*
 * Pokemon Showdown - Impulse Server
 * Clans Info, Settings & Admin Commands
 * @author PrinceSky-Git
 */

import {
	Clans, UserClans, ClanLogs, ClanPointsLogs,
	ClanBattleLogs, ClanWars, ClanBans,
} from './database';
import { hasMinRole, log, to, toDurationString } from './utils';
import { getClanContext, getClanById } from './context';
import { generateClanProfile } from './html';
import { displayElo } from './utils';
import { Table } from '../../impulse-utils';
import { FS } from '../../../lib';
import { Utils } from '../../../lib';
import {
	MAX_CLAN_DESC_LENGTH,
	MAX_CLAN_TAG_LENGTH,
	MAX_CLAN_ICON_URL_LENGTH,
	MAX_LOG_LIMIT,
	MIN_LOG_LIMIT,
	DEFAULT_LOG_LIMIT,
	DEFAULT_PAGE_SIZE,
	CLAN_TAG_REGEX,
	ICON_URL_REGEX,
	ROOM_RANK_OWNER,
	ROOM_RANK_LEADER,
	ROOM_RANK_OFFICER,
	ROOM_RANK_MEMBER,
	ROOM_RANK_MOTW,
	DEFAULT_STATS,
} from './constants';
import type { ClanRole } from './interface';

const esc = (v: string | number | undefined | null) => Utils.escapeHTML(String(v ?? ''));

// ─── Info & Settings Commands ─────────────────────────────────────────────────

export const clanInfoCommands: Chat.ChatCommands = {

	async profile(target, room, user) {
		this.runBroadcast();
		let clanId: ID;
		if (target) {
			clanId = toID(target);
		} else {
			const userClanInfo = await UserClans.findOne({ _id: user.id });
			if (!userClanInfo?.memberOf) {
				return this.errorReply("You are not currently a member of any clan. Specify a clan ID to view its profile.");
			}
			clanId = userClanInfo.memberOf;
		}

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		this.sendReply(`|html|${generateClanProfile(clan)}`);
	},

	async members(target, room, user) {
		this.runBroadcast();
		let clanId: ID;
		if (target) {
			clanId = toID(target);
		} else {
			const userClanInfo = await UserClans.findOne({ _id: user.id });
			if (!userClanInfo?.memberOf) {
				return this.errorReply("You are not currently a member of any clan. Specify a clan ID to view its members.");
			}
			clanId = userClanInfo.memberOf;
		}

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		const memberEntries = Object.entries(clan.members);
		if (memberEntries.length === 0) {
			return this.errorReply(`Clan '${esc(clan.name)}' has no members.`);
		}

		const ROLE_LEVELS: Record<string, number> = { owner: 100, leader: 50, officer: 25, member: 10 };

		const sortedMembers = memberEntries.sort((a, b) => {
			const levelA = ROLE_LEVELS[a[1].role] ?? 0;
			const levelB = ROLE_LEVELS[b[1].role] ?? 0;
			return levelB - levelA;
		});

		const dataRows: string[][] = [];
		const headerRow = ['Username', 'Role', 'Join Date', 'Points Contributed'];
		const title = `${esc(clan.name)} Members (${memberEntries.length})`;

		sortedMembers.forEach(([userId, memberData]) => {
			dataRows.push([
				esc(userId),
				esc(memberData.role),
				toDurationString(Date.now() - memberData.joinDate) + ' ago',
				memberData.totalPointsContributed.toString(),
			]);
		});

		const output = Table(title, headerRow, dataRows);
		this.sendReply(`|html|${output}`);
	},

	async list(target, room, user) {
		this.runBroadcast();
		const [pageStr, sortBy] = target.split(',').map(s => s.trim());
		const page = parseInt(pageStr) || 1;
		const limit = DEFAULT_PAGE_SIZE;
		const skip = (page - 1) * limit;

		const sortKey = toID(sortBy) === 'points' ? 'points' : 'elo';
		const sortField = sortKey === 'elo' ? 'stats.elo' : 'points';
		const headerName = sortKey === 'elo' ? 'ELO' : 'Points';

		const [clans, total] = await Promise.all([
			Clans.find({}, { skip, limit, sort: { [sortField]: -1 } }),
			Clans.countDocuments({}),
		]);

		if (clans.length === 0) {
			return this.errorReply("No clans found.");
		}

		const totalPages = Math.ceil(total / limit);
		const dataRows: string[][] = [];
		const headerRow = ['Rank', 'Clan', 'Tag', 'Members', headerName];
		const title = `All Clans (Page ${page}/${totalPages}) - Sorted by ${headerName}`;

		clans.forEach((clan, i) => {
			const memberCount = Object.keys(clan.members).length;
			const sortValue = sortKey === 'elo' ?
				displayElo(clan.stats.elo) :
				clan.points;

			dataRows.push([
				`<strong>${skip + i + 1}</strong>`,
				esc(clan.name),
				esc(clan.tag),
				memberCount.toString(),
				`<strong>${sortValue}</strong>`,
			]);
		});

		let output = Table(title, headerRow, dataRows);

		const cmd = `/clan list`;
		if (page > 1 || page < totalPages) {
			output += '<center>';
			if (page > 1) {
				output += `<button class="button" name="send" value="${cmd} ${page - 1}, ${sortKey}">Previous</button> `;
			}
			if (page < totalPages) {
				output += `<button class="button" name="send" value="${cmd} ${page + 1}, ${sortKey}">Next</button>`;
			}
			output += '</center>';
		}
		output += `<br /><center><small>Sort by: ` +
			`<button class="button" name="send" value="${cmd} 1, elo">ELO</button> ` +
			`<button class="button" name="send" value="${cmd} 1, points">Points</button>` +
			`</small></center>`;

		this.sendReply(`|html|${output}`);
	},

	async logs(target, room, user) {
		const parts = target.split(',').map(s => s.trim());
		let clanId: ID | undefined;
		let limit = DEFAULT_LOG_LIMIT;

		if (parts.length === 2) {
			clanId = toID(parts[0]);
			limit = parseInt(parts[1]) || DEFAULT_LOG_LIMIT;
		} else if (parts.length === 1 && parts[0]) {
			const parsed = parseInt(parts[0]);
			if (!isNaN(parsed)) {
				limit = parsed;
			} else {
				clanId = toID(parts[0]);
			}
		}

		if (limit < MIN_LOG_LIMIT || limit > MAX_LOG_LIMIT) {
			return this.errorReply(`Limit must be between ${MIN_LOG_LIMIT} and ${MAX_LOG_LIMIT}.`);
		}

		if (clanId) {
			this.checkCan('roomowner');
		} else {
			const actorClanInfo = await UserClans.findOne({ _id: user.id });
			clanId = actorClanInfo?.memberOf;
			if (!clanId) {
				return this.errorReply("You are not currently a member of any clan. Usage: /clan logs [clan id], [limit] (admin only)");
			}
		}

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		const logs = await ClanLogs.find(
			{ clanId },
			{ limit, sort: { timestamp: -1 } }
		);

		if (logs.length === 0) {
			return user.popup(`|html|<div class="infobox"><center>No activity logs found for ${esc(clan.name)}.</center></div>`);
		}

		let html = `<div class="infobox" style="max-width:550px; max-height:400px; overflow-y:auto; font-size:0.9em;">`;
		html += `<center><strong>${esc(clan.name)} Activity Log</strong></center><hr>`;
		html += `<table style="width:100%; border-collapse:collapse;">`;
		html += `<tr style="font-weight:bold; border-bottom:1px solid #ccc;">`;
		html += `<td style="padding:2px 6px; white-space:nowrap; color:#888;">Time</td>`;
		html += `<td style="padding:2px 6px;">Event</td>`;
		html += `</tr>`;

		for (const entry of logs) {
			const date = to(new Date(entry.timestamp), { date: true, time: true });
			html += `<tr style="border-bottom:1px solid #eee;">`;
			html += `<td style="padding:2px 6px; white-space:nowrap; color:#888; font-size:0.85em;">${esc(date)}</td>`;
			html += `<td style="padding:2px 6px;">${esc(entry.message)}</td>`;
			html += `</tr>`;
		}

		html += `</table></div>`;
		user.popup(`|html|${html}`);
	},

	async pointslog(target, room, user) {
		const limit = parseInt(target.trim()) || DEFAULT_LOG_LIMIT;
		if (limit < MIN_LOG_LIMIT || limit > MAX_LOG_LIMIT) {
			return this.errorReply(`Limit must be between ${MIN_LOG_LIMIT} and ${MAX_LOG_LIMIT}.`);
		}

		const ctx = await getClanContext(user.id, this);
		if (!ctx) return;

		const { clan, clanId } = ctx;

		const logs = await ClanPointsLogs.find(
			{ clanId },
			{ limit, sort: { timestamp: -1 } }
		);

		if (!logs.length) {
			return user.popup(`|html|<div class="infobox"><center>No points log entries found for ${esc(clan.name)}.</center></div>`);
		}

		let html = `<div class="infobox" style="max-width:550px; max-height:400px; overflow-y:auto; font-size:0.9em;">`;
		html += `<center><strong>${esc(clan.name)} Points Log</strong></center><hr>`;
		html += `<table style="width:100%; border-collapse:collapse;">`;
		html += `<tr style="font-weight:bold; border-bottom:1px solid #ccc;">`;
		html += `<td style="padding:2px 6px; white-space:nowrap; color:#888;">Time</td>`;
		html += `<td style="padding:2px 6px;">User</td>`;
		html += `<td style="padding:2px 6px;">Amount</td>`;
		html += `<td style="padding:2px 6px;">Reason</td>`;
		html += `</tr>`;

		for (const entry of logs) {
			const date = to(new Date(entry.timestamp), { date: true, time: true });
			const amountColor = entry.amount > 0 ? 'green' : 'red';
			const amountStr = `${entry.amount > 0 ? '+' : ''}${entry.amount}`;
			html += `<tr style="border-bottom:1px solid #eee;">`;
			html += `<td style="padding:2px 6px; white-space:nowrap; color:#888; font-size:0.85em;">${esc(date)}</td>`;
			html += `<td style="padding:2px 6px;">${esc(entry.userid)}</td>`;
			html += `<td style="padding:2px 6px; color:${amountColor}; font-weight:bold;">${esc(amountStr)}</td>`;
			html += `<td style="padding:2px 6px;">${esc(entry.reason || '-')}</td>`;
			html += `</tr>`;
		}

		html += `</table></div>`;
		user.popup(`|html|${html}`);
	},

	async battlelogs(target, room, user) {
		this.runBroadcast();
		let clanId: ID;
		if (target) {
			clanId = toID(target);
		} else {
			const userClanInfo = await UserClans.findOne({ _id: user.id });
			if (!userClanInfo?.memberOf) {
				return this.errorReply("You are not in a clan. Specify a clan ID to view its logs (e.g., /clan battlelogs [clanid]).");
			}
			clanId = userClanInfo.memberOf;
		}

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		const entries = await ClanBattleLogs.find(
			{ $or: [{ winningClan: clanId }, { losingClan: clanId }] },
			{ limit: DEFAULT_LOG_LIMIT, sort: { timestamp: -1 } }
		);

		if (!entries.length) {
			return this.sendReplyBox(`No clan battle logs found for ${esc(clan.name)}.`);
		}

		const headerRow = ['Date', 'Outcome', 'ELO Change', 'Winner', 'Loser', 'Format'];
		const dataRows: string[][] = [];
		const title = `${esc(clan.name)} Battle Logs (Last ${entries.length})`;

		for (const entry of entries) {
			const isWin = entry.winningClan === clanId;
			const eloChange = entry.eloChangeWinner || 0;

			let eloChangeStr: string;
			if (entry.isWarWinningBattle) {
				eloChangeStr = isWin
					? `<strong style="color:green;">+${eloChange}</strong>`
					: `<strong style="color:red;">${entry.eloChangeLoser || -eloChange}</strong>`;
			} else {
				eloChangeStr = `<em>-</em>`;
			}

			dataRows.push([
				to(new Date(entry.timestamp), { date: true, time: true }),
				isWin
					? `<strong style="color:green;">Win</strong>`
					: `<strong style="color:red;">Loss</strong>`,
				eloChangeStr,
				`${esc(entry.winner)} (${esc(entry.winningClan)})`,
				`${esc(entry.loser)} (${esc(entry.losingClan)})`,
				esc(entry.format),
			]);
		}

		const output = Table(title, headerRow, dataRows);
		this.sendReply(`|html|${output}`);
	},

	async setdesc(target, room, user) {
		const description = target.trim();
		const actorId = user.id;

		if (!description) return this.errorReply("You must specify a description.");
		if (description.length > MAX_CLAN_DESC_LENGTH) {
			return this.errorReply(`Clan description must be ${MAX_CLAN_DESC_LENGTH} characters or less.`);
		}

		const ctx = await getClanContext(actorId, this);
		if (!ctx) return;

		const { clan, clanId } = ctx;

		if (!hasMinRole(clan, actorId, 'leader')) {
			return this.errorReply("You must be at least a Leader to edit the clan description.");
		}

		try {
			await Clans.updateOne({ _id: clanId }, { $set: { desc: description } });

			await log(clanId, 'SET_DESC', `description updated by ${actorId}`);

			const clanRoom = Rooms.get(clan.chatRoom);
			if (clanRoom) {
				clanRoom.settings.desc = description;
				clanRoom.saveSettings();
				clanRoom.add(`|html|<div class="infobox"><center>${esc(user.name)} updated the clan description.</center></div>`).update();
			}

			this.sendReply(`You updated the clan description to: "${esc(description)}"`);
		} catch (e) {
			this.errorReply("An error occurred while updating the description. Please try again.");
			Monitor.crashlog(e as Error, "Clan setdesc command", { clanId, actorId });
		}
	},

	async settag(target, room, user) {
		const tag = target.trim().toUpperCase();
		const actorId = user.id;

		if (!tag) return this.errorReply("You must specify a tag.");
		if (tag.length > MAX_CLAN_TAG_LENGTH) {
			return this.errorReply(`Clan tag must be ${MAX_CLAN_TAG_LENGTH} characters or less.`);
		}
		if (!CLAN_TAG_REGEX.test(tag)) {
			return this.errorReply("Clan tag must contain only uppercase letters.");
		}

		const ctx = await getClanContext(actorId, this);
		if (!ctx) return;

		const { clan, clanId } = ctx;

		if (!hasMinRole(clan, actorId, 'leader')) {
			return this.errorReply("You must be at least a Leader to edit the clan tag.");
		}

		const oldTag = clan.tag;

		try {
			await Clans.updateOne({ _id: clanId }, { $set: { tag } });

			await log(clanId, 'SET_TAG', `tag changed: ${oldTag} → ${tag} by ${actorId}`);

			const clanRoom = Rooms.get(clan.chatRoom);
			if (clanRoom) {
				clanRoom.add(`|html|<div class="infobox"><center>${esc(user.name)} updated the clan tag from "${esc(oldTag)}" to "${esc(tag)}".</center></div>`).update();
			}

			this.sendReply(`You updated the clan tag from "${esc(oldTag)}" to "${esc(tag)}".`);
		} catch (e) {
			this.errorReply("An error occurred while updating the tag. Please try again.");
			Monitor.crashlog(e as Error, "Clan settag command", { clanId, actorId });
		}
	},

	async setmotw(target, room, user) {
		const targetId = toID(target);
		const actorId = user.id;

		if (!targetId) return this.errorReply("You must specify a user.");

		const ctx = await getClanContext(actorId, this);
		if (!ctx) return;

		const { clan, clanId } = ctx;

		if (!hasMinRole(clan, actorId, 'leader')) {
			return this.errorReply("You must be at least a Leader to set member of the week.");
		}
		if (!clan.members[targetId]) {
			return this.errorReply(`'${esc(targetId)}' is not a member of ${esc(clan.name)}.`);
		}
		if (clan.memberOfTheWeek === targetId) {
			return this.errorReply(`'${esc(targetId)}' is already the Member of the Week for ${esc(clan.name)}.`);
		}

		const oldMotw = clan.memberOfTheWeek;

		try {
			await Clans.updateOne({ _id: clanId }, { $set: { memberOfTheWeek: targetId } });

			await log(clanId, 'SET_MOTW', `${targetId} set as MOTW by ${actorId}`);

			const clanRoom = Rooms.get(clan.chatRoom);
			if (clanRoom) {
				if (oldMotw && oldMotw !== targetId && clan.members[oldMotw]) {
					const oldMotwRole = clan.members[oldMotw].role;
					const restoredRank =
						oldMotw === clan.owner ? ROOM_RANK_OWNER :
						oldMotwRole === 'leader' ? ROOM_RANK_LEADER :
						oldMotwRole === 'officer' ? ROOM_RANK_OFFICER :
						ROOM_RANK_MEMBER;
					clanRoom.auth.set(oldMotw, restoredRank);
				}

				clanRoom.auth.set(targetId, ROOM_RANK_MOTW);
				clanRoom.saveSettings();
				clanRoom.add(`|html|<div class="infobox"><center>${esc(user.name)} set <b>${esc(targetId)}</b> as the Member of the Week!</center></div>`).update();
			}

			const targetUser = Users.getExact(targetId);
			if (targetUser?.connected) {
				targetUser.popup(`|html|<div class="infobox">Congratulations! You have been named <b>Member of the Week</b> in ${esc(clan.name)} by ${esc(user.name)}!</div>`);
			}

			this.sendReply(`You set '${esc(targetId)}' as the Member of the Week for ${esc(clan.name)}.`);
		} catch (e) {
			this.errorReply("An error occurred while setting member of the week. Please try again.");
			Monitor.crashlog(e as Error, "Clan setmotw command", { clanId, actorId, targetId });
		}
	},

	async seticon(target, room, user) {
		this.checkChat();
		if (!user.named) return this.errorReply("You must be logged in to set clan icon.");

		const iconUrl = target.trim();
		const actorId = user.id;

		if (!iconUrl) return this.errorReply("You must specify an icon URL.");
		if (iconUrl.length > MAX_CLAN_ICON_URL_LENGTH) {
			return this.errorReply(`Icon URL must be ${MAX_CLAN_ICON_URL_LENGTH} characters or less.`);
		}
		if (!ICON_URL_REGEX.test(iconUrl)) {
			return this.errorReply("Invalid image URL. Must be a valid HTTP(S) URL ending in .png, .jpg, .jpeg, .gif, or .webp");
		}

		const ctx = await getClanContext(actorId, this);
		if (!ctx) return;

		const { clan, clanId } = ctx;

		if (!hasMinRole(clan, actorId, 'leader')) {
			return this.errorReply("You must be at least a Leader to edit the clan icon.");
		}

		try {
			await Clans.updateOne({ _id: clanId }, { $set: { icon: iconUrl } });

			await log(clanId, 'SET_ICON', `icon updated by ${actorId}`);

			const clanRoom = Rooms.get(clan.chatRoom);
			if (clanRoom) {
				clanRoom.add(`|html|<div class="infobox"><center>${esc(user.name)} updated the clan icon.</center></div>`).update();
			}

			this.sendReply(`You updated the clan icon.`);
		} catch (e) {
			this.errorReply("An error occurred while updating the icon. Please try again.");
			Monitor.crashlog(e as Error, "Clan seticon command", { clanId, actorId });
		}
	},

	// ─── Admin Commands ───────────────────────────────────────────────────────

	async create(target, room, user) {
		this.checkCan('roomowner');

		const [name, ownerUsername] = target.split(',').map(s => s.trim());
		const clanName = name || '';
		const ownerId = toID(ownerUsername);

		if (!ownerId) {
			return this.errorReply("Usage: /clan create [Clan Name], [Owner ID]");
		}

		const clanId = toID(clanName);

		if (!clanId) return this.errorReply("You must specify a clan name.");
		if (clanId.length < 3 || clanId.length > 20) {
			return this.errorReply("Clan ID must be between 3 and 20 characters long.");
		}
		if (clanName.length > 30) {
			return this.errorReply("Clan name must be 30 characters or less.");
		}

		const ownerUser = Users.getExact(ownerId);
		if (!ownerUser) {
			return this.errorReply(`Owner '${ownerId}' not found. The user must be logged in.`);
		}

		const [existingClan, ownerClanInfo] = await Promise.all([
			Clans.findOne({ _id: clanId }),
			UserClans.findOne({ _id: ownerId }),
		]);

		if (existingClan) {
			return this.errorReply(`A clan with the ID '${clanId}' already exists.`);
		}
		if (ownerClanInfo?.memberOf) {
			return this.errorReply(`User '${ownerId}' is already a member of a clan.`);
		}

		const now = Date.now();
		const chatRoomId = toID(`${clanId}`) as RoomID;

		const newClan = {
			_id: clanId,
			name: clanName,
			tag: clanId.slice(0, 5).toUpperCase(),
			owner: ownerId,
			members: {
				[ownerId]: {
					role: 'owner' as ClanRole,
					joinDate: now,
					totalPointsContributed: 0,
				},
			},
			created: now,
			desc: `Welcome to ${clanName}!`,
			memberOfTheWeek: '' as ID,
			inviteOnly: false,
			invites: [],
			points: 0,
			chatRoom: chatRoomId,
			icon: '',
			lastActive: now,
			stats: DEFAULT_STATS,
		};

		try {
			await Clans.insertOne(newClan);
			await UserClans.upsert({ _id: ownerId }, { $set: { memberOf: clanId } });

			await log(clanId, 'CREATE', `clan created by ${user.id} for owner ${ownerId}`);

			const chatRoomTitle = `${clanName}`;
			let newRoom = Rooms.get(chatRoomId);

			if (!newRoom) {
				const roomSettings: RoomSettings = {
					title: chatRoomTitle,
					auth: {},
					creationTime: Date.now(),
					modjoin: '+',
					desc: newClan.desc,
				};

				newRoom = Rooms.createChatRoom(chatRoomId, chatRoomTitle, roomSettings);
				newRoom.auth.set(ownerId, '#');
				Rooms.global.settingsList.push(roomSettings);
				Rooms.global.chatRooms.push(newRoom);
				Rooms.global.writeChatRoomData();
			} else {
				newRoom.auth.set(ownerId, '#');
				newRoom.saveSettings();
			}

			if (ownerUser.connected) {
				ownerUser.joinRoom(newRoom.roomid);
				ownerUser.popup(
					`|html|<div class="infobox"><div class="infobox-message">` +
					`${user.name} has created the clan <b>${clanName}</b> for you! ` +
					`You are the clan owner (#).</div><br />` +
					`<center><button class="button" name="join" value="${newRoom.roomid}">` +
					`Go to Clan Room: #${newRoom.roomid}</button></center></div>`
				);
			}

			this.sendReply(`Clan "${clanName}" has been successfully created! Owner: ${ownerId}.`);
			this.room.add(`|html|<div class="infobox"><center>Clan "${clanName}" has been successfully created! Owner: ${ownerId}.</center></div>`);
		} catch (e) {
			this.errorReply("An error occurred while creating the clan.");
			await Clans.deleteOne({ _id: clanId });
			await UserClans.updateOne({ _id: ownerId }, { $unset: { memberOf: 1 } });
			Monitor.crashlog(e as Error, "Clan create command", { clanId, ownerId });
		}
	},

	async delete(target, room, user) {
		this.checkCan('roomowner');

		const clanId = toID(target);
		if (!clanId) return this.errorReply("You must specify a clan ID.");

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		const ownerId = clan.owner;
		const ownerUser = Users.getExact(ownerId);
		const chatRoom = Rooms.get(clan.chatRoom);

		try {
			if (chatRoom) {
				chatRoom.add(`|html|<div class="broadcast-red"><b>This clan chatroom is being permanently deleted by ${user.name}.</b></div>`).update();
				await new Promise<void>(resolve => setTimeout(resolve, 1000));

				for (const userid in chatRoom.users) {
					chatRoom.users[userid].leaveRoom(chatRoom);
				}

				Rooms.global.deregisterChatRoom(chatRoom.roomid);
				Rooms.global.delistChatRoom(chatRoom.roomid);
				chatRoom.destroy();
				FS('config/chatrooms.json').writeUpdate(() =>
					JSON.stringify(Rooms.global.settingsList)
						.replace(/\{"title":/g, '\n{"title":')
						.replace(/\]$/, '\n]')
				);
			}

			await log(clanId, 'DELETE', `clan deleted by ${user.id}`);

			await Clans.deleteOne({ _id: clanId });
			await UserClans.updateMany({ memberOf: clanId }, { $unset: { memberOf: 1 } });
			await UserClans.updateMany({ invites: clanId }, { $pull: { invites: clanId } });
			await ClanLogs.deleteMany({ clanId });
			await ClanPointsLogs.deleteMany({ clanId });
			await ClanBattleLogs.deleteMany({
				$or: [{ winningClan: clanId }, { losingClan: clanId }],
			});
			await ClanWars.deleteMany({ clans: clanId });

			if (ownerUser?.connected) {
				ownerUser.popup(
					`|html|<div class="broadcast-red">` +
					`<b>Your clan "${clan.name}" has been permanently deleted by ${user.name}.</b><br />` +
					`All clan data, members, logs, and the chatroom ${clan.chatRoom} have been removed.` +
					`</div>`
				);
			}

			const memberIds = Object.keys(clan.members);
			for (const memberId of memberIds) {
				if (memberId === ownerId) continue;
				const member = Users.getExact(memberId);
				if (member?.connected) {
					member.popup(
						`|html|<div class="broadcast-red">` +
						`<b>The clan "${clan.name}" has been permanently deleted by ${user.name}.</b>` +
						`</div>`
					);
				}
			}

			this.sendReply(`Clan "${clan.name}" (${clanId}) has been successfully deleted.`);
			Monitor.log(`[Clans] ${user.name} deleted clan: ${clan.name} (${clanId}) with ${memberIds.length} members`);
		} catch (e) {
			this.errorReply("An error occurred while deleting the clan. The deletion may have been partially completed.");
			this.privateModAction(`(CRITICAL: Clan deletion failed for ${clanId}. Manual verification required.)`);
			Monitor.crashlog(e as Error, "Clan delete command", { clanId, clanName: clan.name });
		}
	},

	async addpoints(target, room, user) {
		this.checkCan('roomowner');
		const [clanIdRaw, amountStr, ...reasonArr] = target.split(',').map(s => s.trim());
		const clanId = toID(clanIdRaw);
		const amount = parseInt(amountStr);
		const reason = reasonArr.join(',') || 'Admin adjustment';

		if (!clanId || isNaN(amount) || amount <= 0) {
			return this.errorReply("Usage: /clan addpoints [clan id], [amount], [reason]");
		}

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		try {
			await Clans.updateOne({ _id: clanId }, { $inc: { points: amount } });
			await log(clanId, 'ADMIN_POINTS', `+${amount} points by ${user.id}: ${reason}`);
			this.sendReply(`Added ${amount} points to clan '${clan.name}'. Reason: ${reason}`);
		} catch (e) {
			this.errorReply("An error occurred while adding points.");
			Monitor.crashlog(e as Error, "Clan addpoints command", { clanId });
		}
	},

	async removepoints(target, room, user) {
		this.checkCan('roomowner');
		const [clanIdRaw, amountStr, ...reasonArr] = target.split(',').map(s => s.trim());
		const clanId = toID(clanIdRaw);
		const amount = parseInt(amountStr);
		const reason = reasonArr.join(',') || 'Admin adjustment';

		if (!clanId || isNaN(amount) || amount <= 0) {
			return this.errorReply("Usage: /clan removepoints [clan id], [amount], [reason]");
		}

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		try {
			await Clans.updateOne({ _id: clanId }, { $inc: { points: -amount } });
			await log(clanId, 'ADMIN_POINTS', `-${amount} points by ${user.id}: ${reason}`);
			this.sendReply(`Removed ${amount} points from clan '${clan.name}'. Reason: ${reason}`);
		} catch (e) {
			this.errorReply("An error occurred while removing points.");
			Monitor.crashlog(e as Error, "Clan removepoints command", { clanId });
		}
	},

	async addtourwins(target, room, user) {
		this.checkCan('roomowner');
		const [clanIdRaw, amountStr] = target.split(',').map(s => s.trim());
		const clanId = toID(clanIdRaw);
		const amount = parseInt(amountStr) || 1;

		if (!clanId) return this.errorReply("Usage: /clan addtourwins [clan id], [amount]");
		if (amount <= 0) return this.errorReply("Amount must be a positive number.");

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		try {
			await Clans.updateOne({ _id: clanId }, { $inc: { 'stats.tourWins': amount } });
			await log(clanId, 'ADMIN_TOURWIN', `+${amount} tour win(s) by ${user.id}`);
			this.sendReply(`Added ${amount} tour win(s) to clan '${clan.name}'.`);
		} catch (e) {
			this.errorReply("An error occurred while adding tour wins.");
			Monitor.crashlog(e as Error, "Clan addtourwins command", { clanId });
		}
	},

	async removetourwins(target, room, user) {
		this.checkCan('roomowner');
		const [clanIdRaw, amountStr] = target.split(',').map(s => s.trim());
		const clanId = toID(clanIdRaw);
		const amount = parseInt(amountStr) || 1;

		if (!clanId) return this.errorReply("Usage: /clan removetourwins [clan id], [amount]");
		if (amount <= 0) return this.errorReply("Amount must be a positive number.");

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		try {
			await Clans.updateOne({ _id: clanId }, { $inc: { 'stats.tourWins': -amount } });
			await log(clanId, 'ADMIN_TOURWIN', `-${amount} tour win(s) by ${user.id}`);
			this.sendReply(`Removed ${amount} tour win(s) from clan '${clan.name}'.`);
		} catch (e) {
			this.errorReply("An error occurred while removing tour wins.");
			Monitor.crashlog(e as Error, "Clan removetourwins command", { clanId });
		}
	},

	async resetstats(target, room, user) {
		this.checkCan('roomowner');
		const clanId = toID(target.trim());
		if (!clanId) return this.errorReply("Usage: /clan resetstats [clan id]");

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		try {
			await Clans.updateOne(
				{ _id: clanId },
				{ $set: { 'stats.tourWins': 0, 'stats.totalPointsEarned': 0 } }
			);
			await log(clanId, 'ADMIN_RESETSTATS', `stats reset by ${user.id}`);
			this.sendReply(`Reset all stats for clan '${clan.name}'.`);
		} catch (e) {
			this.errorReply("An error occurred while resetting stats.");
			Monitor.crashlog(e as Error, "Clan resetstats command", { clanId });
		}
	},

	async setdescadmin(target, room, user) {
		this.checkCan('roomowner');
		const [clanIdRaw, ...descArr] = target.split(',').map(s => s.trim());
		const clanId = toID(clanIdRaw);
		const desc = descArr.join(',') || '';

		if (!clanId || !desc) return this.errorReply("Usage: /clan setdescadmin [clan id], [desc]");
		if (desc.length > MAX_CLAN_DESC_LENGTH) {
			return this.errorReply(`Description must be ${MAX_CLAN_DESC_LENGTH} characters or less.`);
		}

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		try {
			await Clans.updateOne({ _id: clanId }, { $set: { desc } });
			this.sendReply(`Set description for clan '${clan.name}'.`);
		} catch (e) {
			this.errorReply("An error occurred while setting the description.");
			Monitor.crashlog(e as Error, "Clan setdescadmin command", { clanId });
		}
	},

	async settagadmin(target, room, user) {
		this.checkCan('roomowner');
		const [clanIdRaw, tagRaw] = target.split(',').map(s => s.trim());
		const clanId = toID(clanIdRaw);
		const tag = tagRaw?.toUpperCase();

		if (!clanId || !tag) return this.errorReply("Usage: /clan settagadmin [clan id], [tag]");
		if (tag.length > MAX_CLAN_TAG_LENGTH || !CLAN_TAG_REGEX.test(tag)) {
			return this.errorReply(`Tag must be ${MAX_CLAN_TAG_LENGTH} characters or less and only uppercase letters.`);
		}

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		try {
			await Clans.updateOne({ _id: clanId }, { $set: { tag } });
			this.sendReply(`Set tag for clan '${clan.name}'.`);
		} catch (e) {
			this.errorReply("An error occurred while setting the tag.");
			Monitor.crashlog(e as Error, "Clan settagadmin command", { clanId });
		}
	},

	async seticonadmin(target, room, user) {
		this.checkCan('roomowner');
		const [clanIdRaw, ...iconArr] = target.split(',').map(s => s.trim());
		const clanId = toID(clanIdRaw);
		const iconUrl = iconArr.join(',') || '';

		if (!clanId || !iconUrl) return this.errorReply("Usage: /clan seticonadmin [clan id], [icon url]");
		if (iconUrl.length > MAX_CLAN_ICON_URL_LENGTH || !ICON_URL_REGEX.test(iconUrl)) {
			return this.errorReply("Icon URL must be a valid HTTP(S) image URL (png/jpg/jpeg/gif/webp) and 1000 chars or less.");
		}

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		try {
			await Clans.updateOne({ _id: clanId }, { $set: { icon: iconUrl } });
			this.sendReply(`Set icon for clan '${clan.name}'.`);
		} catch (e) {
			this.errorReply("An error occurred while setting the icon.");
			Monitor.crashlog(e as Error, "Clan seticonadmin command", { clanId });
		}
	},

	async kickall(target, room, user) {
		this.checkCan('roomowner');
		const clanId = toID(target.trim());
		if (!clanId) return this.errorReply("Usage: /clan kickall [clan id]");

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		const ownerId = clan.owner;
		const membersToKick = Object.keys(clan.members).filter(uid => uid !== ownerId);

		if (!membersToKick.length) {
			return this.sendReply(`No members to kick in clan '${clan.name}'.`);
		}

		try {
			await Clans.updateOne({ _id: clanId }, {
				$unset: Object.fromEntries(membersToKick.map(uid => [`members.${uid}`, ""])),
			});
			await UserClans.updateMany(
				{ memberOf: clanId, _id: { $in: membersToKick } },
				{ $unset: { memberOf: 1 } }
			);
			await log(clanId, 'ADMIN_KICKALL', `all members kicked by ${user.id} (${membersToKick.length} removed)`);
			this.sendReply(`Kicked all members except owner from clan '${clan.name}'.`);
		} catch (e) {
			this.errorReply("An error occurred while kicking all members.");
			Monitor.crashlog(e as Error, "Clan kickall command", { clanId });
		}
	},

	async clearinvites(target, room, user) {
		this.checkCan('roomowner');
		const clanId = toID(target.trim());
		if (!clanId) return this.errorReply("Usage: /clan clearinvites [clan id]");

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		const invitedUserIds = clan.invites.map(i => i.userid);

		try {
			await Clans.updateOne({ _id: clanId }, { $set: { invites: [] } });
			if (invitedUserIds.length) {
				await UserClans.updateMany(
					{ _id: { $in: invitedUserIds } },
					{ $pull: { invites: clanId } }
				);
			}
			this.sendReply(`Cleared all invites from clan '${clan.name}'.`);
		} catch (e) {
			this.errorReply("An error occurred while clearing invites.");
			Monitor.crashlog(e as Error, "Clan clearinvites command", { clanId });
		}
	},

	async export(target, room, user) {
		this.checkCan('roomowner');
		const clanId = toID(target.trim());
		if (!clanId) return this.errorReply("Usage: /clan export [clan id]");

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		const members = Object.keys(clan.members);
		const [logs, pointsLogs] = await Promise.all([
			ClanLogs.find({ clanId }, {}),
			ClanPointsLogs.find({ clanId }, {}),
		]);

		const exportObj = { clan, members, logs, pointsLogs };
		const exportStr = `<details><summary>Export data for clan '${clan.name}'</summary><pre>${JSON.stringify(exportObj, null, 2)}</pre></details>`;
		this.sendReply(`|html|${exportStr}`);
	},

	async transferadmin(target, room, user) {
		this.checkCan('roomowner');
		const [clanIdRaw, newOwnerRaw] = target.split(',').map(s => s.trim());
		const clanId = toID(clanIdRaw);
		const newOwnerId = toID(newOwnerRaw);

		if (!clanId || !newOwnerId) {
			return this.errorReply("Usage: /clan transferadmin [clan id], [new owner]");
		}

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		if (!clan.members[newOwnerId]) {
			return this.errorReply(`User '${newOwnerId}' is not a member of the clan.`);
		}

		const oldOwnerId = clan.owner;

		try {
			await Clans.updateOne({ _id: clanId }, {
				$set: {
					owner: newOwnerId,
					[`members.${newOwnerId}.role`]: 'owner' as ClanRole,
					[`members.${oldOwnerId}.role`]: 'leader' as ClanRole,
				},
			});
			await log(clanId, 'ADMIN_TRANSFEROWNER', `ownership transferred to ${newOwnerId} by ${user.id}`);
			this.sendReply(`Transferred ownership of clan '${clan.name}' to '${newOwnerId}'.`);
		} catch (e) {
			this.errorReply("An error occurred while transferring ownership.");
			Monitor.crashlog(e as Error, "Clan transferadmin command", { clanId, newOwnerId });
		}
	},

	async banuser(target, room, user) {
		this.checkCan('roomowner');
		const bannedId = toID(target.trim());
		if (!bannedId) return this.errorReply("Usage: /clan banuser [username]");

		try {
			await ClanBans.upsert({ _id: bannedId }, { $set: { banned: true } });
			this.sendReply(`User '${bannedId}' is now banned from joining clans.`);
		} catch (e) {
			this.errorReply("An error occurred while banning the user.");
			Monitor.crashlog(e as Error, "Clan banuser command", { bannedId });
		}
	},

	async unbanuser(target, room, user) {
		this.checkCan('roomowner');
		const bannedId = toID(target.trim());
		if (!bannedId) return this.errorReply("Usage: /clan unbanuser [username]");

		try {
			await ClanBans.deleteOne({ _id: bannedId });
			this.sendReply(`User '${bannedId}' is unbanned and may join clans.`);
		} catch (e) {
			this.errorReply("An error occurred while unbanning the user.");
			Monitor.crashlog(e as Error, "Clan unbanuser command", { bannedId });
		}
	},

	async clearlogs(target, room, user) {
		this.checkCan('roomowner');
		const clanId = toID(target.trim());
		if (!clanId) return this.errorReply("Usage: /clan clearlogs [clan id]");

		try {
			await ClanLogs.deleteMany({ clanId });
			await ClanPointsLogs.deleteMany({ clanId });
			this.sendReply(`Cleared all logs for clan '${clanId}'.`);
		} catch (e) {
			this.errorReply("An error occurred while clearing logs.");
			Monitor.crashlog(e as Error, "Clan clearlogs command", { clanId });
		}
	},

	async clearmembers(target, room, user) {
		this.checkCan('roomowner');
		const clanId = toID(target.trim());
		if (!clanId) return this.errorReply("Usage: /clan clearmembers [clan id]");

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		const ownerId = clan.owner;
		const membersToRemove = Object.keys(clan.members).filter(uid => uid !== ownerId);

		if (!membersToRemove.length) {
			return this.sendReply(`No members to remove in clan '${clan.name}'.`);
		}

		try {
			await Clans.updateOne({ _id: clanId }, {
				$unset: Object.fromEntries(membersToRemove.map(uid => [`members.${uid}`, ""])),
			});
			await UserClans.updateMany(
				{ memberOf: clanId, _id: { $in: membersToRemove } },
				{ $unset: { memberOf: 1 } }
			);
			await log(clanId, 'ADMIN_CLEARMEMBERS', `all members removed by ${user.id} (${membersToRemove.length} removed)`);
			this.sendReply(`Removed all members except owner from clan '${clan.name}'.`);
		} catch (e) {
			this.errorReply("An error occurred while clearing members.");
			Monitor.crashlog(e as Error, "Clan clearmembers command", { clanId });
		}
	},
};
