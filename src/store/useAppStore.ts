import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  AppConfig,
  AppPreferences,
  Company,
  EntityState,
  Message,
  MonthSave,
  Position,
  Post,
  Shift,
  ShiftType,
  Skill,
  Thread,
  User,
} from '@/src/types';
import { buildSeedData } from '@/src/store/seed';
import { createId } from '@/src/utils/id';
import { sanitizeBannedWords } from '@/src/utils/text';
import { nowIso } from '@/src/utils/time';

export type Session = {
  userId: string | null;
  isGuest: boolean;
};

export type AppEntities = {
  users: EntityState<User>;
  companies: EntityState<Company>;
  positions: EntityState<Position>;
  skills: EntityState<Skill>;
  shiftTypes: EntityState<ShiftType>;
  shifts: EntityState<Shift>;
  monthSaves: EntityState<MonthSave>;
  posts: EntityState<Post>;
  threads: EntityState<Thread>;
  messages: EntityState<Message>;
};

export type AppMeta = {
  schemaVersion: number;
  hasSeeded: boolean;
};

export type AppStoreState = {
  meta: AppMeta;
  session: Session;
  appConfig: AppConfig;
  preferences: AppPreferences;
  entities: AppEntities;
};

export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; error: 'USER_NOT_FOUND' | 'INVALID_PASSWORD' };

export type RegisterInput = {
  username: string;
  password: string;
  displayName: string;
};

export type CompleteOnboardingInput = {
  companyId: string;
  positionId: string;
  skillIds: string[];
};

export type CreatePostInput = {
  boardType: 'swap' | 'square';
  title: string;
  content: string;
  skillIds: string[];
};

export type SetShiftInput = {
  date: string;
  shiftTypeId: string;
};

export type SetShiftEmojiInput = {
  date: string;
  emoji: string | null;
};

export type UpdateShiftTypeInput = {
  shiftTypeId: string;
  name: string;
  shortName: string;
};

export type SaveMonthInput = {
  month: string;
};

export type SetFontScaleInput = {
  fontScale: number;
};

export type EcaiAddPersonaInput = {
  name: string;
  instruction: string;
  emoji: 'none' | 'light' | 'more';
  bannedWords: string[];
};

export type EcaiRemovePersonaInput = {
  personaId: string;
};

export type ClearShiftInput = {
  date: string;
};

export type StartThreadInput = {
  peerUserId: string;
};

export type SendMessageInput = {
  threadId: string;
  text: string;
};

export type SendImageMessageInput = {
  threadId: string;
  imageUri: string;
};

export type SendSwapProposalInput = {
  threadId: string;
  fromDate: string;
  toDate: string;
};

export type RespondSwapProposalInput = {
  messageId: string;
  status: 'accepted' | 'rejected';
};

export type ApplySwapProposalInput = {
  messageId: string;
};

export type AdminCreateCompanyInput = {
  name: string;
};

export type AdminUpdateCompanyInput = {
  companyId: string;
  name: string;
};

export type AdminDeleteCompanyInput = {
  companyId: string;
};

export type AdminCreatePositionInput = {
  companyId: string;
  name: string;
};

export type AdminUpdatePositionInput = {
  positionId: string;
  companyId: string;
  name: string;
};

export type AdminDeletePositionInput = {
  positionId: string;
};

export type AdminCreateSkillInput = {
  positionId: string;
  name: string;
};

export type AdminUpdateSkillInput = {
  skillId: string;
  positionId: string;
  name: string;
};

export type AdminDeleteSkillInput = {
  skillId: string;
};

export type AdminCreateShiftTypeInput = {
  name: string;
  shortName: string;
  colorTag: string;
};

export type AdminUpdateShiftTypeInput = {
  shiftTypeId: string;
  name: string;
  shortName: string;
  colorTag: string;
};

export type AdminDeleteShiftTypeInput = {
  shiftTypeId: string;
};

export type AdminUpdateUserInput = {
  userId: string;
  displayName?: string;
  isVip?: boolean;
  isMuted?: boolean;
  role?: 'user' | 'admin';
};

export type AdminUpdateConfigInput = {
  vipPriceMop: number;
  globalAnnouncement: string;
  bannedWords: string[];
};

