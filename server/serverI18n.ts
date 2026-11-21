export type AppLang = 'en' | 'th';

const EXACT_TH_TO_EN: Record<string, string> = {
  // server.ts auth & route errors
  'กรุณาเข้าสู่ระบบบัญชีผู้เล่นก่อนทำรายการ': 'Please sign in to your player account first.',
  'กรุณาเข้าสู่ระบบผู้ดูแลระบบ (Admin) ก่อนทำรายการ': 'Please sign in to the Admin backoffice first.',
  'ไม่สามารถโหลดข้อมูลภาพรวมเซิร์ฟเวอร์ได้': 'Unable to load server overview data.',
  'ไม่สามารถโหลดข่าวสารเซิร์ฟเวอร์ได้': 'Unable to load server news.',
  'ไม่สามารถโหลดรายการดาวน์โหลดได้': 'Unable to load download packages.',
  'ไม่สามารถโหลดอันดับผู้เล่นได้': 'Unable to load rankings.',
  'ไม่สามารถสมัครสมาชิกได้': 'Unable to complete registration.',
  'เกิดข้อผิดพลาดระหว่างสมัครสมาชิก': 'An error occurred during registration.',
  'ไม่สามารถเข้าสู่ระบบได้': 'Unable to sign in.',
  'เกิดข้อผิดพลาดระหว่างเข้าสู่ระบบ': 'An error occurred while signing in.',
  'ไม่สามารถเข้าสู่ระบบผู้ดูแลได้': 'Unable to sign in to Admin backoffice.',
  'ไม่สามารถโหลดข้อมูลบัญชีได้': 'Unable to load account profile.',
  'รหัสข่าวสารไม่ถูกต้อง': 'Invalid news ID.',
  'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว': 'Password updated successfully.',
  'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว (เข้ารหัส bcrypt ตรงกับ JoinServer)':
    'Password updated successfully (encrypted with bcrypt for JoinServer).',

  // muRepository.ts admin auth & password
  'กรุณากรอกชื่อผู้ใช้และรหัสผ่านผู้ดูแลระบบ': 'Please enter your admin username and password.',
  'ชื่อผู้ใช้หรือรหัสผ่านผู้ดูแลระบบไม่ถูกต้อง': 'Invalid admin username or password.',
  'รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง': 'Incorrect admin password.',
  'รหัสผ่านผู้ดูแลระบบใหม่ต้องมีความยาว 6–64 ตัวอักษร': 'New admin password must be 6–64 characters.',
  'รหัสผ่านผู้ดูแลระบบปัจจุบันไม่ถูกต้อง': 'Current admin password is incorrect.',
  'เปลี่ยนรหัสผ่านบัญชี GM/Admin ใน MEMB_INFO เรียบร้อยแล้ว': 'GM/Admin password updated in MEMB_INFO.',
  'อัปเดตรหัสผ่านผู้ดูแลระบบในตาราง web_admins เรียบร้อยแล้ว': 'Admin password updated in web_admins table.',
  'เปลี่ยนรหัสผ่านผู้ดูแลระบบเรียบร้อยแล้ว': 'Admin password changed successfully.',

  // muRepository.ts news & downloads CRUD
  'กรุณาระบุหัวข้อข่าว (1–200 ตัวอักษร)': 'Please enter a news title (1–200 characters).',
  'กรุณากรอกเนื้อหาข่าวสาร': 'Please enter the announcement content.',
  'ไม่พบประกาศข่าวสารที่ต้องการแก้ไข': 'News announcement not found.',
  'ไม่พบประกาศข่าวสารที่ต้องการลบ': 'News announcement not found.',
  'กรุณาระบุชื่อไฟล์และแพลตฟอร์ม': 'Please provide both package title and platform.',
  'ลิงก์ดาวน์โหลดต้องขึ้นต้นด้วย https://, http:// หรือ /': 'Download URL must start with https://, http://, or /.',
  'ไม่พบรายการดาวน์โหลดที่ต้องการแก้ไข': 'Download item not found.',
  'ไม่พบรายการดาวน์โหลดที่ต้องการลบ': 'Download item not found.',

  // muRepository.ts player account auth & password
  'ชื่อบัญชี (memb___id) ต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลข 4–10 ตัวอักษร':
    'Account ID (memb___id) must be 4–10 alphanumeric characters.',
  'รหัสผ่านต้องมีความยาว 6–20 ตัวอักษร': 'Password must be 6–20 characters.',
  'กรุณากรอกรูปแบบอีเมลให้ถูกต้อง': 'Please enter a valid email address.',
  'ชื่อบัญชีนี้ถูกใช้งานแล้วในฐานข้อมูล MuOnline97': 'This Account ID is already registered in MuOnline97.',
  'ชื่อบัญชีนี้มีผู้ใช้งานแล้ว กรุณาเลือกชื่อบัญชีอื่น': 'This Account ID is already taken. Please choose another.',
  'กรุณากรอกชื่อบัญชีและรหัสผ่าน': 'Please enter your Account ID and password.',
  'ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง': 'Invalid Account ID or password.',
  'บัญชีนี้ถูกระงับการใช้งาน (bloc_code = 1)': 'This account has been suspended (bloc_code = 1).',
  'บัญชีนี้ถูกระงับการใช้งาน': 'This account has been suspended.',
  'รหัสผ่านใหม่ต้องมีความยาว 6–20 ตัวอักษร': 'New password must be 6–20 characters.',
  'รหัสผ่านปัจจุบันไม่ถูกต้อง': 'Current password is incorrect.',

  // muRepository.ts character actions
  'ชื่อตัวละครต้องเป็นภาษาอังกฤษหรือตัวเลข 3–10 ตัวอักษร':
    'Character name must be 3–10 alphanumeric characters.',
  'ไม่พบอาชีพที่เลือกในตาราง DefaultClassType (0.97k)':
    'Selected class was not found in DefaultClassType (0.97k).',
  'บัญชีนี้กำลังออนไลน์อยู่ในเกม กรุณาออกจากเกมก่อนสร้างตัวละคร':
    'Your account is currently online in-game. Please disconnect before creating a character.',
  'ไม่พบข้อมูลบัญชีผู้ใช้': 'Account record not found.',
  'ช่องตัวละครเต็มแล้ว (สูงสุด 5 ตัวต่อไอดีใน AccountCharacter)':
    'Character slots are full (maximum 5 characters per account in AccountCharacter).',
  'Magic Gladiator ต้องมีตัวละครในไอดีอย่างน้อยเลเวล 220 ก่อน':
    'Magic Gladiator requires an existing character at Level 220 or higher on this account.',
  'ชื่อตัวละครนี้ถูกใช้งานแล้ว': 'This character name is already in use.',
  'ชื่อตัวละครนี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น': 'This character name is already in use. Please choose another.',
  'ช่องตัวละครใน AccountCharacter เต็มทั้ง 5 ช่องแล้ว': 'All 5 slots in AccountCharacter are full.',
  'บัญชีนี้กำลังออนไลน์อยู่ในเกม กรุณาออกจากเกมก่อนย้ายตัวละคร':
    'Your account is currently online in-game. Please disconnect before moving your character.',
  'ไม่พบตัวละครในบัญชีของคุณ': 'Character not found on your account.',
  'ไม่สามารถอัปเดตพิกัดตัวละครได้': 'Failed to update character coordinates.',
  'บัญชีนี้กำลังออนไลน์อยู่ในเกม กรุณาออกจากเกมก่อนล้างกระเป๋า':
    'Your account is currently online in-game. Please disconnect before clearing inventory.',
  'บัญชีนี้กำลังออนไลน์อยู่ในเกม กรุณาออกจากเกมก่อนอัพสเตตัสผ่านเว็บ':
    'Your account is currently online in-game. Please disconnect before adding stat points.',
  'กรุณาระบุจำนวนแต้มสเตตัสที่ต้องการเพิ่มอย่างน้อย 1 แต้ม':
    'Please specify at least 1 stat point to add.',
  'บัญชีนี้กำลังออนไลน์อยู่ในเกม กรุณาออกจากเกมก่อนทำ Reset':
    'Your account is currently online in-game. Please disconnect before performing a Reset.',
  'บัญชีนี้กำลังออนไลน์อยู่ในเกม กรุณาออกจากเกมก่อนล้างหัวแดง':
    'Your account is currently online in-game. Please disconnect before clearing PK status.',
};

