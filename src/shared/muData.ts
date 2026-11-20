/**
 * Shared domain constants & types derived directly from EmanuelCatania/Mu-Linux
 * (CreateDatabase.sql, GameServerInfo - Common/Command/ChaosMix.dat, Command.txt, Move.txt, Invasions.toml, BloodCastle.dat, DevilSquare.dat)
 */

export const CLASS_NAMES: Record<number, string> = {
  0: 'Dark Wizard',
  1: 'Soul Master',
  2: 'Grand Master',
  16: 'Dark Knight',
  17: 'Blade Knight',
  18: 'Blade Master',
  32: 'Fairy Elf',
  33: 'Muse Elf',
  34: 'High Elf',
  48: 'Magic Gladiator',
  49: 'Duel Master',
};

export const CLASS_GROUPS = [
  { id: 'all', label: 'ทุกอาชีพ', classIds: [] as number[] },
  { id: 'dk', label: 'Dark Knight / BK', classIds: [16, 17, 18] },
  { id: 'dw', label: 'Dark Wizard / SM', classIds: [0, 1, 2] },
  { id: 'fe', label: 'Fairy Elf / ME', classIds: [32, 33, 34] },
  { id: 'mg', label: 'Magic Gladiator', classIds: [48, 49] },
];

export interface BaseClassSpec {
  classId: number;
  name: string;
  thaiName: string;
  evolution: string;
  role: string;
  description: string;
  strength: number;
  dexterity: number;
  vitality: number;
  energy: number;
  life: number;
  mana: number;
  startMap: number;
  startMapName: string;
  startX: number;
  startY: number;
  unlockRequirement: string;
}

// Exact base stats from server/MuServer/MySQL/DB/CreateDatabase.sql (DefaultClassType)
export const PLAYABLE_BASE_CLASSES: BaseClassSpec[] = [
  {
    classId: 16,
    name: 'Dark Knight',
    thaiName: 'นักรบอัศวิน',
    evolution: 'Blade Knight',
    role: 'โจมตีระยะประชิด · แนวหน้า',
    description:
      'นักรบเกราะหนักผู้เชี่ยวชาญดาบคู่และหอก มีพลังชีวิตและพลังป้องกันสูงสุด เหมาะสำหรับเปิดแนวปะทะและสู้บอสใน Blood Castle',
    strength: 28,
    dexterity: 20,
    vitality: 25,
    energy: 10,
    life: 110,
    mana: 20,
    startMap: 0,
    startMapName: 'Lorencia',
    startX: 125,
    startY: 125,
    unlockRequirement: 'สร้างได้ทันทีตั้งแต่เลเวล 1',
  },
  {
    classId: 0,
    name: 'Dark Wizard',
    thaiName: 'จอมเวทมนตร์ดำ',
    evolution: 'Soul Master',
    role: 'เวทมนตร์วงกว้าง · เก็บเลเวลเร็ว',
    description:
      'ผู้ใช้ศาสตร์เวทโบราณอย่าง Evil Spirit และ Teleport กวาดมอนสเตอร์เป็นวงกว้างใน Devil Square และสนับสนุนทีมด้วย Mana Shield',
    strength: 18,
    dexterity: 18,
    vitality: 15,
    energy: 30,
    life: 60,
    mana: 60,
    startMap: 0,
    startMapName: 'Lorencia',
    startX: 125,
    startY: 125,
    unlockRequirement: 'สร้างได้ทันทีตั้งแต่เลเวล 1',
  },
  {
    classId: 32,
    name: 'Fairy Elf',
    thaiName: 'เอลฟ์ธนูศักดิ์สิทธิ์',
    evolution: 'Muse Elf',
    role: 'ยิงไกล · บัฟโจมตีและป้องกัน',
    description:
      'ผู้พิทักษ์แห่งป่า Noria เลือกเล่นได้ทั้งสาย Agility ยิงธนูรัว หรือสาย Energy บัฟเพิ่มพลังโจมตี ป้องกัน และฮีลให้ปาร์ตี้',
    strength: 22,
    dexterity: 25,
    vitality: 20,
    energy: 15,
    life: 80,
    mana: 30,
    startMap: 3,
    startMapName: 'Noria',
    startX: 172,
    startY: 97,
    unlockRequirement: 'สร้างได้ทันทีตั้งแต่เลเวล 1',
  },
  {
    classId: 48,
    name: 'Magic Gladiator',
    thaiName: 'อัศวินเวทมนตร์',
    evolution: 'Duel Master',
    role: 'ไฮบริดดาบและเวท · แต้มอัพ 7/เลเวล',
    description:
      'อาชีพพิเศษสายผสมผสานระหว่างดาบกับเวทมนตร์ สวมชุดเกราะได้หลากหลายและได้รับแต้มสเตตัสต่อเลเวลมากกว่าอาชีพปกติ',
    strength: 26,
    dexterity: 26,
    vitality: 26,
    energy: 26,
    life: 110,
    mana: 60,
    startMap: 0,
    startMapName: 'Lorencia',
    startX: 125,
    startY: 125,
    unlockRequirement: 'ปลดล็อกเมื่อมีตัวละครเลเวล 220 ในไอดี',
  },
];

