import type {
  AppConfig,
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
import { nowIso } from '@/src/utils/time';

function makeEntityState<T extends { id: string }>(items: T[]): EntityState<T> {
  const byId: Record<string, T> = {};
  const allIds: string[] = [];
  for (const item of items) {
    byId[item.id] = item;
    allIds.push(item.id);
  }
  return { byId, allIds };
}

export type SeedData = {
  appConfig: AppConfig;
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

export function buildSeedData(): SeedData {
  const createdAt = nowIso();

  const appConfig: AppConfig = {
    vipPriceMop: 88,
    globalAnnouncement: '歡迎使用 ShiftLink（換更通）— MVP 版',
    bannedWords: ['微信', 'whatsapp', 'telegram', '賭', '詐騙'],
  };

  const companies: Company[] = [
    { id: 'company_galaxy', name: '澳門銀河', createdAt },
    { id: 'company_venetian', name: '威尼斯人', createdAt },
    { id: 'company_mgm', name: 'MGM', createdAt },
    { id: 'company_wynn', name: '永利', createdAt },
  ];

  const positions: Position[] = [
    { id: 'pos_dealer_galaxy', companyId: 'company_galaxy', name: '莊荷', createdAt },
    { id: 'pos_security_galaxy', companyId: 'company_galaxy', name: '保安', createdAt },
    { id: 'pos_fnb_galaxy', companyId: 'company_galaxy', name: '餐飲服務', createdAt },
    { id: 'pos_dealer_venetian', companyId: 'company_venetian', name: '莊荷', createdAt },
    { id: 'pos_security_venetian', companyId: 'company_venetian', name: '保安', createdAt },
    { id: 'pos_fnb_venetian', companyId: 'company_venetian', name: '餐飲服務', createdAt },
    { id: 'pos_dealer_mgm', companyId: 'company_mgm', name: '莊荷', createdAt },
    { id: 'pos_security_mgm', companyId: 'company_mgm', name: '保安', createdAt },
    { id: 'pos_fnb_mgm', companyId: 'company_mgm', name: '餐飲服務', createdAt },
    { id: 'pos_dealer_wynn', companyId: 'company_wynn', name: '莊荷', createdAt },
    { id: 'pos_security_wynn', companyId: 'company_wynn', name: '保安', createdAt },
    { id: 'pos_fnb_wynn', companyId: 'company_wynn', name: '餐飲服務', createdAt },
  ];

  const skills: Skill[] = [
    { id: 'skill_baccarat', positionId: 'pos_dealer_galaxy', name: '百家樂', createdAt },
    { id: 'skill_sicbo', positionId: 'pos_dealer_galaxy', name: '骰寶', createdAt },
    { id: 'skill_blackjack', positionId: 'pos_dealer_venetian', name: '廿一點', createdAt },
    { id: 'skill_roulette', positionId: 'pos_dealer_mgm', name: '輪盤', createdAt },
    { id: 'skill_service', positionId: 'pos_fnb_galaxy', name: '樓面服務', createdAt },
    { id: 'skill_bar', positionId: 'pos_fnb_venetian', name: '吧檯', createdAt },
    { id: 'skill_patrol', positionId: 'pos_security_mgm', name: '巡邏', createdAt },
    { id: 'skill_crowd', positionId: 'pos_security_wynn', name: '人流管控', createdAt },
  ];

  const shiftTypes: ShiftType[] = [
    { id: 'shift_none', name: '清空', shortName: '', colorTag: 'zinc', isOvernight: false, createdAt },
    { id: 'shift_early', name: '早班', shortName: '早', colorTag: 'emerald', isOvernight: false, createdAt },
    { id: 'shift_mid', name: '中班', shortName: '中', colorTag: 'sky', isOvernight: false, createdAt },
    { id: 'shift_late', name: '晚班', shortName: '晚', colorTag: 'violet', isOvernight: false, createdAt },
    { id: 'shift_topup', name: '頂班', shortName: '頂', colorTag: 'amber', isOvernight: false, createdAt },
    { id: 'shift_off', name: '假期', shortName: '假', colorTag: 'zinc', isOvernight: false, createdAt },
  ];

  const password = '112211';

  const users: User[] = [
    {
      id: 'user_admin',
      username: 'admin',
      password,
      displayName: '管理員',
      role: 'admin',
      companyId: '',
      positionId: '',
      skillIds: [],
      isVip: true,
      isMuted: false,
      createdAt,
    },
    {
      id: 'user_1',
      username: 'user1',
      password,
      displayName: '小明',
      role: 'user',
      companyId: 'company_galaxy',
      positionId: 'pos_dealer_galaxy',
      skillIds: ['skill_baccarat', 'skill_sicbo'],
      isVip: true,
      isMuted: false,
      createdAt,
    },
    {
      id: 'user_2',
      username: 'user2',
      password,
      displayName: '阿欣',
      role: 'user',
      companyId: 'company_galaxy',
      positionId: 'pos_fnb_galaxy',
      skillIds: ['skill_service'],
      isVip: false,
      isMuted: false,
      createdAt,
    },
    {
      id: 'user_3',
      username: 'user3',
      password,
      displayName: '阿強',
      role: 'user',
      companyId: 'company_venetian',
      positionId: 'pos_dealer_venetian',
      skillIds: ['skill_blackjack'],
      isVip: false,
      isMuted: false,
      createdAt,
    },
    {
      id: 'user_4',
      username: 'user4',
      password,
      displayName: 'Karen',
      role: 'user',
      companyId: 'company_mgm',
      positionId: 'pos_security_mgm',
      skillIds: ['skill_patrol'],
      isVip: false,
      isMuted: false,
      createdAt,
    },
    {
      id: 'user_5',
      username: 'user5',
      password,
      displayName: 'Leo',
      role: 'user',
      companyId: 'company_wynn',
      positionId: 'pos_security_wynn',
      skillIds: ['skill_crowd'],
      isVip: true,
      isMuted: false,
      createdAt,
    },
    {
      id: 'user_6',
      username: 'user6',
      password,
      displayName: '阿怡',
      role: 'user',
      companyId: 'company_mgm',
      positionId: 'pos_dealer_mgm',
      skillIds: ['skill_roulette'],
      isVip: false,
      isMuted: false,
      createdAt,
    },
  ];

  const now = nowIso();

  const squarePosts: Post[] = Array.from({ length: 30 }).map((_, i) => {
    const author = users[(i % 6) + 1]!;
    return {
      id: `post_square_${i + 1}`,
      boardType: 'square',
      authorId: author.id,
      companyId: author.companyId,
      title: `【廣場】${author.displayName} 分享 #${i + 1}`,
      content: `想搵人一齊頂更／交流，留言傾下。#${i + 1}`,
      skillIds: author.skillIds.length ? [author.skillIds[i % author.skillIds.length]!] : [],
      createdAt: now,
      updatedAt: now,
    };
  });

  const swapPosts: Post[] = Array.from({ length: 30 }).map((_, i) => {
    const author = users[(i % 6) + 1]!;
    return {
      id: `post_swap_${i + 1}`,
      boardType: 'swap',
      authorId: author.id,
      companyId: author.companyId,
      title: `【換班】求換更 #${i + 1}`,
      content: `有冇同公司同事可以互換？我時間可夾。#${i + 1}`,
      skillIds: author.skillIds.length ? author.skillIds.slice(0, 1) : [],
      createdAt: now,
      updatedAt: now,
    };
  });

  return {
    appConfig,
    users: makeEntityState(users),
    companies: makeEntityState(companies),
    positions: makeEntityState(positions),
    skills: makeEntityState(skills),
    shiftTypes: makeEntityState(shiftTypes),
    shifts: makeEntityState([]),
    monthSaves: makeEntityState([]),
    posts: makeEntityState([...squarePosts, ...swapPosts]),
    threads: makeEntityState([]),
    messages: makeEntityState([]),
  };
}
