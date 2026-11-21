/**
 * Shared domain constants & types derived directly from EmanuelCatania/Mu-Linux
 * (CreateDatabase.sql, GameServerInfo - Common/Command/ChaosMix.dat, Command.txt, Move.txt, Invasions.toml, BloodCastle.dat, DevilSquare.dat)
 */

export type PortalLang = 'en' | 'th';

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
  { id: 'all', label: 'ทุกอาชีพ', labelEn: 'All Classes', classIds: [] as number[] },
  { id: 'dk', label: 'Dark Knight / BK', labelEn: 'Dark Knight / BK', classIds: [16, 17, 18] },
  { id: 'dw', label: 'Dark Wizard / SM', labelEn: 'Dark Wizard / SM', classIds: [0, 1, 2] },
  { id: 'fe', label: 'Fairy Elf / ME', labelEn: 'Fairy Elf / ME', classIds: [32, 33, 34] },
  { id: 'mg', label: 'Magic Gladiator', labelEn: 'Magic Gladiator', classIds: [48, 49] },
];

export interface BaseClassSpec {
  classId: number;
  name: string;
  thaiName: string;
  evolution: string;
  role: string;
  roleEn: string;
  description: string;
  descriptionEn: string;
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
  unlockRequirementEn: string;
}

// Exact base stats from server/MuServer/MySQL/DB/CreateDatabase.sql (DefaultClassType)
export const PLAYABLE_BASE_CLASSES: BaseClassSpec[] = [
  {
    classId: 16,
    name: 'Dark Knight',
    thaiName: 'นักรบอัศวิน',
    evolution: 'Blade Knight',
    role: 'โจมตีระยะประชิด · แนวหน้า',
    roleEn: 'Melee Vanguard · Frontline',
    description:
      'นักรบเกราะหนักผู้เชี่ยวชาญดาบคู่และหอก มีพลังชีวิตและพลังป้องกันสูงสุด เหมาะสำหรับเปิดแนวปะทะและสู้บอสใน Blood Castle',
    descriptionEn:
      'Heavy-armored warrior mastering dual blades and spears with the highest vitality and defense, built to lead frontline battles and Blood Castle raids.',
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
    unlockRequirementEn: 'Available immediately at Level 1',
  },
  {
    classId: 0,
    name: 'Dark Wizard',
    thaiName: 'จอมเวทมนตร์ดำ',
    evolution: 'Soul Master',
    role: 'เวทมนตร์วงกว้าง · เก็บเลเวลเร็ว',
    roleEn: 'Arcane AoE · Fast Leveling',
    description:
      'ผู้ใช้ศาสตร์เวทโบราณอย่าง Evil Spirit และ Teleport กวาดมอนสเตอร์เป็นวงกว้างใน Devil Square และสนับสนุนทีมด้วย Mana Shield',
    descriptionEn:
      'Master of ancient spells like Evil Spirit and Teleport, clearing entire Devil Square waves while shielding allies with Mana Shield.',
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
    unlockRequirementEn: 'Available immediately at Level 1',
  },
  {
    classId: 32,
    name: 'Fairy Elf',
    thaiName: 'เอลฟ์ธนูศักดิ์สิทธิ์',
    evolution: 'Muse Elf',
    role: 'ยิงไกล · บัฟโจมตีและป้องกัน',
    roleEn: 'Ranged Archer · Party Support',
    description:
      'ผู้พิทักษ์แห่งป่า Noria เลือกเล่นได้ทั้งสาย Agility ยิงธนูรัว หรือสาย Energy บัฟเพิ่มพลังโจมตี ป้องกัน และฮีลให้ปาร์ตี้',
    descriptionEn:
      'Guardian of Noria forest. Specialize in rapid-fire Agility archery or Energy support buffs that boost party attack, defense, and healing.',
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
    unlockRequirementEn: 'Available immediately at Level 1',
  },
  {
    classId: 48,
    name: 'Magic Gladiator',
    thaiName: 'อัศวินเวทมนตร์',
    evolution: 'Duel Master',
    role: 'ไฮบริดดาบและเวท · แต้มอัพ 7/เลเวล',
    roleEn: 'Blade & Spell Hybrid · 7 pts/lv',
    description:
      'อาชีพพิเศษสายผสมผสานระหว่างดาบกับเวทมนตร์ สวมชุดเกราะได้หลากหลายและได้รับแต้มสเตตัสต่อเลเวลมากกว่าอาชีพปกติ',
    descriptionEn:
      'Special hybrid class combining sword skills and wizard magic, equipping diverse armor sets while earning 7 stat points per level.',
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
    unlockRequirementEn: 'Unlocks when an account reaches Level 220',
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
  zoneEn: string;
}

// Exact warp entries from server/MuServer/Data/Move/Move.txt
export const MOVE_GATES: MoveGate[] = [
  { index: 2, name: 'Lorencia', zen: 1000, minLevel: 10, gate: 17, zone: 'เมืองเริ่มต้น', zoneEn: 'Starting Continent & Trade Hub' },
  { index: 3, name: 'Noria', zen: 1000, minLevel: 10, gate: 27, zone: 'เมืองเอลฟ์ & Chaos Machine', zoneEn: 'Elven Village & Chaos Machine' },
  { index: 4, name: 'Devias', zen: 1500, minLevel: 20, gate: 22, zone: 'เมืองหิมะ & เปลี่ยนอาชีพ', zoneEn: 'Snowy Town & 2nd Class Quest' },
  { index: 5, name: 'Devias2', zen: 2000, minLevel: 20, gate: 72, zone: 'ปราสาทน้ำแข็ง', zoneEn: 'Ice Castle' },
  { index: 6, name: 'Devias3', zen: 2500, minLevel: 20, gate: 73, zone: 'หอคอยหิมะ', zoneEn: 'Snowy Fortress' },
  { index: 7, name: 'Devias4', zen: 2500, minLevel: 20, gate: 74, zone: 'ลานน้ำแข็งเหนือ', zoneEn: 'Northern Frost Plains' },
  { index: 8, name: 'Dungeon', zen: 3000, minLevel: 30, gate: 2, zone: 'ดันเจี้ยนชั้น 1', zoneEn: 'Underground Dungeon Floor 1' },
  { index: 9, name: 'Dungeon2', zen: 3000, minLevel: 40, gate: 6, zone: 'ดันเจี้ยนชั้น 2', zoneEn: 'Underground Dungeon Floor 2' },
  { index: 10, name: 'Dungeon3', zen: 3500, minLevel: 50, gate: 10, zone: 'ดันเจี้ยนชั้น 3 (Gorgon)', zoneEn: 'Dungeon Floor 3 (Gorgon)' },
  { index: 14, name: 'LostTower', zen: 5000, minLevel: 50, gate: 42, zone: 'หอคอยชั้น 1', zoneEn: 'Lost Tower Floor 1' },
  { index: 15, name: 'LostTower2', zen: 5000, minLevel: 50, gate: 31, zone: 'หอคอยชั้น 2', zoneEn: 'Lost Tower Floor 2' },
  { index: 16, name: 'LostTower3', zen: 5500, minLevel: 50, gate: 33, zone: 'หอคอยชั้น 3', zoneEn: 'Lost Tower Floor 3' },
  { index: 17, name: 'LostTower4', zen: 5500, minLevel: 60, gate: 35, zone: 'หอคอยชั้น 4', zoneEn: 'Lost Tower Floor 4' },
  { index: 18, name: 'LostTower5', zen: 5500, minLevel: 60, gate: 37, zone: 'หอคอยชั้น 5', zoneEn: 'Lost Tower Floor 5' },
  { index: 19, name: 'LostTower6', zen: 6000, minLevel: 70, gate: 39, zone: 'หอคอยชั้น 6', zoneEn: 'Lost Tower Floor 6' },
  { index: 20, name: 'LostTower7', zen: 6500, minLevel: 70, gate: 41, zone: 'หอคอยชั้น 7 (Balrog)', zoneEn: 'Lost Tower Floor 7 (Balrog)' },
  { index: 11, name: 'Atlans', zen: 4000, minLevel: 70, gate: 49, zone: 'นครใต้น้ำชั้น 1', zoneEn: 'Underwater City Zone 1' },
  { index: 12, name: 'Atlans2', zen: 4500, minLevel: 80, gate: 75, zone: 'นครใต้น้ำชั้น 2', zoneEn: 'Underwater City Zone 2' },
  { index: 13, name: 'Atlans3', zen: 5000, minLevel: 90, gate: 76, zone: 'นครใต้น้ำชั้น 3 (Hydra)', zoneEn: 'Underwater City Zone 3 (Hydra)' },
  { index: 21, name: 'Tarkan', zen: 8000, minLevel: 140, gate: 57, zone: 'ทะเลทรายทาร์แคน 1', zoneEn: 'Tarkan Desert Zone 1' },
  { index: 22, name: 'Tarkan2', zen: 8500, minLevel: 140, gate: 77, zone: 'ทะเลทรายทาร์แคน 2 (Zaikan)', zoneEn: 'Tarkan Desert Zone 2 (Zaikan)' },
  { index: 23, name: 'Icarus', zen: 9000, minLevel: 170, gate: 63, zone: 'วิหารลอยฟ้า (ต้องใส่ปีก/Dinorant)', zoneEn: 'Sky Temple (Requires Wings or Dinorant)' },
  { index: 1, name: 'Stadium', zen: 3000, minLevel: 255, gate: 50, zone: 'สนามประลอง & ฟาร์ม Arena', zoneEn: 'Battle Arena & High-Level Spots' },
];

export type CommandCategoryId = 'movement' | 'stats' | 'character' | 'guild';

export interface PlayerCommandSpec {
  command: string;
  syntax: string;
  syntaxEn: string;
  categoryId: CommandCategoryId;
  category: 'การเคลื่อนที่และสื่อสาร' | 'สเตตัสและรีเซ็ต' | 'ตัวละครและคลัง' | 'กิลด์และระบบ';
  categoryEn: 'Movement & Chat' | 'Stats & Reset' | 'Character & Vault' | 'Guild & System';
  description: string;
  descriptionEn: string;
}

// Exact player commands (GameMaster=0) from server/MuServer/Data/Command.txt
export const PLAYER_COMMANDS: PlayerCommandSpec[] = [
  {
    command: '/move',
    syntax: '/move <MapName>',
    syntaxEn: '/move <MapName>',
    categoryId: 'movement',
    category: 'การเคลื่อนที่และสื่อสาร',
    categoryEn: 'Movement & Chat',
    description: 'วาร์ปไปยังแผนที่ที่กำหนดตามตาราง Move.txt',
    descriptionEn: 'Warp to any unlocked map defined in Move.txt.',
  },
  {
    command: '/post',
    syntax: '/post <ข้อความ>',
    syntaxEn: '/post <Message>',
    categoryId: 'movement',
    category: 'การเคลื่อนที่และสื่อสาร',
    categoryEn: 'Movement & Chat',
    description: 'ประกาศข้อความสีทองถึงผู้เล่นทั้งเซิร์ฟเวอร์ (Global Post)',
    descriptionEn: 'Broadcast a gold global chat message to the entire server.',
  },
  {
    command: '/str',
    syntax: '/str <จำนวน>',
    syntaxEn: '/str <Points>',
    categoryId: 'stats',
    category: 'สเตตัสและรีเซ็ต',
    categoryEn: 'Stats & Reset',
    description: 'เพิ่มแต้ม Strength แบบรวดเร็วในเกม (สูงสุด 32,767)',
    descriptionEn: 'Quickly add Strength stat points in-game (max 32,767).',
  },
  {
    command: '/agi',
    syntax: '/agi <จำนวน>',
    syntaxEn: '/agi <Points>',
    categoryId: 'stats',
    category: 'สเตตัสและรีเซ็ต',
    categoryEn: 'Stats & Reset',
    description: 'เพิ่มแต้ม Dexterity / Agility แบบรวดเร็วในเกม',
    descriptionEn: 'Quickly add Dexterity / Agility stat points in-game.',
  },
  {
    command: '/vit',
    syntax: '/vit <จำนวน>',
    syntaxEn: '/vit <Points>',
    categoryId: 'stats',
    category: 'สเตตัสและรีเซ็ต',
    categoryEn: 'Stats & Reset',
    description: 'เพิ่มแต้ม Vitality แบบรวดเร็วในเกม',
    descriptionEn: 'Quickly add Vitality stat points in-game.',
  },
  {
    command: '/ene',
    syntax: '/ene <จำนวน>',
    syntaxEn: '/ene <Points>',
    categoryId: 'stats',
    category: 'สเตตัสและรีเซ็ต',
    categoryEn: 'Stats & Reset',
    description: 'เพิ่มแต้ม Energy แบบรวดเร็วในเกม',
    descriptionEn: 'Quickly add Energy stat points in-game.',
  },
  {
    command: '/reset',
    syntax: '/reset [Auto] [Str] [Agi] [Vit] [Ene]',
    syntaxEn: '/reset [Auto] [Str] [Agi] [Vit] [Ene]',
    categoryId: 'stats',
    category: 'สเตตัสและรีเซ็ต',
    categoryEn: 'Stats & Reset',
    description: 'รีเซ็ตตัวละครที่เลเวล 400 (รองรับ Auto Reset และอัพสเตตัสอัตโนมัติ)',
    descriptionEn: 'Reset your character at Level 400 (supports Auto Reset and auto stat allocation).',
  },
  {
    command: '/grandreset',
    syntax: '/grandreset',
    syntaxEn: '/grandreset',
    categoryId: 'stats',
    category: 'สเตตัสและรีเซ็ต',
    categoryEn: 'Stats & Reset',
    description: 'ทำ Grand Reset เพื่อสะสมอันดับและรับโบนัสระดับสูง',
    descriptionEn: 'Perform a Grand Reset to climb rankings and earn prestige bonuses.',
  },
  {
    command: '/pkclear',
    syntax: '/pkclear',
    syntaxEn: '/pkclear',
    categoryId: 'character',
    category: 'ตัวละครและคลัง',
    categoryEn: 'Character & Vault',
    description: 'ล้างค่าหัวแดง (PK Level) กลับสู่สถานะผู้เล่นปกติ',
    descriptionEn: 'Clear your PK status and return to Commoner.',
  },
  {
    command: '/evo',
    syntax: '/evo',
    syntaxEn: '/evo',
    categoryId: 'character',
    category: 'ตัวละครและคลัง',
    categoryEn: 'Character & Vault',
    description: 'เปลี่ยนอาชีพขั้น 2 (Soul Master / Blade Knight / Muse Elf)',
    descriptionEn: 'Evolve to 2nd Class (Soul Master / Blade Knight / Muse Elf).',
  },
  {
    command: '/ware',
    syntax: '/ware <หมายเลขคลัง>',
    syntaxEn: '/ware <VaultNumber>',
    categoryId: 'character',
    category: 'ตัวละครและคลัง',
    categoryEn: 'Character & Vault',
    description: 'สลับคลังเก็บของเสริม (ExtWarehouse)',
    descriptionEn: 'Switch between extra warehouse vaults (ExtWarehouse).',
  },
  {
    command: '/clearinv',
    syntax: '/clearinv',
    syntaxEn: '/clearinv',
    categoryId: 'character',
    category: 'ตัวละครและคลัง',
    categoryEn: 'Character & Vault',
    description: 'ล้างไอเทมทั้งหมดในกระเป๋าตัวละคร (ควรเก็บของสำคัญก่อนใช้)',
    descriptionEn: 'Clear all items in your character inventory (store valuables first).',
  },
  {
    command: '/skin',
    syntax: '/skin <รหัสมอนสเตอร์>',
    syntaxEn: '/skin <MonsterID>',
    categoryId: 'character',
    category: 'ตัวละครและคลัง',
    categoryEn: 'Character & Vault',
    description: 'เปลี่ยนรูปลักษณ์ตัวละครเป็นมอนสเตอร์ตามรหัส',
    descriptionEn: 'Transform your character appearance into a monster ID.',
  },
  {
    command: '/onlines',
    syntax: '/onlines',
    syntaxEn: '/onlines',
    categoryId: 'guild',
    category: 'กิลด์และระบบ',
    categoryEn: 'Guild & System',
    description: 'ตรวจสอบจำนวนผู้เล่นออนไลน์ในเซิร์ฟเวอร์ขณะนั้น',
    descriptionEn: 'Display the current number of online players on the server.',
  },
  {
    command: '/war',
    syntax: '/war <ชื่อกิลด์>',
    syntaxEn: '/war <GuildName>',
    categoryId: 'guild',
    category: 'กิลด์และระบบ',
    categoryEn: 'Guild & System',
    description: 'ท้าทายสงครามกิลด์ (Guild War)',
    descriptionEn: 'Challenge another guild to a Guild War.',
  },
  {
    command: '/soccer',
    syntax: '/soccer <ชื่อกิลด์>',
    syntaxEn: '/soccer <GuildName>',
    categoryId: 'guild',
    category: 'กิลด์และระบบ',
    categoryEn: 'Guild & System',
    description: 'ท้าทายการแข่งขัน Battle Soccer ในสนาม Arena',
    descriptionEn: 'Challenge a rival guild to Battle Soccer in the Arena.',
  },
  {
    command: '/re',
    syntax: '/re <ON|OFF|AUTO>',
    syntaxEn: '/re <ON|OFF|AUTO>',
    categoryId: 'guild',
    category: 'กิลด์และระบบ',
    categoryEn: 'Guild & System',
    description: 'ตั้งค่าการรับคำขอเทรด ปาร์ตี้ หรือกิลด์ (เปิด / ปิด / อัตโนมัติ)',
    descriptionEn: 'Configure incoming trade, party, and guild requests (ON / OFF / AUTO).',
  },
];

export interface EventScheduleSpec {
  id: string;
  name: string;
  category: 'ดันเจี้ยนกิจกรรม' | 'บอสบุกเมือง' | 'กิจกรรมพิเศษ';
  categoryEn: 'Event Dungeon' | 'Boss Invasion' | 'Special Event';
  scheduleTimes: string[]; // HH:MM in server time
  warningMinutes: number;
  durationMinutes: number;
  maps: string;
  mapsEn: string;
  rewardSummary: string;
  rewardSummaryEn: string;
  sourceFile: string;
}

// Exact schedules from BloodCastle.dat, DevilSquare.dat, GoldenArcherBingo.dat, Invasions.toml
export const EVENT_SCHEDULES: EventScheduleSpec[] = [
  {
    id: 'blood-castle',
    name: 'Blood Castle',
    category: 'ดันเจี้ยนกิจกรรม',
    categoryEn: 'Event Dungeon',
    scheduleTimes: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    warningMinutes: 5,
    durationMinutes: 5,
    maps: 'Devias (Archangel) → Blood Castle 1–6',
    mapsEn: 'Devias (Archangel) → Blood Castle 1–6',
    rewardSummary: 'EXP โบนัส + Jewel of Chaos / Bless + คะแนน RankingBloodCastle',
    rewardSummaryEn: 'Bonus EXP + Jewel of Chaos / Bless + Blood Castle Ranking Points',
    sourceFile: 'Data/Event/BloodCastle.dat',
  },
  {
    id: 'devil-square',
    name: 'Devil Square',
    category: 'ดันเจี้ยนกิจกรรม',
    categoryEn: 'Event Dungeon',
    scheduleTimes: ['00:30', '04:30', '08:30', '12:30', '16:30', '20:30'],
    warningMinutes: 5,
    durationMinutes: 5,
    maps: 'Noria (Charon) → Devil Square 1–4',
    mapsEn: 'Noria (Charon) → Devil Square 1–4',
    rewardSummary: 'EXP สูงสุด + Zen + คะแนน RankingDevilSquare',
    rewardSummaryEn: 'Maximum EXP + Zen + Devil Square Ranking Points',
    sourceFile: 'Data/Event/DevilSquare.dat',
  },
  {
    id: 'tamachan',
    name: 'Tamachan Invasion',
    category: 'บอสบุกเมือง',
    categoryEn: 'Boss Invasion',
    scheduleTimes: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    warningMinutes: 0,
    durationMinutes: 5,
    maps: 'สุ่มเกิดตามจุด Spawns.toml',
    mapsEn: 'Random spawn coordinates (Spawns.toml)',
    rewardSummary: 'ดรอปไอเทมกิจกรรมพิเศษประจำรอบ',
    rewardSummaryEn: 'Special seasonal invasion drops',
    sourceFile: 'Data/Events/Invasions/Invasions.toml',
  },
  {
    id: 'death-king',
    name: 'Death King Invasion',
    category: 'บอสบุกเมือง',
    categoryEn: 'Boss Invasion',
    scheduleTimes: ['14:50'],
    warningMinutes: 5,
    durationMinutes: 10,
    maps: 'Lorencia, Noria',
    mapsEn: 'Lorencia, Noria',
    rewardSummary: 'บอส Death King (ID 55) และกองทัพโครงกระดูก',
    rewardSummaryEn: 'Death King Boss (ID 55) & Skeleton Legion drops',
    sourceFile: 'Data/Events/Invasions/Invasions.toml',
  },
  {
    id: 'golden-invasion',
    name: 'Golden Invasion',
    category: 'บอสบุกเมือง',
    categoryEn: 'Boss Invasion',
    scheduleTimes: ['14:58'],
    warningMinutes: 5,
    durationMinutes: 10,
    maps: 'Lorencia, Devias, Noria, Lost Tower, Atlans, Tarkan',
    mapsEn: 'Lorencia, Devias, Noria, Lost Tower, Atlans, Tarkan',
    rewardSummary: 'มอนสเตอร์ทองคำ ดรอป Box of Kundun +1 ถึง +5',
    rewardSummaryEn: 'Golden Monsters dropping Box of Kundun +1 to +5',
    sourceFile: 'Data/Events/Invasions/Invasions.toml',
  },
  {
    id: 'red-dragon',
    name: 'Red Dragon Invasion',
    category: 'บอสบุกเมือง',
    categoryEn: 'Boss Invasion',
    scheduleTimes: ['19:35'],
    warningMinutes: 5,
    durationMinutes: 10,
    maps: 'Lorencia, Devias',
    mapsEn: 'Lorencia, Devias',
    rewardSummary: 'มังกรแดง Red Dragon (ID 42) ดรอป Jewel และไอเทมหายาก',
    rewardSummaryEn: 'Red Dragon (ID 42) dropping Jewels and rare items',
    sourceFile: 'Data/Events/Invasions/Invasions.toml',
  },
  {
    id: 'golden-archer-bingo',
    name: 'Golden Archer Bingo',
    category: 'กิจกรรมพิเศษ',
    categoryEn: 'Special Event',
    scheduleTimes: ['22:31'],
    warningMinutes: 5,
    durationMinutes: 5,
    maps: 'Tarkan (พิกัด 242, 52)',
    mapsEn: 'Tarkan (Coords 242, 52)',
    rewardSummary: 'แลก Rena / Stone และลุ้น LuckyNumber จาก GoldenArcherCoin',
    rewardSummaryEn: 'Exchange Rena / Stone and draw LuckyNumber rewards',
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
  maxItemOptionEn: '+16 (4 Jewel of Life tiers)',
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
    {
      key: 'MoveCheck=2',
      detail: 'ตรวจสอบเส้นทางการเดินและกำแพงฝั่งเซิร์ฟเวอร์ (Tolerance 4 ช่อง)',
      detailEn: 'Server-side movement path and wall validation (4-tile tolerance).',
    },
    {
      key: 'AttackCheck=2',
      detail: 'คำนวณความเร็วการโจมตีเทียบ PhysiSpeed ป้องกัน Speed/Hit Hack',
      detailEn: 'Validates attack cadence against PhysiSpeed to prevent speed/hit hacks.',
    },
    {
      key: 'CheckAutoPotionHack=1',
      detail: 'ตรวจจับการปั๊มยาอัตโนมัติที่เร็วกว่ามนุษย์ (< 75ms)',
      detailEn: 'Detects inhuman auto-potion macro intervals (< 75ms).',
    },
    {
      key: 'PacketRateCheck=1',
      detail: 'จำกัดแพ็กเก็ตไม่เกิน 60 แพ็กเก็ต/วินาทีต่อการเชื่อมต่อ',
      detailEn: 'Caps client traffic at 60 packets/second per connection.',
    },
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
  published?: boolean;
  createdAt: string;
}

export interface DownloadItem {
  id: string;
  platform: string;
  title: string;
  renderer: string;
  version: string;
  size: string;
  url: string;
  highlights: string[];
  published: boolean;
  updatedAt: string;
}

export interface AdminSessionInfo {
  username: string;
  authSource: 'web_admins' | 'server_env' | 'gm_account';
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

export function getPkLabel(pkLevel: number, lang: PortalLang = 'th'): string {
  if (lang === 'en') {
    if (pkLevel <= 1) return 'Hero';
    if (pkLevel === 2) return 'Guardian';
    if (pkLevel === 3) return 'Commoner';
    if (pkLevel === 4) return 'Outlaw Lv.1';
    if (pkLevel === 5) return 'Outlaw Lv.2';
    return 'Phonomania (PK)';
  }
  if (pkLevel <= 1) return 'Hero (วีรบุรุษ)';
  if (pkLevel === 2) return 'Guardian';
  if (pkLevel === 3) return 'ปกติ (Commoner)';
  if (pkLevel === 4) return 'PK ขั้น 1';
  if (pkLevel === 5) return 'PK ขั้น 2';
  return 'Phonomania (หัวแดง)';
}

export function getAccountTierLabel(accountLevel: number, lang: PortalLang = 'th'): string {
  switch (accountLevel) {
    case 1:
      return 'VIP Bronze (AL1)';
    case 2:
      return 'VIP Silver (AL2)';
    case 3:
      return 'VIP Gold (AL3)';
    default:
      return lang === 'en' ? 'Standard Account (AL0)' : 'บัญชีทั่วไป (AL0)';
  }
}