// Exact map table from web/server.js MAP_NAMES
export const MAP_NAMES: Record<number, string> = {
  0: 'Lorencia',
  1: 'Dungeon',
  2: 'Devias',
  3: 'Noria',
  4: 'Lost Tower',
  5: 'Exile',
  6: 'Arena (Stadium)',
  7: 'Atlans',
  8: 'Tarkan',
  9: 'Devil Square',
  10: 'Icarus',
  11: 'Blood Castle 1',
  12: 'Blood Castle 2',
  13: 'Blood Castle 3',
  14: 'Blood Castle 4',
  15: 'Blood Castle 5',
  16: 'Blood Castle 6',
};

export interface MoveGate {
  index: number;
  name: string;
  zen: number;
  minLevel: number;
  gate: number;
  zone: string;
}

// Exact warp entries from server/MuServer/Data/Move/Move.txt
export const MOVE_GATES: MoveGate[] = [
  { index: 2, name: 'Lorencia', zen: 1000, minLevel: 10, gate: 17, zone: 'เมืองเริ่มต้น' },
  { index: 3, name: 'Noria', zen: 1000, minLevel: 10, gate: 27, zone: 'เมืองเอลฟ์ & Chaos Machine' },
  { index: 4, name: 'Devias', zen: 1500, minLevel: 20, gate: 22, zone: 'เมืองหิมะ & เปลี่ยนอาชีพ' },
  { index: 5, name: 'Devias2', zen: 2000, minLevel: 20, gate: 72, zone: 'ปราสาทน้ำแข็ง' },
  { index: 6, name: 'Devias3', zen: 2500, minLevel: 20, gate: 73, zone: 'หอคอยหิมะ' },
  { index: 7, name: 'Devias4', zen: 2500, minLevel: 20, gate: 74, zone: 'ลานน้ำแข็งเหนือ' },
  { index: 8, name: 'Dungeon', zen: 3000, minLevel: 30, gate: 2, zone: 'ดันเจี้ยนชั้น 1' },
  { index: 9, name: 'Dungeon2', zen: 3000, minLevel: 40, gate: 6, zone: 'ดันเจี้ยนชั้น 2' },
  { index: 10, name: 'Dungeon3', zen: 3500, minLevel: 50, gate: 10, zone: 'ดันเจี้ยนชั้น 3 (Gorgon)' },
  { index: 14, name: 'LostTower', zen: 5000, minLevel: 50, gate: 42, zone: 'หอคอยชั้น 1' },
  { index: 15, name: 'LostTower2', zen: 5000, minLevel: 50, gate: 31, zone: 'หอคอยชั้น 2' },
  { index: 16, name: 'LostTower3', zen: 5500, minLevel: 50, gate: 33, zone: 'หอคอยชั้น 3' },
  { index: 17, name: 'LostTower4', zen: 5500, minLevel: 60, gate: 35, zone: 'หอคอยชั้น 4' },
  { index: 18, name: 'LostTower5', zen: 5500, minLevel: 60, gate: 37, zone: 'หอคอยชั้น 5' },
  { index: 19, name: 'LostTower6', zen: 6000, minLevel: 70, gate: 39, zone: 'หอคอยชั้น 6' },
  { index: 20, name: 'LostTower7', zen: 6500, minLevel: 70, gate: 41, zone: 'หอคอยชั้น 7 (Balrog)' },
  { index: 11, name: 'Atlans', zen: 4000, minLevel: 70, gate: 49, zone: 'นครใต้น้ำชั้น 1' },
  { index: 12, name: 'Atlans2', zen: 4500, minLevel: 80, gate: 75, zone: 'นครใต้น้ำชั้น 2' },
  { index: 13, name: 'Atlans3', zen: 5000, minLevel: 90, gate: 76, zone: 'นครใต้น้ำชั้น 3 (Hydra)' },
  { index: 21, name: 'Tarkan', zen: 8000, minLevel: 140, gate: 57, zone: 'ทะเลทรายทาร์แคน 1' },
  { index: 22, name: 'Tarkan2', zen: 8500, minLevel: 140, gate: 77, zone: 'ทะเลทรายทาร์แคน 2 (Zaikan)' },
  { index: 23, name: 'Icarus', zen: 9000, minLevel: 170, gate: 63, zone: 'วิหารลอยฟ้า (ต้องใส่ปีก/Dinorant)' },
  { index: 1, name: 'Stadium', zen: 3000, minLevel: 255, gate: 50, zone: 'สนามประลอง & ฟาร์ม Arena' },
];