export type AppStoreActions = {
  bootstrap: () => Promise<void>;
  login: (username: string, password: string) => AuthResult;
  logout: () => void;
  register: (input: RegisterInput) => { ok: true; userId: string } | { ok: false; error: 'USERNAME_TAKEN' };
  completeOnboarding: (input: CompleteOnboardingInput) => void;
  updateMySkills: (skillIds: string[]) => void;
  createPost: (input: CreatePostInput) => { ok: true; postId: string } | { ok: false; error: 'AUTH_REQUIRED' };
  setShift: (input: SetShiftInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' };
  setShiftEmoji: (input: SetShiftEmojiInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' | 'VIP_REQUIRED' };
  clearShift: (input: ClearShiftInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' };
  updateShiftType: (input: UpdateShiftTypeInput) => void;
  saveMonth: (input: SaveMonthInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' };
  setFontScale: (input: SetFontScaleInput) => void;
  ecaiAddPersona: (input: EcaiAddPersonaInput) => { ok: true; personaId: string };
  ecaiRemovePersona: (input: EcaiRemovePersonaInput) => { ok: true };
  startThread: (input: StartThreadInput) => { ok: true; threadId: string } | { ok: false; error: 'AUTH_REQUIRED' | 'USER_NOT_FOUND' };
  sendMessage: (input: SendMessageInput) => { ok: true; messageId: string } | { ok: false; error: 'AUTH_REQUIRED' | 'THREAD_NOT_FOUND' };
  sendImageMessage: (input: SendImageMessageInput) => { ok: true; messageId: string } | { ok: false; error: 'AUTH_REQUIRED' | 'THREAD_NOT_FOUND' };
  sendSwapProposal: (input: SendSwapProposalInput) => { ok: true; messageId: string } | { ok: false; error: 'AUTH_REQUIRED' | 'THREAD_NOT_FOUND' };
  respondSwapProposal: (input: RespondSwapProposalInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' | 'MESSAGE_NOT_FOUND' };
  applySwapProposal: (input: ApplySwapProposalInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' | 'MESSAGE_NOT_FOUND' };
  adminCreateCompany: (input: AdminCreateCompanyInput) => { ok: true; companyId: string } | { ok: false; error: 'AUTH_REQUIRED' };
  adminUpdateCompany: (input: AdminUpdateCompanyInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' | 'NOT_FOUND' };
  adminDeleteCompany: (input: AdminDeleteCompanyInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' | 'NOT_FOUND' | 'IN_USE' };
  adminCreatePosition: (input: AdminCreatePositionInput) => { ok: true; positionId: string } | { ok: false; error: 'AUTH_REQUIRED' | 'NOT_FOUND' };
  adminUpdatePosition: (input: AdminUpdatePositionInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' | 'NOT_FOUND' };
  adminDeletePosition: (input: AdminDeletePositionInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' | 'NOT_FOUND' | 'IN_USE' };
  adminCreateSkill: (input: AdminCreateSkillInput) => { ok: true; skillId: string } | { ok: false; error: 'AUTH_REQUIRED' | 'NOT_FOUND' };
  adminUpdateSkill: (input: AdminUpdateSkillInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' | 'NOT_FOUND' };
  adminDeleteSkill: (input: AdminDeleteSkillInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' | 'NOT_FOUND' | 'IN_USE' };
  adminCreateShiftType: (input: AdminCreateShiftTypeInput) => { ok: true; shiftTypeId: string } | { ok: false; error: 'AUTH_REQUIRED' };
  adminUpdateShiftType: (input: AdminUpdateShiftTypeInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' | 'NOT_FOUND' };
  adminDeleteShiftType: (input: AdminDeleteShiftTypeInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' | 'NOT_FOUND' | 'IN_USE' };
  adminUpdateUser: (input: AdminUpdateUserInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' | 'NOT_FOUND' };
  adminUpdateConfig: (input: AdminUpdateConfigInput) => { ok: true } | { ok: false; error: 'AUTH_REQUIRED' };
  devResetNonAdmin: () => void;
};

export type AppStore = AppStoreState & { actions: AppStoreActions };

const STORAGE_NAME = 'shiftlink_store_v1';
const SCHEMA_VERSION = 8;

function emptyEntityState<T>(): EntityState<T> {
  return { byId: {}, allIds: [] };
}

function buildInitialState(): AppStoreState {
  const seed = buildSeedData();
  return {
    meta: { schemaVersion: SCHEMA_VERSION, hasSeeded: false },
    session: { userId: null, isGuest: true },
    appConfig: seed.appConfig,
    preferences: { fontScale: 1, ecai: { customPersonas: [] } },
    entities: {
      users: emptyEntityState<User>(),
      companies: emptyEntityState<Company>(),
      positions: emptyEntityState<Position>(),
      skills: emptyEntityState<Skill>(),
      shiftTypes: emptyEntityState<ShiftType>(),
      shifts: emptyEntityState<Shift>(),
      monthSaves: emptyEntityState<MonthSave>(),
      posts: emptyEntityState<Post>(),
      threads: emptyEntityState<Thread>(),
      messages: emptyEntityState<Message>(),
    },
  };
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),
      actions: {
        bootstrap: async () => {
          const state = get();
          if (state.meta.hasSeeded) return;
          if (state.entities.companies.allIds.length > 0) {
            set({ meta: { ...state.meta, hasSeeded: true } });
            return;
          }

          const seed = buildSeedData();
          set({
            meta: { schemaVersion: SCHEMA_VERSION, hasSeeded: true },
            appConfig: seed.appConfig,
            entities: {
              users: seed.users,
              companies: seed.companies,
              positions: seed.positions,
              skills: seed.skills,
              shiftTypes: seed.shiftTypes,
              shifts: seed.shifts,
              monthSaves: seed.monthSaves,
              posts: seed.posts,
              threads: seed.threads,
              messages: seed.messages,
            },
          });
        },

        login: (username, password) => {
          const state = get();
          const user = state.entities.users.allIds
            .map((id) => state.entities.users.byId[id])
            .find((u) => u?.username.toLowerCase() === username.toLowerCase());

          if (!user) return { ok: false, error: 'USER_NOT_FOUND' };
          if (user.password !== password) return { ok: false, error: 'INVALID_PASSWORD' };

          set({ session: { userId: user.id, isGuest: false } });
          return { ok: true, userId: user.id };
        },

        logout: () => {
          set({ session: { userId: null, isGuest: true } });
        },

        register: (input) => {
          const state = get();
          const existing = state.entities.users.allIds
            .map((id) => state.entities.users.byId[id])
            .find((u) => u?.username.toLowerCase() === input.username.toLowerCase());
          if (existing) return { ok: false, error: 'USERNAME_TAKEN' } as const;

          const userId = createId('user');
          const createdAt = nowIso();
          const user: User = {
            id: userId,
            username: input.username,
            password: input.password,
            displayName: input.displayName,
            role: 'user',
            companyId: '',
            positionId: '',
            skillIds: [],
            isVip: false,
            isMuted: false,
            createdAt,
          };

          set({
            session: { userId, isGuest: false },
            entities: {
              ...state.entities,
              users: {
                byId: { ...state.entities.users.byId, [userId]: user },
                allIds: [userId, ...state.entities.users.allIds],
              },
            },
          });

          return { ok: true, userId } as const;
        },

        completeOnboarding: (input) => {
          const state = get();
          const userId = state.session.userId;
          if (!userId) return;
          const user = state.entities.users.byId[userId];
          if (!user) return;
          if (user.role === 'admin') return;

          const canSetCompany = !user.companyId;
          const canSetPosition = !user.positionId;
          if (!canSetCompany || !canSetPosition) return;

          set({
            entities: {
              ...state.entities,
              users: {
                ...state.entities.users,
                byId: {
                  ...state.entities.users.byId,
                  [userId]: {
                    ...user,
                    companyId: input.companyId,
                    positionId: input.positionId,
                    skillIds: input.skillIds,
                  },
                },
              },
            },
          });
        },

        updateMySkills: (skillIds) => {
          const state = get();
          const userId = state.session.userId;
          if (!userId) return;
          const user = state.entities.users.byId[userId];
          if (!user) return;

          set({
            entities: {
              ...state.entities,
              users: {
                ...state.entities.users,
                byId: {
                  ...state.entities.users.byId,
                  [userId]: { ...user, skillIds },
                },
              },
            },
          });
        },

        createPost: (input) => {
          const state = get();
          const userId = state.session.userId;
          if (!userId) return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const user = state.entities.users.byId[userId];
          if (!user) return { ok: false, error: 'AUTH_REQUIRED' } as const;
          if (user.isMuted) return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const now = nowIso();
          const postId = createId('post');
          const title = sanitizeBannedWords(input.title, state.appConfig.bannedWords);
          const content = sanitizeBannedWords(input.content, state.appConfig.bannedWords);

          const post: Post = {
            id: postId,
            boardType: input.boardType,
            authorId: userId,
            companyId: user.companyId,
            title,
            content,
            skillIds: input.skillIds,
            createdAt: now,
            updatedAt: now,
          };

          set({
            entities: {
              ...state.entities,
              posts: {
                byId: { ...state.entities.posts.byId, [postId]: post },
                allIds: [postId, ...state.entities.posts.allIds],
              },
            },
          });

          return { ok: true, postId } as const;
        },

        setShift: (input) => {
          const state = get();
          const userId = state.session.userId;
          if (!userId) return { ok: false, error: 'AUTH_REQUIRED' } as const;
          const user = state.entities.users.byId[userId];
          if (!user) return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const shiftId = `shift_${userId}_${input.date}`;
          const existing = state.entities.shifts.byId[shiftId];
          const now = nowIso();

          const shift: Shift = {
            id: shiftId,
            userId,
            date: input.date,
            shiftTypeId: input.shiftTypeId,
            isOvernight: false,
            emoji: existing?.emoji,
            note: existing?.note,
            updatedAt: now,
          };

          const hasId = state.entities.shifts.allIds.includes(shiftId);

          set({
            entities: {
              ...state.entities,
              shifts: {
                byId: { ...state.entities.shifts.byId, [shiftId]: shift },
                allIds: hasId ? state.entities.shifts.allIds : [shiftId, ...state.entities.shifts.allIds],
              },
            },
          });

          return { ok: true } as const;
        },

        setShiftEmoji: (input) => {
          const state = get();
          const userId = state.session.userId;
          if (!userId) return { ok: false, error: 'AUTH_REQUIRED' } as const;
          const user = state.entities.users.byId[userId];
          if (!user) return { ok: false, error: 'AUTH_REQUIRED' } as const;
          if (!user.isVip) return { ok: false, error: 'VIP_REQUIRED' } as const;

          const shiftId = `shift_${userId}_${input.date}`;
          const existing = state.entities.shifts.byId[shiftId];
          const now = nowIso();
          const shiftTypeId = existing?.shiftTypeId ?? 'shift_none';

          const shift: Shift = {
            id: shiftId,
            userId,
            date: input.date,
            shiftTypeId,
            isOvernight: false,
            emoji: input.emoji ?? undefined,
            note: existing?.note,
            updatedAt: now,
          };

          const hasId = state.entities.shifts.allIds.includes(shiftId);

          set({
            entities: {
              ...state.entities,
              shifts: {
                byId: { ...state.entities.shifts.byId, [shiftId]: shift },
                allIds: hasId ? state.entities.shifts.allIds : [shiftId, ...state.entities.shifts.allIds],
              },
            },
          });

          return { ok: true } as const;
        },

        clearShift: (input) => {
          const state = get();
          const userId = state.session.userId;
          if (!userId) return { ok: false, error: 'AUTH_REQUIRED' } as const;
          const user = state.entities.users.byId[userId];
          if (!user) return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const shiftId = `shift_${userId}_${input.date}`;
          const existing = state.entities.shifts.byId[shiftId];
          if (!existing) return { ok: true } as const;

          const now = nowIso();
          const shift: Shift = {
            ...existing,
            shiftTypeId: 'shift_none',
            isOvernight: false,
            emoji: undefined,
            note: undefined,
            updatedAt: now,
          };

          set({
            entities: {
              ...state.entities,
              shifts: {
                ...state.entities.shifts,
                byId: { ...state.entities.shifts.byId, [shiftId]: shift },
              },
            },
          });

          return { ok: true } as const;
        },

        startThread: (input) => {
          const state = get();
          const userId = state.session.userId;
          if (!userId) return { ok: false, error: 'AUTH_REQUIRED' } as const;
          if (input.peerUserId === userId) return { ok: false, error: 'USER_NOT_FOUND' } as const;
          const peer = state.entities.users.byId[input.peerUserId];
          if (!peer) return { ok: false, error: 'USER_NOT_FOUND' } as const;

          const existing = state.entities.threads.allIds
            .map((id) => state.entities.threads.byId[id])
            .find((t) => {
              if (!t) return false;
              const [a, b] = t.participantIds;
              return (a === userId && b === input.peerUserId) || (a === input.peerUserId && b === userId);
            });

          if (existing) return { ok: true, threadId: existing.id } as const;

          const now = nowIso();
          const threadId = createId('thread');
          const participantIds = (userId < input.peerUserId ? [userId, input.peerUserId] : [input.peerUserId, userId]) as [string, string];
          const thread: Thread = { id: threadId, participantIds, lastMessageAt: now, createdAt: now };

          set({
            entities: {
              ...state.entities,
              threads: {
                byId: { ...state.entities.threads.byId, [threadId]: thread },
                allIds: [threadId, ...state.entities.threads.allIds],
              },
            },
          });

          return { ok: true, threadId } as const;
        },

        sendMessage: (input) => {
          const state = get();
          const userId = state.session.userId;
          if (!userId) return { ok: false, error: 'AUTH_REQUIRED' } as const;
          const thread = state.entities.threads.byId[input.threadId];
          if (!thread) return { ok: false, error: 'THREAD_NOT_FOUND' } as const;
          if (!thread.participantIds.includes(userId)) return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const now = nowIso();
          const messageId = createId('msg');
          const text = sanitizeBannedWords(input.text, state.appConfig.bannedWords);
          const message: Message = { id: messageId, threadId: input.threadId, senderId: userId, type: 'text', text, createdAt: now };

          set({
            entities: {
              ...state.entities,
              messages: {
                byId: { ...state.entities.messages.byId, [messageId]: message },
                allIds: [...state.entities.messages.allIds, messageId],
              },
              threads: {
                ...state.entities.threads,
                byId: {
                  ...state.entities.threads.byId,
                  [thread.id]: { ...thread, lastMessageAt: now },
                },
              },
            },
          });

          return { ok: true, messageId } as const;
        },

        sendImageMessage: (input) => {
          const state = get();
          const userId = state.session.userId;
          if (!userId) return { ok: false, error: 'AUTH_REQUIRED' } as const;
          const thread = state.entities.threads.byId[input.threadId];
          if (!thread) return { ok: false, error: 'THREAD_NOT_FOUND' } as const;
          if (!thread.participantIds.includes(userId)) return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const now = nowIso();
          const messageId = createId('msg');
          const message: Message = { id: messageId, threadId: input.threadId, senderId: userId, type: 'image', imageUri: input.imageUri, createdAt: now };

          set({
            entities: {
              ...state.entities,
              messages: {
                byId: { ...state.entities.messages.byId, [messageId]: message },
                allIds: [...state.entities.messages.allIds, messageId],
              },
              threads: {
                ...state.entities.threads,
                byId: {
                  ...state.entities.threads.byId,
                  [thread.id]: { ...thread, lastMessageAt: now },
                },
              },
            },
          });

          return { ok: true, messageId } as const;
        },

        sendSwapProposal: (input) => {
          const state = get();
          const userId = state.session.userId;
          if (!userId) return { ok: false, error: 'AUTH_REQUIRED' } as const;
          const thread = state.entities.threads.byId[input.threadId];
          if (!thread) return { ok: false, error: 'THREAD_NOT_FOUND' } as const;
          if (!thread.participantIds.includes(userId)) return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const [a, b] = thread.participantIds;
          const peerId = a === userId ? b : a;
          const now = nowIso();
          const messageId = createId('msg');

          const message: Message = {
            id: messageId,
            threadId: input.threadId,
            senderId: userId,
            type: 'proposal',
            proposal: {
              fromUserId: userId,
              toUserId: peerId,
              fromDate: input.fromDate,
              toDate: input.toDate,
              status: 'pending',
            },
            createdAt: now,
          };

          set({
            entities: {
              ...state.entities,
              messages: {
                byId: { ...state.entities.messages.byId, [messageId]: message },
                allIds: [...state.entities.messages.allIds, messageId],
              },
              threads: {
                ...state.entities.threads,
                byId: {
                  ...state.entities.threads.byId,
                  [thread.id]: { ...thread, lastMessageAt: now },
                },
              },
            },
          });

          return { ok: true, messageId } as const;
        },

        respondSwapProposal: (input) => {
          const state = get();
          const userId = state.session.userId;
          if (!userId) return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const message = state.entities.messages.byId[input.messageId];
          if (!message || message.type !== 'proposal' || !message.proposal) return { ok: false, error: 'MESSAGE_NOT_FOUND' } as const;
          if (message.proposal.toUserId !== userId) return { ok: false, error: 'AUTH_REQUIRED' } as const;
          if (message.proposal.status !== 'pending') return { ok: true } as const;

          const updated: Message = {
            ...message,
            proposal: { ...message.proposal, status: input.status },
          };

          const now = nowIso();
          const systemId = createId('msg');
          const systemText =
            input.status === 'accepted'
              ? `已同意換更：${message.proposal.fromDate} ⇄ ${message.proposal.toDate}`
              : `已拒絕換更：${message.proposal.fromDate} ⇄ ${message.proposal.toDate}`;

          const systemMsg: Message = {
            id: systemId,
            threadId: message.threadId,
            senderId: userId,
            type: 'system',
            text: systemText,
            createdAt: now,
          };

          const thread = state.entities.threads.byId[message.threadId];

          set({
            entities: {
              ...state.entities,
              messages: {
                byId: { ...state.entities.messages.byId, [updated.id]: updated, [systemId]: systemMsg },
                allIds: [...state.entities.messages.allIds, systemId],
              },
              threads: thread
                ? {
                    ...state.entities.threads,
                    byId: { ...state.entities.threads.byId, [thread.id]: { ...thread, lastMessageAt: now } },
                  }
                : state.entities.threads,
            },
          });

          return { ok: true } as const;
        },

        applySwapProposal: (input) => {
          const state = get();
          const userId = state.session.userId;
          if (!userId) return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const message = state.entities.messages.byId[input.messageId];
          if (!message || message.type !== 'proposal' || !message.proposal) return { ok: false, error: 'MESSAGE_NOT_FOUND' } as const;
          const proposal = message.proposal;
          if (proposal.status !== 'accepted') return { ok: true } as const;
          if (proposal.appliedAt) return { ok: true } as const;

          const thread = state.entities.threads.byId[message.threadId];
          if (!thread || !thread.participantIds.includes(userId)) return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const now = nowIso();
          let shiftsById = state.entities.shifts.byId;
          let shiftsAllIds = state.entities.shifts.allIds;

          const getShiftTypeId = (uid: string, date: string) => {
            const id = `shift_${uid}_${date}`;
            return shiftsById[id]?.shiftTypeId ?? 'shift_none';
          };

          const upsertShiftType = (uid: string, date: string, shiftTypeId: string) => {
            const id = `shift_${uid}_${date}`;
            const existing = shiftsById[id];
            const shift: Shift = {
              id,
              userId: uid,
              date,
              shiftTypeId,
              isOvernight: false,
              emoji: undefined,
              note: undefined,
              updatedAt: now,
            };
            shiftsById = { ...shiftsById, [id]: existing ? { ...existing, ...shift } : shift };
            if (!shiftsAllIds.includes(id)) shiftsAllIds = [id, ...shiftsAllIds];
          };

          const aShiftType = getShiftTypeId(proposal.fromUserId, proposal.fromDate);
          const bShiftType = getShiftTypeId(proposal.toUserId, proposal.toDate);

          upsertShiftType(proposal.fromUserId, proposal.fromDate, 'shift_none');
          upsertShiftType(proposal.toUserId, proposal.toDate, 'shift_none');
          upsertShiftType(proposal.fromUserId, proposal.toDate, bShiftType);
          upsertShiftType(proposal.toUserId, proposal.fromDate, aShiftType);

          const nextShifts = { byId: shiftsById, allIds: shiftsAllIds };

          const updatedMessage: Message = {
            ...message,
            proposal: { ...proposal, appliedAt: now },
          };

          const systemId = createId('msg');
          const systemMsg: Message = {
            id: systemId,
            threadId: message.threadId,
            senderId: userId,
            type: 'system',
            text: `已更新日曆：${proposal.fromDate} ⇄ ${proposal.toDate}`,
            createdAt: now,
          };

          set({
            entities: {
              ...state.entities,
              shifts: nextShifts,
              messages: {
                byId: { ...state.entities.messages.byId, [updatedMessage.id]: updatedMessage, [systemId]: systemMsg },
                allIds: [...state.entities.messages.allIds, systemId],
              },
              threads: thread
                ? {
                    ...state.entities.threads,
                    byId: { ...state.entities.threads.byId, [thread.id]: { ...thread, lastMessageAt: now } },
                  }
                : state.entities.threads,
            },
          });

          return { ok: true } as const;
        },

        updateShiftType: (input) => {
          const state = get();
          const existing = state.entities.shiftTypes.byId[input.shiftTypeId];
          if (!existing) return;
          if (existing.id === 'shift_none') return;

          set({
            entities: {
              ...state.entities,
              shiftTypes: {
                ...state.entities.shiftTypes,
                byId: {
                  ...state.entities.shiftTypes.byId,
                  [input.shiftTypeId]: { ...existing, name: input.name, shortName: input.shortName },
                },
              },
            },
          });
        },

        saveMonth: (input) => {
          const state = get();
          const userId = state.session.userId;
          if (!userId) return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const id = `month_${userId}_${input.month}`;
          const savedAt = nowIso();
          const monthSave: MonthSave = { id, userId, month: input.month, savedAt };
          const hasId = state.entities.monthSaves.allIds.includes(id);

          set({
            entities: {
              ...state.entities,
              monthSaves: {
                byId: { ...state.entities.monthSaves.byId, [id]: monthSave },
                allIds: hasId ? state.entities.monthSaves.allIds : [id, ...state.entities.monthSaves.allIds],
              },
            },
          });

          return { ok: true } as const;
        },

        setFontScale: (input) => {
          const clamped = Math.max(0.85, Math.min(1.25, input.fontScale));
          const state = get();
          set({ preferences: { ...state.preferences, fontScale: clamped } });
        },

        ecaiAddPersona: (input) => {
          const state = get();
          const name = input.name.trim() || '自建人設';
          const instruction = input.instruction.trim() || '用自然清晰的語氣重寫，保留原意。';
          const personaId = createId('ecai_persona');
          const bannedWords = input.bannedWords.map((x) => x.trim()).filter(Boolean);

          set({
            preferences: {
              ...state.preferences,
              ecai: {
                customPersonas: [
                  ...((state.preferences as any).ecai?.customPersonas ?? []),
                  { id: personaId, name, instruction, emoji: input.emoji, bannedWords },
                ],
              },
            },
          });

          return { ok: true, personaId } as const;
        },

        ecaiRemovePersona: (input) => {
          const state = get();
          const existing = ((state.preferences as any).ecai?.customPersonas ?? []) as any[];
          const next = existing.filter((p) => p?.id !== input.personaId);
          set({ preferences: { ...state.preferences, ecai: { customPersonas: next } } });
          return { ok: true } as const;
        },

        adminCreateCompany: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const name = input.name.trim();
          if (!name) return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const companyId = createId('company');
          const createdAt = nowIso();
          const company: Company = { id: companyId, name, createdAt };

          set({
            entities: {
              ...state.entities,
              companies: {
                byId: { ...state.entities.companies.byId, [companyId]: company },
                allIds: [companyId, ...state.entities.companies.allIds],
              },
            },
          });

          return { ok: true, companyId } as const;
        },

        adminUpdateCompany: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const existing = state.entities.companies.byId[input.companyId];
          if (!existing) return { ok: false, error: 'NOT_FOUND' } as const;

          const name = input.name.trim();
          if (!name) return { ok: false, error: 'NOT_FOUND' } as const;

          set({
            entities: {
              ...state.entities,
              companies: {
                ...state.entities.companies,
                byId: { ...state.entities.companies.byId, [input.companyId]: { ...existing, name } },
              },
            },
          });

          return { ok: true } as const;
        },

        adminDeleteCompany: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const existing = state.entities.companies.byId[input.companyId];
          if (!existing) return { ok: false, error: 'NOT_FOUND' } as const;

          const hasPositions = state.entities.positions.allIds.some((id) => state.entities.positions.byId[id]?.companyId === input.companyId);
          const hasUsers = state.entities.users.allIds.some((id) => state.entities.users.byId[id]?.companyId === input.companyId);
          if (hasPositions || hasUsers) return { ok: false, error: 'IN_USE' } as const;

          const nextById = { ...state.entities.companies.byId };
          delete nextById[input.companyId];

          set({
            entities: {
              ...state.entities,
              companies: {
                byId: nextById,
                allIds: state.entities.companies.allIds.filter((id) => id !== input.companyId),
              },
            },
          });

          return { ok: true } as const;
        },

        adminCreatePosition: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          if (!state.entities.companies.byId[input.companyId]) return { ok: false, error: 'NOT_FOUND' } as const;
          const name = input.name.trim();
          if (!name) return { ok: false, error: 'NOT_FOUND' } as const;

          const positionId = createId('pos');
          const createdAt = nowIso();
          const position: Position = { id: positionId, companyId: input.companyId, name, createdAt };

          set({
            entities: {
              ...state.entities,
              positions: {
                byId: { ...state.entities.positions.byId, [positionId]: position },
                allIds: [positionId, ...state.entities.positions.allIds],
              },
            },
          });

          return { ok: true, positionId } as const;
        },

        adminUpdatePosition: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const existing = state.entities.positions.byId[input.positionId];
          if (!existing) return { ok: false, error: 'NOT_FOUND' } as const;
          if (!state.entities.companies.byId[input.companyId]) return { ok: false, error: 'NOT_FOUND' } as const;

          const name = input.name.trim();
          if (!name) return { ok: false, error: 'NOT_FOUND' } as const;

          set({
            entities: {
              ...state.entities,
              positions: {
                ...state.entities.positions,
                byId: {
                  ...state.entities.positions.byId,
                  [input.positionId]: { ...existing, companyId: input.companyId, name },
                },
              },
            },
          });

          return { ok: true } as const;
        },

        adminDeletePosition: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const existing = state.entities.positions.byId[input.positionId];
          if (!existing) return { ok: false, error: 'NOT_FOUND' } as const;

          const hasSkills = state.entities.skills.allIds.some((id) => state.entities.skills.byId[id]?.positionId === input.positionId);
          const hasUsers = state.entities.users.allIds.some((id) => state.entities.users.byId[id]?.positionId === input.positionId);
          if (hasSkills || hasUsers) return { ok: false, error: 'IN_USE' } as const;

          const nextById = { ...state.entities.positions.byId };
          delete nextById[input.positionId];

          set({
            entities: {
              ...state.entities,
              positions: {
                byId: nextById,
                allIds: state.entities.positions.allIds.filter((id) => id !== input.positionId),
              },
            },
          });

          return { ok: true } as const;
        },

        adminCreateSkill: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          if (!state.entities.positions.byId[input.positionId]) return { ok: false, error: 'NOT_FOUND' } as const;
          const name = input.name.trim();
          if (!name) return { ok: false, error: 'NOT_FOUND' } as const;

          const skillId = createId('skill');
          const createdAt = nowIso();
          const skill: Skill = { id: skillId, positionId: input.positionId, name, createdAt };

          set({
            entities: {
              ...state.entities,
              skills: {
                byId: { ...state.entities.skills.byId, [skillId]: skill },
                allIds: [skillId, ...state.entities.skills.allIds],
              },
            },
          });

          return { ok: true, skillId } as const;
        },

        adminUpdateSkill: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const existing = state.entities.skills.byId[input.skillId];
          if (!existing) return { ok: false, error: 'NOT_FOUND' } as const;
          if (!state.entities.positions.byId[input.positionId]) return { ok: false, error: 'NOT_FOUND' } as const;

          const name = input.name.trim();
          if (!name) return { ok: false, error: 'NOT_FOUND' } as const;

          set({
            entities: {
              ...state.entities,
              skills: {
                ...state.entities.skills,
                byId: {
                  ...state.entities.skills.byId,
                  [input.skillId]: { ...existing, positionId: input.positionId, name },
                },
              },
            },
          });

          return { ok: true } as const;
        },

        adminDeleteSkill: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const existing = state.entities.skills.byId[input.skillId];
          if (!existing) return { ok: false, error: 'NOT_FOUND' } as const;

          const hasUsers = state.entities.users.allIds.some((id) => state.entities.users.byId[id]?.skillIds.includes(input.skillId));
          const hasPosts = state.entities.posts.allIds.some((id) => state.entities.posts.byId[id]?.skillIds.includes(input.skillId));
          if (hasUsers || hasPosts) return { ok: false, error: 'IN_USE' } as const;

          const nextById = { ...state.entities.skills.byId };
          delete nextById[input.skillId];

          set({
            entities: {
              ...state.entities,
              skills: {
                byId: nextById,
                allIds: state.entities.skills.allIds.filter((id) => id !== input.skillId),
              },
            },
          });

          return { ok: true } as const;
        },

        adminCreateShiftType: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const name = input.name.trim();
          const shortName = input.shortName.trim().slice(0, 2);
          const colorTag = input.colorTag.trim() || 'zinc';
          if (!name || !shortName) return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const shiftTypeId = createId('shiftType');
          const createdAt = nowIso();
          const shiftType: ShiftType = { id: shiftTypeId, name, shortName, colorTag, isOvernight: false, createdAt };

          set({
            entities: {
              ...state.entities,
              shiftTypes: {
                byId: { ...state.entities.shiftTypes.byId, [shiftTypeId]: shiftType },
                allIds: [shiftTypeId, ...state.entities.shiftTypes.allIds],
              },
            },
          });

          return { ok: true, shiftTypeId } as const;
        },

        adminUpdateShiftType: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const existing = state.entities.shiftTypes.byId[input.shiftTypeId];
          if (!existing || existing.id === 'shift_none') return { ok: false, error: 'NOT_FOUND' } as const;

          const name = input.name.trim();
          const shortName = input.shortName.trim().slice(0, 2);
          const colorTag = input.colorTag.trim() || existing.colorTag;
          if (!name || !shortName) return { ok: false, error: 'NOT_FOUND' } as const;

          set({
            entities: {
              ...state.entities,
              shiftTypes: {
                ...state.entities.shiftTypes,
                byId: {
                  ...state.entities.shiftTypes.byId,
                  [input.shiftTypeId]: { ...existing, name, shortName, colorTag, isOvernight: false },
                },
              },
            },
          });

          return { ok: true } as const;
        },

        adminDeleteShiftType: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const existing = state.entities.shiftTypes.byId[input.shiftTypeId];
          if (!existing || existing.id === 'shift_none') return { ok: false, error: 'NOT_FOUND' } as const;

          const hasShifts = state.entities.shifts.allIds.some((id) => state.entities.shifts.byId[id]?.shiftTypeId === input.shiftTypeId);
          if (hasShifts) return { ok: false, error: 'IN_USE' } as const;

          const nextById = { ...state.entities.shiftTypes.byId };
          delete nextById[input.shiftTypeId];

          set({
            entities: {
              ...state.entities,
              shiftTypes: {
                byId: nextById,
                allIds: state.entities.shiftTypes.allIds.filter((id) => id !== input.shiftTypeId),
              },
            },
          });

          return { ok: true } as const;
        },

        adminUpdateUser: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const existing = state.entities.users.byId[input.userId];
          if (!existing) return { ok: false, error: 'NOT_FOUND' } as const;

          const next: User = {
            ...existing,
            displayName: input.displayName !== undefined ? input.displayName : existing.displayName,
            isVip: input.isVip !== undefined ? input.isVip : existing.isVip,
            isMuted: input.isMuted !== undefined ? input.isMuted : existing.isMuted,
            role: input.role !== undefined ? input.role : existing.role,
          };

          set({
            entities: {
              ...state.entities,
              users: {
                ...state.entities.users,
                byId: { ...state.entities.users.byId, [input.userId]: next },
              },
            },
          });

          return { ok: true } as const;
        },

        adminUpdateConfig: (input) => {
          const state = get();
          const userId = state.session.userId;
          const me = userId ? state.entities.users.byId[userId] : undefined;
          if (me?.role !== 'admin') return { ok: false, error: 'AUTH_REQUIRED' } as const;

          const bannedWords = input.bannedWords.map((x) => x.trim()).filter(Boolean);
          const unique = Array.from(new Set(bannedWords));

          set({
            appConfig: {
              vipPriceMop: input.vipPriceMop,
              globalAnnouncement: input.globalAnnouncement,
              bannedWords: unique,
            },
          });

          return { ok: true } as const;
        },

        devResetNonAdmin: () => {
          const state = get();
          const userId = state.session.userId;
          const user = userId ? state.entities.users.byId[userId] : undefined;
          if (user?.role === 'admin') return;
          set(buildInitialState() as AppStoreState);
        },
      },
    }),
    {
      name: STORAGE_NAME,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        meta: state.meta,
        session: state.session,
        appConfig: state.appConfig,
        preferences: state.preferences,
        entities: state.entities,
      }),
      migrate: (persisted, version) => {
        const incoming = persisted as AppStoreState;
        if (!incoming) return buildInitialState();
        if (version === SCHEMA_VERSION) return incoming;

        const base = buildInitialState();
        const entities = incoming.entities ?? base.entities;

        const usersById: Record<string, User> = {};
        for (const id of entities.users.allIds ?? []) {
          const u = entities.users.byId[id];
          if (!u) continue;
          usersById[id] = { ...u, isMuted: (u as any).isMuted ?? false };
        }

        const shiftTypesById: Record<string, ShiftType> = {};
        for (const id of entities.shiftTypes.allIds ?? []) {
          const st = entities.shiftTypes.byId[id];
          if (!st) continue;
          shiftTypesById[id] = { ...st, isOvernight: false };
        }
        const shiftTypesAllIds = (entities.shiftTypes.allIds ?? []).slice();
        if (!shiftTypesById.shift_none) {
          const createdAt = nowIso();
          shiftTypesById.shift_none = { id: 'shift_none', name: '清空', shortName: '', colorTag: 'zinc', isOvernight: false, createdAt };
          shiftTypesAllIds.unshift('shift_none');
        }

        const shiftsById: Record<string, Shift> = {};
        for (const id of entities.shifts.allIds ?? []) {
          const s = entities.shifts.byId[id];
          if (!s) continue;
          shiftsById[id] = { ...s, isOvernight: false };
        }

        return {
          ...base,
          ...incoming,
          meta: { schemaVersion: SCHEMA_VERSION, hasSeeded: incoming.meta?.hasSeeded ?? false },
          preferences: { ...base.preferences, ...(incoming as any).preferences },
          entities: {
            ...base.entities,
            ...entities,
            users: { byId: usersById, allIds: entities.users.allIds ?? [] },
            shiftTypes: { byId: shiftTypesById, allIds: shiftTypesAllIds },
            shifts: { byId: shiftsById, allIds: entities.shifts.allIds ?? [] },
            monthSaves: (entities as any).monthSaves ?? base.entities.monthSaves,
          },
        };
      },
    },
  ),
);

export function getCurrentUser(state: AppStoreState): User | null {
  const userId = state.session.userId;
  if (!userId) return null;
  return state.entities.users.byId[userId] ?? null;
}
