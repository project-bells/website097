import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import net from 'node:net';
import mysql, { type Pool, type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';
import {
  PLAYABLE_BASE_CLASSES,
  SERVER_CONFIG_SPECS,
  getClassName,
  getMapName,
  type AccountProfile,
  type CharacterRecord,
  type EventRankingRow,
  type NewsItem,
  type RankingCharacterRow,
  type RankingGuildRow,
  type ServerOverview,
} from '../src/shared/muData.ts';

const BCRYPT_COST = 10;
const COOLDOWN_MINUTES = Math.max(1, Number.parseInt(process.env.ACTION_COOLDOWN_MINUTES || '3', 10) || 3);
const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;

interface MembInfoRow {
  memb___id: string;
  memb__pwd: Buffer;
  memb_name: string;
  mail_addr: string;
  sno__numb: string;
  AccountLevel: number;
  bloc_code: string;
}

interface MembStatRow {
  memb___id: string;
  ConnectStat: number;
  ServerName: string;
  OnlineHours: number;
}

interface AccountCharacterRow {
  Id: string;
  GameID1: string | null;
  GameID2: string | null;
  GameID3: string | null;
  GameID4: string | null;
  GameID5: string | null;
  GameIDC: string | null;
}

interface RawCharacterRow {
  AccountID: string;
  Name: string;
  Class: number;
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
  MapPosX: number;
  MapPosY: number;
  PkCount: number;
  PkLevel: number;
  PkTime: number;
  CtlCode: number;
  Inventory: Buffer;
}

interface RawGuildRow {
  G_Name: string;
  G_Score: number;
  G_Master: string;
  G_Notice: string;
}

interface RawGuildMemberRow {
  Name: string;
  G_Name: string;
  G_Status: number;
}

interface RawGoldenArcherRow {
  AccountID: string;
  Renas: number;
  Stones: number;
  LuckyNumber: string | null;
}

function isBcryptHash(buf: Buffer): boolean {
  const text = buf.toString('latin1');
  return /^\$2[aby]\$\d\d\$[./A-Za-z0-9]{53}$/.test(text);
}

function countInventoryItems(inv: Buffer | null | undefined): number {
  if (!inv || inv.length < 10) return 0;
  let occupied = 0;
  const totalSlots = Math.floor(inv.length / 10);
  for (let i = 0; i < totalSlots; i++) {
    if (inv[i * 10] !== 0xff) {
      occupied++;
    }
  }
  return occupied;
}

async function probeTcpPort(host: string, port: number, timeoutMs = 450): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const finish = (ok: boolean) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(ok);
      }
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

class MuRepository {
  private pool: Pool | null = null;
  private mode: 'mysql-live' | 'unconfigured' = 'unconfigured';
  private initialized = false;
  private dbName = process.env.DB_NAME || 'MuOnline97';

  // Clean empty in-memory tables (zero temporary/mock seed records) used only until DB_HOST is configured
  private membInfo = new Map<string, MembInfoRow>();
  private membStat = new Map<string, MembStatRow>();
  private accountChars = new Map<string, AccountCharacterRow>();
  private characters = new Map<string, RawCharacterRow>();
  private guilds = new Map<string, RawGuildRow>();
  private guildMembers = new Map<string, RawGuildMemberRow>();
  private rankingBC = new Map<string, number>();
  private rankingDS = new Map<string, number>();
  private goldenArcher = new Map<string, RawGoldenArcherRow>();
  private cooldowns = new Map<string, number>();
  private news: NewsItem[] = [];

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    const host = (process.env.DB_HOST || '').trim();
    if (host) {
      try {
        const pool = mysql.createPool({
          host,
          port: Number.parseInt(process.env.DB_PORT || '3306', 10) || 3306,
          user: process.env.DB_USER || 'admin',
          password: process.env.DB_PASS || '',
          database: this.dbName,
          waitForConnections: true,
          connectionLimit: 10,
          connectTimeout: 2500,
        });
        await pool.query('SELECT 1');
        await pool.query(`
          CREATE TABLE IF NOT EXISTS web_action_cooldown (
            account_id VARCHAR(10) NOT NULL,
            char_name VARCHAR(40) NOT NULL,
            action VARCHAR(32) NOT NULL,
            last_used DATETIME NOT NULL,
            PRIMARY KEY (account_id, char_name, action)
          )
        `);
        this.pool = pool;
        this.mode = 'mysql-live';
        console.log(`[MuOrigins] Connected to live MySQL MuOnline97 at ${host}`);
        return;
      } catch (err) {
        console.warn('[MuOrigins] MySQL connection unavailable:', (err as Error).message);
      }
    }