export interface PlayerCommandSpec {
  command: string;
  syntax: string;
  category: 'การเคลื่อนที่และสื่อสาร' | 'สเตตัสและรีเซ็ต' | 'ตัวละครและคลัง' | 'กิลด์และระบบ';
  description: string;
}

// Exact player commands (GameMaster=0) from server/MuServer/Data/Command.txt
export const PLAYER_COMMANDS: PlayerCommandSpec[] = [
  { command: '/move', syntax: '/move <MapName>', category: 'การเคลื่อนที่และสื่อสาร', description: 'วาร์ปไปยังแผนที่ที่กำหนดตามตาราง Move.txt' },
  { command: '/post', syntax: '/post <ข้อความ>', category: 'การเคลื่อนที่และสื่อสาร', description: 'ประกาศข้อความสีทองถึงผู้เล่นทั้งเซิร์ฟเวอร์ (Global Post)' },
  { command: '/str', syntax: '/str <จำนวน>', category: 'สเตตัสและรีเซ็ต', description: 'เพิ่มแต้ม Strength แบบรวดเร็วในเกม (สูงสุด 32,767)' },
  { command: '/agi', syntax: '/agi <จำนวน>', category: 'สเตตัสและรีเซ็ต', description: 'เพิ่มแต้ม Dexterity / Agility แบบรวดเร็วในเกม' },
  { command: '/vit', syntax: '/vit <จำนวน>', category: 'สเตตัสและรีเซ็ต', description: 'เพิ่มแต้ม Vitality แบบรวดเร็วในเกม' },
  { command: '/ene', syntax: '/ene <จำนวน>', category: 'สเตตัสและรีเซ็ต', description: 'เพิ่มแต้ม Energy แบบรวดเร็วในเกม' },
  { command: '/reset', syntax: '/reset [Auto] [Str] [Agi] [Vit] [Ene]', category: 'สเตตัสและรีเซ็ต', description: 'รีเซ็ตตัวละครที่เลเวล 400 (รองรับ Auto Reset และอัพสเตตัสอัตโนมัติ)' },
  { command: '/grandreset', syntax: '/grandreset', category: 'สเตตัสและรีเซ็ต', description: 'ทำ Grand Reset เพื่อสะสมอันดับและรับโบนัสระดับสูง' },
  { command: '/pkclear', syntax: '/pkclear', category: 'ตัวละครและคลัง', description: 'ล้างค่าหัวแดง (PK Level) กลับสู่สถานะผู้เล่นปกติ' },
  { command: '/evo', syntax: '/evo', category: 'ตัวละครและคลัง', description: 'เปลี่ยนอาชีพขั้น 2 (Soul Master / Blade Knight / Muse Elf)' },
  { command: '/ware', syntax: '/ware <หมายเลขคลัง>', category: 'ตัวละครและคลัง', description: 'สลับคลังเก็บของเสริม (ExtWarehouse)' },
  { command: '/clearinv', syntax: '/clearinv', category: 'ตัวละครและคลัง', description: 'ล้างไอเทมทั้งหมดในกระเป๋าตัวละคร (ควรเก็บของสำคัญก่อนใช้)' },
  { command: '/skin', syntax: '/skin <รหัสมอนสเตอร์>', category: 'ตัวละครและคลัง', description: 'เปลี่ยนรูปลักษณ์ตัวละครเป็นมอนสเตอร์ตามรหัส' },
  { command: '/onlines', syntax: '/onlines', category: 'กิลด์และระบบ', description: 'ตรวจสอบจำนวนผู้เล่นออนไลน์ในเซิร์ฟเวอร์ขณะนั้น' },
  { command: '/war', syntax: '/war <ชื่อกิลด์>', category: 'กิลด์และระบบ', description: 'ท้าทายสงครามกิลด์ (Guild War)' },
  { command: '/soccer', syntax: '/soccer <ชื่อกิลด์>', category: 'กิลด์และระบบ', description: 'ท้าทายการแข่งขัน Battle Soccer ในสนาม Arena' },
  { command: '/re', syntax: '/re <ON|OFF|AUTO>', category: 'กิลด์และระบบ', description: 'ตั้งค่าการรับคำขอเทรด ปาร์ตี้ หรือกิลด์ (เปิด / ปิด / อัตโนมัติ)' },
];

