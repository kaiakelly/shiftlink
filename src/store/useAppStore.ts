import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  AppConfig,
  Company,
  EntityState,
  Message,
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

export type AppStoreActions = {
  bootstrap: () => Promise<void>;
  login: (username: string, password: string) => AuthResult;
  logout: () => void;
  register: (input: RegisterInput) => { ok: true; userId: string } | { ok: false; error: 'USERNAME_TAKEN' };
  completeOnboarding: (input: CompleteOnboardingInput) => void;
  updateMySkills: (skillIds: string[]) => void;
  createPost: (input: CreatePostInput) => { ok: true; postId: string } | { ok: false; error: 'AUTH_REQUIRED' };
  devResetNonAdmin: () => void;
};

export type AppStore = AppStoreState & { actions: AppStoreActions };

const STORAGE_NAME = 'shiftlink_store_v1';
const SCHEMA_VERSION = 1;

function emptyEntityState<T>(): EntityState<T> {
  return { byId: {}, allIds: [] };
}

function buildInitialState(): AppStoreState {
  const seed = buildSeedData();
  return {
    meta: { schemaVersion: SCHEMA_VERSION, hasSeeded: false },
    session: { userId: null, isGuest: true },
    appConfig: seed.appConfig,
    entities: {
      users: emptyEntityState<User>(),
      companies: emptyEntityState<Company>(),
      positions: emptyEntityState<Position>(),
      skills: emptyEntityState<Skill>(),
      shiftTypes: emptyEntityState<ShiftType>(),
      shifts: emptyEntityState<Shift>(),
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
        entities: state.entities,
      }),
      migrate: (persisted, version) => {
        const incoming = persisted as AppStoreState;
        if (!incoming) return buildInitialState();
        if (version === SCHEMA_VERSION) return incoming;
        return {
          ...buildInitialState(),
          ...incoming,
          meta: { schemaVersion: SCHEMA_VERSION, hasSeeded: incoming.meta?.hasSeeded ?? false },
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