export function translateBackendMessage(text: string, lang: AppLang): string {
  if (lang === 'th' || !text) return text;
  if (EXACT_TH_TO_EN[text]) return EXACT_TH_TO_EN[text];

  // Dynamic template translations
  let m: RegExpMatchArray | null;

  m = text.match(/^ไม่สามารถบันทึกรหัสผ่านใน MySQL ได้: (.+)$/);
  if (m) return `Failed to save password in MySQL: ${m[1]}`;

  m = text.match(/^สร้างตัวละคร (.+?) \((.+?)\) ที่ (.+?) เรียบร้อยแล้ว$/);
  if (m) return `Character ${m[1]} (${m[2]}) created in ${m[3]} successfully.`;

  m = text.match(/^สร้างตัวละคร (.+?) \((.+?)\) เรียบร้อยแล้ว$/);
  if (m) return `Character ${m[1]} (${m[2]}) created successfully.`;

  m = text.match(/^กรุณารออีก (\d+) นาที \((\d+) วินาที\) ก่อนใช้คำสั่งวาร์ปกลับเมืองอีกครั้ง$/);
  if (m) return `Please wait ${m[1]} min (${m[2]}s) before using Move Home again.`;

  m = text.match(/^ย้าย (.+?) ไปยังเขตปลอดภัย (.+?) เรียบร้อยแล้ว \(คูลดาวน์ (\d+) นาที\)$/);
  if (m) return `Moved ${m[1]} to safe zone ${m[2]} (cooldown ${m[3]} min).`;

  m = text.match(/^กรุณารออีก (\d+) นาที \((\d+) วินาที\) ก่อนใช้คำสั่งล้างกระเป๋าอีกครั้ง$/);
  if (m) return `Please wait ${m[1]} min (${m[2]}s) before clearing inventory again.`;

  m = text.match(/^ล้างกระเป๋าของ (.+?) \(760 bytes 0xFF\) เรียบร้อยแล้ว \(คูลดาวน์ (\d+) นาที\)$/);
  if (m) return `Cleared inventory for ${m[1]} (760 bytes 0xFF, cooldown ${m[2]} min).`;

  m = text.match(/^แต้มคงเหลือไม่เพียงพอ \(มีอยู่ ([\d,]+) แต้ม\)$/);
  if (m) return `Insufficient stat points available (${m[1]} remaining).`;

  m = text.match(/^ค่าสเตตัสแต่ละช่องไม่สามารถเกินขีดจำกัดเซิร์ฟเวอร์ \(([\d,]+)\)$/);
  if (m) return `Each stat attribute cannot exceed the server limit (${m[1]}).`;

  m = text.match(/^อัพสเตตัสให้ (.+?) รวม ([\d,]+) แต้มเรียบร้อยแล้ว$/);
  if (m) return `Added ${m[2]} stat points to ${m[1]} successfully.`;

  m = text.match(/^ต้องมีเลเวลอย่างน้อย (\d+) จึงจะรีเซ็ตได้ \(ปัจจุบัน Lv\.(\d+)\)$/);
  if (m) return `Level ${m[1]} or higher is required to reset (current Lv.${m[2]}).`;

  m = text.match(/^รีเซ็ต (.+?) สำเร็จ \(Reset #(\d+)\)/);
  if (m) return `Reset complete for ${m[1]} (Reset #${m[2]}). Stats preserved and moved to safe zone.`;

  m = text.match(/^(.+?) ไม่มีสถานะหัวแดง/);
  if (m) return `${m[1]} does not have PK status (already Commoner).`;

  m = text.match(/^ล้างสถานะ(?: PK|หัวแดง)ของ (.+?) กลับเป็นสถานะปกติ/);
  if (m) return `PK status cleared for ${m[1]} (restored to Commoner).`;

  return text;
}

export function detectCountryFromHeaders(headers: Record<string, string | string[] | undefined>): string | null {
  const candidates = [
    headers['cf-ipcountry'],
    headers['x-appengine-country'],
    headers['x-google-country'],
    headers['x-vercel-ip-country'],
    headers['cloudfront-viewer-country'],
    headers['fastly-client-country'],
    headers['x-country-code'],
    headers['x-geo-country'],
  ];

  for (const raw of candidates) {
    const val = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase();
    if (val && /^[A-Z]{2}$/.test(val) && val !== 'XX' && val !== 'ZZ' && val !== 'T1') {
      return val;
    }
  }

  // Google Cloud / GFE sometimes sends x-client-geo-location: "TH, ..."
  const geoLoc = headers['x-client-geo-location'];
  const geoStr = (Array.isArray(geoLoc) ? geoLoc[0] : geoLoc)?.trim().toUpperCase();
  if (geoStr) {
    const first = geoStr.split(',')[0]?.trim();
    if (first && /^[A-Z]{2}$/.test(first) && first !== 'XX' && first !== 'ZZ') {
      return first;
    }
  }

  return null;
}

export function resolveRequestLang(headers: Record<string, string | string[] | undefined>): AppLang {
  const explicit = headers['x-lang'];
  const explicitVal = (Array.isArray(explicit) ? explicit[0] : explicit)?.trim().toLowerCase();
  if (explicitVal === 'en' || explicitVal === 'th') {
    return explicitVal;
  }

  const country = detectCountryFromHeaders(headers);
  if (country) {
    return country === 'TH' ? 'th' : 'en';
  }

  const acceptLang = headers['accept-language'];
  const acceptStr = (Array.isArray(acceptLang) ? acceptLang[0] : acceptLang)?.toLowerCase() ?? '';
  if (acceptStr.startsWith('th') || acceptStr.includes(',th')) {
    return 'th';
  }

  return 'en';
}
