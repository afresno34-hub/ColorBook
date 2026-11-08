/**
 * Colorbook - Módulo de Notificaciones por Correo Gmail
 * Correo oficial de soporte y administración: colorbookaadministracion@gmail.com
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const SUPPORT_EMAIL = 'colorbookaadministracion@gmail.com';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'email-config.json');
const LOGS_FILE = path.join(DATA_DIR, 'email_logs.json');

function loadEmailConfig() {
  let config = {
    user: process.env.GMAIL_USER || SUPPORT_EMAIL,
    pass: process.env.GMAIL_PASS || '',
    fromName: 'Colorbook',
    supportEmail: SUPPORT_EMAIL
  };

  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (saved.user) config.user = saved.user;
      if (saved.pass) config.pass = saved.pass;
      if (saved.fromName) config.fromName = saved.fromName;
      if (saved.supportEmail) config.supportEmail = saved.supportEmail;
    } catch (e) {
      console.error('Error leyendo email-config.json:', e);
    }
  }

  return config;
}

function saveEmailConfig(user, pass, fromName = 'Colorbook') {
  try {
    const config = {
      user: String(user || SUPPORT_EMAIL).trim(),
      pass: String(pass || '').trim().replace(/\s+/g, ''),
      fromName: fromName || 'Colorbook',
      supportEmail: SUPPORT_EMAIL,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function logEmailDispatch(entry) {
  try {
    let logs = [];
    if (fs.existsSync(LOGS_FILE)) {
      logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8') || '[]');
    }
    logs.unshift({
      id: 'eml_' + Date.now(),
      timestamp: new Date().toISOString(),
      sender: SUPPORT_EMAIL,
      ...entry
    });
    if (logs.length > 100) logs = logs.slice(0, 100);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error guardando log de correo:', e);
  }
}

function getTransporter() {
  const config = loadEmailConfig();
  if (!config.user || !config.pass) {
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
}

/**
 * Plantilla HTML con estilo oficial de COLOR BOOK (Oro Metálico 3D + Obsidiana Profunda)
 */