export interface EventScheduleSpec {
  id: string;
  name: string;
  category: 'ดันเจี้ยนกิจกรรม' | 'บอสบุกเมือง' | 'กิจกรรมพิเศษ';
  scheduleTimes: string[]; // HH:MM in server time
  warningMinutes: number;
  durationMinutes: number;
  maps: string;
  rewardSummary: string;
  sourceFile: string;
}

// Exact schedules from BloodCastle.dat, DevilSquare.dat, GoldenArcherBingo.dat, Invasions.toml
export const EVENT_SCHEDULES: EventScheduleSpec[] = [
  {
    id: 'blood-castle',
    name: 'Blood Castle',
    category: 'ดันเจี้ยนกิจกรรม',
    scheduleTimes: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    warningMinutes: 5,
    durationMinutes: 5,
    maps: 'Devias (Archangel) → Blood Castle 1–6',
    rewardSummary: 'EXP โบนัส + Jewel of Chaos / Bless + คะแนน RankingBloodCastle',
    sourceFile: 'Data/Event/BloodCastle.dat',
  },
  {
    id: 'devil-square',
    name: 'Devil Square',
    category: 'ดันเจี้ยนกิจกรรม',
    scheduleTimes: ['00:30', '04:30', '08:30', '12:30', '16:30', '20:30'],
    warningMinutes: 5,
    durationMinutes: 5,
    maps: 'Noria (Charon) → Devil Square 1–4',
    rewardSummary: 'EXP สูงสุด + Zen + คะแนน RankingDevilSquare',
    sourceFile: 'Data/Event/DevilSquare.dat',
  },
  {
    id: 'tamachan',
    name: 'Tamachan Invasion',
    category: 'บอสบุกเมือง',
    scheduleTimes: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    warningMinutes: 0,
    durationMinutes: 5,
    maps: 'สุ่มเกิดตามจุด Spawns.toml',
    rewardSummary: 'ดรอปไอเทมกิจกรรมพิเศษประจำรอบ',
    sourceFile: 'Data/Events/Invasions/Invasions.toml',
  },
  {
    id: 'death-king',
    name: 'Death King Invasion',
    category: 'บอสบุกเมือง',
    scheduleTimes: ['14:50'],
    warningMinutes: 5,
    durationMinutes: 10,
    maps: 'Lorencia, Noria',
    rewardSummary: 'บอส Death King (ID 55) และกองทัพโครงกระดูก',
    sourceFile: 'Data/Events/Invasions/Invasions.toml',
  },
  {
    id: 'golden-invasion',
    name: 'Golden Invasion',
    category: 'บอสบุกเมือง',
    scheduleTimes: ['14:58'],
    warningMinutes: 5,
    durationMinutes: 10,
    maps: 'Lorencia, Devias, Noria, Lost Tower, Atlans, Tarkan',
    rewardSummary: 'มอนสเตอร์ทองคำ ดรอป Box of Kundun +1 ถึง +5',
    sourceFile: 'Data/Events/Invasions/Invasions.toml',
  },
  {
    id: 'red-dragon',
    name: 'Red Dragon Invasion',
    category: 'บอสบุกเมือง',
    scheduleTimes: ['19:35'],
    warningMinutes: 5,
    durationMinutes: 10,
    maps: 'Lorencia, Devias',
    rewardSummary: 'มังกรแดง Red Dragon (ID 42) ดรอป Jewel และไอเทมหายาก',
    sourceFile: 'Data/Events/Invasions/Invasions.toml',
  },
  {
    id: 'golden-archer-bingo',
    name: 'Golden Archer Bingo',
    category: 'กิจกรรมพิเศษ',
    scheduleTimes: ['22:31'],
    warningMinutes: 5,
    durationMinutes: 5,
    maps: 'Tarkan (พิกัด 242, 52)',
    rewardSummary: 'แลก Rena / Stone และลุ้น LuckyNumber จาก GoldenArcherCoin',
    sourceFile: 'Data/Event/GoldenArcherBingo.dat',
  },
];