    this.mode = 'unconfigured';
  }

  getMode(): 'mysql-live' | 'unconfigured' {
    return this.mode;
  }

  async getOverview(): Promise<ServerOverview> {
    await this.init();
    const csHost = process.env.CS_HOST || '127.0.0.1';
    const csPort = Number.parseInt(process.env.CS_PORT || String(SERVER_CONFIG_SPECS.connectServerPort), 10);
    const gsHost = process.env.GS_HOST || '127.0.0.1';
    const gsPort = Number.parseInt(process.env.GS_PORT || String(SERVER_CONFIG_SPECS.gameServerPort), 10);

    const [csReachable, gsReachable] = await Promise.all([
      probeTcpPort(csHost, csPort),
      probeTcpPort(gsHost, gsPort),
    ]);

    if (this.mode === 'mysql-live' && this.pool) {
      const [[onlineRow]] = await this.pool.query<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM MEMB_STAT WHERE ConnectStat = 1');
      const [[accRow]] = await this.pool.query<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM MEMB_INFO');
      const [[charRow]] = await this.pool.query<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM `Character`');
      const [[guildRow]] = await this.pool.query<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM Guild');
      const topPlayers = await this.getCharacterRankings('resets', undefined, undefined, 5);
      const news = await this.getNews();

      return {
        connectionMode: 'mysql-live',
        databaseName: this.dbName,
        connectServer: { host: csHost, port: csPort, reachable: csReachable },
        gameServer: { host: gsHost, port: gsPort, reachable: gsReachable },
        stats: {
          onlinePlayers: Number(onlineRow?.cnt || 0),
          totalAccounts: Number(accRow?.cnt || 0),
          totalCharacters: Number(charRow?.cnt || 0),
          totalGuilds: Number(guildRow?.cnt || 0),
        },
        topPlayers,
        news: news.slice(0, 3),
        serverTimeIso: new Date().toISOString(),
      };
    }

    let onlinePlayers = 0;
    for (const st of this.membStat.values()) {
      if (st.ConnectStat === 1) onlinePlayers++;
    }
    const topPlayers = await this.getCharacterRankings('resets', undefined, undefined, 5);

    return {
      connectionMode: 'unconfigured',
      databaseName: this.dbName,
      connectServer: { host: csHost, port: csPort, reachable: csReachable },
      gameServer: { host: gsHost, port: gsPort, reachable: gsReachable },
      stats: {
        onlinePlayers,
        totalAccounts: this.membInfo.size,
        totalCharacters: this.characters.size,
        totalGuilds: this.guilds.size,
      },
      topPlayers,
      news: this.news.slice(0, 3),
      serverTimeIso: new Date().toISOString(),
    };
  }

  async getNews(): Promise<NewsItem[]> {
    await this.init();
    if (this.mode === 'mysql-live' && this.pool) {
      try {
        const [rows] = await this.pool.query<RowDataPacket[]>(
          'SELECT id, title, body, created_at FROM web_news WHERE published = 1 ORDER BY created_at DESC LIMIT 20'
        );
        return rows.map((r) => {
          const plain = String(r.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          return {
            id: Number(r.id),
            title: String(r.title || ''),
            category: 'ประกาศเซิร์ฟเวอร์',
            excerpt: plain.length > 180 ? `${plain.slice(0, 180)}...` : plain,
            body: plain,
            createdAt: new Date(r.created_at).toISOString(),
          };
        });
      } catch {
        return [];
      }
    }
    return this.news;
  }

  async getCharacterRankings(
    type: 'level' | 'resets' | 'gr',
    classIds?: number[],
    search?: string,
    limit = 100
  ): Promise<RankingCharacterRow[]> {
    await this.init();
    if (this.mode === 'mysql-live' && this.pool) {
      let orderBy = 'c.cLevel DESC, c.ResetCount DESC, c.GrandResetCount DESC, c.Experience DESC';
      if (type === 'resets') {
        orderBy = 'c.ResetCount DESC, c.GrandResetCount DESC, c.cLevel DESC, c.Experience DESC';
      } else if (type === 'gr') {
        orderBy = 'c.GrandResetCount DESC, c.ResetCount DESC, c.cLevel DESC, c.Experience DESC';
      }

      const conditions: string[] = ['c.CtlCode < 8'];
      const params: unknown[] = [];

      if (classIds && classIds.length > 0) {
        conditions.push(`c.Class IN (${classIds.map(() => '?').join(',')})`);
        params.push(...classIds);
      }
      if (search && search.trim()) {
        conditions.push('c.Name LIKE ?');
        params.push(`%${search.trim()}%`);
      }

      const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT c.Name, c.Class, c.cLevel, c.ResetCount, c.GrandResetCount, c.MapNumber, c.PkLevel,
                gm.G_Name AS GuildName,
                COALESCE(ms.ConnectStat, 0) AS ConnectStat,
                ac.GameIDC
         FROM \`Character\` c
         LEFT JOIN GuildMember gm ON gm.Name = c.Name
         LEFT JOIN MEMB_STAT ms ON ms.memb___id = c.AccountID
         LEFT JOIN AccountCharacter ac ON ac.Id = c.AccountID
         ${whereSql}
         ORDER BY ${orderBy}
         LIMIT ?`,
        [...params, limit]
      );

      return rows.map((r) => ({
        Name: String(r.Name),
        Class: Number(r.Class),
        ClassName: getClassName(Number(r.Class)),
        cLevel: Number(r.cLevel),
        ResetCount: Number(r.ResetCount),
        GrandResetCount: Number(r.GrandResetCount),
        MapNumber: Number(r.MapNumber ?? 0),
        MapName: getMapName(Number(r.MapNumber ?? 0)),
        GuildName: r.GuildName ? String(r.GuildName) : null,
        IsOnline: Number(r.ConnectStat) === 1 && String(r.GameIDC || '').toLowerCase() === String(r.Name).toLowerCase(),
        PkLevel: Number(r.PkLevel ?? 3),
      }));
    }

    let list = Array.from(this.characters.values()).filter((c) => c.CtlCode < 8);
    if (classIds && classIds.length > 0) {
      const set = new Set(classIds);
      list = list.filter((c) => set.has(c.Class));
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.Name.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (type === 'gr') {
        return b.GrandResetCount - a.GrandResetCount || b.ResetCount - a.ResetCount || b.cLevel - a.cLevel;
      }
      if (type === 'resets') {
        return b.ResetCount - a.ResetCount || b.GrandResetCount - a.GrandResetCount || b.cLevel - a.cLevel;
      }
      return b.cLevel - a.cLevel || b.ResetCount - a.ResetCount || b.GrandResetCount - a.GrandResetCount;
    });

    return list.slice(0, limit).map((c) => {
      const st = this.membStat.get(c.AccountID.toLowerCase());
      const ac = this.accountChars.get(c.AccountID.toLowerCase());
      const gm = this.guildMembers.get(c.Name.toLowerCase());
      return {
        Name: c.Name,
        Class: c.Class,
        ClassName: getClassName(c.Class),
        cLevel: c.cLevel,
        ResetCount: c.ResetCount,
        GrandResetCount: c.GrandResetCount,
        MapNumber: c.MapNumber,
        MapName: getMapName(c.MapNumber),
        GuildName: gm?.G_Name ?? null,
        IsOnline: st?.ConnectStat === 1 && ac?.GameIDC?.toLowerCase() === c.Name.toLowerCase(),
        PkLevel: c.PkLevel,
      };
    });
  }

  async getGuildRankings(search?: string): Promise<RankingGuildRow[]> {
    await this.init();
    if (this.mode === 'mysql-live' && this.pool) {
      const params: unknown[] = [];
      let whereSql = '';
      if (search && search.trim()) {
        whereSql = 'WHERE G.G_Name LIKE ? OR G.G_Master LIKE ?';
        params.push(`%${search.trim()}%`, `%${search.trim()}%`);
      }
      const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT G.G_Name AS GuildName,
                COALESCE(G.G_Score, 0) AS GuildScore,
                G.G_Master AS GuildMaster,
                COALESCE(G.G_Notice, '') AS Notice,
                COUNT(M.Name) AS Members,
                COALESCE(ms.ConnectStat, 0) AS ConnectStat,
                ac.GameIDC
         FROM Guild G
         LEFT JOIN GuildMember M ON M.G_Name = G.G_Name
         LEFT JOIN \`Character\` c ON c.Name = G.G_Master
         LEFT JOIN MEMB_STAT ms ON ms.memb___id = c.AccountID
         LEFT JOIN AccountCharacter ac ON ac.Id = c.AccountID
         ${whereSql}
         GROUP BY G.G_Name, G.G_Score, G.G_Master, G.G_Notice, ms.ConnectStat, ac.GameIDC
         ORDER BY GuildScore DESC, Members DESC, G.G_Name ASC
         LIMIT 100`,
        params
      );
      return rows.map((r) => ({
        GuildName: String(r.GuildName),
        GuildScore: Number(r.GuildScore),
        GuildMaster: String(r.GuildMaster || '-'),
        Members: Number(r.Members),
        Notice: String(r.Notice || ''),
        IsMasterOnline: Number(r.ConnectStat) === 1 && String(r.GameIDC || '').toLowerCase() === String(r.GuildMaster || '').toLowerCase(),
      }));
    }

    let list = Array.from(this.guilds.values());
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((g) => g.G_Name.toLowerCase().includes(q) || g.G_Master.toLowerCase().includes(q));
    }

    const memberCounts = new Map<string, number>();
    for (const m of this.guildMembers.values()) {
      const key = m.G_Name.toLowerCase();
      memberCounts.set(key, (memberCounts.get(key) ?? 0) + 1);
    }

    return list
      .map((g) => {
        const masterChar = this.characters.get(g.G_Master.toLowerCase());
        const st = masterChar ? this.membStat.get(masterChar.AccountID.toLowerCase()) : undefined;
        const ac = masterChar ? this.accountChars.get(masterChar.AccountID.toLowerCase()) : undefined;
        return {
          GuildName: g.G_Name,
          GuildScore: g.G_Score,
          GuildMaster: g.G_Master,
          Members: memberCounts.get(g.G_Name.toLowerCase()) ?? 1,
          Notice: g.G_Notice,
          IsMasterOnline: st?.ConnectStat === 1 && ac?.GameIDC?.toLowerCase() === g.G_Master.toLowerCase(),
        };
      })
      .sort((a, b) => b.GuildScore - a.GuildScore || b.Members - a.Members);
  }

  async getEventRankings(eventType: 'bc' | 'ds', search?: string): Promise<EventRankingRow[]> {
    await this.init();
    const table = eventType === 'bc' ? 'RankingBloodCastle' : 'RankingDevilSquare';

    if (this.mode === 'mysql-live' && this.pool) {
      const params: unknown[] = [];
      let whereSql = '';
      if (search && search.trim()) {
        whereSql = 'WHERE r.Name LIKE ?';
        params.push(`%${search.trim()}%`);
      }
      const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT r.Name, COALESCE(r.Score, 0) AS Score,
                COALESCE(c.Class, 0) AS Class,
                COALESCE(c.cLevel, 1) AS cLevel,
                COALESCE(c.ResetCount, 0) AS ResetCount,
                COALESCE(ms.ConnectStat, 0) AS ConnectStat,
                ac.GameIDC
         FROM ${table} r
         LEFT JOIN \`Character\` c ON c.Name = r.Name
         LEFT JOIN MEMB_STAT ms ON ms.memb___id = c.AccountID
         LEFT JOIN AccountCharacter ac ON ac.Id = c.AccountID
         ${whereSql}
         ORDER BY Score DESC, r.Name ASC
         LIMIT 100`,
        params
      );
      return rows.map((r) => ({
        Name: String(r.Name),
        Class: Number(r.Class),
        ClassName: getClassName(Number(r.Class)),
        cLevel: Number(r.cLevel),
        ResetCount: Number(r.ResetCount),
        Score: Number(r.Score),
        IsOnline: Number(r.ConnectStat) === 1 && String(r.GameIDC || '').toLowerCase() === String(r.Name).toLowerCase(),
      }));
    }

    const map = eventType === 'bc' ? this.rankingBC : this.rankingDS;
    let entries = Array.from(map.entries());
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      entries = entries.filter(([name]) => name.toLowerCase().includes(q));
    }

    return entries
      .map(([name, score]) => {
        const ch = this.characters.get(name.toLowerCase());
        const st = ch ? this.membStat.get(ch.AccountID.toLowerCase()) : undefined;
        const ac = ch ? this.accountChars.get(ch.AccountID.toLowerCase()) : undefined;
        return {
          Name: ch?.Name ?? name,
          Class: ch?.Class ?? 0,
          ClassName: getClassName(ch?.Class ?? 0),
          cLevel: ch?.cLevel ?? 1,
          ResetCount: ch?.ResetCount ?? 0,
          Score: score,
          IsOnline: st?.ConnectStat === 1 && ac?.GameIDC?.toLowerCase() === name.toLowerCase(),
        };
      })
      .sort((a, b) => b.Score - a.Score);
  }

  async registerAccount(input: {
    accountId: string;
    password: string;
    name: string;
    email: string;
    personalId: string;
  }): Promise<{ ok: true; accountId: string } | { ok: false; error: string }> {
    await this.init();
    const id = input.accountId.trim();
    const pwd = input.password;
    const name = (input.name || id).trim().slice(0, 10);
    const email = input.email.trim().slice(0, 50);
    const sno = (input.personalId || '111111111111111111').replace(/\D/g, '').padEnd(18, '1').slice(0, 18);

    if (!/^[A-Za-z0-9]{4,10}$/.test(id)) {
      return { ok: false, error: 'ชื่อบัญชี (memb___id) ต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลข 4–10 ตัวอักษร' };
    }
    if (pwd.length < 6 || pwd.length > 20) {
      return { ok: false, error: 'รหัสผ่านต้องมีความยาว 6–20 ตัวอักษร' };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'กรุณากรอกรูปแบบอีเมลให้ถูกต้อง' };
    }

    const hashBuf = Buffer.from(await bcrypt.hash(pwd, BCRYPT_COST), 'latin1');

    if (this.mode === 'mysql-live' && this.pool) {
      const [exists] = await this.pool.query<RowDataPacket[]>(
        'SELECT memb___id FROM MEMB_INFO WHERE memb___id = ? LIMIT 1',
        [id]
      );
      if (exists.length > 0) {
        return { ok: false, error: 'ชื่อบัญชีนี้ถูกใช้งานแล้วในฐานข้อมูล MuOnline97' };
      }

      await this.pool.query(
        `INSERT INTO MEMB_INFO (memb___id, memb__pwd, memb_name, mail_addr, sno__numb, AccountLevel, bloc_code)
         VALUES (?, ?, ?, ?, ?, 0, '0')`,
        [id, hashBuf, name, email, sno]
      );
      await this.pool.query(`INSERT IGNORE INTO AccountCharacter (Id) VALUES (?)`, [id]);
      await this.pool.query(
        `INSERT IGNORE INTO MEMB_STAT (memb___id, ConnectStat, ServerName, OnlineHours) VALUES (?, 0, 'Server 1', 0)`,
        [id]
      );
      return { ok: true, accountId: id };
    }

    if (this.membInfo.has(id.toLowerCase())) {
      return { ok: false, error: 'ชื่อบัญชีนี้มีผู้ใช้งานแล้ว กรุณาเลือกชื่อบัญชีอื่น' };
    }

    this.membInfo.set(id.toLowerCase(), {
      memb___id: id,
      memb__pwd: hashBuf,
      memb_name: name,
      mail_addr: email,
      sno__numb: sno,
      AccountLevel: 0,
      bloc_code: '0',
    });
    this.membStat.set(id.toLowerCase(), {
      memb___id: id,
      ConnectStat: 0,
      ServerName: 'Server 1',
      OnlineHours: 0,
    });
    this.accountChars.set(id.toLowerCase(), {
      Id: id,
      GameID1: null,
      GameID2: null,
      GameID3: null,
      GameID4: null,
      GameID5: null,
      GameIDC: null,
    });
    this.goldenArcher.set(id.toLowerCase(), {
      AccountID: id,
      Renas: 0,
      Stones: 0,
      LuckyNumber: null,
    });
    return { ok: true, accountId: id };
  }

  async verifyLogin(accountId: string, password: string): Promise<{ ok: true; accountId: string } | { ok: false; error: string }> {
    await this.init();
    const id = accountId.trim();
    if (!id || !password) {
      return { ok: false, error: 'กรุณากรอกชื่อบัญชีและรหัสผ่าน' };
    }

    if (this.mode === 'mysql-live' && this.pool) {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT memb___id, memb__pwd, bloc_code, (memb__pwd = UNHEX(MD5(?))) AS md5_match
         FROM MEMB_INFO WHERE memb___id = ? LIMIT 1`,
        [password, id]
      );
      if (rows.length === 0) {
        return { ok: false, error: 'ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง' };
      }
      const row = rows[0];
      if (String(row.bloc_code) === '1') {
        return { ok: false, error: 'บัญชีนี้ถูกระงับการใช้งาน (bloc_code = 1)' };
      }
      const stored = Buffer.isBuffer(row.memb__pwd) ? row.memb__pwd : Buffer.from(String(row.memb__pwd || ''), 'latin1');
      let matched = false;
      let isLegacy = false;
      if (isBcryptHash(stored)) {
        matched = await bcrypt.compare(password, stored.toString('latin1'));
      } else {
        const plainBuf = Buffer.from(password, 'utf8');
        const eqPlain = stored.length === plainBuf.length && crypto.timingSafeEqual(stored, plainBuf);
        matched = Number(row.md5_match) === 1 || eqPlain;
        isLegacy = matched;
      }
      if (!matched) {
        return { ok: false, error: 'ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง' };
      }
      if (isLegacy) {
        try {
          const upgraded = Buffer.from(await bcrypt.hash(password, BCRYPT_COST), 'latin1');
          await this.pool.query('UPDATE MEMB_INFO SET memb__pwd = ? WHERE memb___id = ?', [upgraded, row.memb___id]);
        } catch {
          // Ignore if column not migrated to 60 bytes yet
        }
      }
      return { ok: true, accountId: String(row.memb___id) };
    }

    const row = this.membInfo.get(id.toLowerCase());
    if (!row) {
      return { ok: false, error: 'ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง' };
    }
    if (row.bloc_code === '1') {
      return { ok: false, error: 'บัญชีนี้ถูกระงับการใช้งาน' };
    }
    const ok = await bcrypt.compare(password, row.memb__pwd.toString('latin1'));
    if (!ok) {
      return { ok: false, error: 'ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง' };
    }
    return { ok: true, accountId: row.memb___id };
  }

  async changePassword(
    accountId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    await this.init();
    if (newPassword.length < 6 || newPassword.length > 20) {
      return { ok: false, error: 'รหัสผ่านใหม่ต้องมีความยาว 6–20 ตัวอักษร' };
    }
    const verified = await this.verifyLogin(accountId, currentPassword);
    if (!verified.ok) {
      return { ok: false, error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' };
    }

    const hashBuf = Buffer.from(await bcrypt.hash(newPassword, BCRYPT_COST), 'latin1');
    if (this.mode === 'mysql-live' && this.pool) {
      await this.pool.query('UPDATE MEMB_INFO SET memb__pwd = ? WHERE memb___id = ?', [hashBuf, accountId]);
      return { ok: true };
    }
    const row = this.membInfo.get(accountId.toLowerCase());
    if (row) row.memb__pwd = hashBuf;
    return { ok: true };
  }

  private async getCooldownRemaining(accountId: string, charName: string, action: string): Promise<number> {
    if (this.mode === 'mysql-live' && this.pool) {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        `SELECT GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(last_used, INTERVAL ? MINUTE))) AS rem
         FROM web_action_cooldown
         WHERE account_id = ? AND char_name = ? AND action = ? LIMIT 1`,
        [COOLDOWN_MINUTES, accountId, charName, action]
      );
      return rows.length ? Number(rows[0].rem || 0) : 0;
    }

    const key = `${accountId.toLowerCase()}:${charName.toLowerCase()}:${action}`;
    const lastUsed = this.cooldowns.get(key);
    if (!lastUsed) return 0;
    const remMs = lastUsed + COOLDOWN_MS - Date.now();
    return remMs > 0 ? Math.ceil(remMs / 1000) : 0;
  }

  private async touchCooldown(accountId: string, charName: string, action: string): Promise<void> {
    if (this.mode === 'mysql-live' && this.pool) {
      await this.pool.query(
        `INSERT INTO web_action_cooldown (account_id, char_name, action, last_used)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE last_used = NOW()`,
        [accountId, charName, action]
      );
      return;
    }
    const key = `${accountId.toLowerCase()}:${charName.toLowerCase()}:${action}`;
    this.cooldowns.set(key, Date.now());
  }

  async ensureAccountOffline(accountId: string): Promise<boolean> {
    await this.init();
    if (this.mode === 'mysql-live' && this.pool) {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        'SELECT ConnectStat FROM MEMB_STAT WHERE memb___id = ? LIMIT 1',
        [accountId]
      );
      if (rows.length === 0) return true;
      return Number(rows[0].ConnectStat || 0) === 0;
    }
    const st = this.membStat.get(accountId.toLowerCase());
    return !st || st.ConnectStat === 0;
  }

  async getAccountProfile(accountId: string): Promise<AccountProfile | null> {
    await this.init();

    if (this.mode === 'mysql-live' && this.pool) {
      const [infoRows] = await this.pool.query<RowDataPacket[]>(
        `SELECT m.memb___id, m.memb_name, m.mail_addr, m.AccountLevel, m.bloc_code,
                COALESCE(ms.ConnectStat, 0) AS ConnectStat,
                COALESCE(ms.ServerName, 'Server 1') AS ServerName,
                COALESCE(ms.OnlineHours, 0) AS OnlineHours,
                ac.GameIDC,
                COALESCE(ga.Renas, 0) AS Renas,
                COALESCE(ga.Stones, 0) AS Stones,
                ga.LuckyNumber
         FROM MEMB_INFO m
         LEFT JOIN MEMB_STAT ms ON ms.memb___id = m.memb___id
         LEFT JOIN AccountCharacter ac ON ac.Id = m.memb___id
         LEFT JOIN GoldenArcherCoin ga ON ga.AccountID = m.memb___id
         WHERE m.memb___id = ? LIMIT 1`,
        [accountId]
      );
      if (infoRows.length === 0) return null;
      const info = infoRows[0];

      const [charRows] = await this.pool.query<RowDataPacket[]>(
        `SELECT c.AccountID, c.Name, c.Class, c.cLevel, c.ResetCount, c.GrandResetCount,
                c.LevelUpPoint, c.Strength, c.Dexterity, c.Vitality, c.Energy,
                c.Money, c.Life, c.MaxLife, c.Mana, c.MaxMana,
                c.MapNumber, c.MapPosX, c.MapPosY, c.PkCount, c.PkLevel, c.CtlCode,
                c.Inventory, gm.G_Name AS GuildName
         FROM \`Character\` c
         LEFT JOIN GuildMember gm ON gm.Name = c.Name
         WHERE c.AccountID = ?
         ORDER BY c.ResetCount DESC, c.cLevel DESC`,
        [accountId]
      );

      const characters: CharacterRecord[] = await Promise.all(
        charRows.map(async (c) => {
          const name = String(c.Name);
          const [moveHomeSeconds, clearInventorySeconds] = await Promise.all([
            this.getCooldownRemaining(accountId, name, 'move_home'),
            this.getCooldownRemaining(accountId, name, 'clear_inventory'),
          ]);
          const invBuf = Buffer.isBuffer(c.Inventory) ? c.Inventory : null;
          return {
            AccountID: String(c.AccountID),
            Name: name,
            Class: Number(c.Class ?? 0),
            ClassName: getClassName(Number(c.Class ?? 0)),
            cLevel: Number(c.cLevel ?? 1),
            ResetCount: Number(c.ResetCount ?? 0),
            GrandResetCount: Number(c.GrandResetCount ?? 0),
            LevelUpPoint: Number(c.LevelUpPoint ?? 0),
            Strength: Number(c.Strength ?? 0),
            Dexterity: Number(c.Dexterity ?? 0),
            Vitality: Number(c.Vitality ?? 0),
            Energy: Number(c.Energy ?? 0),
            Money: Number(c.Money ?? 0),
            Life: Number(c.Life ?? 0),
            MaxLife: Number(c.MaxLife ?? 0),
            Mana: Number(c.Mana ?? 0),
            MaxMana: Number(c.MaxMana ?? 0),
            MapNumber: Number(c.MapNumber ?? 0),
            MapName: getMapName(Number(c.MapNumber ?? 0)),
            MapPosX: Number(c.MapPosX ?? 125),
            MapPosY: Number(c.MapPosY ?? 125),
            PkCount: Number(c.PkCount ?? 0),
            PkLevel: Number(c.PkLevel ?? 3),
            CtlCode: Number(c.CtlCode ?? 0),
            GuildName: c.GuildName ? String(c.GuildName) : null,
            IsOnline: Number(info.ConnectStat) === 1 && String(info.GameIDC || '').toLowerCase() === name.toLowerCase(),
            InventoryItemCount: countInventoryItems(invBuf),
            Cooldowns: { moveHomeSeconds, clearInventorySeconds },
          };
        })
      );

      return {
        memb___id: String(info.memb___id),
        memb_name: String(info.memb_name || info.memb___id),
        mail_addr: String(info.mail_addr || ''),
        AccountLevel: Number(info.AccountLevel ?? 0),
        bloc_code: String(info.bloc_code ?? '0'),
        ConnectStat: Number(info.ConnectStat ?? 0),
        ServerName: String(info.ServerName || 'Server 1'),
        OnlineHours: Number(info.OnlineHours ?? 0),
        GameIDC: info.GameIDC ? String(info.GameIDC) : null,
        Renas: Number(info.Renas ?? 0),
        Stones: Number(info.Stones ?? 0),
        LuckyNumber: info.LuckyNumber ? String(info.LuckyNumber) : null,
        Characters: characters,
      };
    }

    const key = accountId.toLowerCase();
    const info = this.membInfo.get(key);
    if (!info) return null;
    const st = this.membStat.get(key) ?? { memb___id: info.memb___id, ConnectStat: 0, ServerName: 'Server 1', OnlineHours: 0 };
    const ac = this.accountChars.get(key);
    const ga = this.goldenArcher.get(key);

    const chars = Array.from(this.characters.values())
      .filter((c) => c.AccountID.toLowerCase() === key)
      .sort((a, b) => b.ResetCount - a.ResetCount || b.cLevel - a.cLevel);

    const characterRecords: CharacterRecord[] = await Promise.all(
      chars.map(async (c) => {
        const gm = this.guildMembers.get(c.Name.toLowerCase());
        const [moveHomeSeconds, clearInventorySeconds] = await Promise.all([
          this.getCooldownRemaining(info.memb___id, c.Name, 'move_home'),
          this.getCooldownRemaining(info.memb___id, c.Name, 'clear_inventory'),
        ]);
        return {
          AccountID: c.AccountID,
          Name: c.Name,
          Class: c.Class,
          ClassName: getClassName(c.Class),
          cLevel: c.cLevel,
          ResetCount: c.ResetCount,
          GrandResetCount: c.GrandResetCount,
          LevelUpPoint: c.LevelUpPoint,
          Strength: c.Strength,
          Dexterity: c.Dexterity,
          Vitality: c.Vitality,
          Energy: c.Energy,
          Money: c.Money,
          Life: c.Life,
          MaxLife: c.MaxLife,
          Mana: c.Mana,
          MaxMana: c.MaxMana,
          MapNumber: c.MapNumber,
          MapName: getMapName(c.MapNumber),
          MapPosX: c.MapPosX,
          MapPosY: c.MapPosY,
          PkCount: c.PkCount,
          PkLevel: c.PkLevel,
          CtlCode: c.CtlCode,
          GuildName: gm?.G_Name ?? null,
          IsOnline: st.ConnectStat === 1 && ac?.GameIDC?.toLowerCase() === c.Name.toLowerCase(),
          InventoryItemCount: countInventoryItems(c.Inventory),
          Cooldowns: { moveHomeSeconds, clearInventorySeconds },
        };
      })
    );

    return {
      memb___id: info.memb___id,
      memb_name: info.memb_name,
      mail_addr: info.mail_addr,
      AccountLevel: info.AccountLevel,
      bloc_code: info.bloc_code,
      ConnectStat: st.ConnectStat,
      ServerName: st.ServerName,
      OnlineHours: st.OnlineHours,
      GameIDC: ac?.GameIDC ?? null,
      Renas: ga?.Renas ?? 0,
      Stones: ga?.Stones ?? 0,
      LuckyNumber: ga?.LuckyNumber ?? null,
      Characters: characterRecords,
    };
  }

  async createCharacter(
    accountId: string,
    charName: string,
    classId: number
  ): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
    await this.init();
    const name = charName.trim();
    if (!/^[A-Za-z0-9_]{3,10}$/.test(name)) {
      return { ok: false, error: 'ชื่อตัวละครต้องเป็นภาษาอังกฤษหรือตัวเลข 3–10 ตัวอักษร' };
    }
    const spec = PLAYABLE_BASE_CLASSES.find((c) => c.classId === classId);
    if (!spec) {
      return { ok: false, error: 'ไม่พบอาชีพที่เลือกในตาราง DefaultClassType (0.97k)' };
    }
    const offline = await this.ensureAccountOffline(accountId);
    if (!offline) {
      return { ok: false, error: 'บัญชีนี้กำลังออนไลน์อยู่ในเกม กรุณาออกจากเกมก่อนสร้างตัวละคร' };
    }

    const profile = await this.getAccountProfile(accountId);
    if (!profile) return { ok: false, error: 'ไม่พบข้อมูลบัญชีผู้ใช้' };
    if (profile.Characters.length >= 5) {
      return { ok: false, error: 'ช่องตัวละครเต็มแล้ว (สูงสุด 5 ตัวต่อไอดีใน AccountCharacter)' };
    }
    if (classId === 48) {
      const hasLv220 = profile.Characters.some((c) => c.cLevel >= 220 || c.ResetCount > 0);
      if (!hasLv220) {
        return { ok: false, error: 'Magic Gladiator ต้องมีตัวละครในไอดีอย่างน้อยเลเวล 220 ก่อน' };
      }
    }

    const emptyInv = Buffer.alloc(760, 0xff);

    if (this.mode === 'mysql-live' && this.pool) {
      const [exists] = await this.pool.query<RowDataPacket[]>('SELECT Name FROM `Character` WHERE Name = ? LIMIT 1', [name]);
      if (exists.length > 0) {
        return { ok: false, error: 'ชื่อตัวละครนี้ถูกใช้งานแล้ว' };
      }
      const [acRows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM AccountCharacter WHERE Id = ? LIMIT 1', [accountId]);
      const slots = ['GameID1', 'GameID2', 'GameID3', 'GameID4', 'GameID5'] as const;
      let freeSlot: string | null = null;
      if (acRows.length === 0) {
        await this.pool.query('INSERT INTO AccountCharacter (Id, GameID1) VALUES (?, ?)', [accountId, name]);
        freeSlot = 'GameID1';
      } else {
        for (const s of slots) {
          if (!acRows[0][s]) {
            freeSlot = s;
            break;
          }
        }
        if (!freeSlot) return { ok: false, error: 'ช่องตัวละครใน AccountCharacter เต็มทั้ง 5 ช่องแล้ว' };
        await this.pool.query(`UPDATE AccountCharacter SET ${freeSlot} = ? WHERE Id = ?`, [name, accountId]);
      }

      await this.pool.query(
        `INSERT INTO \`Character\` (AccountID, Name, Class, cLevel, LevelUpPoint, Strength, Dexterity, Vitality, Energy, Inventory, Money, Life, MaxLife, Mana, MaxMana, MapNumber, MapPosX, MapPosY, PkLevel)
         VALUES (?, ?, ?, 1, 0, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, 3)`,
        [
          accountId,
          name,
          spec.classId,
          spec.strength,
          spec.dexterity,
          spec.vitality,
          spec.energy,
          emptyInv,
          spec.life,
          spec.life,
          spec.mana,
          spec.mana,
          spec.startMap,
          spec.startX,
          spec.startY,
        ]
      );
      return { ok: true, message: `สร้างตัวละคร ${name} (${spec.name}) เรียบร้อยแล้ว` };
    }

    if (this.characters.has(name.toLowerCase())) {
      return { ok: false, error: 'ชื่อตัวละครนี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น' };
    }

    this.characters.set(name.toLowerCase(), {
      AccountID: accountId,
      Name: name,
      Class: spec.classId,
      cLevel: 1,
      ResetCount: 0,
      GrandResetCount: 0,
      LevelUpPoint: 0,
      Strength: spec.strength,
      Dexterity: spec.dexterity,
      Vitality: spec.vitality,
      Energy: spec.energy,
      Money: 0,
      Life: spec.life,
      MaxLife: spec.life,
      Mana: spec.mana,
      MaxMana: spec.mana,
      MapNumber: spec.startMap,
      MapPosX: spec.startX,
      MapPosY: spec.startY,
      PkCount: 0,
      PkLevel: 3,
      PkTime: 0,
      CtlCode: 0,
      Inventory: emptyInv,
    });

    const ac = this.accountChars.get(accountId.toLowerCase());
    if (ac) {
      if (!ac.GameID1) ac.GameID1 = name;
      else if (!ac.GameID2) ac.GameID2 = name;
      else if (!ac.GameID3) ac.GameID3 = name;
      else if (!ac.GameID4) ac.GameID4 = name;
      else if (!ac.GameID5) ac.GameID5 = name;
    }

    return { ok: true, message: `สร้างตัวละคร ${name} (${spec.name}) ที่ ${spec.startMapName} เรียบร้อยแล้ว` };
  }

  async moveCharacterHome(accountId: string, charName: string): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
    await this.init();
    const offline = await this.ensureAccountOffline(accountId);
    if (!offline) {
      return { ok: false, error: 'บัญชีนี้กำลังออนไลน์อยู่ในเกม กรุณาออกจากเกมก่อนย้ายตัวละคร' };
    }

    const rem = await this.getCooldownRemaining(accountId, charName, 'move_home');
    if (rem > 0) {
      return { ok: false, error: `กรุณารออีก ${Math.ceil(rem / 60)} นาที (${rem} วินาที) ก่อนใช้คำสั่งวาร์ปกลับเมืองอีกครั้ง` };
    }

    if (this.mode === 'mysql-live' && this.pool) {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        'SELECT Name, Class FROM `Character` WHERE AccountID = ? AND Name = ? LIMIT 1',
        [accountId, charName]
      );
      if (rows.length === 0) return { ok: false, error: 'ไม่พบตัวละครในบัญชีของคุณ' };
      const classId = Number(rows[0].Class);
      const isElf = classId === 32 || classId === 33 || classId === 34;
      const target = isElf ? { map: 3, x: 174, y: 112, label: 'Noria (174, 112)' } : { map: 0, x: 137, y: 124, label: 'Lorencia (137, 124)' };
      const [res] = await this.pool.query<ResultSetHeader>(
        'UPDATE `Character` SET MapNumber = ?, MapPosX = ?, MapPosY = ? WHERE AccountID = ? AND Name = ?',
        [target.map, target.x, target.y, accountId, charName]
      );
      if (res.affectedRows === 0) return { ok: false, error: 'ไม่สามารถอัปเดตพิกัดตัวละครได้' };
      await this.touchCooldown(accountId, charName, 'move_home');
      return { ok: true, message: `ย้าย ${charName} ไปยังเขตปลอดภัย ${target.label} เรียบร้อยแล้ว (คูลดาวน์ ${COOLDOWN_MINUTES} นาที)` };
    }

    const ch = this.characters.get(charName.toLowerCase());
    if (!ch || ch.AccountID.toLowerCase() !== accountId.toLowerCase()) {
      return { ok: false, error: 'ไม่พบตัวละครในบัญชีของคุณ' };
    }
    const isElf = ch.Class === 32 || ch.Class === 33 || ch.Class === 34;
    const target = isElf ? { map: 3, x: 174, y: 112, label: 'Noria (174, 112)' } : { map: 0, x: 137, y: 124, label: 'Lorencia (137, 124)' };
    ch.MapNumber = target.map;
    ch.MapPosX = target.x;
    ch.MapPosY = target.y;
    await this.touchCooldown(accountId, ch.Name, 'move_home');
    return { ok: true, message: `ย้าย ${ch.Name} ไปยังเขตปลอดภัย ${target.label} เรียบร้อยแล้ว (คูลดาวน์ ${COOLDOWN_MINUTES} นาที)` };
  }

  async clearCharacterInventory(accountId: string, charName: string): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
    await this.init();
    const offline = await this.ensureAccountOffline(accountId);
    if (!offline) {
      return { ok: false, error: 'บัญชีนี้กำลังออนไลน์อยู่ในเกม กรุณาออกจากเกมก่อนล้างกระเป๋า' };
    }

    const rem = await this.getCooldownRemaining(accountId, charName, 'clear_inventory');
    if (rem > 0) {
      return { ok: false, error: `กรุณารออีก ${Math.ceil(rem / 60)} นาที (${rem} วินาที) ก่อนใช้คำสั่งล้างกระเป๋าอีกครั้ง` };
    }

    const emptyInv = Buffer.alloc(760, 0xff);

    if (this.mode === 'mysql-live' && this.pool) {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        'SELECT Name FROM `Character` WHERE AccountID = ? AND Name = ? LIMIT 1',
        [accountId, charName]
      );
      if (rows.length === 0) return { ok: false, error: 'ไม่พบตัวละครในบัญชีของคุณ' };
      await this.pool.query(
        'UPDATE `Character` SET Inventory = ? WHERE AccountID = ? AND Name = ?',
        [emptyInv, accountId, charName]
      );
      await this.touchCooldown(accountId, charName, 'clear_inventory');
      return { ok: true, message: `ล้างกระเป๋าของ ${charName} (760 bytes 0xFF) เรียบร้อยแล้ว (คูลดาวน์ ${COOLDOWN_MINUTES} นาที)` };
    }

    const ch = this.characters.get(charName.toLowerCase());
    if (!ch || ch.AccountID.toLowerCase() !== accountId.toLowerCase()) {
      return { ok: false, error: 'ไม่พบตัวละครในบัญชีของคุณ' };
    }
    ch.Inventory = emptyInv;
    await this.touchCooldown(accountId, ch.Name, 'clear_inventory');
    return { ok: true, message: `ล้างกระเป๋าของ ${ch.Name} (760 bytes 0xFF) เรียบร้อยแล้ว (คูลดาวน์ ${COOLDOWN_MINUTES} นาที)` };
  }

  async addCharacterStats(
    accountId: string,
    charName: string,
    delta: { str: number; agi: number; vit: number; ene: number }
  ): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
    await this.init();
    const offline = await this.ensureAccountOffline(accountId);
    if (!offline) {
      return { ok: false, error: 'บัญชีนี้กำลังออนไลน์อยู่ในเกม กรุณาออกจากเกมก่อนอัพสเตตัสผ่านเว็บ' };
    }

    const str = Math.max(0, Math.floor(Number(delta.str) || 0));
    const agi = Math.max(0, Math.floor(Number(delta.agi) || 0));
    const vit = Math.max(0, Math.floor(Number(delta.vit) || 0));
    const ene = Math.max(0, Math.floor(Number(delta.ene) || 0));
    const total = str + agi + vit + ene;

    if (total <= 0) {
      return { ok: false, error: 'กรุณาระบุจำนวนแต้มสเตตัสที่ต้องการเพิ่มอย่างน้อย 1 แต้ม' };
    }

    const maxStat = SERVER_CONFIG_SPECS.maxStatPoint;

    if (this.mode === 'mysql-live' && this.pool) {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        'SELECT LevelUpPoint, Strength, Dexterity, Vitality, Energy FROM `Character` WHERE AccountID = ? AND Name = ? LIMIT 1',
        [accountId, charName]
      );
      if (rows.length === 0) return { ok: false, error: 'ไม่พบตัวละครในบัญชีของคุณ' };
      const c = rows[0];
      if (total > Number(c.LevelUpPoint)) {
        return { ok: false, error: `แต้มคงเหลือไม่เพียงพอ (มีอยู่ ${Number(c.LevelUpPoint).toLocaleString()} แต้ม)` };
      }
      if (
        Number(c.Strength) + str > maxStat ||
        Number(c.Dexterity) + agi > maxStat ||
        Number(c.Vitality) + vit > maxStat ||
        Number(c.Energy) + ene > maxStat
      ) {
        return { ok: false, error: `ค่าสเตตัสแต่ละช่องไม่สามารถเกินขีดจำกัดเซิร์ฟเวอร์ (${maxStat.toLocaleString()})` };
      }
      await this.pool.query(
        `UPDATE \`Character\`
         SET LevelUpPoint = LevelUpPoint - ?,
             Strength = Strength + ?,
             Dexterity = Dexterity + ?,
             Vitality = Vitality + ?,
             Energy = Energy + ?
         WHERE AccountID = ? AND Name = ?`,
        [total, str, agi, vit, ene, accountId, charName]
      );
      return { ok: true, message: `อัพสเตตัสให้ ${charName} รวม ${total.toLocaleString()} แต้มเรียบร้อยแล้ว` };
    }

    const ch = this.characters.get(charName.toLowerCase());
    if (!ch || ch.AccountID.toLowerCase() !== accountId.toLowerCase()) {
      return { ok: false, error: 'ไม่พบตัวละครในบัญชีของคุณ' };
    }
    if (total > ch.LevelUpPoint) {
      return { ok: false, error: `แต้มคงเหลือไม่เพียงพอ (มีอยู่ ${ch.LevelUpPoint.toLocaleString()} แต้ม)` };
    }
    if (
      ch.Strength + str > maxStat ||
      ch.Dexterity + agi > maxStat ||
      ch.Vitality + vit > maxStat ||
      ch.Energy + ene > maxStat
    ) {
      return { ok: false, error: `ค่าสเตตัสแต่ละช่องไม่สามารถเกินขีดจำกัดเซิร์ฟเวอร์ (${maxStat.toLocaleString()})` };
    }

    ch.LevelUpPoint -= total;
    ch.Strength += str;
    ch.Dexterity += agi;
    ch.Vitality += vit;
    ch.Energy += ene;
    ch.MaxLife += vit * 3;
    ch.Life = ch.MaxLife;
    ch.MaxMana += ene * 2;
    ch.Mana = ch.MaxMana;

    return { ok: true, message: `อัพสเตตัสให้ ${ch.Name} รวม ${total.toLocaleString()} แต้มเรียบร้อยแล้ว` };
  }

  async resetCharacter(accountId: string, charName: string): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
    await this.init();
    const offline = await this.ensureAccountOffline(accountId);
    if (!offline) {
      return { ok: false, error: 'บัญชีนี้กำลังออนไลน์อยู่ในเกม กรุณาออกจากเกมก่อนทำ Reset' };
    }

    if (this.mode === 'mysql-live' && this.pool) {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        'SELECT cLevel, Class, ResetCount FROM `Character` WHERE AccountID = ? AND Name = ? LIMIT 1',
        [accountId, charName]
      );
      if (rows.length === 0) return { ok: false, error: 'ไม่พบตัวละครในบัญชีของคุณ' };
      const cLevel = Number(rows[0].cLevel);
      if (cLevel < SERVER_CONFIG_SPECS.resetLevel) {
        return { ok: false, error: `ต้องมีเลเวลอย่างน้อย ${SERVER_CONFIG_SPECS.resetLevel} จึงจะรีเซ็ตได้ (ปัจจุบัน Lv.${cLevel})` };
      }
      const classId = Number(rows[0].Class);
      const isElf = classId === 32 || classId === 33 || classId === 34;
      const target = isElf ? { map: 3, x: 174, y: 112 } : { map: 0, x: 137, y: 124 };
      await this.pool.query(
        `UPDATE \`Character\`
         SET cLevel = ?, Experience = 0, ResetCount = ResetCount + 1,
             MapNumber = ?, MapPosX = ?, MapPosY = ?
         WHERE AccountID = ? AND Name = ?`,
        [SERVER_CONFIG_SPECS.resetStartLevel, target.map, target.x, target.y, accountId, charName]
      );
      return { ok: true, message: `รีเซ็ต ${charName} สำเร็จ (Reset #${Number(rows[0].ResetCount) + 1}) สเตตัสเดิมถูกเก็บไว้ครบและย้ายกลับเขตปลอดภัยแล้ว` };
    }

    const ch = this.characters.get(charName.toLowerCase());
    if (!ch || ch.AccountID.toLowerCase() !== accountId.toLowerCase()) {
      return { ok: false, error: 'ไม่พบตัวละครในบัญชีของคุณ' };
    }
    if (ch.cLevel < SERVER_CONFIG_SPECS.resetLevel) {
      return { ok: false, error: `ต้องมีเลเวลอย่างน้อย ${SERVER_CONFIG_SPECS.resetLevel} จึงจะรีเซ็ตได้ (ปัจจุบัน Lv.${ch.cLevel})` };
    }
    const isElf = ch.Class === 32 || ch.Class === 33 || ch.Class === 34;
    ch.cLevel = SERVER_CONFIG_SPECS.resetStartLevel;
    ch.ResetCount += 1;
    ch.MapNumber = isElf ? 3 : 0;
    ch.MapPosX = isElf ? 174 : 137;
    ch.MapPosY = isElf ? 112 : 124;

    return { ok: true, message: `รีเซ็ต ${ch.Name} สำเร็จ (Reset #${ch.ResetCount}) เก็บค่าสเตตัสเดิมครบและย้ายกลับเมืองเริ่มต้นเรียบร้อย` };
  }

  async clearPkStatus(accountId: string, charName: string): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
    await this.init();
    const offline = await this.ensureAccountOffline(accountId);
    if (!offline) {
      return { ok: false, error: 'บัญชีนี้กำลังออนไลน์อยู่ในเกม กรุณาออกจากเกมก่อนล้างหัวแดง' };
    }

    if (this.mode === 'mysql-live' && this.pool) {
      const [rows] = await this.pool.query<RowDataPacket[]>(
        'SELECT PkLevel FROM `Character` WHERE AccountID = ? AND Name = ? LIMIT 1',
        [accountId, charName]
      );
      if (rows.length === 0) return { ok: false, error: 'ไม่พบตัวละครในบัญชีของคุณ' };
      if (Number(rows[0].PkLevel) <= 3) {
        return { ok: false, error: `${charName} ไม่มีสถานะหัวแดง (PkLevel ปัจจุบันปกติ)` };
      }
      await this.pool.query(
        'UPDATE `Character` SET PkLevel = 3, PkCount = 0, PkTime = 0 WHERE AccountID = ? AND Name = ?',
        [accountId, charName]
      );
      return { ok: true, message: `ล้างสถานะ PK ของ ${charName} กลับเป็นสถานะปกติเรียบร้อยแล้ว` };
    }

    const ch = this.characters.get(charName.toLowerCase());
    if (!ch || ch.AccountID.toLowerCase() !== accountId.toLowerCase()) {
      return { ok: false, error: 'ไม่พบตัวละครในบัญชีของคุณ' };
    }
    if (ch.PkLevel <= 3) {
      return { ok: false, error: `${ch.Name} ไม่มีสถานะหัวแดงอยู่แล้ว` };
    }
    ch.PkLevel = 3;
    ch.PkCount = 0;
    ch.PkTime = 0;
    return { ok: true, message: `ล้างสถานะหัวแดงของ ${ch.Name} กลับเป็นสถานะปกติ (Commoner) เรียบร้อยแล้ว` };
  }
}

export const muRepository = new MuRepository();
