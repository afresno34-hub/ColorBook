/**
 * Colorbook - Sistema Inteligente de Fórmulas y Colorimetría por Voz
 * Servidor HTTP Multi-Usuario con Autenticación Segura (HMAC Tokens + PBKDF2)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');
const crypto = require('crypto');
const { exec } = require('child_process');
const mailer = require('./services/mailer');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'formulas.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const SECRET_KEY = process.env.JWT_SECRET || 'colorbook_secure_master_key_2026';

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '[]', 'utf-8');
}

function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

// ==========================================
// MÓDULO DE BASE DE DATOS Y USUARIOS
// ==========================================
function readDatabase() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error leyendo fórmulas:', err);
    return [];
  }
}

function writeDatabase(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error escribiendo fórmulas:', err);
    return false;
  }
}

function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error leyendo usuarios:', err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error escribiendo usuarios:', err);
    return false;
  }
}

// Criptografía y Tokens Seguros
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function createToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function getAuthUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  let token = null;
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      token = authHeader.trim();
    }
  }
  return verifyToken(token);
}

// ==========================================
// SERVIDOR HTTP PRINCIPAL
// ==========================================
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Headers CORS para despliegue público y acceso móvil
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. REGISTRO DE NUEVA CUENTA: POST /api/auth/register
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { name, email, password } = JSON.parse(body);

        if (!name || name.trim().length < 2) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Ingresa un nombre válido (mínimo 2 caracteres).' }));
          return;
        }

        const cleanEmail = String(email || '').trim().toLowerCase();
        if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Ingresa un correo electrónico válido.' }));
          return;
        }

        if (!password || password.length < 6) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'La contraseña debe tener al menos 6 caracteres.' }));
          return;
        }

        const users = readUsers();
        const exists = users.find(u => u.email === cleanEmail);
        if (exists) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Este correo electrónico ya tiene una cuenta registrada. Inicia sesión.' }));
          return;
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const hash = hashPassword(password, salt);
        const newUser = {
          id: 'usr_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
          name: name.trim(),
          email: cleanEmail,
          salt: salt,
          hash: hash,
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        writeUsers(users);

        const token = createToken({
          userId: newUser.id,
          name: newUser.name,
          email: newUser.email,
          exp: Date.now() + (90 * 24 * 3600 * 1000)
        });

        // Enviar correo de bienvenida a su Gmail/correo
        mailer.sendWelcomeEmail(newUser.email, newUser.name).catch(e => {
          console.error('Error enviando correo de bienvenida:', e.message);
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          token,
          user: { id: newUser.id, name: newUser.name, email: newUser.email }
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Datos de registro inválidos.' }));
      }
    });
    return;
  }

  // 2. INICIO DE SESIÓN: POST /api/auth/login
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        const cleanLogin = String(email || '').trim().toLowerCase();

        if (!cleanLogin || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Ingresa tu correo/usuario y tu contraseña.' }));
          return;
        }

        const users = readUsers();
        const user = users.find(u => 
          u.email === cleanLogin || 
          u.name.toLowerCase() === cleanLogin
        );

        if (!user) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Correo o contraseña incorrectos.' }));
          return;
        }

        const testHash = hashPassword(password, user.salt);
        if (testHash !== user.hash) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Correo o contraseña incorrectos.' }));
          return;
        }

        const token = createToken({
          userId: user.id,
          name: user.name,
          email: user.email,
          exp: Date.now() + (90 * 24 * 3600 * 1000)
        });

        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Local';
        const userAgent = req.headers['user-agent'] || '';

        // Enviar notificación de inicio de sesión a su Gmail
        mailer.sendLoginAlertEmail(user.email, user.name, clientIp, userAgent).catch(e => {
          console.error('Error enviando notificación de login:', e.message);
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          token,
          user: { id: user.id, name: user.name, email: user.email }
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Solicitud inválida.' }));
      }
    });
    return;
  }

  // 2.1 CONSULTAR ESTADO DE GMAIL: GET /api/email/config
  if (pathname === '/api/email/config' && req.method === 'GET') {
    const cfg = mailer.loadEmailConfig();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      configured: !!(cfg.user && cfg.pass),
      user: cfg.user || '',
      fromName: cfg.fromName || 'COLORVOX Automotriz'
    }));
    return;
  }

  // 2.2 GUARDAR CONFIGURACIÓN DE GMAIL: POST /api/email/config
  if (pathname === '/api/email/config' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { user, pass, fromName } = JSON.parse(body);
        const result = mailer.saveEmailConfig(user, pass, fromName);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Datos de configuración inválidos.' }));
      }
    });
    return;
  }

  // 2.3 ENVIAR CORREO DE PRUEBA: POST /api/email/test
  if (pathname === '/api/email/test' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { email } = JSON.parse(body);
        if (!email) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Ingresa un correo destinatario.' }));
          return;
        }
        const result = await mailer.sendWelcomeEmail(email, 'Colorista');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 2.4 ENVIAR MENSAJE A SOPORTE TÉCNICO: POST /api/support
  if (pathname === '/api/support' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { name, email, subject, message } = JSON.parse(body);

        if (!name || name.trim().length < 2) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Ingresa tu nombre o taller.' }));
          return;
        }

        const cleanEmail = String(email || '').trim().toLowerCase();
        if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Ingresa un correo electrónico válido para poder responderte.' }));
          return;
        }

        if (!message || message.trim().length < 5) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Escribe tu mensaje o consulta (mínimo 5 caracteres).' }));
          return;
        }

        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Local';

        const result = await mailer.sendSupportTicketEmail({
          senderName: name.trim(),
          senderEmail: cleanEmail,
          subject: subject ? subject.trim() : 'Consulta de Soporte',
          message: message.trim(),
          clientIp
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Tu mensaje ha sido enviado directamente a colorbookaadministracion@gmail.com. Te responderemos a la brevedad.'
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al enviar el mensaje de soporte.' }));
      }
    });
    return;
  }

  // 3. CONSULTAR SESIÓN ACTIVA: GET /api/auth/me
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const authUser = getAuthUser(req);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (!authUser) {
      res.end(JSON.stringify({ authenticated: false }));
    } else {
      res.end(JSON.stringify({
        authenticated: true,
        user: { id: authUser.userId, name: authUser.name, email: authUser.email }
      }));
    }
    return;
  }

  // 4. API PARA LANZAR MICROSOFT EDGE DIRECTAMENTE EN WINDOWS (OPCIONAL)
  if (pathname === '/api/open-edge' && req.method === 'GET') {
    exec(`start msedge http://localhost:${PORT}`, (err) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: !err }));
    });
    return;
  }

  // 5. API INFO: Devuelve IP local y puerto
  if (pathname === '/api/info' && req.method === 'GET') {
    const localIp = getLocalNetworkIp();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ip: localIp, port: PORT, appName: 'Colorbook' }));
    return;
  }

  // 6. OBTENER FÓRMULAS DEL USUARIO: GET /api/formulas
  if (pathname === '/api/formulas' && req.method === 'GET') {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Debes iniciar sesión para consultar tus fórmulas.' }));
      return;
    }

    const allFormulas = readDatabase();
    // Filtro estricto por cuenta de usuario
    const userFormulas = allFormulas.filter(f => f.userId === authUser.userId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(userFormulas));
    return;
  }

  // 7. GUARDAR O ACTUALIZAR FÓRMULA DEL USUARIO: POST /api/formulas
  if (pathname === '/api/formulas' && req.method === 'POST') {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Debes iniciar sesión para guardar fórmulas.' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const formula = JSON.parse(body);
        if (!formula.name && !formula.code) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El nombre o código de la fórmula es obligatorio.' }));
          return;
        }

        // Asignar pertenencia a la cuenta activa
        formula.userId = authUser.userId;

        const allFormulas = readDatabase();
        const existingIdx = allFormulas.findIndex(f => 
          f.userId === authUser.userId && (
            (formula.id && f.id === formula.id) ||
            (formula.code && f.code && f.code.trim().toUpperCase() === formula.code.trim().toUpperCase())
          )
        );

        const now = new Date().toISOString();
        if (existingIdx >= 0) {
          formula.id = allFormulas[existingIdx].id;
          formula.updatedAt = now;
          formula.createdAt = allFormulas[existingIdx].createdAt || now;
          allFormulas[existingIdx] = formula;
        } else {
          formula.id = formula.id || 'fp-' + Date.now();
          formula.createdAt = now;
          formula.updatedAt = now;
          allFormulas.unshift(formula);
        }

        writeDatabase(allFormulas);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, formula }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON inválido' }));
      }
    });
    return;
  }

  // 8. ELIMINAR FÓRMULA POR ID: DELETE /api/formulas/:id
  if (pathname.startsWith('/api/formulas/') && req.method === 'DELETE') {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No autorizado.' }));
      return;
    }

    const id = pathname.replace('/api/formulas/', '');
    let allFormulas = readDatabase();
    const initialLen = allFormulas.length;

    // Solo elimina si pertenece a la cuenta autenticada
    allFormulas = allFormulas.filter(f => !(f.id === id && f.userId === authUser.userId));

    if (allFormulas.length < initialLen) {
      writeDatabase(allFormulas);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Fórmula eliminada con éxito.' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Fórmula no encontrada o no pertenece a tu cuenta.' }));
    }
    return;
  }

  // 9. SERVIR ARCHIVOS ESTÁTICOS DE LA APLICACIÓN WEB
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, pathname);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Acceso denegado');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 No Encontrado - Colorbook');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const headers = { 'Content-Type': contentType };

    if (filePath.endsWith('sw.js') || ext === '.js' || ext === '.css' || ext === '.html') {
      if (filePath.endsWith('sw.js')) headers['Service-Worker-Allowed'] = '/';
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    }

    res.writeHead(200, headers);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalNetworkIp();
  console.log('====================================================');
  console.log('📖  COLOR BOOK - ALMACENES DE PINTURA');
  console.log('👑  Laboratorio de Fórmulas Automotrices por Voz');
  console.log(`💻  Acceso en esta PC:  http://localhost:${PORT}`);
  console.log(`📱  Acceso desde Móvil: http://${localIp}:${PORT}`);
  console.log('====================================================');
});
