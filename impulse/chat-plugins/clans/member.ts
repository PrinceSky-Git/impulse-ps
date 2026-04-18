/*
 * Pokemon Showdown - Impulse Server
 * Clans Member & Role Commands
 * @author PrinceSky-Git
 */

import { Clans, UserClans, ClanBans } from './database';
import { hasMinRole, log, to } from './utils';
import { getClanContext, getClanById, assertClanMember, assertNotOwner } from './context';
import { generateInvitePopup, generateAnnouncementPopup } from './html';
import { Table } from '../../impulse-utils';
import { Utils } from '../../../lib';
import { CLAN_ROLE_TO_ROOM_RANK } from './constants';
import type { ClanRole } from './interface';

const esc = (v: string | number | undefined | null) => Utils.escapeHTML(String(v ?? ''));

// ─── Role Hierarchy ───────────────────────────────────────────────────────────

const ASSIGNABLE_ROLES: ClanRole[] = ['leader', 'officer', 'member'];

const ROLE_LEVELS: Record<ClanRole, number> = {
	owner: 100,
	leader: 50,
	officer: 25,
	member: 10,
};

// ─── Member Commands ──────────────────────────────────────────────────────────

export const memberCommands: Chat.ChatCommands = {

	async join(target, room, user) {
		const clanId = toID(target);
		const userId = user.id;

		if (!clanId) return this.errorReply("Specify the ID of the clan you wish to join.");

		const banInfo = await ClanBans.findOne({ _id: userId });
		if (banInfo?.banned) return this.errorReply("You are banned from joining clans.");

		const [clan, userClanInfo] = await Promise.all([
			Clans.findOne({ _id: clanId }),
			UserClans.findOne({ _id: userId }),
		]);

		if (!clan) return this.errorReply(`Clan '${clanId}' not found.`);
		if (userClanInfo?.memberOf) {
			return this.errorReply(`You are already a member of the clan '${userClanInfo.memberOf}'.`);
		}

		const isInvited = clan.invites.some(invite => invite.userid === userId);
		if (clan.inviteOnly && !isInvited) {
			return this.errorReply(`The clan '${esc(clan.name)}' is invite-only. You must be invited to join.`);
		}

		try {
			await Clans.updateOne(
				{ _id: clanId },
				{ $pull: { invites: { userid: userId } } }
			);
			await Clans.updateOne(
				{ _id: clanId },
				{
					$set: {
						[`members.${userId}`]: {
							role: 'member',
							joinDate: Date.now(),
							totalPointsContributed: 0,
						},
					},
				}
			);
			await UserClans.upsert({ _id: userId }, {
				$set: { memberOf: clanId },
				$pull: { invites: clanId },
			});

			await log(clanId, 'JOIN', `${userId} joined`);

			const clanRoom = Rooms.get(clan.chatRoom);
			if (clanRoom) {
				clanRoom.auth.set(userId, '+');
				clanRoom.saveSettings();
				user.joinRoom(clanRoom.roomid, this.connection);
				clanRoom.add(`|html|<div class="infobox">${esc(user.name)} joined the clan and was granted Room Voice.</div>`).update();
			}

			this.sendReply(`You have successfully joined the clan '${esc(clan.name)}'!`);
			if (clanRoom) this.sendReply(`You have been automatically joined to the clan chatroom: #${esc(clan.chatRoom)}`);
		} catch (e) {
			this.errorReply("An error occurred while joining the clan. Please try again.");
			Monitor.crashlog(e as Error, "Clan join command", { clanId, userId });
		}
	},

	async leave(target, room, user) {
		const userId = user.id;
		const ctx = await getClanContext(userId, this);
		if (!ctx) return;

		const { clan, clanId } = ctx;

		if (clan.owner === userId) {
			return this.errorReply("You are the owner of this clan. Transfer ownership before leaving or delete the clan.");
		}

		try {
			await Clans.updateOne({ _id: clanId }, { $unset: { [`members.${userId}`]: "" } });
			await UserClans.updateOne({ _id: userId }, { $unset: { memberOf: 1 } });

			await log(clanId, 'LEAVE', `${userId} left`);

			const clanRoom = Rooms.get(clan.chatRoom);
			if (clanRoom) {
				clanRoom.auth.delete(userId);
				clanRoom.saveSettings();
				clanRoom.add(`|html|<div class="infobox"><center>${esc(user.name)} left the clan.</center></div>`).update();
				user.leaveRoom(clanRoom.roomid, this.connection);
			}

			this.sendReply(`You have successfully left the clan '${esc(clan.name)}'.`);
		} catch (e) {
			this.errorReply("An error occurred while leaving the clan. Please try again.");
			Monitor.crashlog(e as Error, "Clan leave command", { clanId, userId });
		}
	},

	async kick(target, room, user) {
		const targetId = toID(target);
		const kickerId = user.id;

		if (!targetId) return this.errorReply("Specify the user you wish to kick.");
		if (targetId === kickerId) return this.errorReply("You cannot kick yourself.");

		const ctx = await getClanContext(kickerId, this);
		if (!ctx) return;

		const { clan, clanId } = ctx;

		if (!hasMinRole(clan, kickerId, 'officer')) {
			return this.errorReply("You must be at least an Officer to kick members.");
		}
		if (!assertClanMember(clan, targetId, this)) return;
		if (!assertNotOwner(clan, targetId, this)) return;

		const kickerRole = clan.owner === kickerId ? 'owner' : (clan.members[kickerId]?.role ?? 'member');
		const targetRole = clan.members[targetId].role;

		if ((ROLE_LEVELS[targetRole] ?? 0) >= (ROLE_LEVELS[kickerRole] ?? 0)) {
			return this.errorReply("You cannot kick users with an equal or higher role than yours.");
		}

		try {
			await Clans.updateOne({ _id: clanId }, { $unset: { [`members.${targetId}`]: "" } });
			await UserClans.updateOne({ _id: targetId }, { $unset: { memberOf: 1 } });

			await log(clanId, 'KICK', `${targetId} kicked by ${kickerId}`);

			const clanRoom = Rooms.get(clan.chatRoom);
			if (clanRoom) {
				clanRoom.auth.delete(targetId);
				clanRoom.saveSettings();
				const kickedUser = Users.get(targetId);
				if (kickedUser?.inRooms.has(clan.chatRoom)) kickedUser.leaveRoom(clanRoom);
				clanRoom.add(`|html|<div class="infobox"><center>${esc(targetId)} was kicked from the clan by ${esc(user.name)}.</center></div>`).update();
			}

			const targetUser = Users.getExact(targetId);
			if (targetUser?.connected) {
				targetUser.popup(`|html|<div class="infobox">You have been kicked from the clan <b>${esc(clan.name)}</b> by ${esc(user.name)}.</div>`);
			}

			this.sendReply(`You kicked '${esc(targetId)}' from ${esc(clan.name)}.`);
		} catch (e) {
			this.errorReply("An error occurred while kicking the user. Please try again.");
			Monitor.crashlog(e as Error, "Clan kick command", { clanId, kickerId, targetId });
		}
	},

	async invite(target, room, user) {
		const targetId = toID(target);
		const inviterId = user.id;

		if (!targetId) return this.errorReply("Specify the user you wish to invite.");
		if (targetId === inviterId) return this.errorReply("You cannot invite yourself.");

		const [inviterClanInfo, targetClanInfo] = await Promise.all([
			UserClans.findOne({ _id: inviterId }),
			UserClans.findOne({ _id: targetId }),
		]);

		const clanId = inviterClanInfo?.memberOf;
		if (!clanId) return this.errorReply("You are not currently a member of any clan.");

		if (targetClanInfo?.memberOf) {
			return this.errorReply(`'${esc(targetId)}' is already a member of the clan '${esc(targetClanInfo.memberOf)}'.`);
		}

		const clan = await getClanById(clanId, this);
		if (!clan) return;

		if (!hasMinRole(clan, inviterId, 'officer')) {
			return this.errorReply("You must be at least an Officer to invite users.");
		}
		if (clan.invites.some(invite => invite.userid === targetId)) {
			return this.errorReply(`'${esc(targetId)}' has already been invited to ${esc(clan.name)}.`);
		}

		try {
			await Clans.updateOne(
				{ _id: clanId },
				{ $push: { invites: { userid: targetId, actor: inviterId, timestamp: Date.now() } } }
			);
			await UserClans.upsert({ _id: targetId }, { $addToSet: { invites: clanId } });

			this.sendReply(`You invited '${esc(targetId)}' to join ${esc(clan.name)}.`);

			const targetUser = Users.getExact(targetId);
			if (targetUser?.connected) {
				targetUser.popup(`|html|${generateInvitePopup(clan.name, clanId, user.name)}`);
			} else {
				this.sendReply(`'${esc(targetId)}' is offline and will see the invite when they log in.`);
			}

			const clanRoom = Rooms.get(clan.chatRoom);
			if (clanRoom) {
				clanRoom.add(`|html|<div class="infobox"><center>${esc(user.name)} invited ${esc(targetId)} to the clan.</center></div>`).update();
			}
		} catch (e) {
			this.errorReply("An error occurred while sending the invite. Please try again.");
			Monitor.crashlog(e as Error, "Clan invite command", { clanId, inviterId, targetId });
		}
	},

	async deinvite(target, room, user) {
		const targetId = toID(target);
		const actorId = user.id;

		if (!targetId) return this.errorReply("Specify the user whose invite you wish to revoke.");

		const ctx = await getClanContext(actorId, this);
		if (!ctx) return;

		const { clan, clanId } = ctx;

		if (!hasMinRole(clan, actorId, 'officer')) {
			return this.errorReply("You must be at least an Officer to revoke invites.");
		}
		if (!clan.invites.some(invite => invite.userid === targetId)) {
			return this.errorReply(`'${esc(targetId)}' does not have a pending invite to ${esc(clan.name)}.`);
		}

		try {
			await Clans.updateOne({ _id: clanId }, { $pull: { invites: { userid: targetId } } });
			await UserClans.updateOne({ _id: targetId }, { $pull: { invites: clanId } });

			this.sendReply(`You revoked ${esc(targetId)}'s invite to ${esc(clan.name)}.`);

			const targetUser = Users.getExact(targetId);
			if (targetUser?.connected) {
				targetUser.popup(`|html|<div class="infobox">Your invite to join the clan <b>${esc(clan.name)}</b> has been revoked by ${esc(user.name)}.</div>`);
			}

			const clanRoom = Rooms.get(clan.chatRoom);
			if (clanRoom) {
				clanRoom.add(`|html|<div class="infobox"><center>${esc(user.name)} revoked ${esc(targetId)}'s invite to the clan.</center></div>`).update();
			}
		} catch (e) {
			this.errorReply("An error occurred while revoking the invite. Please try again.");
			Monitor.crashlog(e as Error, "Clan deinvite command", { clanId, actorId, targetId });
		}
	},

	async invites(target, room, user) {
		this.runBroadcast();
		const userId = user.id;
		const userClanInfo = await UserClans.findOne({ _id: userId });
		const memberOfClanId = userClanInfo?.memberOf;

		let output = '';
		let isClanOfficer = false;

		if (memberOfClanId) {
			const clan = await Clans.findOne({ _id: memberOfClanId });
			if (clan) {
				isClanOfficer = hasMinRole(clan, userId, 'officer');

				if (isClanOfficer) {
					const sentInvites = clan.invites;
					if (sentInvites.length) {
						const sentDataRows: string[][] = [];
						const sentHeaderRow = ['User', 'Invited By', 'Date'];
						const sentTitle = `Invites Sent by ${esc(clan.name)}`;

						sentInvites.forEach(invite => {
							sentDataRows.push([
								esc(invite.userid),
								esc(invite.actor),
								to(new Date(invite.timestamp), { date: true, time: true }),
							]);
						});

						output += Table(sentTitle, sentHeaderRow, sentDataRows);
					} else {
						output += `<div class="infobox">${esc(clan.name)} has no pending outgoing invitations.</div>`;
					}
				}
			}
		}

		if (!isClanOfficer) {
			const receivedInvites = userClanInfo?.invites || [];
			if (receivedInvites.length) {
				const invitedClans = await Clans.find({ _id: { $in: receivedInvites } });
				const headerRow = ['Clan', 'ID', 'Action'];
				const dataRows: string[][] = [];
				const title = 'Your Pending Clan Invites';

				invitedClans.forEach(clan => {
					dataRows.push([
						esc(clan.name),
						esc(clan._id),
						`<button class="button" name="send" value="/clan join ${clan._id}">Accept</button>`,
					]);
				});

				if (output) output += '<hr />';
				output += Table(title, headerRow, dataRows);
			} else if (!output) {
				return this.errorReply("You have no pending clan invitations.");
			}
		}

		if (!output) {
			return this.errorReply("You are not currently a member of a clan and have no pending invites.");
		}

		this.sendReply(`|html|${output}`);
	},

	async inviteonly(target, room, user) {
		const value = target.trim().toLowerCase();
		const actorId = user.id;

		let newInviteOnlyStatus: boolean;
		if (['on', 'true', '1'].includes(value)) {
			newInviteOnlyStatus = true;
		} else if (['off', 'false', '0'].includes(value)) {
			newInviteOnlyStatus = false;
		} else if (value === 'toggle') {
			newInviteOnlyStatus = null as any;
		} else {
			return this.errorReply("Usage: /clan inviteonly [on/off/toggle]");
		}

		const ctx = await getClanContext(actorId, this);
		if (!ctx) return;

		const { clan, clanId } = ctx;

		if (!hasMinRole(clan, actorId, 'leader')) {
			return this.errorReply("You must be at least a Leader to change invite-only mode.");
		}

		if (newInviteOnlyStatus === null) newInviteOnlyStatus = !clan.inviteOnly;

		if (clan.inviteOnly === newInviteOnlyStatus) {
			const currentStatus = newInviteOnlyStatus ? 'already invite-only' : 'already open to all users';
			return this.errorReply(`The clan is ${currentStatus}.`);
		}

		try {
			await Clans.updateOne({ _id: clanId }, { $set: { inviteOnly: newInviteOnlyStatus } });

			const clanRoom = Rooms.get(clan.chatRoom);
			if (clanRoom) {
				const statusText = newInviteOnlyStatus ? 'is now invite-only' : 'is now open to all users';
				clanRoom.add(`|html|<div class="infobox"><center>${esc(user.name)} changed the clan setting: The clan ${statusText}.</center></div>`).update();
			}

			const statusText = newInviteOnlyStatus ? 'enabled' : 'disabled';
			this.sendReply(`You have successfully ${statusText} invite-only mode for ${esc(clan.name)}.`);
		} catch (e) {
			this.errorReply("An error occurred while updating invite-only mode. Please try again.");
			Monitor.crashlog(e as Error, "Clan inviteonly command", { clanId, actorId });
		}
	},

	async announce(target, room, user) {
		const message = target.trim();
		if (!message) return this.errorReply("You must specify a message to announce.");

		const actorId = user.id;
		const ctx = await getClanContext(actorId, this);
		if (!ctx) return;

		const { clan } = ctx;

		if (!hasMinRole(clan, actorId, 'leader')) {
			return this.errorReply("You must be at least a Leader to send announcements.");
		}

		const memberIds = Object.keys(clan.members);
		const popupHtml = generateAnnouncementPopup(message, user.name, clan.name);

		let sentTo = 0;
		for (const memberId of memberIds) {
			const memberUser = Users.getExact(memberId);
			if (memberUser?.connected) {
				memberUser.popup(`|html|${popupHtml}`);
				sentTo++;
			}
		}

		this.sendReply(`Announcement sent to ${sentTo} online member(s) of your clan.`);
	},

	// ─── Role Commands ────────────────────────────────────────────────────────

	async promote(target, room, user) {
		const [targetUsername, newRoleRaw] = target.split(',').map(s => s.trim());
		const targetId = toID(targetUsername);
		const actorId = user.id;
		const newRole = toID(newRoleRaw) as ClanRole;

		if (!targetId || !newRole) {
			return this.errorReply("Usage: /clan promote [username], [role] — roles: leader, officer, member");
		}
		if (targetId === actorId) return this.errorReply("You cannot promote yourself.");
		if (!ASSIGNABLE_ROLES.includes(newRole)) {
			return this.errorReply(`Invalid role '${esc(newRole)}'. Valid roles: ${ASSIGNABLE_ROLES.join(', ')}`);
		}
		if (newRole === 'owner') {
			return this.errorReply("Use /clan transfer to transfer ownership.");
		}

		const ctx = await getClanContext(actorId, this);
		if (!ctx) return;

		const { clan, clanId } = ctx;

		if (!hasMinRole(clan, actorId, 'leader')) {
			return this.errorReply("You must be at least a Leader to promote members.");
		}
		if (!assertClanMember(clan, targetId, this)) return;
		if (!assertNotOwner(clan, targetId, this)) return;

		const currentRole = clan.members[targetId].role;
		const actorRole = clan.owner === actorId ? 'owner' : (clan.members[actorId]?.role ?? 'member');
		const currentLevel = ROLE_LEVELS[currentRole] ?? 0;
		const newLevel = ROLE_LEVELS[newRole] ?? 0;
		const actorLevel = ROLE_LEVELS[actorRole] ?? 0;

		if (newLevel >= actorLevel) {
			return this.errorReply("You cannot promote users to a role equal to or higher than your own.");
		}
		if (currentLevel >= actorLevel) {
			return this.errorReply("You cannot promote users with a role equal to or higher than your own.");
		}
		if (newLevel <= currentLevel) {
			return this.errorReply("The new role must be higher than the current role. Use /clan demote to lower a role.");
		}

		try {
			await Clans.updateOne({ _id: clanId }, { $set: { [`members.${targetId}.role`]: newRole } });

			await log(clanId, 'PROMOTE', `${targetId} promoted to ${newRole} by ${actorId}`);

			const clanRoom = Rooms.get(clan.chatRoom);
			if (clanRoom) {
				const newRoomRank = CLAN_ROLE_TO_ROOM_RANK[newRole] || '+';
				clanRoom.auth.set(targetId, newRoomRank);
				clanRoom.saveSettings();
				clanRoom.add(`|html|<div class="infobox"><center>${esc(targetId)} was promoted from ${esc(currentRole)} to ${esc(newRole)} by ${esc(user.name)}.</center></div>`).update();
			}

			const targetUser = Users.getExact(targetId);
			if (targetUser?.connected) {
				targetUser.popup(`|html|<div class="infobox">You have been promoted to <b>${esc(newRole)}</b> in ${esc(clan.name)} by ${esc(user.name)}.</div>`);
			}

			this.sendReply(`You promoted '${esc(targetId)}' from ${esc(currentRole)} to ${esc(newRole)}.`);
		} catch (e) {
			this.errorReply("An error occurred while promoting the user. Please try again.");
			Monitor.crashlog(e as Error, "Clan promote command", { clanId, actorId, targetId });
		}
	},

	async demote(target, room, user) {
		const [targetUsername, newRoleRaw] = target.split(',').map(s => s.trim());
		const targetId = toID(targetUsername);
		const actorId = user.id;
		const newRole = toID(newRoleRaw) as ClanRole;

		if (!targetId || !newRole) {
			return this.errorReply("Usage: /clan demote [username], [role] — roles: leader, officer, member");
		}
		if (targetId === actorId) return this.errorReply("You cannot demote yourself.");
		if (!ASSIGNABLE_ROLES.includes(newRole)) {
			return this.errorReply(`Invalid role '${esc(newRole)}'. Valid roles: ${ASSIGNABLE_ROLES.join(', ')}`);
		}
		if (newRole === 'owner') {
			return this.errorReply("Use /clan transfer to transfer ownership.");
		}

		const ctx = await getClanContext(actorId, this);
		if (!ctx) return;

		const { clan, clanId } = ctx;

		if (!hasMinRole(clan, actorId, 'leader')) {
			return this.errorReply("You must be at least a Leader to demote members.");
		}
		if (!assertClanMember(clan, targetId, this)) return;
		if (!assertNotOwner(clan, targetId, this)) return;

		const currentRole = clan.members[targetId].role;
		const actorRole = clan.owner === actorId ? 'owner' : (clan.members[actorId]?.role ?? 'member');
		const currentLevel = ROLE_LEVELS[currentRole] ?? 0;
		const newLevel = ROLE_LEVELS[newRole] ?? 0;
		const actorLevel = ROLE_LEVELS[actorRole] ?? 0;

		if (newLevel >= actorLevel) {
			return this.errorReply("You cannot demote users to a role equal to or higher than your own.");
		}
		if (currentLevel >= actorLevel) {
			return this.errorReply("You cannot demote users with a role equal to or higher than your own.");
		}
		if (newLevel >= currentLevel) {
			return this.errorReply("The new role must be lower than the current role. Use /clan promote to raise a role.");
		}

		try {
			await Clans.updateOne({ _id: clanId }, { $set: { [`members.${targetId}.role`]: newRole } });

			await log(clanId, 'DEMOTE', `${targetId} demoted to ${newRole} by ${actorId}`);

			const clanRoom = Rooms.get(clan.chatRoom);
			if (clanRoom) {
				const newRoomRank = CLAN_ROLE_TO_ROOM_RANK[newRole] || '+';
				clanRoom.auth.set(targetId, newRoomRank);
				clanRoom.saveSettings();
				clanRoom.add(`|html|<div class="infobox"><center>${esc(targetId)} was demoted from ${esc(currentRole)} to ${esc(newRole)} by ${esc(user.name)}.</center></div>`).update();
			}

			const targetUser = Users.getExact(targetId);
			if (targetUser?.connected) {
				targetUser.popup(`|html|<div class="infobox">You have been demoted to <b>${esc(newRole)}</b> in ${esc(clan.name)} by ${esc(user.name)}.</div>`);
			}

			this.sendReply(`You demoted '${esc(targetId)}' from ${esc(currentRole)} to ${esc(newRole)}.`);
		} catch (e) {
			this.errorReply("An error occurred while demoting the user. Please try again.");
			Monitor.crashlog(e as Error, "Clan demote command", { clanId, actorId, targetId });
		}
	},

	async transfer(target, room, user) {
		const targetId = toID(target);
		const actorId = user.id;

		if (!targetId) return this.errorReply("Specify the user you wish to transfer ownership to.");
		if (targetId === actorId) return this.errorReply("You are already the owner.");

		const ctx = await getClanContext(actorId, this);
		if (!ctx) return;

		const { clan, clanId } = ctx;

		if (clan.owner !== actorId) {
			return this.errorReply("Only the clan owner can transfer ownership.");
		}
		if (!assertClanMember(clan, targetId, this)) return;

		try {
			await Clans.updateOne(
				{ _id: clanId },
				{
					$set: {
						owner: targetId,
						[`members.${targetId}.role`]: 'owner' as ClanRole,
						[`members.${actorId}.role`]: 'leader' as ClanRole,
					},
				}
			);

			await log(clanId, 'PROMOTE', `ownership transferred from ${actorId} to ${targetId}`);

			const clanRoom = Rooms.get(clan.chatRoom);
			if (clanRoom) {
				clanRoom.auth.set(targetId, '#');
				clanRoom.auth.set(actorId, '@');
				clanRoom.saveSettings();
				clanRoom.add(`|html|<div class="infobox"><center>Clan ownership has been transferred from ${esc(user.name)} to ${esc(targetId)}.</center></div>`).update();
			}

			const targetUser = Users.getExact(targetId);
			if (targetUser?.connected) {
				targetUser.popup(`|html|<div class="infobox">You are now the owner of <b>${esc(clan.name)}</b>! Ownership was transferred to you by ${esc(user.name)}.</div>`);
			}

			this.sendReply(`You transferred ownership of ${esc(clan.name)} to '${esc(targetId)}'. You are now a Leader.`);
		} catch (e) {
			this.errorReply("An error occurred while transferring ownership. Please try again.");
			Monitor.crashlog(e as Error, "Clan transfer command", { clanId, actorId, targetId });
		}
	},
};