// Exact default configuration values from EmanuelCatania/Mu-Linux
export const SERVER_CONFIG_SPECS = {
  brandName: 'MuOrigins',
  playOnlineUrl: 'https://playonline.muorigins.online',
  version: '0.97k Native Linux',
  repository: 'https://github.com/EmanuelCatania/Mu-Linux',
  database: 'MySQL 8.4 (MuOnline97)',
  passwordHash: 'bcrypt ($2a$10$ · PasswordHash=1)',
  connectServerPort: 44405,
  connectServerUdp: 55601,
  gameServerPort: 55901,
  maxLevel: 400,
  resetLevel: 400,
  resetStartLevel: 1,
  resetCostZen: 0,
  resetKeepStats: true,
  maxStatPoint: 32767,
  itemDropRate: '100%',
  zenDropRate: '50%',
  maxItemOption: '+16 (Jewel of Life 4 ขั้น)',
  maxIpConnections: 10,
  charDeleteMaxLevel: 220,
  devilSquareMixRate: '80%',
  partyExpBonus: [
    { members: 2, rate: '125%' },
    { members: 3, rate: '150%' },
    { members: 4, rate: '175%' },
    { members: 5, rate: '200%' },
  ],
  antiHack: [
    { key: 'MoveCheck=2', detail: 'ตรวจสอบเส้นทางการเดินและกำแพงฝั่งเซิร์ฟเวอร์ (Tolerance 4 ช่อง)' },
    { key: 'AttackCheck=2', detail: 'คำนวณความเร็วการโจมตีเทียบ PhysiSpeed ป้องกัน Speed/Hit Hack' },
    { key: 'CheckAutoPotionHack=1', detail: 'ตรวจจับการปั๊มยาอัตโนมัติที่เร็วกว่ามนุษย์ (< 75ms)' },
    { key: 'PacketRateCheck=1', detail: 'จำกัดแพ็กเก็ตไม่เกิน 60 แพ็กเก็ต/วินาทีต่อการเชื่อมต่อ' },
  ],
};

