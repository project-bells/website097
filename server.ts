import 'dotenv/config';
import crypto from 'node:crypto';
import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { muRepository } from './server/muRepository.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const SESSION_COOKIE = 'mulinux_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'mu-linux-097k-portal-session-key';

interface SessionPayload {
  accountId: string;
  exp: number;
}

function signSession(accountId: string): string {
  const payload: SessionPayload = {
    accountId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!parsed.accountId || typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  const pairs = header.split(';');
  for (const part of pairs) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) {
      return decodeURIComponent(v.join('='));
    }
  }
  return undefined;
}

function setSessionCookie(res: Response, accountId: string): void {
  const token = signSession(accountId);
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
  );
}

function clearSessionCookie(res: Response): void {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

interface AuthedRequest extends Request {
  accountId?: string;
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = readCookie(req, SESSION_COOKIE);
  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({ error: 'กรุณาเข้าสู่ระบบบัญชีผู้เล่นก่อนทำรายการ' });
    return;
  }
  req.accountId = payload.accountId;
  next();
}

async function startServer(): Promise<void> {
  await muRepository.init();
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // =========================================================================
  // Public Player API (connected to MuOnline97 MySQL or compatible sandbox)
  // =========================================================================
  app.get('/api/overview', async (_req, res) => {
    try {
      const overview = await muRepository.getOverview();
      res.json(overview);
    } catch (err) {
      res.status(500).json({ error: 'ไม่สามารถโหลดข้อมูลภาพรวมเซิร์ฟเวอร์ได้', detail: (err as Error).message });
    }
  });

  app.get('/api/news', async (_req, res) => {
    try {
      const news = await muRepository.getNews();
      res.json({ news });
    } catch (err) {
      res.status(500).json({ error: 'ไม่สามารถโหลดข่าวสารเซิร์ฟเวอร์ได้', detail: (err as Error).message });
    }
  });

  app.get('/api/rankings', async (req, res) => {
    try {
      const type = String(req.query.type || 'resets').toLowerCase();
      const q = String(req.query.q || '').trim();
      const classParam = String(req.query.classIds || '').trim();
      const classIds = classParam
        ? classParam
            .split(',')
            .map((v) => Number.parseInt(v, 10))
            .filter((n) => !Number.isNaN(n))
        : undefined;

      if (type === 'guilds') {
        const guilds = await muRepository.getGuildRankings(q);
        res.json({ type: 'guilds', rows: guilds });
        return;
      }
      if (type === 'bc' || type === 'ds') {
        const rows = await muRepository.getEventRankings(type, q);
        res.json({ type, rows });
        return;
      }
      const charType = type === 'level' || type === 'gr' ? type : 'resets';
      const rows = await muRepository.getCharacterRankings(charType, classIds, q, 100);
      res.json({ type: charType, rows });
    } catch (err) {
      res.status(500).json({ error: 'ไม่สามารถโหลดอันดับผู้เล่นได้', detail: (err as Error).message });
    }
  });

  // =========================================================================
  // Auth API (MEMB_INFO + bcrypt PasswordHash=1 / legacy MD5 auto-upgrade)
  // =========================================================================
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { accountId, password, name, email, personalId } = req.body ?? {};
      const result = await muRepository.registerAccount({
        accountId: String(accountId || ''),
        password: String(password || ''),
        name: String(name || ''),
        email: String(email || ''),
        personalId: String(personalId || ''),
      });
      if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
      }
      setSessionCookie(res, result.accountId);
      const profile = await muRepository.getAccountProfile(result.accountId);
      res.status(201).json({ ok: true, profile });
    } catch (err) {
      res.status(500).json({ error: 'เกิดข้อผิดพลาดระหว่างสมัครสมาชิก', detail: (err as Error).message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { accountId, password } = req.body ?? {};
      const result = await muRepository.verifyLogin(String(accountId || ''), String(password || ''));
      if (!result.ok) {
        res.status(401).json({ error: result.error });
        return;
      }
      setSessionCookie(res, result.accountId);
      const profile = await muRepository.getAccountProfile(result.accountId);
      res.json({ ok: true, profile });
    } catch (err) {
      res.status(500).json({ error: 'เกิดข้อผิดพลาดระหว่างเข้าสู่ระบบ', detail: (err as Error).message });
    }
  });

  app.post('/api/auth/logout', (_req, res) => {
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  // =========================================================================
  // Authenticated Account & Character Control API
  // =========================================================================
  app.get('/api/account/me', async (req, res) => {
    const token = readCookie(req, SESSION_COOKIE);
    const payload = verifySessionToken(token);
    if (!payload) {
      res.json({ authenticated: false, profile: null });
      return;
    }
    const profile = await muRepository.getAccountProfile(payload.accountId);
    if (!profile) {
      clearSessionCookie(res);
      res.json({ authenticated: false, profile: null });
      return;
    }
    res.json({ authenticated: true, profile });
  });

  app.post('/api/account/password', requireAuth, async (req: AuthedRequest, res) => {
    const { currentPassword, newPassword } = req.body ?? {};
    const result = await muRepository.changePassword(
      req.accountId!,
      String(currentPassword || ''),
      String(newPassword || '')
    );
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ ok: true, message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว (เข้ารหัส bcrypt ตรงกับ JoinServer)' });
  });

  app.post('/api/account/characters', requireAuth, async (req: AuthedRequest, res) => {
    const { name, classId } = req.body ?? {};
    const result = await muRepository.createCharacter(req.accountId!, String(name || ''), Number(classId));
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    const profile = await muRepository.getAccountProfile(req.accountId!);
    res.status(201).json({ ok: true, message: result.message, profile });
  });

  app.post('/api/account/characters/:name/move-home', requireAuth, async (req: AuthedRequest, res) => {
    const result = await muRepository.moveCharacterHome(req.accountId!, String(req.params.name || ''));
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    const profile = await muRepository.getAccountProfile(req.accountId!);
    res.json({ ok: true, message: result.message, profile });
  });

  app.post('/api/account/characters/:name/clear-inventory', requireAuth, async (req: AuthedRequest, res) => {
    const result = await muRepository.clearCharacterInventory(req.accountId!, String(req.params.name || ''));
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    const profile = await muRepository.getAccountProfile(req.accountId!);
    res.json({ ok: true, message: result.message, profile });
  });

  app.post('/api/account/characters/:name/add-stats', requireAuth, async (req: AuthedRequest, res) => {
    const { str, agi, vit, ene } = req.body ?? {};
    const result = await muRepository.addCharacterStats(req.accountId!, String(req.params.name || ''), {
      str: Number(str || 0),
      agi: Number(agi || 0),
      vit: Number(vit || 0),
      ene: Number(ene || 0),
    });
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    const profile = await muRepository.getAccountProfile(req.accountId!);
    res.json({ ok: true, message: result.message, profile });
  });

  app.post('/api/account/characters/:name/reset', requireAuth, async (req: AuthedRequest, res) => {
    const result = await muRepository.resetCharacter(req.accountId!, String(req.params.name || ''));
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    const profile = await muRepository.getAccountProfile(req.accountId!);
    res.json({ ok: true, message: result.message, profile });
  });

  app.post('/api/account/characters/:name/pk-clear', requireAuth, async (req: AuthedRequest, res) => {
    const result = await muRepository.clearPkStatus(req.accountId!, String(req.params.name || ''));
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    const profile = await muRepository.getAccountProfile(req.accountId!);
    res.json({ ok: true, message: result.message, profile });
  });

  // =========================================================================
  // Frontend Serving (Vite dev middleware or built dist/)
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MuOrigins Portal] Server running at http://0.0.0.0:${PORT} (mode: ${muRepository.getMode()})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
