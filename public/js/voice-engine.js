/**
 * FABIO PINTURAS - Motor de Reconocimiento de Voz
 * Ciclo de vida robusto con reconexión limpia y diagnóstico transparente
 */

class VoiceEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.handsFreeMode = true;
    this.voiceFeedbackEnabled = false; // Sin asistente de voz virtual
    this.browserInfo = this.detectBrowser();

    this.callbacks = {
      onTranscript: null,
      onCommandDetected: null,
      onStatusChange: null,
      onError: null
    };

    this.spanishNumbers = {
      'cero': 0, 'medio': 0.5, 'media': 0.5, 'un cuarto': 0.25,
      'uno': 1, 'una': 1, 'un': 1, 'dos': 2, 'tres': 3, 'cuatro': 4,
      'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
      'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
      'dieciséis': 16, 'dieciseis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
      'veinte': 20, 'veintiuno': 21, 'veintidos': 22, 'veintidós': 22, 'veintitres': 23, 'veintitrés': 23,
      'veinticuatro': 24, 'veinticinco': 25, 'veintiséis': 26, 'veintiseis': 26, 'veintisiete': 27,
      'veintiocho': 28, 'veintinueve': 29, 'treinta': 30, 'cuarenta': 40, 'cincuenta': 50,
      'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90,
      'cien': 100, 'ciento': 100, 'doscientos': 200, 'trescientos': 300,
      'cuatrocientos': 400, 'quinientos': 500, 'seiscientos': 600, 'setecientos': 700,
      'ochocientos': 800, 'novecientos': 900, 'mil': 1000
    };
  }

  detectBrowser() {
    const ua = navigator.userAgent;
    const isOpera = ua.includes('OPR') || ua.includes('Opera');
    const isEdge = ua.includes('Edg');
    const isChrome = ua.includes('Chrome') && !isOpera && !isEdge;
    return { isOpera, isEdge, isChrome, ua };
  }

  createRecognitionInstance() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      rec.lang = 'es-CO';

      rec.onstart = () => {
        this.isListening = true;
        if (window.audioEffects) window.audioEffects.playMicOn();
        if (this.callbacks.onStatusChange) {
          this.callbacks.onStatusChange('listening', 'Escuchando en vivo...');
        }
      };

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (this.callbacks.onTranscript) {
          this.callbacks.onTranscript(finalTranscript || interimTranscript, !!finalTranscript);
        }

        if (finalTranscript) {
          this.processVoiceInput(finalTranscript.trim());
        }
      };

      rec.onerror = (event) => {
        console.warn('SpeechRecognition event:', event.error);

        // Errores de ciclo de vida que son totalmente normales y NUNCA deben mostrar alertas ni modales
        if (event.error === 'no-speech' || event.error === 'aborted' || event.error === 'canceled') {
          return;
        }

        let errorMsg = `Aviso de voz: ${event.error}`;

        if (event.error === 'network') {
          if (this.browserInfo.isOpera) {
            errorMsg = 'Opera GX bloquea el reconocimiento de voz de Google. Abre en Google Chrome o Microsoft Edge.';
          } else {
            // Un parpadeo de red no debe bloquear la app, simplemente reintentar
            return;
          }
        } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMsg = 'Permiso de micrófono bloqueado. Haz clic en el ícono de candado en la barra de direcciones y selecciona "Permitir micrófono".';
        } else if (event.error === 'audio-capture') {
          errorMsg = 'No se encontró ningún micrófono conectado o está ocupado por otra aplicación.';
        }

        if (this.callbacks.onError) {
          this.callbacks.onError(event.error, errorMsg);
        }
        if (this.callbacks.onStatusChange) {
          this.callbacks.onStatusChange('error', errorMsg);
        }
      };

      rec.onend = () => {
        if (this.isListening && this.handsFreeMode) {
          clearTimeout(this._restartTimer);
          this._restartTimer = setTimeout(() => {
            if (this.isListening && this.handsFreeMode) {
              try {
                this.recognition.start();
              } catch (e) {
                try {
                  this.recognition = this.createRecognitionInstance();
                  if (this.recognition) this.recognition.start();
                } catch (err2) {
                  console.warn('Reintento suave de micrófono:', err2);
                }
              }
            }
          }, 200);
        } else {
          this.isListening = false;
          if (window.audioEffects) window.audioEffects.playMicOff();
          if (this.callbacks.onStatusChange) {
            this.callbacks.onStatusChange('idle', 'Micrófono en reposo');
          }
        }
      };

      return rec;
    } catch (e) {
      console.error('Error instanciando SpeechRecognition:', e);
      return null;
    }
  }

  async toggleListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const msg = 'Tu navegador no soporta reconocimiento de voz nativo. Por favor abre http://localhost:3000 en Google Chrome o Microsoft Edge.';
      if (this.callbacks.onError) this.callbacks.onError('not-supported', msg);
      return false;
    }

    // Si ya está escuchando, apagar limpiamente
    if (this.isListening) {
      this.handsFreeMode = false;
      this.isListening = false;
      if (this.recognition) {
        try {
          this.recognition.onend = null;
          this.recognition.onerror = null;
          this.recognition.stop();
        } catch (e) {}
      }
      if (window.audioEffects) window.audioEffects.playMicOff();
      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange('idle', 'Micrófono en reposo');
      }
      return false;
    }

    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange('connecting', 'Conectando micrófono...');
    }

    this.handsFreeMode = true;
    try {
      if (this.recognition) {
        try {
          this.recognition.onend = null;
          this.recognition.onerror = null;
          this.recognition.abort();
        } catch (e) {}
      }
      this.recognition = this.createRecognitionInstance();
      if (!this.recognition) throw new Error('No se pudo inicializar SpeechRecognition');

      this.recognition.start();
      return true;
    } catch (e) {
      console.warn('Fallo al iniciar reconocimiento:', e);
      let msg = `No se pudo iniciar el servicio de voz (${e.message}).`;
      if (this.browserInfo.isOpera) {
        msg = 'Opera GX bloquea el servicio de reconocimiento de voz. Abre http://localhost:3000 en Microsoft Edge o Google Chrome.';
      }
      if (this.callbacks.onError) this.callbacks.onError('start-failed', msg);
      if (this.callbacks.onStatusChange) this.callbacks.onStatusChange('error', msg);
      return false;
    }
  }

  parseSpanishNumber(text) {
    if (!text) return null;
    const clean = text.toLowerCase().trim()
      .replace(/,/g, '.')
      .replace(/ gramos?| mililitros?| gramos| g| ml| onzas?|[.,;:]+$/g, '')
      .trim();

    const directMatch = clean.match(/^(\d+(?:\.\d+)?)$/);
    if (directMatch) {
      return parseFloat(directMatch[1]);
    }

    if (clean.includes(' con ') || clean.includes(' punto ')) {
      const parts = clean.split(/ con | punto /);
      const enter = this.parseSpanishNumber(parts[0]) || 0;
      const dec = this.parseSpanishNumber(parts[1]) || 0;
      return enter + (dec / (Math.pow(10, parts[1].trim().length || 1)));
    }

    const words = clean.split(/\s+/);
    let total = 0;
    let current = 0;

    for (const w of words) {
      if (w === 'y') continue;
      const val = this.spanishNumbers[w];
      if (val !== undefined) {
        if (val === 1000) {
          current = current === 0 ? 1000 : current * 1000;
          total += current;
          current = 0;
        } else if (val >= 100) {
          current += val;
        } else {
          current += val;
        }
      }
    }
    total += current;

    return total > 0 ? total : null;
  }

  processVoiceInput(rawText) {
    if (!rawText) return;

    let text = rawText.trim().replace(/[.,;:]+$/, '');
    const lower = text.toLowerCase().trim();
    if (!lower) return;

    // 1. GUARDAR FÓRMULA
    if (lower === 'guardar' || lower === 'guardar formula' || lower === 'guardar fórmula' || lower.includes('guardar fórmula') || lower.includes('guardar formula') || lower === 'salvar') {
      if (this.callbacks.onCommandDetected) this.callbacks.onCommandDetected('SAVE_FORMULA', {}, rawText);
      return;
    }

    // 2. NUEVA FÓRMULA EN BLANCO
    if (lower === 'nueva formula' || lower === 'nueva fórmula' || lower === 'limpiar' || lower === 'nueva') {
      if (this.callbacks.onCommandDetected) this.callbacks.onCommandDetected('NEW_FORMULA', {}, rawText);
      return;
    }

    // 3. CAMBIO DE PASO TRICAPA
    if (lower === 'paso 1' || lower === 'paso uno' || lower === 'capa 1' || lower === 'fondo' || lower === 'capa de fondo') {
      if (this.callbacks.onCommandDetected) this.callbacks.onCommandDetected('SWITCH_STEP', { step: 1 }, rawText);
      return;
    }
    if (lower === 'paso 2' || lower === 'paso dos' || lower === 'capa 2' || lower === 'efecto' || lower === 'perla' || lower === 'capa de efecto') {
      if (this.callbacks.onCommandDetected) this.callbacks.onCommandDetected('SWITCH_STEP', { step: 2 }, rawText);
      return;
    }

    // 4. CAMBIO DE LÍNEA DE PINTURA (HS, MS, Poliéster, Tricapa)
    if (lower.includes('línea') || lower.includes('linea')) {
      if (lower.includes('hs') || lower.includes('altos sólidos') || lower.includes('altos solidos')) {
        if (this.callbacks.onCommandDetected) this.callbacks.onCommandDetected('SWITCH_CATEGORY', { category: 'HS - Poliuretano Altos Sólidos' }, rawText);
        return;
      }
      if (lower.includes('ms') || lower.includes('medios sólidos') || lower.includes('medios solidos')) {
        if (this.callbacks.onCommandDetected) this.callbacks.onCommandDetected('SWITCH_CATEGORY', { category: 'MS - Poliuretano Medios Sólidos' }, rawText);
        return;
      }
      if (lower.includes('tricapa') || lower.includes('tricapas')) {
        if (this.callbacks.onCommandDetected) this.callbacks.onCommandDetected('SWITCH_CATEGORY', { category: 'Base Tricapas' }, rawText);
        return;
      }
      if (lower.includes('poliéster') || lower.includes('poliester') || lower.includes('bicapa')) {
        if (this.callbacks.onCommandDetected) this.callbacks.onCommandDetected('SWITCH_CATEGORY', { category: 'Base Poliéster (Bicapa)' }, rawText);
        return;
      }
    }

    // 5. COLOR Y CÓDIGO SIMULTÁNEO: "Color Rojo Rubí, código R55"
    const colorCodeMatch = text.match(/^(?:nueva\s+f[oó]rmula\s+)?color\s+(.+?)(?:,\s*|\s+)c[oó]digo\s+(.+)$/i);
    if (colorCodeMatch) {
      const colorName = colorCodeMatch[1].trim();
      const colorCode = colorCodeMatch[2].trim().replace(/\s+/g, '').toUpperCase();
      if (this.callbacks.onCommandDetected) {
        this.callbacks.onCommandDetected('SET_COLOR_AND_CODE', {
          name: this.capitalize(colorName),
          code: colorCode
        }, rawText);
      }
      return;
    }

    const codeColorMatch = text.match(/^(?:nueva\s+f[oó]rmula\s+)?c[oó]digo\s+(.+?)(?:,\s*|\s+)color\s+(.+)$/i);
    if (codeColorMatch) {
      const colorCode = codeColorMatch[1].trim().replace(/\s+/g, '').toUpperCase();
      const colorName = codeColorMatch[2].trim();
      if (this.callbacks.onCommandDetected) {
        this.callbacks.onCommandDetected('SET_COLOR_AND_CODE', {
          name: this.capitalize(colorName),
          code: colorCode
        }, rawText);
      }
      return;
    }

    // 6. CAMBIO DE COLOR O CÓDIGO SIMPLE
    const simpleColorMatch = text.match(/^(?:nueva\s+f[oó]rmula\s+color|cambiar\s+a(?:l)?|pasar\s+a(?:l)?|color|c[oó]digo)\s+(.+)$/i);
    if (simpleColorMatch) {
      const targetQuery = simpleColorMatch[1].trim();
      this.handleColorSwitch(targetQuery, rawText);
      return;
    }

    // 7. ESCALA (1/32 a 1/1) - Exclusivo cuando se menciona la palabra 'escala' o fracción pura
    const isExplicitScale = lower.startsWith('escala') || /^(?:cambiar\s+a\s+)?escala\b/i.test(lower) || /^(?:1\/1|1\/2|1\/4|1\/8|1\/16|1\/32)$/.test(lower.trim());
    if (isExplicitScale) {
      let multiplier = null;
      let label = '';

      if (lower.includes('1/32') || lower.includes('treintaidos') || lower.includes('treinta y dos')) {
        multiplier = 1 / 32;
        label = '1/32';
      } else if (lower.includes('1/16') || lower.includes('dieciseis') || lower.includes('dieciséis')) {
        multiplier = 1 / 16;
        label = '1/16';
      } else if (lower.includes('1/8') || lower.includes('octavo')) {
        multiplier = 1 / 8;
        label = '1/8';
      } else if (lower.includes('1/4') || lower.includes('cuarto')) {
        multiplier = 1 / 4;
        label = '1/4';
      } else if (lower.includes('1/2') || lower.includes('mitad') || lower.includes('medio')) {
        multiplier = 0.5;
        label = '1/2';
      } else if (lower.includes('1/1') || lower.includes('uno a uno') || lower.includes('completa') || lower.includes('base') || lower.includes('100%')) {
        multiplier = 1.0;
        label = '1/1 (Base)';
      }

      if (multiplier !== null) {
        if (this.callbacks.onCommandDetected) {
          this.callbacks.onCommandDetected('SCALE_FRACTION', { multiplier, label }, rawText);
        }
        return;
      }
    }

    // 8. ELIMINAR COMPONENTE
    if (lower.startsWith('quitar') || lower.startsWith('eliminar') || lower.startsWith('borrar')) {
      if (lower.includes('último') || lower.includes('ultimo')) {
        if (this.callbacks.onCommandDetected) this.callbacks.onCommandDetected('REMOVE_LAST_COMPONENT', {}, rawText);
        return;
      }
      const removeMatch = text.match(/^(?:quitar|eliminar|borrar)\s+(.+)$/i);
      if (removeMatch) {
        if (this.callbacks.onCommandDetected) this.callbacks.onCommandDetected('REMOVE_COMPONENT', { name: removeMatch[1].trim() }, rawText);
        return;
      }
    }

    // 9. IMPRIMIR TICKET
    if (lower.includes('imprimir') || lower.includes('ticket') || lower.includes('ficha técnica')) {
      if (this.callbacks.onCommandDetected) this.callbacks.onCommandDetected('PRINT_TICKET', {}, rawText);
      return;
    }

    // 10. DICTADO DE COMPONENTE (con detección opcional de paso)
    let targetStep = null;
    let ingredientRaw = text;
    if (/^(?:en\s+)?paso\s+(?:1|uno)\s+(.+)$/i.test(text)) {
      targetStep = 1;
      ingredientRaw = text.replace(/^(?:en\s+)?paso\s+(?:1|uno)\s+/i, '');
    } else if (/^(?:en\s+)?paso\s+(?:2|dos)\s+(.+)$/i.test(text)) {
      targetStep = 2;
      ingredientRaw = text.replace(/^(?:en\s+)?paso\s+(?:2|dos)\s+/i, '');
    }

    const handled = this.handleFlexibleIngredientDictation(ingredientRaw, rawText, targetStep);
    if (handled) return;

    // 11. Coincidencia exacta con catálogo
    if (window.formulaDB && window.formulaDB.cache) {
      const exactMatch = window.formulaDB.findFormula(lower);
      if (exactMatch) {
        this.handleColorSwitch(exactMatch.name || exactMatch.code, rawText);
        return;
      }
    }

    if (this.callbacks.onCommandDetected) {
      this.callbacks.onCommandDetected('UNRECOGNIZED', { text: rawText }, rawText);
    }
  }

  normalizeTintInput(raw) {
    let s = (raw || '').trim();
    // Quitar prefijos y comandos de dictado
    s = s.replace(/^(?:por favor\s+)?(?:agregar|agrega|poner|pon|sumar|suma|añadir|añade|incluir|el|la)\s+/i, '').trim();

    // Normalizar letras habladas de tintes automotrices (ej: "811 jota" -> "811J")
    s = s.replace(/(\b\d+)\s*(?:jota|j)\b/gi, '$1J');
    s = s.replace(/(\b\d+)\s*-\s*j\b/gi, '$1J');
    s = s.replace(/(\b\d+)\s*(?:ka|k)\b/gi, '$1K');
    s = s.replace(/(\b\d+)\s*(?:ge)\b/gi, '$1G');
    s = s.replace(/(\b\d+)\s*(?:equis|x)\b/gi, '$1X');
    s = s.replace(/(\b\d+)\s*(?:zeta|z)\b/gi, '$1Z');

    // Casos frecuentes donde el micrófono confunde 'j' o 'jota' con 'g de' (ej: "811 g de 5g" -> "811J de 5g")
    s = s.replace(/(\b\d+)\s+g\s+de\s+/gi, '$1J de ');
    s = s.replace(/(\b\d+)\s+j\s+de\s+/gi, '$1J de ');
    s = s.replace(/(\b\d+)\s+jota\s+de\s+/gi, '$1J de ');

    return s;
  }

  handleFlexibleIngredientDictation(text, rawText, targetStep = null) {
    let clean = this.normalizeTintInput(text);

    // Extraer unidad si viene explícita
    let unit = 'g';
    if (/\b(?:mililitros?|ml)\b/i.test(clean)) {
      unit = 'ml';
      clean = clean.replace(/\b(?:mililitros?|ml)\b/gi, '').trim();
    } else if (/\b(?:onzas?|oz)\b/i.test(clean)) {
      unit = 'oz';
      clean = clean.replace(/\b(?:onzas?|oz)\b/gi, '').trim();
    } else if (/\b(?:por ciento|%)\b/i.test(clean)) {
      unit = '%';
      clean = clean.replace(/\b(?:por ciento|%)\b/gi, '').trim();
    } else if (/\b(?:gramos?|gr)\b/i.test(clean) || /(?<=\d)\s*(?:g|gr)\b/i.test(clean)) {
      unit = 'g';
      // Quitar "gramos", "gr" y la "g" únicamente cuando acompaña a un número para no romper códigos como 811G
      clean = clean.replace(/\b(?:gramos?|gr)\b/gi, '').trim();
      clean = clean.replace(/(?<=\d)\s*g\b/gi, '').trim();
    }

    clean = clean.replace(/(\b\d+)\s*(?:jota|j)\b/gi, '$1J');
    clean = clean.replace(/[.,;:]+$/, '').trim();

    // CASO 1: "[CÓDIGO/NOMBRE] de/con [CANTIDAD]" -> Ej: "811J de 5", "811J con 5", "728 de 12"
    const codeDeQtyMatch = clean.match(/^(.+?)\s+(?:de|con)\s+(\d+(?:[.,]\d+)?)$/i);
    if (codeDeQtyMatch) {
      const rawCode = codeDeQtyMatch[1].trim();
      const qty = parseFloat(codeDeQtyMatch[2].replace(',', '.'));
      this.emitAddComponent(rawCode, qty, unit, rawText, targetStep);
      return true;
    }

    // CASO 2: "[CANTIDAD] de [CÓDIGO/NOMBRE]" -> Ej: "5 de 811J", "120 de Blanco Perlado"
    const qtyDeCodeMatch = clean.match(/^(\d+(?:[.,]\d+)?)\s+(?:de|con)\s+(.+)$/i);
    if (qtyDeCodeMatch) {
      const qty = parseFloat(qtyDeCodeMatch[1].replace(',', '.'));
      const rawCode = qtyDeCodeMatch[2].trim();
      this.emitAddComponent(rawCode, qty, unit, rawText, targetStep);
      return true;
    }

    // CASO 3: Directo "[CÓDIGO/NOMBRE] [CANTIDAD]" -> Ej: "811J 5", "811 5", "728 5", "Blanco Titanio 120"
    const directEndMatch = clean.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)$/);
    if (directEndMatch) {
      const rawCode = directEndMatch[1].trim();
      const qty = parseFloat(directEndMatch[2].replace(',', '.'));
      this.emitAddComponent(rawCode, qty, unit, rawText, targetStep);
      return true;
    }

    // CASO 4: En palabras (ej: "811J cinco", "Blanco Titanio diez")
    const words = clean.split(/\s+/);
    if (words.length >= 2) {
      let numStartIndex = -1;
      for (let i = 1; i < words.length; i++) {
        const w = words[i].toLowerCase();
        if (this.spanishNumbers[w] !== undefined || w === 'punto' || w === 'con') {
          numStartIndex = i;
          break;
        }
      }
      if (numStartIndex > 0) {
        const codeOrName = words.slice(0, numStartIndex).join(' ').trim();
        const numText = words.slice(numStartIndex).join(' ');
        const qty = this.parseSpanishNumber(numText);
        if (qty !== null && qty > 0) {
          this.emitAddComponent(codeOrName, qty, unit, rawText, targetStep);
          return true;
        }
      }
    }

    // CASO 5: Sin cantidad explícita (ej: "agregar 811J")
    if (clean && clean.length >= 1 && (text.toLowerCase().startsWith('agregar') || text.toLowerCase().startsWith('agrega') || text.toLowerCase().startsWith('poner') || text.toLowerCase().startsWith('añadir'))) {
      this.emitAddComponent(clean, 0, unit, rawText, targetStep);
      return true;
    }

    return false;
  }

  emitAddComponent(codeOrName, quantity, unit, rawText, targetStep = null) {
    let trimmed = (codeOrName || '').trim();
    // Normalizar códigos: comprimir espacios entre números y letras (ej: "811 J" -> "811J")
    trimmed = trimmed.replace(/(\d+)\s+([A-Za-z])/g, '$1$2').trim();

    const isAlphanumericCode = /^[A-Za-z0-9-_/.\s]{1,15}$/.test(trimmed);
    const code = isAlphanumericCode ? trimmed.replace(/\s+/g, '').toUpperCase() : trimmed.toUpperCase();
    const name = isAlphanumericCode ? trimmed.replace(/\s+/g, '').toUpperCase() : this.capitalize(trimmed);

    if (this.callbacks.onCommandDetected) {
      this.callbacks.onCommandDetected('ADD_COMPONENT', {
        code: code,
        name: name,
        quantity: quantity,
        unit: unit || 'g',
        step: targetStep
      }, rawText);
    }
  }

  handleColorSwitch(targetColorQuery, rawText) {
    if (!targetColorQuery) return;
    const cleanQuery = targetColorQuery
      .replace(/^el\s+|^la\s+|^al\s+/i, '')
      .replace(/[.,;:]+$/, '')
      .trim();

    if (this.callbacks.onCommandDetected) {
      this.callbacks.onCommandDetected('SWITCH_COLOR', { query: cleanQuery }, rawText);
    }
  }

  capitalize(str) {
    if (!str) return '';
    return str.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
}

window.voiceEngine = new VoiceEngine();
