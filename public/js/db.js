/**
 * Colorbook - Módulo de Base de Datos y Autenticación
 * Sincronización multiusuario por token JWT/HMAC + Redundancia IndexedDB
 */

class FormulaDB {
  constructor() {
    this.dbName = 'ColorbookDB';
    this.dbVersion = 3;
    this.db = null;
    this.apiAvailable = true;
    this.cache = [];
    this.token = localStorage.getItem('colorbook_token') || localStorage.getItem('colorvox_token') || null;
    this.currentUser = null;
  }

  async init() {
    await this.initIndexedDB();
    if (this.token) {
      await this.checkAuth();
    }
    await this.loadAll();
    return this.cache;
  }

  getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      headers['x-auth-token'] = this.token;
    }
    return headers;
  }

  // Inicializar IndexedDB en el navegador
  initIndexedDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('formulas')) {
          const store = db.createObjectStore('formulas', { keyPath: 'id' });
          store.createIndex('code', 'code', { unique: false });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.error('Error abriendo IndexedDB:', e);
        resolve(null);
      };
    });
  }

  // ==========================================
  // AUTENTICACIÓN: REGISTRO, LOGIN Y SESIÓN
  // ==========================================
  async register(name, email, password) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Error al crear la cuenta.' };
      }

      this.token = data.token;
      this.currentUser = data.user;
      localStorage.setItem('colorbook_token', this.token);
      localStorage.removeItem('colorvox_token');

      await this.loadAll();
      return { success: true, user: this.currentUser };
    } catch (err) {
      return { success: false, error: 'No se pudo conectar con el servidor.' };
    }
  }

  async login(email, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Correo o contraseña incorrectos.' };
      }

      this.token = data.token;
      this.currentUser = data.user;
      localStorage.setItem('colorbook_token', this.token);
      localStorage.removeItem('colorvox_token');

      await this.loadAll();
      return { success: true, user: this.currentUser };
    } catch (err) {
      return { success: false, error: 'No se pudo conectar con el servidor.' };
    }
  }

  async checkAuth() {
    if (!this.token) {
      this.currentUser = null;
      return null;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: this.getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          this.currentUser = data.user;
          return this.currentUser;
        }
      }
      // Token inválido o expirado
      this.logout();
      return null;
    } catch (e) {
      console.warn('Verificación offline de sesión:', e);
      return this.currentUser;
    }
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    this.cache = [];
    localStorage.removeItem('colorbook_token');
    localStorage.removeItem('colorvox_token');
    if (this.db) {
      try {
        const tx = this.db.transaction('formulas', 'readwrite');
        tx.objectStore('formulas').clear();
      } catch (e) {}
    }
  }

  isAuthenticated() {
    return !!this.token && !!this.currentUser;
  }

  // ==========================================
  // GESTIÓN DE FÓRMULAS
  // ==========================================
  async loadAll() {
    if (!this.token) {
      this.cache = [];
      return [];
    }

    let serverItems = [];
    try {
      const res = await fetch('/api/formulas', {
        headers: this.getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        serverItems = Array.isArray(data) ? data : [];
        this.apiAvailable = true;
      } else if (res.status === 401) {
        this.logout();
        return [];
      }
    } catch (err) {
      console.warn('Servidor offline, cargando fórmulas desde almacenamiento local:', err);
      this.apiAvailable = false;
    }

    if (this.apiAvailable) {
      this.cache = serverItems;
      await this.syncToIndexedDB(serverItems);
    } else {
      const local = await this.readAllFromIndexedDB();
      this.cache = local.filter(f => !this.currentUser || f.userId === this.currentUser.id);
    }

    return this.cache;
  }

  readAllFromIndexedDB() {
    return new Promise((resolve) => {
      if (!this.db) return resolve([]);
      try {
        const tx = this.db.transaction('formulas', 'readonly');
        const store = tx.objectStore('formulas');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async syncToIndexedDB(formulas) {
    if (!this.db || !Array.isArray(formulas)) return;
    try {
      const tx = this.db.transaction('formulas', 'readwrite');
      const store = tx.objectStore('formulas');
      store.clear();
      for (const item of formulas) {
        store.put(item);
      }
    } catch (e) {
      console.error('Error sincronizando a IndexedDB:', e);
    }
  }

  // Buscar fórmula por código o nombre
  findFormula(query) {
    if (!query) return null;
    const q = query.trim().toLowerCase();

    // 1. Coincidencia exacta por código
    let match = this.cache.find(f => f.code && f.code.toLowerCase().trim() === q);
    if (match) return match;

    // 2. Coincidencia exacta por nombre
    match = this.cache.find(f => f.name && f.name.toLowerCase().trim() === q);
    if (match) return match;

    // 3. Código contenido
    match = this.cache.find(f => f.code && f.code.toLowerCase().includes(q));
    if (match) return match;

    // 4. Nombre contenido
    match = this.cache.find(f => f.name && f.name.toLowerCase().includes(q));
    if (match) return match;

    // 5. Palabras clave (ej: "rojo ferrari" coincide con "Rojo Ferrari Corsa")
    const words = q.split(/\s+/).filter(w => w.length > 2);
    if (words.length > 0) {
      match = this.cache.find(f => {
        const full = `${f.name || ''} ${f.code || ''} ${f.vehicle || ''}`.toLowerCase();
        return words.every(w => full.includes(w));
      });
      if (match) return match;
    }

    return null;
  }

  // Guardar fórmula (API + IndexedDB)
  async saveFormula(formula) {
    if (!this.token) {
      throw new Error('Debes iniciar sesión con tu cuenta para guardar fórmulas.');
    }

    if (!formula.id) {
      formula.id = 'cv-' + Date.now();
    }
    const now = new Date().toISOString();
    formula.updatedAt = now;
    if (!formula.createdAt) formula.createdAt = now;
    if (this.currentUser) {
      formula.userId = this.currentUser.id;
    }

    // Guardar en cache local de inmediato
    const existingIdx = this.cache.findIndex(f => f.id === formula.id);
    if (existingIdx >= 0) {
      this.cache[existingIdx] = formula;
    } else {
      this.cache.unshift(formula);
    }

    // Guardar en IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction('formulas', 'readwrite');
        tx.objectStore('formulas').put(formula);
      } catch (e) {
        console.error('Error guardando en IndexedDB:', e);
      }
    }

    // Enviar a servidor REST
    const res = await fetch('/api/formulas', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(formula)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al guardar en el servidor.');
    }

    const data = await res.json();
    return data.formula || formula;
  }

  // Eliminar fórmula
  async deleteFormula(id) {
    if (!this.token) {
      throw new Error('Debes iniciar sesión para eliminar fórmulas.');
    }

    this.cache = this.cache.filter(f => f.id !== id);

    if (this.db) {
      try {
        const tx = this.db.transaction('formulas', 'readwrite');
        tx.objectStore('formulas').delete(id);
      } catch (e) {
        console.error('Error eliminando de IndexedDB:', e);
      }
    }

    try {
      const res = await fetch(`/api/formulas/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      return res.ok;
    } catch (e) {
      console.warn('Error eliminando en API:', e);
      return false;
    }
  }

  // Exportar respaldo JSON
  exportBackup() {
    const userPrefix = this.currentUser ? this.currentUser.name.replace(/\s+/g, '_').toLowerCase() : 'colorvox';
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.cache, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    const date = new Date().toISOString().slice(0, 10);
    dlAnchor.setAttribute("download", `${userPrefix}_formulas_${date}.json`);
    dlAnchor.click();
  }

  // Importar respaldo JSON
  async importBackup(jsonData) {
    if (!this.token) {
      throw new Error('Debes iniciar sesión antes de importar fórmulas.');
    }
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (!Array.isArray(parsed)) throw new Error('Formato inválido: debe ser una lista de fórmulas');

      for (const item of parsed) {
        await this.saveFormula(item);
      }
      await this.loadAll();
      return true;
    } catch (err) {
      console.error('Error importando respaldo:', err);
      throw err;
    }
  }
}

window.formulaDB = new FormulaDB();