function wrapEmailTemplate(contentHtml, title) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #07080a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f8fafc;
    }
    .wrapper {
      max-width: 600px;
      margin: 20px auto;
      background-color: #0e1014;
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.85);
    }
    .header {
      background: linear-gradient(135deg, #8c6d23 0%, #d4af37 50%, #fef08a 100%);
      padding: 24px;
      text-align: center;
      color: #07080a;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 1.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      opacity: 0.95;
      margin-top: 4px;
      text-transform: uppercase;
    }
    .body-content {
      padding: 28px 24px;
      line-height: 1.6;
      color: #e2e8f0;
      font-size: 15px;
    }
    .btn-action {
      display: inline-block;
      background: linear-gradient(135deg, #d4af37 0%, #ffd700 60%, #ffffff 100%);
      color: #07080a !important;
      text-decoration: none;
      font-weight: 900;
      padding: 12px 28px;
      border-radius: 8px;
      margin: 20px 0;
      text-transform: uppercase;
      font-size: 14px;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
    }
    .info-card {
      background-color: #15181f;
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-left: 4px solid #ffd700;
      border-radius: 6px;
      padding: 14px 18px;
      margin: 18px 0;
      font-size: 14px;
    }
    .footer {
      background-color: #07080a;
      padding: 20px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
      border-top: 1px solid rgba(212, 175, 55, 0.18);
    }
    .support-box {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px dashed rgba(212, 175, 55, 0.25);
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="brand-title">COLOR BOOK</h1>
      <div class="brand-sub">ALMACENES DE PINTURA • Fórmulas por Voz</div>
    </div>
    <div class="body-content">
      ${contentHtml}
    </div>
    <div class="footer">
      <b>COLOR BOOK - ALMACENES DE PINTURA</b> • Fórmulas Automotrices Inteligentes.<br>
      <div class="support-box">
        ¿Dudas o soporte sobre la aplicación? Escríbenos a nuestro correo oficial:<br>
        <a href="mailto:${SUPPORT_EMAIL}" style="color: #ffd700; font-weight: bold; text-decoration: none;">${SUPPORT_EMAIL}</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 1. Enviar correo de confirmación de registro a la página de Colorbook
 */
async function sendWelcomeEmail(toEmail, userName) {
  const subject = `🎉 ¡Bienvenido a Colorbook, ${userName}! Te has registrado a la página`;
  const content = `
    <h2 style="color: #00ff88; margin-top:0;">¡Hola, ${userName}!</h2>
    <p>Te damos la bienvenida oficial a <b>Colorbook</b>. Tu registro en la página ha sido completado con éxito.</p>
    
    <div class="info-card">
      <b style="color: #00ff88;">Datos de tu registro:</b><br>
      • <b>Nombre / Taller:</b> ${userName}<br>
      • <b>Correo Registrado:</b> ${toEmail}<br>
      • <b>Fecha de Registro:</b> ${new Date().toLocaleString('es-CO')}<br>
      • <b>Canal Oficial de Soporte:</b> <a href="mailto:${SUPPORT_EMAIL}" style="color:#00ff88;">${SUPPORT_EMAIL}</a>
    </div>

    <p>Tu mesa de trabajo ya está lista para que puedas:</p>
    <ul>
      <li>Dictar fórmulas con tu voz mediante manos libres (micrófono en vivo).</li>
      <li>Crear y guardar fórmulas para líneas <b>HS, MS, Base Poliéster y Base Tricapas</b> (con control estricto de Paso 1 y Paso 2).</li>
      <li>Imprimir tickets de balanza para taller con escalas automáticas (1/32 a 1/1).</li>
      <li>Tus fórmulas quedan respaldadas de manera privada y permanente en tu cuenta.</li>
    </ul>

    <div style="text-align:center;">
      <a href="http://localhost:3000" class="btn-action">Entrar a mi Taller Colorbook</a>
    </div>

    <p style="font-size: 13px; color: #94a3b8; margin-top: 15px;">
      Cualquier duda, sugerencia o asistencia técnica, puedes responder a este correo o escribirnos a 
      <a href="mailto:${SUPPORT_EMAIL}" style="color:#00ff88;">${SUPPORT_EMAIL}</a>.
    </p>
  `;

  const html = wrapEmailTemplate(content, subject);
  return await dispatchEmail({ toEmail, subject, html, type: 'REGISTER' });
}

/**
 * 2. Enviar correo de notificación al Iniciar Sesión (Login)
 */
async function sendLoginAlertEmail(toEmail, userName, clientIp, userAgent) {
  const subject = `🔔 Nuevo Inicio de Sesión en tu cuenta de Colorbook`;
  const timeStr = new Date().toLocaleString('es-CO');
  const content = `
    <h2 style="color: #00ff88; margin-top:0;">Inicio de sesión detectado</h2>
    <p>Hola <b>${userName}</b>, acabas de iniciar sesión en tu cuenta de <b>Colorbook</b>.</p>
    
    <div class="info-card">
      <b style="color: #00ff88;">Detalles del acceso:</b><br>
      • <b>Usuario:</b> ${userName} (${toEmail})<br>
      • <b>Fecha y Hora:</b> ${timeStr}<br>
      • <b>Dirección IP:</b> ${clientIp || 'Red Local'}<br>
      • <b>Dispositivo:</b> ${userAgent ? userAgent.slice(0, 90) : 'Navegador Web'}
    </div>

    <p>Tus fórmulas guardadas están sincronizadas y listas en la mesa de trabajo.</p>

    <div style="text-align:center;">
      <a href="http://localhost:3000" class="btn-action">Abrir Mesa de Trabajo</a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; margin-top: 15px;">
      Si necesitas ayuda con tu cuenta, contacta a soporte en 
      <a href="mailto:${SUPPORT_EMAIL}" style="color:#00ff88;">${SUPPORT_EMAIL}</a>.
    </p>
  `;

  const html = wrapEmailTemplate(content, subject);
  return await dispatchEmail({ toEmail, subject, html, type: 'LOGIN' });
}

/**
 * 3. Enviar mensaje de soporte técnico a la administración de Colorbook
 */
async function sendSupportTicketEmail({ senderName, senderEmail, subject, message, clientIp }) {
  const emailSubject = `📩 [Soporte Colorbook] ${subject || 'Nueva Consulta'} - de ${senderName}`;
  const timeStr = new Date().toLocaleString('es-CO');
  const content = `
    <h2 style="color: #00ff88; margin-top:0;">Nuevo Mensaje para Soporte Técnico</h2>
    <p>Has recibido una nueva consulta enviada desde la aplicación de <b>Colorbook</b>:</p>
    
    <div class="info-card">
      <b style="color: #00ff88;">Datos del Remitente:</b><br>
      • <b>Nombre / Taller:</b> ${senderName}<br>
      • <b>Correo de Contacto:</b> <a href="mailto:${senderEmail}" style="color:#00ff88; font-weight:bold;">${senderEmail}</a><br>
      • <b>Asunto:</b> ${subject || 'General'}<br>
      • <b>Fecha y Hora:</b> ${timeStr}<br>
      • <b>IP:</b> ${clientIp || 'Local'}
    </div>

    <p style="font-weight:bold; color:#00ff88; margin-bottom:6px;">Mensaje del Usuario:</p>
    <div style="background:#131c15; border:1px solid #1f3624; border-radius:8px; padding:16px; font-size:15px; color:#f0fdf4; white-space:pre-wrap; line-height:1.6;">${message}</div>

    <div style="text-align:center; margin-top:20px;">
      <a href="mailto:${senderEmail}?subject=Re:%20[Soporte%20Colorbook]%20${encodeURIComponent(subject || 'Tu consulta')}" class="btn-action">Responder a ${senderName}</a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; margin-top: 15px;">
      Puedes responder directamente a este correo para escribirle a <b>${senderEmail}</b>.
    </p>
  `;

  const html = wrapEmailTemplate(content, emailSubject);
  return await dispatchEmail({
    toEmail: SUPPORT_EMAIL,
    replyTo: senderEmail,
    subject: emailSubject,
    html: html,
    type: 'SUPPORT_TICKET'
  });
}

/**
 * Motor de despacho
 */
async function dispatchEmail({ toEmail, subject, html, type, replyTo }) {
  const config = loadEmailConfig();
  const transporter = getTransporter();

  const fromEmail = config.user || SUPPORT_EMAIL;
  const fromHeader = `"${config.fromName || 'Colorbook'}" <${fromEmail}>`;
  const replyToEmail = replyTo || SUPPORT_EMAIL;

  // Si Gmail está configurado en email-config.json o ENV
  if (transporter && config.user && config.pass) {
    try {
      const info = await transporter.sendMail({
        from: fromHeader,
        replyTo: replyToEmail,
        to: toEmail,
        subject: subject,
        html: html
      });

      console.log(`📧 [COLORBOOK EMAIL ENVIADO DESDE ${fromEmail}] ${type} -> ${toEmail} (ID: ${info.messageId})`);
      logEmailDispatch({
        to: toEmail,
        from: fromEmail,
        replyTo: replyToEmail,
        subject,
        type,
        status: 'SENT',
        messageId: info.messageId
      });
      return { success: true, mode: 'GMAIL_SENT', messageId: info.messageId };
    } catch (err) {
      console.error(`⚠️ [COLORBOOK EMAIL ERROR] No se pudo entregar a ${toEmail}:`, err.message);
      logEmailDispatch({
        to: toEmail,
        from: fromEmail,
        replyTo: replyToEmail,
        subject,
        type,
        status: 'FAILED',
        error: err.message
      });
      return { success: false, mode: 'GMAIL_FAILED', error: err.message };
    }
  } else {
    // Si aún no hay credenciales SMTP, se registra en cola interna
    console.log(`📬 [COLORBOOK NOTIFICACIÓN REGISTRADA] De: ${fromEmail} | Para: ${toEmail} | Asunto: ${subject}`);
    logEmailDispatch({
      to: toEmail,
      from: fromEmail,
      replyTo: replyToEmail,
      subject,
      type,
      status: 'QUEUED_LOCAL',
      note: `Correo preparado para ${toEmail} de parte de Colorbook.`
    });
    return {
      success: true,
      mode: 'LOGGED',
      note: `Notificación registrada de parte de Colorbook.`
    };
  }
}

module.exports = {
  SUPPORT_EMAIL,
  loadEmailConfig,
  saveEmailConfig,
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendSupportTicketEmail,
  dispatchEmail
};
