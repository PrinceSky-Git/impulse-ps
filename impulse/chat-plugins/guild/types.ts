export interface GuildMember {
  id: string;
  username: string;
  // Hierarchical order: Master > Champion > Elite > Veteran > Trainer > Rookie
  role: 'Master' | 'Champion' | 'Elite' | 'Veteran' | 'Trainer' | 'Rookie';
  joinedAt: Date;
  lastActiveAt: Date;
  points: number;
  totalPoints: number;
}

export interface InvitedMember {
  userId: string;
  invitedAt: Date;
  expiresAt: Date;
  invitedBy: string;
  status: 'pending' | 'rejected' | 'revoked';
}

export type JoinPolicy = 'open' | 'invite-only';

export type Visibility = 'public' | 'private';

export interface Guild {
  id: string;
  ownerId: string;
  name: string;
  chatroom: string;
  description: string;
  icon: string | null;
  visibility: Visibility;
  joinPolicy: JoinPolicy;
  
  points: number;
  memberLimit: number;
  memberCount: number;
  members: GuildMember[];
  
  invited: InvitedMember[];
  
  createdAt: Date;
  updatedAt: Date;
}
