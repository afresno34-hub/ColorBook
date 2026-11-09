/**
 * Colorbook - Sistema Inteligente de Fórmulas y Colorimetría por Voz
 * Servidor Express Multi-Usuario con Autenticación Segura (HMAC Tokens + PBKDF2)
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { exec } = require('child_process');
const mailer = require('./services/mailer');

const app = express();
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

// Base de Datos y Usuarios
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

// Middlewares
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

const INDEX_FILE = fs.existsSync(path.join(PUBLIC_DIR, 'index.html'))
  ? path.join(PUBLIC_DIR, 'index.html')
  : path.join(__dirname, 'index.html');

// Servir archivos estáticos de public y de la raíz
const staticOptions = {
  etag: false,
  maxAge: 0,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('sw.js')) {
      res.setHeader('Service-Worker-Allowed', '/');
    }
    if (filePath.endsWith('sw.js') || filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
};

app.use(express.static(PUBLIC_DIR, staticOptions));
app.use(express.static(__dirname, staticOptions));

// RUTA PRINCIPAL RAÍZ: Garantiza que / SIEMPRE entregue index.html sin error
app.get('/', (req, res) => {
  res.sendFile(INDEX_FILE);
});
app.get('/index.html', (req, res) => {
  res.sendFile(INDEX_FILE);
});

// ==========================================
// RUTAS API
// ==========================================

// 1. REGISTRO DE NUEVA CUENTA: POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Ingresa un nombre válido (mínimo 2 caracteres).' });
    }

    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const users = readUsers();
    const exists = users.find(u => u.email === cleanEmail);
    if (exists) {
      return res.status(409).json({ error: 'Este correo electrónico ya tiene una cuenta registrada. Inicia sesión.' });
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

    res.status(201).json({
      success: true,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (err) {
    res.status(400).json({ error: 'Datos de registro inválidos.' });
  }
});

// 2. INICIO DE SESIÓN: POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanLogin = String(email || '').trim().toLowerCase();

    if (!cleanLogin || !password) {
      return res.status(400).json({ error: 'Ingresa tu correo/usuario y tu contraseña.' });
    }

    const users = readUsers();
    const user = users.find(u => 
      u.email === cleanLogin || 
      u.name.toLowerCase() === cleanLogin
    );

    if (!user) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const testHash = hashPassword(password, user.salt);
    if (testHash !== user.hash) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const token = createToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      exp: Date.now() + (90 * 24 * 3600 * 1000)
    });

    res.status(200).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(400).json({ error: 'Error en la solicitud de inicio de sesión.' });
  }
});

// 3. CONSULTAR SESIÓN ACTIVA: GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(200).json({ authenticated: false });
  }
  res.status(200).json({
    authenticated: true,
    user: { id: authUser.userId, name: authUser.name, email: authUser.email }
  });
});

// 4. ENVÍO DE CONSULTA A SOPORTE TÉCNICO: POST /api/support/ticket
app.post('/api/support/ticket', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Ingresa tu nombre o taller.' });
    }

    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({ error: 'Ingresa un correo electrónico válido para poder responderte.' });
    }

    if (!message || message.trim().length < 5) {
      return res.status(400).json({ error: 'Escribe tu mensaje o consulta (mínimo 5 caracteres).' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Local';

    await mailer.sendSupportTicketEmail({
      senderName: name.trim(),
      senderEmail: cleanEmail,
      subject: subject ? subject.trim() : 'Consulta de Soporte',
      message: message.trim(),
      clientIp
    });

    res.status(200).json({
      success: true,
      message: 'Tu mensaje ha sido enviado directamente a colorbookaadministracion@gmail.com. Te responderemos a la brevedad.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar el mensaje de soporte.' });
  }
});

// 5. OBTENER FÓRMULAS DEL USUARIO: GET /api/formulas
app.get('/api/formulas', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Debes iniciar sesión para consultar tus fórmulas.' });
  }

  const allFormulas = readDatabase();
  const userFormulas = allFormulas.filter(f => f.userId === authUser.userId);
  res.status(200).json(userFormulas);
});

// 6. GUARDAR O ACTUALIZAR FÓRMULA DEL USUARIO: POST /api/formulas
app.post('/api/formulas', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Debes iniciar sesión para guardar fórmulas.' });
  }

  try {
    const formula = req.body;
    formula.userId = authUser.userId;

    if (formula.category === 'Base Tricapas') {
      const s1 = formula.step1Components ? formula.step1Components.length : 0;
      const s2 = formula.step2Components ? formula.step2Components.length : 0;
      if (s1 === 0 || s2 === 0) {
        return res.status(400).json({
          error: 'En Base Tricapas es obligatorio ingresar componentes tanto en el Paso 1 (Fondo) como en el Paso 2 (Efecto).'
        });
      }
    } else {
      if (!formula.components || formula.components.length === 0) {
        return res.status(400).json({ error: 'La fórmula debe tener al menos un componente' });
      }
    }

    let allFormulas = readDatabase();
    const existingIndex = allFormulas.findIndex(f => f.id === formula.id && f.userId === authUser.userId);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      formula.updatedAt = now;
      allFormulas[existingIndex] = { ...allFormulas[existingIndex], ...formula };
    } else {
      formula.id = formula.id || ('formula_' + Date.now());
      formula.createdAt = now;
      formula.updatedAt = now;
      allFormulas.unshift(formula);
    }

    writeDatabase(allFormulas);
    res.status(200).json({ success: true, formula });
  } catch (e) {
    res.status(400).json({ error: 'JSON inválido' });
  }
});

// 7. ELIMINAR FÓRMULA POR ID: DELETE /api/formulas/:id
app.delete('/api/formulas/:id', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  const id = req.params.id;
  let allFormulas = readDatabase();
  const initialLen = allFormulas.length;

  allFormulas = allFormulas.filter(f => !(f.id === id && f.userId === authUser.userId));

  if (allFormulas.length < initialLen) {
    writeDatabase(allFormulas);
    res.status(200).json({ success: true, message: 'Fórmula eliminada con éxito.' });
  } else {
    res.status(404).json({ error: 'Fórmula no encontrada o no pertenece a tu cuenta.' });
  }
});

// 8. API INFO: Devuelve IP local y puerto
app.get('/api/info', (req, res) => {
  const localIp = getLocalNetworkIp();
  res.status(200).json({ ip: localIp, port: PORT, appName: 'Colorbook' });
});

// 9. API PARA LANZAR MICROSOFT EDGE DIRECTAMENTE EN WINDOWS (OPCIONAL)
app.get('/api/open-edge', (req, res) => {
  exec(`start msedge http://localhost:${PORT}`, (err) => {
    res.status(200).json({ success: !err });
  });
});

// RUTA COMODÍN: Redirige cualquier otra solicitud al index.html de la PWA (compatible Express 4 y 5)
app.use((req, res) => {
  res.sendFile(INDEX_FILE);
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalNetworkIp();
  console.log(`=======================================================`);
  console.log(` 🎨 COLOR BOOK - Almacenes de Pintura`);
  console.log(` 🚀 Servidor Express Activo en Puerto ${PORT}`);
  console.log(` 🌐 Local:      http://localhost:${PORT}`);
  console.log(` 📲 Red Móvil:  http://${localIp}:${PORT}`);
  console.log(`=======================================================`);
});

module.exports = app;
