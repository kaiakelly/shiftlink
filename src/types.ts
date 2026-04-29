export type ID = string;

export type UserRole = 'user' | 'admin';

export type BoardType = 'swap' | 'square';

export interface AppConfig {
  vipPriceMop: number;
  globalAnnouncement: string;
  bannedWords: string[];
}

export interface User {
  id: ID;
  username: string;
  password: string;
  displayName: string;
  role: UserRole;
  companyId: ID;
  positionId: ID;
  skillIds: ID[];
  isVip: boolean;
  createdAt: string;
}

export interface Company {
  id: ID;
  name: string;
  createdAt: string;
}

export interface Position {
  id: ID;
  companyId: ID;
  name: string;
  createdAt: string;
}

export interface Skill {
  id: ID;
  positionId: ID;
  name: string;
  createdAt: string;
}

export interface ShiftType {
  id: ID;
  name: string;
  shortName: string;
  colorTag: string;
  createdAt: string;
}

export interface Shift {
  id: ID;
  userId: ID;
  date: string;
  shiftTypeId: ID;
  isOvernight: boolean;
  emoji?: string;
  note?: string;
  updatedAt: string;
}

export interface Post {
  id: ID;
  boardType: BoardType;
  authorId: ID;
  companyId: ID;
  title: string;
  content: string;
  skillIds: ID[];
  createdAt: string;
  updatedAt: string;
}

export type MessageType = 'text' | 'image' | 'system' | 'proposal';

export interface Thread {
  id: ID;
  participantIds: [ID, ID];
  lastMessageAt: string;
  createdAt: string;
}

export interface Message {
  id: ID;
  threadId: ID;
  senderId: ID;
  type: MessageType;
  text?: string;
  imageUri?: string;
  proposal?: SwapProposal;
  createdAt: string;
}

export interface SwapProposal {
  fromUserId: ID;
  toUserId: ID;
  fromDate: string;
  toDate: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export type EntityState<T> = {
  byId: Record<ID, T>;
  allIds: ID[];
};