// Shared API response contracts
export interface CharacterRecord {
  AccountID: string;
  Name: string;
  Class: number;
  ClassName: string;
  cLevel: number;
  ResetCount: number;
  GrandResetCount: number;
  LevelUpPoint: number;
  Strength: number;
  Dexterity: number;
  Vitality: number;
  Energy: number;
  Money: number;
  Life: number;
  MaxLife: number;
  Mana: number;
  MaxMana: number;
  MapNumber: number;
  MapName: string;
  MapPosX: number;
  MapPosY: number;
  PkCount: number;
  PkLevel: number;
  CtlCode: number;
  GuildName: string | null;
  IsOnline: boolean;
  InventoryItemCount: number;
  Cooldowns?: {
    moveHomeSeconds: number;
    clearInventorySeconds: number;
  };
}

export interface RankingCharacterRow {
  Name: string;
  Class: number;
  ClassName: string;
  cLevel: number;
  ResetCount: number;
  GrandResetCount: number;
  MapNumber: number;
  MapName: string;
  GuildName: string | null;
  IsOnline: boolean;
  PkLevel: number;
}

export interface RankingGuildRow {
  GuildName: string;
  GuildScore: number;
  GuildMaster: string;
  Members: number;
  Notice: string;
  IsMasterOnline: boolean;
}

export interface EventRankingRow {
  Name: string;
  Class: number;
  ClassName: string;
  cLevel: number;
  ResetCount: number;
  Score: number;
  IsOnline: boolean;
}

export interface NewsItem {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  createdAt: string;
}

export interface AccountProfile {
  memb___id: string;
  memb_name: string;
  mail_addr: string;
  AccountLevel: number;
  bloc_code: string;
  ConnectStat: number;
  ServerName: string;
  OnlineHours: number;
  GameIDC: string | null;
  Renas: number;
  Stones: number;
  LuckyNumber: string | null;
  Characters: CharacterRecord[];
}

export interface ServerOverview {
  connectionMode: 'mysql-live' | 'unconfigured';
  databaseName: string;
  connectServer: { host: string; port: number; reachable: boolean };
  gameServer: { host: string; port: number; reachable: boolean };
  stats: {
    onlinePlayers: number;
    totalAccounts: number;
    totalCharacters: number;
    totalGuilds: number;
  };
  topPlayers: RankingCharacterRow[];
  news: NewsItem[];
  serverTimeIso: string;
}

export function getClassName(classId: number): string {
  return CLASS_NAMES[classId] ?? `Class ${classId}`;
}

export function getMapName(mapId: number): string {
  return MAP_NAMES[mapId] ?? `Map ${mapId}`;
}

export function getPkLabel(pkLevel: number): string {
  if (pkLevel <= 1) return 'Hero (วีรบุรุษ)';
  if (pkLevel === 2) return 'Guardian';
  if (pkLevel === 3) return 'ปกติ (Commoner)';
  if (pkLevel === 4) return 'PK ขั้น 1';
  if (pkLevel === 5) return 'PK ขั้น 2';
  return 'Phonomania (หัวแดง)';
}

export function getAccountTierLabel(accountLevel: number): string {
  switch (accountLevel) {
    case 1:
      return 'VIP Bronze (AL1)';
    case 2:
      return 'VIP Silver (AL2)';
    case 3:
      return 'VIP Gold (AL3)';
    default:
      return 'บัญชีทั่วไป (AL0)';
  }
}
