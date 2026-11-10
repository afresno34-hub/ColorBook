/**
 * FABIO PINTURAS - Controlador Principal
 * Colorimetría Automática en Tiempo Real y Diagnóstico de Micrófono
 */

function initApp() {
  const state = {
    currentFormula: createEmptyFormula(),
    formulasList: [],
    targetWeight: null,
    scaleMultiplier: 1.0,
    selectedScaleLabel: '100% (Original)',
    activeFilter: 'all',
    searchQuery: '',
    activeTricapaStep: 1,
    isDirty: false
  };

  const elements = {
    btnToggleMic: document.getElementById('btnToggleMic'),
    btnMobileFloatingMic: document.getElementById('btnMobileFloatingMic'),
    micStatusBadge: document.getElementById('micStatusBadge'),
    voiceWaveCanvas: document.getElementById('voiceWaveCanvas'),
    micIcon: document.getElementById('micIcon'),
    voiceTranscriptLive: document.getElementById('voiceTranscriptLive'),
    headerCommandInput: document.getElementById('headerCommandInput'),
    btnHeaderCommand: document.getElementById('btnHeaderCommand'),
    btnOpenEdgeDirect: document.getElementById('btnOpenEdgeDirect'),

    // Formula Header
    inputColorName: document.getElementById('inputColorName'),
    inputColorCode: document.getElementById('inputColorCode'),
    selectCategory: document.getElementById('selectCategory'),
    inputClient: document.getElementById('inputClient'),
    inputVehicle: document.getElementById('inputVehicle'),
    inputNotes: document.getElementById('inputNotes'),

    // Tricapa Steps UI
    tricapaStepsContainer: document.getElementById('tricapaStepsContainer'),
    btnStep1Tab: document.getElementById('btnStep1Tab'),
    btnStep2Tab: document.getElementById('btnStep2Tab'),
    step1CountBadge: document.getElementById('step1CountBadge'),
    step2CountBadge: document.getElementById('step2CountBadge'),
    currentStepIndicator: document.getElementById('currentStepIndicator'),
    currentStepLabel: document.getElementById('currentStepLabel'),

    // Table
    componentsTableBody: document.getElementById('componentsTableBody'),
    totalWeightDisplay: document.getElementById('totalWeightDisplay'),
    componentCountDisplay: document.getElementById('componentCountDisplay'),
    emptyTableNotice: document.getElementById('emptyTableNotice'),

    // Manual add
    inputNewCompCode: document.getElementById('inputNewCompCode'),
    inputNewCompName: document.getElementById('inputNewCompName'),
    inputNewCompQty: document.getElementById('inputNewCompQty'),
    selectNewCompUnit: document.getElementById('selectNewCompUnit'),
    btnAddManualComp: document.getElementById('btnAddManualComp'),

    // Actions
    btnSaveFormula: document.getElementById('btnSaveFormula'),
    btnNewFormula: document.getElementById('btnNewFormula'),
    btnPrintTicket: document.getElementById('btnPrintTicket'),
    btnExportDb: document.getElementById('btnExportDb'),
    btnImportDb: document.getElementById('btnImportDb'),
    fileInputImport: document.getElementById('fileInputImport'),

    // Catalog & Search
    catalogList: document.getElementById('catalogList'),
    catalogSearchInput: document.getElementById('catalogSearchInput'),
    catalogCount: document.getElementById('catalogCount'),

    // Cantidad a preparar / Peso objetivo
    inputTargetWeight: document.getElementById('inputTargetWeight'),
    baseWeightBadge: document.getElementById('baseWeightBadge'),
    activeScaleFactorBadge: document.getElementById('activeScaleFactorBadge'),
    quickWeightPresets: document.querySelectorAll('.btn-weight-preset'),
    targetWeightSection: document.getElementById('targetWeightSection'),
    emptyFormulaHint: document.getElementById('emptyFormulaHint'),

    // Modals
    ticketModal: document.getElementById('ticketModal'),
    ticketContent: document.getElementById('ticketContent'),
    btnCloseTicket: document.getElementById('btnCloseTicket'),
    btnPrintTicketNow: document.getElementById('btnPrintTicketNow'),
    btnVoiceHelp: document.getElementById('btnVoiceHelp'),
    voiceHelpModal: document.getElementById('voiceHelpModal'),
    btnCloseVoiceHelp: document.getElementById('btnCloseVoiceHelp'),
    btnDeviceHelp: document.getElementById('btnDeviceHelp'),
    deviceModal: document.getElementById('deviceModal'),
    btnCloseDeviceModal: document.getElementById('btnCloseDeviceModal'),
    localIpBadge: document.getElementById('localIpBadge'),

    // Modal de Ayuda / Diagnóstico de Micrófono
    micHelpModal: document.getElementById('micHelpModal'),
    btnCloseMicHelpModal: document.getElementById('btnCloseMicHelpModal'),
    micDiagnosticReason: document.getElementById('micDiagnosticReason'),
    btnLaunchEdgeFromModal: document.getElementById('btnLaunchEdgeFromModal'),

    // Navegación en Celulares
    appWorkspace: document.querySelector('.app-workspace'),
    btnMobileTabWorkbench: document.getElementById('btnMobileTabWorkbench'),
    btnMobileTabCatalog: document.getElementById('btnMobileTabCatalog'),
    mobileCatalogCountBadge: document.getElementById('mobileCatalogCountBadge'),

    // Autenticación COLORVOX
    btnOpenAuthModal: document.getElementById('btnOpenAuthModal'),
    userProfileChip: document.getElementById('userProfileChip'),
    userNameDisplay: document.getElementById('userNameDisplay'),
    userAvatarText: document.getElementById('userAvatarText'),
    btnLogout: document.getElementById('btnLogout'),
    authModal: document.getElementById('authModal'),
    btnCloseAuthModal: document.getElementById('btnCloseAuthModal'),
    tabAuthLogin: document.getElementById('tabAuthLogin'),
    tabAuthRegister: document.getElementById('tabAuthRegister'),
    authErrorMessage: document.getElementById('authErrorMessage'),
    authSuccessMessage: document.getElementById('authSuccessMessage'),
    formLogin: document.getElementById('formLogin'),
    formRegister: document.getElementById('formRegister'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    registerName: document.getElementById('registerName'),
    registerEmail: document.getElementById('registerEmail'),
    registerPassword: document.getElementById('registerPassword'),
    linkSwitchToRegister: document.getElementById('linkSwitchToRegister'),
    linkSwitchToLogin: document.getElementById('linkSwitchToLogin'),

    // Modal de Gmail
    btnGmailSettings: document.getElementById('btnGmailSettings'),
    gmailModal: document.getElementById('gmailModal'),
    btnCloseGmailModal: document.getElementById('btnCloseGmailModal'),
    formGmailConfig: document.getElementById('formGmailConfig'),
    gmailInputUser: document.getElementById('gmailInputUser'),
    gmailInputPass: document.getElementById('gmailInputPass'),
    btnSaveGmailConfig: document.getElementById('btnSaveGmailConfig'),
    btnTestGmailEmail: document.getElementById('btnTestGmailEmail'),
    gmailAlertBox: document.getElementById('gmailAlertBox'),

    // Modal de Soporte Técnico
    btnOpenSupportModal: document.getElementById('btnOpenSupportModal'),
    supportModal: document.getElementById('supportModal'),
    btnCloseSupportModal: document.getElementById('btnCloseSupportModal'),
    formSupportTicket: document.getElementById('formSupportTicket'),
    supportName: document.getElementById('supportName'),
    supportEmail: document.getElementById('supportEmail'),
    supportSubject: document.getElementById('supportSubject'),
    supportMessage: document.getElementById('supportMessage'),
    supportAlertBox: document.getElementById('supportAlertBox'),
    btnSubmitSupport: document.getElementById('btnSubmitSupport')
  };

  function createEmptyFormula() {
    return {
      id: null,
      name: '',
      code: '',
      category: 'HS - Poliuretano Altos Sólidos',
      colorHex: '#00ff88',
      client: '',
      vehicle: '',
      notes: '',
      unit: 'g',
      components: [],
      step1Components: [],
      step2Components: []
    };
  }

  const browser = window.voiceEngine.detectBrowser();

  fetchLocalServerInfo();

  async function fetchLocalServerInfo() {
    try {
      const res = await fetch('/api/info');
      if (res.ok) {
        const info = await res.json();
        if (elements.localIpBadge && info.ip) {
          elements.localIpBadge.textContent = `http://${info.ip}:${info.port || 3000}`;
        }
      }
    } catch (e) {
      if (elements.localIpBadge) {
        elements.localIpBadge.textContent = `http://${window.location.hostname}:3000`;
      }
    }
  }

  // Abrir Microsoft Edge desde el servidor
  async function launchEdgeBrowser() {
    try {
      showToast('Abriendo Microsoft Edge...', 'info');
      await fetch('/api/open-edge');
    } catch (e) {
      window.open('http://localhost:3000', '_blank');
    }
  }

  if (elements.btnOpenEdgeDirect) {
    elements.btnOpenEdgeDirect.addEventListener('click', launchEdgeBrowser);
  }
  if (elements.btnLaunchEdgeFromModal) {
    elements.btnLaunchEdgeFromModal.addEventListener('click', () => {
      elements.micHelpModal.classList.remove('visible');
      launchEdgeBrowser();
    });
  }

  // Inicializar UI limpia inmediatamente sin bloquearse
  updateWorkbenchUI();

  function updateAutomaticColorCircle() {
    // Círculos cromáticos eliminados
  }

  // CALLBACKS DEL MOTOR DE VOZ
  window.voiceEngine.callbacks.onStatusChange = (status, msg) => {
    if (status === 'listening') {
      elements.micStatusBadge.className = 'status-badge active';
      elements.micStatusBadge.innerHTML = '<span class="pulse-dot"></span> <b>Escuchando en vivo...</b>';
      elements.btnToggleMic.className = 'btn-mic-main recording';
      elements.btnToggleMic.querySelector('.mic-label').textContent = 'Escuchando (Clic para pausar)';
      if (elements.btnMobileFloatingMic) elements.btnMobileFloatingMic.classList.add('recording');
      window.audioEffects.startVisualizer(elements.voiceWaveCanvas);
    } else if (status === 'connecting') {
      elements.micStatusBadge.className = 'status-badge connecting';
      elements.micStatusBadge.innerHTML = '<span class="idle-dot"></span> Conectando...';
      elements.btnToggleMic.querySelector('.mic-label').textContent = 'Iniciando...';
      if (elements.btnMobileFloatingMic) elements.btnMobileFloatingMic.classList.remove('recording');
    } else if (status === 'error') {
      elements.micStatusBadge.className = 'status-badge error';
      elements.micStatusBadge.innerHTML = '<span class="error-dot"></span> <b>Error de Micrófono</b>';
      elements.btnToggleMic.className = 'btn-mic-main';
      elements.btnToggleMic.querySelector('.mic-label').textContent = 'Micrófono Inactivo';
      if (elements.btnMobileFloatingMic) elements.btnMobileFloatingMic.classList.remove('recording');
      window.audioEffects.stopVisualizer(elements.voiceWaveCanvas);
    } else {
      elements.micStatusBadge.className = 'status-badge idle';
      elements.micStatusBadge.innerHTML = '<span class="idle-dot"></span> Micrófono en reposo';
      elements.btnToggleMic.className = 'btn-mic-main';
      elements.btnToggleMic.querySelector('.mic-label').textContent = 'Activar Micrófono';
      if (elements.btnMobileFloatingMic) elements.btnMobileFloatingMic.classList.remove('recording');
      window.audioEffects.stopVisualizer(elements.voiceWaveCanvas);
    }
  };

  window.voiceEngine.callbacks.onTranscript = (transcript, isFinal) => {
    if (elements.voiceTranscriptLive) {
      elements.voiceTranscriptLive.textContent = transcript || 'Di: "Color Rojo Rubí, código R55", "Agregar 811J 5g", "Escala 1/4"...';
      if (isFinal) {
        elements.voiceTranscriptLive.classList.add('final-flash');
        setTimeout(() => elements.voiceTranscriptLive.classList.remove('final-flash'), 400);
      }
    }
  };

  window.voiceEngine.callbacks.onError = (code, message) => {
    if (code === 'aborted' || code === 'no-speech' || code === 'canceled') return;

    if (code === 'not-allowed') {
      if (elements.micDiagnosticReason) {
        elements.micDiagnosticReason.innerHTML = `
          <b>Permiso de micrófono bloqueado:</b><br>
          Tu navegador o sistema tiene el micrófono bloqueado para esta página.<br>
          Haz clic en el ícono de candado junto a la URL y selecciona <b>"Permitir Micrófono"</b>.
        `;
      }
      if (elements.micHelpModal) elements.micHelpModal.classList.add('visible');
    } else if (browser.isOpera) {
      if (elements.micDiagnosticReason) {
        elements.micDiagnosticReason.innerHTML = `
          <b>Navegador: Opera GX</b><br>
          Opera GX bloquea internamente el servicio de voz de Google.<br>
          Para dictar por voz, abre la app en <b>Google Chrome</b> o <b>Microsoft Edge</b>.
        `;
      }
      if (elements.micHelpModal) elements.micHelpModal.classList.add('visible');
    } else {
      console.warn('Aviso de micrófono:', code, message);
      if (elements.voiceTranscriptLive) {
        elements.voiceTranscriptLive.textContent = '🎙️ Micrófono en reposo. Presiona "Activar Micrófono" para hablar.';
      }
    }
  };

  window.voiceEngine.callbacks.onCommandDetected = (action, data, rawText) => {
    handleVoiceCommand(action, data, rawText);
  };

  // MANEJADOR PRINCIPAL DE COMANDOS DE VOZ Y TEXTO
  function handleVoiceCommand(action, data, rawText) {
    switch (action) {
      case 'SET_COLOR_AND_CODE': {
        const { name, code } = data;
        state.currentFormula.id = 'fp-' + Date.now();
        state.currentFormula.name = name;
        state.currentFormula.code = code;
        state.currentFormula.components = [];
        state.currentFormula.step1Components = [];
        state.currentFormula.step2Components = [];
        setTargetWeight(null);
        updateWorkbenchUI();
        window.audioEffects.playColorSwitch();
        showToast(`Color: ${name} (${code})`, 'success');
        break;
      }

      case 'SWITCH_CATEGORY': {
        const { category } = data;
        state.currentFormula.category = category;
        elements.selectCategory.value = category;
        updateTricapaUI();
        updateWorkbenchUI();
        window.audioEffects.playItemAdded();
        showToast(`Línea: ${category}`, 'info');
        break;
      }

      case 'SWITCH_STEP': {
        if (state.currentFormula.category !== 'Base Tricapas') {
          state.currentFormula.category = 'Base Tricapas';
          elements.selectCategory.value = 'Base Tricapas';
        }
        setTricapaStep(data.step);
        window.audioEffects.playItemAdded();
        showToast(`Activo: Paso ${data.step}`, 'info');
        break;
      }

      case 'SWITCH_COLOR': {
        const query = data.query;
        const found = window.formulaDB.findFormula(query);

        if (found) {
          loadFormula(found, true);
          window.audioEffects.playColorSwitch();
          showToast(`Cargada: ${found.name}`, 'success');
        } else {
          window.audioEffects.playColorSwitch();
          state.currentFormula.id = 'fp-' + Date.now();
          const cleanVal = query.trim();
          state.currentFormula.code = cleanVal.toUpperCase();
          state.currentFormula.name = cleanVal;
          state.currentFormula.components = [];
          state.currentFormula.step1Components = [];
          state.currentFormula.step2Components = [];
          setTargetWeight(null);
          updateWorkbenchUI();
          showToast(`Fórmula: ${cleanVal}`, 'info');
        }
        break;
      }

      case 'ADD_COMPONENT': {
        const { code, name, quantity, unit, step } = data;
        let targetCode = (code || name).trim().replace(/\s+/g, '').toUpperCase();
        let targetName = (name || code).trim();

        let targetList;
        let stepNum = state.activeTricapaStep;
        if (state.currentFormula.category === 'Base Tricapas') {
          if (step === 1 || step === 2) {
            stepNum = step;
            state.activeTricapaStep = step;
          }
          if (!state.currentFormula.step1Components) state.currentFormula.step1Components = [];
          if (!state.currentFormula.step2Components) state.currentFormula.step2Components = [];
          targetList = stepNum === 1 ? state.currentFormula.step1Components : state.currentFormula.step2Components;
        } else {
          if (!state.currentFormula.components) state.currentFormula.components = [];
          targetList = state.currentFormula.components;
        }

        const existingIdx = targetList.findIndex(c => {
          const cCodeClean = (c.code || '').replace(/\s+/g, '').toUpperCase();
          const targetCodeClean = targetCode.replace(/\s+/g, '').toUpperCase();
          const cNameClean = (c.name || '').trim().toLowerCase();
          const targetNameClean = targetName.toLowerCase();

          // 1. Coincidencia directa de código o nombre
          if ((cCodeClean && cCodeClean === targetCodeClean) ||
              (cNameClean && cNameClean === targetNameClean)) {
            return true;
          }

          // 2. Coincidencia numérica (si en mesa está "811J" y dicen "811", o viceversa)
          const cDigits = cCodeClean.replace(/\D/g, '');
          const targetDigits = targetCodeClean.replace(/\D/g, '');
          if (cDigits && cDigits.length >= 2 && cDigits === targetDigits) {
            return true;
          }

          return false;
        });

        if (existingIdx >= 0) {
          // Lo que el usuario dictó se suma directamente a lo que ve en pantalla en la escala actual
          const currentDisplayed = parseFloat((targetList[existingIdx].quantity * state.scaleMultiplier).toFixed(2));
          const addQty = parseFloat(quantity) || 0;
          const newDisplayed = parseFloat((currentDisplayed + addQty).toFixed(2));
          
          // Almacenar en base 1:1 para que al multiplicar por scaleMultiplier dé exactamente newDisplayed
          targetList[existingIdx].quantity = state.scaleMultiplier > 0 ? (newDisplayed / state.scaleMultiplier) : newDisplayed;

          // Normalizar código existente sin espacios (ej: "811 J" -> "811J")
          if (targetList[existingIdx].code) {
            targetList[existingIdx].code = targetList[existingIdx].code.replace(/\s+/g, '').toUpperCase();
          }
          if (targetList[existingIdx].name && targetList[existingIdx].name.includes(' ')) {
            targetList[existingIdx].name = targetList[existingIdx].code;
          }
          if (unit) targetList[existingIdx].unit = unit;

          window.audioEffects.playItemAdded();
          updateWorkbenchUI();
          highlightComponentRow(existingIdx);
          const compCode = targetList[existingIdx].code;
          showToast(`➕ Sumado a [${compCode}]: +${addQty}${unit || 'g'} (Total: ${newDisplayed}${unit || 'g'})`, 'success');
          if (elements.voiceTranscriptLive) {
            elements.voiceTranscriptLive.textContent = `➕ [${compCode}] Sumado +${addQty}${unit || 'g'} ➔ Total: ${newDisplayed}${unit || 'g'}`;
          }
        } else {
          const normalizedCode = targetCode.replace(/(\d+)\s+([A-Za-z])/g, '$1$2').replace(/\s+/g, '').toUpperCase();
          const targetQty = parseFloat(quantity) || 0;
          const baseQty = state.scaleMultiplier > 0 ? (targetQty / state.scaleMultiplier) : targetQty;

          const newComp = {
            id: 'c-' + Date.now(),
            code: normalizedCode,
            name: (targetName && targetName.toUpperCase() !== normalizedCode) ? targetName : '',
            quantity: baseQty,
            unit: unit || 'g'
          };
          targetList.push(newComp);
          window.audioEffects.playItemAdded();
          updateWorkbenchUI();
          highlightComponentRow(targetList.length - 1);
          showToast(`Agregado [${normalizedCode}]: ${targetQty}${unit || 'g'}`, 'success');
          if (elements.voiceTranscriptLive) {
            elements.voiceTranscriptLive.textContent = `✅ [${normalizedCode}] Agregado: ${targetQty}${unit || 'g'}`;
          }
        }
        state.isDirty = true;
        break;
      }

      case 'SET_TARGET_WEIGHT': {
        const { targetWeight, isOriginal } = data;
        if (isOriginal) {
          setTargetWeight(null);
          showToast('Fórmula restablecida al 100% (Peso original)', 'info');
        } else {
          setTargetWeight(targetWeight);
          showToast(`Fórmula ajustada para preparar ${targetWeight} g`, 'info');
        }
        break;
      }

      case 'SAVE_FORMULA': {
        saveCurrentFormula();
        break;
      }

      case 'NEW_FORMULA': {
        state.currentFormula = createEmptyFormula();
        state.activeTricapaStep = 1;
        setTargetWeight(null);
        updateWorkbenchUI();
        window.audioEffects.playItemAdded();
        showToast('Mesa de trabajo limpia', 'info');
        break;
      }

      case 'REMOVE_LAST_COMPONENT': {
        const currentList = getActiveComponentList();
        if (currentList.length > 0) {
          const removed = currentList.pop();
          updateWorkbenchUI();
          window.audioEffects.playNotice();
          showToast(`Eliminado: ${removed.code || removed.name}`, 'info');
        } else {
          showToast('No hay componentes para eliminar', 'warning');
        }
        break;
      }

      case 'PRINT_TICKET': {
        openTicketModal();
        break;
      }

      case 'UNRECOGNIZED': {
        showToast(`Comando: "${rawText}"`, 'info');
        break;
      }
    }
  }

  function getActiveComponentList() {
    const f = state.currentFormula;
    if (f.category === 'Base Tricapas') {
      if (!f.step1Components) f.step1Components = [];
      if (!f.step2Components) f.step2Components = [];
      return state.activeTricapaStep === 1 ? f.step1Components : f.step2Components;
    }
    if (!f.components) f.components = [];
    return f.components;
  }

  function setTricapaStep(stepNum) {
    state.activeTricapaStep = stepNum;
    elements.btnStep1Tab.classList.toggle('active', stepNum === 1);
    elements.btnStep2Tab.classList.toggle('active', stepNum === 2);
    elements.currentStepLabel.textContent = stepNum === 1 
      ? 'Mostrando: Paso 1 - Capa de Fondo (Base)' 
      : 'Mostrando: Paso 2 - Capa de Efecto / Perla';
    renderComponentsTable();
  }

  function updateTricapaUI() {
    const isTricapa = state.currentFormula.category === 'Base Tricapas';
    elements.tricapaStepsContainer.style.display = isTricapa ? 'flex' : 'none';
    elements.currentStepIndicator.style.display = isTricapa ? 'flex' : 'none';

    if (isTricapa) {
      const s1 = state.currentFormula.step1Components ? state.currentFormula.step1Components.length : 0;
      const s2 = state.currentFormula.step2Components ? state.currentFormula.step2Components.length : 0;
      elements.step1CountBadge.textContent = `${s1} comp.`;
      elements.step2CountBadge.textContent = `${s2} comp.`;
      elements.btnStep1Tab.classList.toggle('active', state.activeTricapaStep === 1);
      elements.btnStep2Tab.classList.toggle('active', state.activeTricapaStep === 2);
    }
  }

  async function saveCurrentFormula() {
    if (!window.formulaDB.isAuthenticated()) {
      window.audioEffects.playNotice();
      showToast('Debes iniciar sesión con tu cuenta para guardar fórmulas en tu taller.', 'warning');
      openAuthModal('login');
      return;
    }

    syncFormInputsToState();

    if (!state.currentFormula.name || state.currentFormula.name.trim() === '') {
      state.currentFormula.name = state.currentFormula.code || `Fórmula ${new Date().toLocaleDateString()}`;
    }
    if (!state.currentFormula.code || state.currentFormula.code.trim() === '') {
      state.currentFormula.code = state.currentFormula.name.slice(0, 10).toUpperCase();
    }

    if (state.currentFormula.category === 'Base Tricapas') {
      const step1Count = state.currentFormula.step1Components ? state.currentFormula.step1Components.length : 0;
      const step2Count = state.currentFormula.step2Components ? state.currentFormula.step2Components.length : 0;

      if (step1Count === 0 || step2Count === 0) {
        window.audioEffects.playNotice();
        const errorMsg = '⚠️ En Base Tricapas es OBLIGATORIO ingresar componentes en el Paso 1 (Fondo) y en el Paso 2 (Efecto). No se puede guardar la fórmula.';
        showToast(errorMsg, 'error');

        if (step1Count === 0) setTricapaStep(1);
        else if (step2Count === 0) setTricapaStep(2);

        return;
      }
    } else {
      const compsCount = state.currentFormula.components ? state.currentFormula.components.length : 0;
      if (compsCount === 0) {
        window.audioEffects.playNotice();
        showToast('Agrega al menos un componente a la fórmula antes de guardar.', 'warning');
        return;
      }
    }

    try {
      const saved = await window.formulaDB.saveFormula(state.currentFormula);
      state.currentFormula = JSON.parse(JSON.stringify(saved));
      state.formulasList = window.formulaDB.cache;
      state.isDirty = false;

      renderCatalog();
      updateWorkbenchUI();
      window.audioEffects.playSaved();
      showToast(`¡Fórmula "${saved.name}" (${saved.code}) guardada con éxito!`, 'success');
    } catch (e) {
      console.error(e);
      window.audioEffects.playNotice();
      showToast(e.message || 'Error al guardar la fórmula', 'error');
    }
  }

  function syncFormInputsToState() {
    state.currentFormula.name = elements.inputColorName.value.trim();
    state.currentFormula.code = elements.inputColorCode.value.trim().toUpperCase();
    state.currentFormula.category = elements.selectCategory.value;
    state.currentFormula.client = elements.inputClient.value.trim();
    state.currentFormula.vehicle = elements.inputVehicle.value.trim();
    state.currentFormula.notes = elements.inputNotes.value.trim();
  }

  function updateWorkbenchUI() {
    const f = state.currentFormula;
    elements.inputColorName.value = f.name || '';
    elements.inputColorCode.value = f.code || '';
    elements.selectCategory.value = f.category || 'HS - Poliuretano Altos Sólidos';
    elements.inputClient.value = f.client || '';
    elements.inputVehicle.value = f.vehicle || '';
    elements.inputNotes.value = f.notes || '';

    updateTricapaUI();
    renderComponentsTable();
    updateAutomaticColorCircle();
  }

  function renderComponentsTable() {
    const comps = getActiveComponentList();
    elements.componentsTableBody.innerHTML = '';

    updateTricapaUI();

    if (comps.length === 0) {
      elements.emptyTableNotice.style.display = 'block';
    } else {
      elements.emptyTableNotice.style.display = 'none';
    }

    const baseTotal = calculateTotalWeight(comps);
    if (elements.baseWeightBadge) {
      elements.baseWeightBadge.textContent = `${baseTotal.toFixed(2)} g`;
    }

    // Mostrar opciones de cantidad sólo si la fórmula original ya tiene componentes
    if (elements.targetWeightSection) {
      if (baseTotal > 0) {
        elements.targetWeightSection.style.display = 'block';
        if (elements.emptyFormulaHint) elements.emptyFormulaHint.style.display = 'none';
      } else {
        elements.targetWeightSection.style.display = 'none';
        if (elements.emptyFormulaHint) elements.emptyFormulaHint.style.display = 'block';
      }
    }

    // Si hay un peso objetivo definido, calcular el multiplicador de escala proporcional
    if (state.targetWeight && state.targetWeight > 0) {
      state.scaleMultiplier = baseTotal > 0 ? (state.targetWeight / baseTotal) : 1.0;
      const pct = (state.scaleMultiplier * 100).toFixed(0);
      state.selectedScaleLabel = `${state.targetWeight} g (${pct}%)`;
    } else {
      state.scaleMultiplier = 1.0;
      state.selectedScaleLabel = '100% (Original)';
    }

    if (elements.activeScaleFactorBadge) {
      elements.activeScaleFactorBadge.textContent = state.selectedScaleLabel;
    }

    let scaledTotal = 0;

    comps.forEach((comp, index) => {
      const scaledQty = parseFloat((comp.quantity * state.scaleMultiplier).toFixed(2));
      scaledTotal += scaledQty;

      const pct = baseTotal > 0 ? ((comp.quantity / baseTotal) * 100).toFixed(1) : 0;
      const codeVal = (comp.code || comp.name || '').trim().toUpperCase();
      const descVal = (comp.name && comp.name.toUpperCase() !== codeVal) ? comp.name : '';

      const tr = document.createElement('tr');
      tr.id = `comp-row-${index}`;
      tr.className = 'comp-table-row';
      tr.innerHTML = `
        <td class="col-num">${index + 1}</td>
        <td class="col-code">
          <div class="ink-code-wrapper">
            <span class="badge-code-full" title="Código de Tinta">${escapeHtml(codeVal)}</span>
          </div>
        </td>
        <td class="col-name">
          <input type="text" class="cell-input inline-name" value="${escapeHtml(descVal)}" placeholder="Descripción opcional..." data-index="${index}" title="Descripción o pigmento">
        </td>
        <td class="col-qty">
          <div class="qty-input-wrap">
            <input type="number" step="0.01" class="cell-input inline-qty" value="${scaledQty}" data-index="${index}" title="Gramos a pesar">
            <span class="qty-unit">${comp.unit || 'g'}</span>
          </div>
        </td>
        <td class="col-pct">
          <div class="pct-bar-wrapper">
            <div class="pct-bar" style="width: ${Math.min(pct, 100)}%"></div>
            <span class="pct-label">${pct}%</span>
          </div>
        </td>
        <td class="col-actions">
          <button class="btn-icon-danger btn-delete-comp" title="Eliminar componente" data-index="${index}">
            ✕
          </button>
        </td>
      `;

      elements.componentsTableBody.appendChild(tr);
    });

    const fullTotalG = (scaledTotal).toFixed(2);
    elements.totalWeightDisplay.textContent = `${fullTotalG} g`;

    if (state.currentFormula.category === 'Base Tricapas') {
      const s1 = state.currentFormula.step1Components ? state.currentFormula.step1Components.length : 0;
      const s2 = state.currentFormula.step2Components ? state.currentFormula.step2Components.length : 0;
      elements.componentCountDisplay.textContent = `Tricapa: ${s1} en Fondo + ${s2} en Efecto (${s1 + s2} total)`;
    } else {
      elements.componentCountDisplay.textContent = `${comps.length} ${comps.length === 1 ? 'componente' : 'componentes'}`;
    }

    elements.componentsTableBody.querySelectorAll('.inline-code').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const list = getActiveComponentList();
        list[idx].code = e.target.value.trim().toUpperCase();
        state.isDirty = true;
        updateAutomaticColorCircle();
      });
    });

    elements.componentsTableBody.querySelectorAll('.inline-name').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const list = getActiveComponentList();
        list[idx].name = e.target.value.trim();
        state.isDirty = true;
        updateAutomaticColorCircle();
      });
    });

    elements.componentsTableBody.querySelectorAll('.inline-qty').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const list = getActiveComponentList();
        const newScaled = parseFloat(e.target.value) || 0;
        list[idx].quantity = state.scaleMultiplier > 0 ? newScaled / state.scaleMultiplier : newScaled;
        state.isDirty = true;
        renderComponentsTable();
        updateAutomaticColorCircle();
      });
    });

    elements.componentsTableBody.querySelectorAll('.btn-delete-comp').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const list = getActiveComponentList();
        const removed = list.splice(idx, 1)[0];
        window.audioEffects.playNotice();
        updateWorkbenchUI();
        showToast(`Eliminado ${removed.code || removed.name}`, 'info');
      });
    });
  }

  function highlightComponentRow(index) {
    setTimeout(() => {
      const row = document.getElementById(`comp-row-${index}`);
      if (row) {
        if (typeof row.scrollIntoView === 'function') {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        row.classList.add('row-highlight');
        setTimeout(() => row.classList.remove('row-highlight'), 1800);
      }
    }, 50);
  }

  function calculateTotalWeight(components) {
    if (!components || !components.length) return 0;
    return components.reduce((acc, c) => acc + (parseFloat(c.quantity) || 0), 0);
  }

  function calculateFormulaTotal(formula) {
    if (formula.category === 'Base Tricapas') {
      const s1 = calculateTotalWeight(formula.step1Components);
      const s2 = calculateTotalWeight(formula.step2Components);
      return (s1 + s2).toFixed(1);
    }
    return calculateTotalWeight(formula.components).toFixed(1);
  }

  function getTotalWeight() {
    const f = state.currentFormula;
    let base = 0;
    if (f.category === 'Base Tricapas') {
      base = calculateTotalWeight(f.step1Components) + calculateTotalWeight(f.step2Components);
    } else {
      base = calculateTotalWeight(f.components);
    }
    return (base * state.scaleMultiplier).toFixed(2);
  }

  function setMobileView(view) {
    if (!elements.appWorkspace) return;
    if (view === 'catalog') {
      elements.appWorkspace.classList.add('show-catalog');
      elements.appWorkspace.classList.remove('show-workbench');
      if (elements.btnMobileTabCatalog) elements.btnMobileTabCatalog.classList.add('active');
      if (elements.btnMobileTabWorkbench) elements.btnMobileTabWorkbench.classList.remove('active');
    } else {
      elements.appWorkspace.classList.add('show-workbench');
      elements.appWorkspace.classList.remove('show-catalog');
      if (elements.btnMobileTabWorkbench) elements.btnMobileTabWorkbench.classList.add('active');
      if (elements.btnMobileTabCatalog) elements.btnMobileTabCatalog.classList.remove('active');
    }
  }

  if (elements.btnMobileTabWorkbench) {
    elements.btnMobileTabWorkbench.addEventListener('click', () => setMobileView('workbench'));
  }
  if (elements.btnMobileTabCatalog) {
    elements.btnMobileTabCatalog.addEventListener('click', () => setMobileView('catalog'));
  }

  function loadFormula(formula, speakNotice = false) {
    state.currentFormula = JSON.parse(JSON.stringify(formula));
    if (!state.currentFormula.step1Components) state.currentFormula.step1Components = [];
    if (!state.currentFormula.step2Components) state.currentFormula.step2Components = [];
    state.activeTricapaStep = 1;
    setTargetWeight(null);
    updateWorkbenchUI();
    setMobileView('workbench');

    document.querySelectorAll('.catalog-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === formula.id);
    });
  }

  function renderCatalog() {
    const list = state.formulasList;
    const filter = state.activeFilter;
    const q = state.searchQuery.toLowerCase().trim();

    const filtered = list.filter(item => {
      if (filter !== 'all' && item.category !== filter) return false;
      if (q) {
        const searchTarget = `${item.name} ${item.code} ${item.vehicle || ''} ${item.client || ''}`.toLowerCase();
        return searchTarget.includes(q);
      }
      return true;
    });

    elements.catalogCount.textContent = `${filtered.length} de ${list.length}`;
    if (elements.mobileCatalogCountBadge) {
      elements.mobileCatalogCountBadge.textContent = list.length;
    }
    elements.catalogList.innerHTML = '';

    if (filtered.length === 0) {
      elements.catalogList.innerHTML = `
        <div class="empty-catalog-box">
          <p style="padding:15px; text-align:center; color:#94a3b8; font-size:0.8rem;">No se encontraron fórmulas.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = `catalog-item ${state.currentFormula.id === item.id ? 'active' : ''}`;
      card.dataset.id = item.id;

      const totalWeight = calculateFormulaTotal(item);
      const compsCount = item.category === 'Base Tricapas'
        ? (item.step1Components ? item.step1Components.length : 0) + (item.step2Components ? item.step2Components.length : 0)
        : (item.components ? item.components.length : 0);

      card.innerHTML = `
        <div class="item-info">
          <div class="item-header-row">
            <span class="item-title">${escapeHtml(item.name)}</span>
            <span class="item-code">${escapeHtml(item.code || 'S/C')}</span>
          </div>
          <div class="item-meta">
            <span>${escapeHtml(item.category || 'Automotriz')}</span> • 
            <span>${compsCount} pigm.</span> • 
            <span>${totalWeight}g</span>
          </div>
          ${item.vehicle ? `<div class="item-sub">${escapeHtml(item.vehicle)}</div>` : ''}
        </div>
        <button class="btn-item-delete" title="Eliminar fórmula" data-id="${item.id}">✕</button>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-item-delete')) return;
        loadFormula(item, false);
        window.audioEffects.playColorSwitch();
        showToast(`Cargada: ${item.name}`, 'info');
      });

      card.querySelector('.btn-item-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`¿Deseas eliminar la fórmula "${item.name}"?`)) {
          await window.formulaDB.deleteFormula(item.id);
          state.formulasList = window.formulaDB.cache;
          renderCatalog();
          showToast('Fórmula eliminada', 'info');
        }
      });

      elements.catalogList.appendChild(card);
    });
  }

  function setTargetWeight(weight) {
    const comps = getActiveComponentList();
    const baseTotal = calculateTotalWeight(comps);

    if (weight === null || weight === undefined || weight === '' || weight === 'base') {
      state.targetWeight = null;
      state.scaleMultiplier = 1.0;
      state.selectedScaleLabel = '100% (Original)';
      if (elements.inputTargetWeight) elements.inputTargetWeight.value = '';
    } else {
      const numWeight = parseFloat(weight);
      if (isNaN(numWeight) || numWeight <= 0) {
        state.targetWeight = null;
        state.scaleMultiplier = 1.0;
        state.selectedScaleLabel = '100% (Original)';
        if (elements.inputTargetWeight) elements.inputTargetWeight.value = '';
      } else {
        state.targetWeight = numWeight;
        state.scaleMultiplier = baseTotal > 0 ? (numWeight / baseTotal) : 1.0;
        const pct = (state.scaleMultiplier * 100).toFixed(0);
        state.selectedScaleLabel = `${numWeight} g (${pct}%)`;
        if (elements.inputTargetWeight) elements.inputTargetWeight.value = numWeight;
      }
    }

    if (elements.activeScaleFactorBadge) {
      elements.activeScaleFactorBadge.textContent = state.selectedScaleLabel;
    }

    if (elements.quickWeightPresets) {
      elements.quickWeightPresets.forEach(btn => {
        const preset = btn.dataset.preset;
        if (preset === 'base') {
          btn.classList.toggle('active', state.targetWeight === null);
        } else {
          btn.classList.toggle('active', state.targetWeight !== null && Math.abs(parseFloat(preset) - state.targetWeight) < 0.01);
        }
      });
    }

    renderComponentsTable();
  }

  function openTicketModal() {
    const f = state.currentFormula;
    const date = new Date().toLocaleString();
    const isTricapa = f.category === 'Base Tricapas';

    let tableHtml = '';

    if (isTricapa) {
      const s1 = f.step1Components || [];
      const s2 = f.step2Components || [];
      const s1Total = (calculateTotalWeight(s1) * state.scaleMultiplier).toFixed(2);
      const s2Total = (calculateTotalWeight(s2) * state.scaleMultiplier).toFixed(2);
      const grandTotal = (parseFloat(s1Total) + parseFloat(s2Total)).toFixed(2);

      tableHtml = `
        <h4 style="margin-top:10px; color:#064e3b; border-bottom:1px solid #064e3b; padding-bottom:4px;">PASO 1: CAPA DE FONDO (BASE)</h4>
        <table class="ticket-table">
          <thead>
            <tr><th>#</th><th>Código</th><th>Componente</th><th style="text-align:right;">Cantidad a Pesar</th></tr>
          </thead>
          <tbody>
            ${s1.map((c, i) => `
              <tr>
                <td>${i+1}</td>
                <td><code>${c.code || c.name}</code></td>
                <td><b>${escapeHtml(c.name)}</b></td>
                <td style="text-align:right; font-weight:800; font-size:1.1em; color:#047857;">${(c.quantity * state.scaleMultiplier).toFixed(2)} ${c.unit || 'g'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr><th colspan="3" style="text-align:right;">SUBTOTAL PASO 1 (FONDO):</th><th style="text-align:right; color:#047857; font-size:1.15em;">${s1Total} g</th></tr>
          </tfoot>
        </table>

        <h4 style="margin-top:20px; color:#064e3b; border-bottom:1px solid #064e3b; padding-bottom:4px;">PASO 2: CAPA DE EFECTO (PERLA / TINTE)</h4>
        <table class="ticket-table">
          <thead>
            <tr><th>#</th><th>Código</th><th>Componente</th><th style="text-align:right;">Cantidad a Pesar</th></tr>
          </thead>
          <tbody>
            ${s2.map((c, i) => `
              <tr>
                <td>${i+1}</td>
                <td><code>${c.code || c.name}</code></td>
                <td><b>${escapeHtml(c.name)}</b></td>
                <td style="text-align:right; font-weight:800; font-size:1.1em; color:#047857;">${(c.quantity * state.scaleMultiplier).toFixed(2)} ${c.unit || 'g'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr><th colspan="3" style="text-align:right;">SUBTOTAL PASO 2 (EFECTO):</th><th style="text-align:right; color:#047857; font-size:1.15em;">${s2Total} g</th></tr>
            <tr style="border-top:2px solid #064e3b;"><th colspan="3" style="text-align:right; font-size:1.15em;">PESO TOTAL COMBINADO TRICAPA:</th><th style="text-align:right; color:#d97706; font-size:1.3em;">${grandTotal} g</th></tr>
          </tfoot>
        </table>
      `;
    } else {
      const comps = f.components || [];
      const baseWeight = calculateTotalWeight(comps);
      const scaledTotal = (baseWeight * state.scaleMultiplier).toFixed(2);

      tableHtml = `
        <table class="ticket-table">
          <thead>
            <tr><th>#</th><th>Código</th><th>Componente</th><th>Proporción</th><th style="text-align:right;">Cantidad a Pesar</th></tr>
          </thead>
          <tbody>
            ${comps.map((c, i) => {
              const scaled = (c.quantity * state.scaleMultiplier).toFixed(2);
              const pct = baseWeight > 0 ? ((c.quantity / baseWeight) * 100).toFixed(1) : 0;
              return `
                <tr>
                  <td>${i + 1}</td>
                  <td><code>${c.code || c.name}</code></td>
                  <td><b>${escapeHtml(c.name && c.name !== c.code ? c.name : 'Tinta / Pigmento')}</b></td>
                  <td>${pct}%</td>
                  <td style="text-align:right; font-weight:800; font-size:1.1em; color:#047857;">${scaled} ${c.unit || 'g'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr><th colspan="4" style="text-align:right;">PESO TOTAL A MEZCLAR:</th><th style="text-align:right; font-size:1.25em; color:#047857;">${scaledTotal} g</th></tr>
          </tfoot>
        </table>
      `;
    }

    elements.ticketContent.innerHTML = `
      <div class="ticket-header">
        <div class="ticket-brand">
          <h2 style="display:flex; align-items:center; gap:8px;">
            <img src="images/colorbook-logo.png" alt="Color Book" style="height:36px; object-fit:contain;">
            <span>COLOR BOOK</span>
          </h2>
          <p>ALMACENES DE PINTURA • Laboratorio de Fórmulas Automotrices</p>
        </div>
        <div class="ticket-badge">ORDEN DE MEZCLA</div>
      </div>
      <hr class="ticket-divider">
      <div class="ticket-meta-grid">
        <div><b>Color:</b> ${escapeHtml(f.name || 'Sin nombre')}</div>
        <div><b>Código:</b> <span class="ticket-code-tag">${escapeHtml(f.code || 'S/C')}</span></div>
        <div><b>Línea:</b> <b>${escapeHtml(f.category)}</b></div>
        <div><b>Fecha:</b> ${date}</div>
        <div><b>Vehículo / Ref:</b> ${escapeHtml(f.vehicle || 'N/A')}</div>
        <div><b>Cliente:</b> ${escapeHtml(f.client || 'General')}</div>
        <div><b>Cantidad a Preparar:</b> <b>${state.selectedScaleLabel}</b></div>
        <div><b>Componentes:</b> <b>${isTricapa ? ((f.step1Components?.length || 0) + (f.step2Components?.length || 0)) : (f.components?.length || 0)} ítems</b></div>
      </div>
      ${f.notes ? `<div class="ticket-notes"><b>Observaciones:</b> ${escapeHtml(f.notes)}</div>` : ''}
      <hr class="ticket-divider">
      ${tableHtml}
      <div class="ticket-signatures">
        <div class="sign-box">
          <div class="sign-line"></div>
          <span>Colorista / Preparador</span>
        </div>
        <div class="sign-box">
          <div class="sign-line"></div>
          <span>Recibido por Cliente</span>
        </div>
      </div>
      <div class="ticket-footer">
        COLOR BOOK - ALMACENES DE PINTURA • Soporte Oficial: colorbookaadministracion@gmail.com
      </div>
    `;

    elements.ticketModal.classList.add('visible');
  }

  function addManualComponent() {
    const code = elements.inputNewCompCode ? elements.inputNewCompCode.value.trim().toUpperCase() : '';
    const name = elements.inputNewCompName.value.trim();
    const qty = parseFloat(elements.inputNewCompQty.value);
    const unit = elements.selectNewCompUnit.value;

    const finalCode = (code || name).trim().toUpperCase();
    const finalName = (name && name.toUpperCase() !== finalCode) ? name.trim() : '';

    if (!finalCode && !finalName) {
      alert('Ingresa el código o nombre del componente.');
      return;
    }
    if (isNaN(qty) || qty < 0) {
      alert('Ingresa una cantidad válida.');
      return;
    }

    const currentList = getActiveComponentList();
    const existingIdx = currentList.findIndex(c => {
      const cCodeClean = (c.code || '').replace(/\s+/g, '').toUpperCase();
      const finalCodeClean = finalCode.replace(/\s+/g, '').toUpperCase();
      const cNameClean = (c.name || '').trim().toLowerCase();
      const finalNameClean = finalName.toLowerCase();

      if ((cCodeClean && cCodeClean === finalCodeClean) ||
          (cNameClean && cNameClean === finalNameClean)) {
        return true;
      }
      const cDigits = cCodeClean.replace(/\D/g, '');
      const finalDigits = finalCodeClean.replace(/\D/g, '');
      if (cDigits && cDigits.length >= 2 && cDigits === finalDigits) {
        return true;
      }
      return false;
    });

    if (existingIdx >= 0) {
      const currentDisplayed = parseFloat((currentList[existingIdx].quantity * state.scaleMultiplier).toFixed(2));
      const addQty = parseFloat(qty) || 0;
      const newDisplayed = parseFloat((currentDisplayed + addQty).toFixed(2));
      currentList[existingIdx].quantity = state.scaleMultiplier > 0 ? (newDisplayed / state.scaleMultiplier) : newDisplayed;

      if (currentList[existingIdx].code) {
        currentList[existingIdx].code = currentList[existingIdx].code.replace(/\s+/g, '').toUpperCase();
      }
      if (unit) currentList[existingIdx].unit = unit;

      state.isDirty = true;
      if (elements.inputNewCompCode) elements.inputNewCompCode.value = '';
      elements.inputNewCompName.value = '';
      if (elements.inputNewCompQty) elements.inputNewCompQty.value = '';
      if (elements.inputNewCompCode && typeof elements.inputNewCompCode.focus === 'function') {
        elements.inputNewCompCode.focus();
      }

      window.audioEffects.playItemAdded();
      updateWorkbenchUI();
      highlightComponentRow(existingIdx);
      const matchedCode = currentList[existingIdx].code;
      showToast(`➕ Sumado a [${matchedCode}]: +${addQty}${unit || 'g'} (Total: ${newDisplayed}${unit || 'g'})`, 'success');
      return;
    }

    const baseQty = state.scaleMultiplier > 0 ? (qty / state.scaleMultiplier) : qty;
    currentList.push({
      id: 'c-' + Date.now(),
      code: finalCode,
      name: finalName,
      quantity: baseQty,
      unit: unit
    });

    state.isDirty = true;
    if (elements.inputNewCompCode) elements.inputNewCompCode.value = '';
    elements.inputNewCompName.value = '';
    if (elements.inputNewCompQty) elements.inputNewCompQty.value = '';
    if (elements.inputNewCompCode && typeof elements.inputNewCompCode.focus === 'function') {
      elements.inputNewCompCode.focus();
    }

    window.audioEffects.playItemAdded();
    updateWorkbenchUI();
    highlightComponentRow(currentList.length - 1);
    showToast(`Agregado [${finalCode}]: ${qty}${unit || 'g'}`, 'success');
  }

  // EVENT LISTENERS DEL MICRÓFONO
  elements.btnToggleMic.addEventListener('click', async () => {
    window.audioEffects.init();
    await window.voiceEngine.toggleListening();
  });

  // Ejecutar comando desde la barra superior de entrada rápida
  function executeHeaderCommand() {
    const txt = elements.headerCommandInput.value.trim();
    if (!txt) return;
    elements.headerCommandInput.value = '';
    window.voiceEngine.processVoiceInput(txt);
  }

  if (elements.btnHeaderCommand) {
    elements.btnHeaderCommand.addEventListener('click', executeHeaderCommand);
  }
  if (elements.headerCommandInput) {
    elements.headerCommandInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeHeaderCommand();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
      e.preventDefault();
      window.voiceEngine.toggleListening();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCurrentFormula();
    }
  });

  elements.btnSaveFormula.addEventListener('click', saveCurrentFormula);
  elements.btnNewFormula.addEventListener('click', () => {
    state.currentFormula = createEmptyFormula();
    state.activeTricapaStep = 1;
    setTargetWeight(null);
    updateWorkbenchUI();
  });
  elements.btnPrintTicket.addEventListener('click', openTicketModal);
  elements.btnAddManualComp.addEventListener('click', addManualComponent);

  elements.inputNewCompQty.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addManualComponent();
  });

  elements.inputColorName.addEventListener('input', () => {
    state.currentFormula.name = elements.inputColorName.value;
    updateAutomaticColorCircle();
  });

  elements.inputColorCode.addEventListener('input', () => {
    state.currentFormula.code = elements.inputColorCode.value.toUpperCase();
    updateAutomaticColorCircle();
  });

  elements.selectCategory.addEventListener('change', (e) => {
    state.currentFormula.category = e.target.value;
    updateTricapaUI();
    renderComponentsTable();
  });

  elements.btnStep1Tab.addEventListener('click', () => setTricapaStep(1));
  elements.btnStep2Tab.addEventListener('click', () => setTricapaStep(2));

  // Control numérico de cantidad a preparar
  if (elements.inputTargetWeight) {
    elements.inputTargetWeight.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      setTargetWeight(val ? parseFloat(val) : null);
    });
  }

  // Botones de presets rápidos de peso (50g, 100g, 200g, 250g, 500g, etc.)
  if (elements.quickWeightPresets) {
    elements.quickWeightPresets.forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (preset === 'base') {
          setTargetWeight(null);
          showToast('Fórmula restablecida al 100% (Peso original)', 'info');
        } else {
          const w = parseFloat(preset);
          setTargetWeight(w);
          showToast(`Preparar: ${w} gramos`, 'info');
        }
      });
    });
  }

  // Botón flotante de micrófono para celular
  if (elements.btnMobileFloatingMic) {
    elements.btnMobileFloatingMic.addEventListener('click', () => {
      window.voiceEngine.toggleListening();
    });
  }

  elements.catalogSearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderCatalog();
  });

  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeFilter = chip.dataset.category;
      renderCatalog();
    });
  });

  elements.btnExportDb.addEventListener('click', () => {
    window.formulaDB.exportBackup();
  });

  elements.btnImportDb.addEventListener('click', () => {
    elements.fileInputImport.click();
  });

  elements.fileInputImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await window.formulaDB.importBackup(ev.target.result);
        state.formulasList = window.formulaDB.cache;
        renderCatalog();
        showToast('Respaldo importado correctamente', 'success');
      } catch (err) {
        alert('Archivo de respaldo inválido: ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  elements.btnCloseTicket.addEventListener('click', () => {
    elements.ticketModal.classList.remove('visible');
  });

  elements.btnPrintTicketNow.addEventListener('click', () => {
    window.print();
  });

  elements.btnVoiceHelp.addEventListener('click', () => {
    elements.voiceHelpModal.classList.add('visible');
  });

  elements.btnCloseVoiceHelp.addEventListener('click', () => {
    elements.voiceHelpModal.classList.remove('visible');
  });

  elements.btnDeviceHelp.addEventListener('click', () => {
    fetchLocalServerInfo();
    elements.deviceModal.classList.add('visible');
  });

  elements.btnCloseDeviceModal.addEventListener('click', () => {
    elements.deviceModal.classList.remove('visible');
  });

  if (elements.btnCloseMicHelpModal) {
    elements.btnCloseMicHelpModal.addEventListener('click', () => {
      elements.micHelpModal.classList.remove('visible');
    });
  }

  // ==========================================
  // GESTIÓN DE AUTENTICACIÓN COLORVOX
  // ==========================================
  function updateAuthUI() {
    const user = window.formulaDB.currentUser;
    if (user) {
      if (elements.btnOpenAuthModal) elements.btnOpenAuthModal.classList.add('hidden');
      if (elements.userProfileChip) elements.userProfileChip.classList.remove('hidden');
      if (elements.userNameDisplay) elements.userNameDisplay.textContent = user.name;
      if (elements.userAvatarText) elements.userAvatarText.textContent = (user.name || 'U').charAt(0).toUpperCase();
    } else {
      if (elements.btnOpenAuthModal) elements.btnOpenAuthModal.classList.remove('hidden');
      if (elements.userProfileChip) elements.userProfileChip.classList.add('hidden');
    }
  }

  function switchAuthTab(tab) {
    if (elements.authErrorMessage) elements.authErrorMessage.classList.add('hidden');
    if (elements.authSuccessMessage) elements.authSuccessMessage.classList.add('hidden');

    if (tab === 'register') {
      if (elements.tabAuthRegister) elements.tabAuthRegister.classList.add('active');
      if (elements.tabAuthLogin) elements.tabAuthLogin.classList.remove('active');
      if (elements.formRegister) elements.formRegister.classList.remove('hidden');
      if (elements.formLogin) elements.formLogin.classList.add('hidden');
    } else {
      if (elements.tabAuthLogin) elements.tabAuthLogin.classList.add('active');
      if (elements.tabAuthRegister) elements.tabAuthRegister.classList.remove('active');
      if (elements.formLogin) elements.formLogin.classList.remove('hidden');
      if (elements.formRegister) elements.formRegister.classList.add('hidden');
    }
  }

  function openAuthModal(defaultTab = 'login') {
    switchAuthTab(defaultTab);
    if (elements.authModal) elements.authModal.classList.add('visible');
  }

  function closeAuthModal() {
    if (elements.authModal) elements.authModal.classList.remove('visible');
    if (elements.authErrorMessage) elements.authErrorMessage.classList.add('hidden');
    if (elements.authSuccessMessage) elements.authSuccessMessage.classList.add('hidden');
  }

  if (elements.btnOpenAuthModal) {
    elements.btnOpenAuthModal.addEventListener('click', () => openAuthModal('login'));
  }

  if (elements.btnCloseAuthModal) {
    elements.btnCloseAuthModal.addEventListener('click', closeAuthModal);
  }

  if (elements.tabAuthLogin) {
    elements.tabAuthLogin.addEventListener('click', () => switchAuthTab('login'));
  }

  if (elements.tabAuthRegister) {
    elements.tabAuthRegister.addEventListener('click', () => switchAuthTab('register'));
  }

  if (elements.linkSwitchToRegister) {
    elements.linkSwitchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab('register');
    });
  }

  if (elements.linkSwitchToLogin) {
    elements.linkSwitchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab('login');
    });
  }

  // Alternar ver / ocultar contraseña
  document.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
      } else {
        input.type = 'password';
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
      }
    });
  });

  // Enviar Formulario de Login
  if (elements.formLogin) {
    elements.formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = elements.loginEmail.value.trim();
      const password = elements.loginPassword.value;

      if (elements.authErrorMessage) elements.authErrorMessage.classList.add('hidden');
      if (elements.authSuccessMessage) elements.authSuccessMessage.classList.add('hidden');

      const res = await window.formulaDB.login(email, password);
      if (res.success) {
        if (elements.authSuccessMessage) {
          elements.authSuccessMessage.textContent = `¡Bienvenido a Colorbook, ${res.user.name}!`;
          elements.authSuccessMessage.classList.remove('hidden');
        }
        updateAuthUI();
        state.formulasList = window.formulaDB.cache || [];
        renderCatalog();
        if (state.formulasList.length > 0) {
          loadFormula(state.formulasList[0], false);
        } else {
          state.currentFormula = createEmptyFormula();
          updateWorkbenchUI();
        }
        showToast(`Sesión iniciada: ${res.user.name}`, 'success');
        window.audioEffects.playSaved();
        setTimeout(() => closeAuthModal(), 1000);
      } else {
        if (elements.authErrorMessage) {
          elements.authErrorMessage.textContent = res.error || 'Correo o contraseña incorrectos.';
          elements.authErrorMessage.classList.remove('hidden');
        }
        window.audioEffects.playNotice();
      }
    });
  }

  // Enviar Formulario de Registro
  if (elements.formRegister) {
    elements.formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = elements.registerName.value.trim();
      const email = elements.registerEmail.value.trim();
      const password = elements.registerPassword.value;

      if (elements.authErrorMessage) elements.authErrorMessage.classList.add('hidden');
      if (elements.authSuccessMessage) elements.authSuccessMessage.classList.add('hidden');

      const res = await window.formulaDB.register(name, email, password);
      if (res.success) {
        if (elements.authSuccessMessage) {
          elements.authSuccessMessage.textContent = `¡Cuenta creada exitosamente en Colorbook! Bienvenido, ${res.user.name}.`;
          elements.authSuccessMessage.classList.remove('hidden');
        }
        updateAuthUI();
        state.formulasList = window.formulaDB.cache || [];
        renderCatalog();
        state.currentFormula = createEmptyFormula();
        updateWorkbenchUI();
        showToast(`¡Bienvenido a Colorbook, ${res.user.name}!`, 'success');
        window.audioEffects.playSaved();
        setTimeout(() => closeAuthModal(), 1000);
      } else {
        if (elements.authErrorMessage) {
          elements.authErrorMessage.textContent = res.error || 'Error al crear la cuenta.';
          elements.authErrorMessage.classList.remove('hidden');
        }
        window.audioEffects.playNotice();
      }
    });
  }

  // Cerrar Sesión
  if (elements.btnLogout) {
    elements.btnLogout.addEventListener('click', () => {
      if (confirm('¿Deseas cerrar la sesión de tu taller?')) {
        window.formulaDB.logout();
        updateAuthUI();
        state.formulasList = [];
        state.currentFormula = createEmptyFormula();
        updateWorkbenchUI();
        renderCatalog();
        showToast('Sesión cerrada correctamente.', 'info');
      }
    });
  }

  // ==========================================
  // CONFIGURACIÓN DE GMAIL EN VIVO
  // ==========================================
  async function loadGmailConfig() {
    try {
      const res = await fetch('/api/email/config');
      if (res.ok) {
        const data = await res.json();
        if (elements.gmailInputUser && data.user) {
          elements.gmailInputUser.value = data.user;
        }
        if (elements.gmailAlertBox) {
          if (data.configured) {
            elements.gmailAlertBox.className = 'auth-alert-box success';
            elements.gmailAlertBox.textContent = `✅ Gmail conectado con ${data.user}. Los correos se enviarán automáticamente a cada usuario.`;
            elements.gmailAlertBox.classList.remove('hidden');
          } else {
            elements.gmailAlertBox.className = 'auth-alert-box error';
            elements.gmailAlertBox.textContent = `ℹ️ Gmail en modo cola local. Ingresa tu correo y contraseña de aplicación para enviar a bandejas de entrada reales.`;
            elements.gmailAlertBox.classList.remove('hidden');
          }
        }
      }
    } catch (e) {
      console.warn('Error cargando config de Gmail:', e);
    }
  }

  if (elements.btnGmailSettings) {
    elements.btnGmailSettings.addEventListener('click', () => {
      loadGmailConfig();
      if (elements.gmailModal) elements.gmailModal.classList.add('visible');
    });
  }

  if (elements.btnCloseGmailModal) {
    elements.btnCloseGmailModal.addEventListener('click', () => {
      if (elements.gmailModal) elements.gmailModal.classList.remove('visible');
    });
  }

  if (elements.formGmailConfig) {
    elements.formGmailConfig.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = elements.gmailInputUser.value.trim();
      const pass = elements.gmailInputPass.value.trim();

      elements.gmailAlertBox.className = 'auth-alert-box';
      elements.gmailAlertBox.textContent = 'Guardando configuración...';
      elements.gmailAlertBox.classList.remove('hidden');

      try {
        const res = await fetch('/api/email/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, pass })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          elements.gmailAlertBox.className = 'auth-alert-box success';
          elements.gmailAlertBox.textContent = `✅ ¡Gmail conectado exitosamente con ${user}!`;
          showToast('Configuración de Gmail guardada', 'success');
          window.audioEffects.playSaved();
        } else {
          elements.gmailAlertBox.className = 'auth-alert-box error';
          elements.gmailAlertBox.textContent = data.error || 'Error guardando configuración.';
        }
      } catch (err) {
        elements.gmailAlertBox.className = 'auth-alert-box error';
        elements.gmailAlertBox.textContent = 'Error de conexión con el servidor.';
      }
    });
  }

  if (elements.btnTestGmailEmail) {
    elements.btnTestGmailEmail.addEventListener('click', async () => {
      const targetEmail = elements.gmailInputUser.value.trim() || prompt('Ingresa el correo al que deseas enviar la prueba:');
      if (!targetEmail) return;

      elements.gmailAlertBox.className = 'auth-alert-box';
      elements.gmailAlertBox.textContent = `Enviando correo de prueba a ${targetEmail}...`;
      elements.gmailAlertBox.classList.remove('hidden');

      try {
        const res = await fetch('/api/email/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.mode === 'GMAIL_SENT') {
            elements.gmailAlertBox.className = 'auth-alert-box success';
            elements.gmailAlertBox.textContent = `🚀 ¡Correo enviado exitosamente a ${targetEmail}! Revisa tu bandeja de entrada o spam.`;
          } else {
            elements.gmailAlertBox.className = 'auth-alert-box success';
            elements.gmailAlertBox.textContent = `📬 Correo registrado en log del servidor. (Configura tu contraseña de aplicación para que viaje por Gmail real).`;
          }
          showToast('Prueba de correo completada', 'info');
        } else {
          elements.gmailAlertBox.className = 'auth-alert-box error';
          elements.gmailAlertBox.textContent = `Error: ${data.error || 'No se pudo enviar el correo de prueba.'}`;
        }
      } catch (err) {
        elements.gmailAlertBox.className = 'auth-alert-box error';
        elements.gmailAlertBox.textContent = 'Error al conectar con la API de prueba.';
      }
    });
  }

  // ==========================================
  // SOPORTE TÉCNICO DIRECTO A colorbookaadministracion@gmail.com
  // ==========================================
  if (elements.btnOpenSupportModal) {
    elements.btnOpenSupportModal.addEventListener('click', () => {
      if (elements.supportAlertBox) {
        elements.supportAlertBox.className = 'auth-alert-box hidden';
        elements.supportAlertBox.textContent = '';
      }
      if (window.formulaDB.currentUser) {
        if (elements.supportName && !elements.supportName.value) {
          elements.supportName.value = window.formulaDB.currentUser.name || '';
        }
        if (elements.supportEmail && !elements.supportEmail.value) {
          elements.supportEmail.value = window.formulaDB.currentUser.email || '';
        }
      }
      if (elements.supportModal) {
        elements.supportModal.classList.add('visible');
      }
    });
  }

  if (elements.btnCloseSupportModal) {
    elements.btnCloseSupportModal.addEventListener('click', () => {
      if (elements.supportModal) elements.supportModal.classList.remove('visible');
    });
  }

  if (elements.formSupportTicket) {
    elements.formSupportTicket.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = elements.supportName.value.trim();
      const email = elements.supportEmail.value.trim();
      const subject = elements.supportSubject.value.trim();
      const message = elements.supportMessage.value.trim();

      if (!name || !email || !subject || !message) {
        if (elements.supportAlertBox) {
          elements.supportAlertBox.className = 'auth-alert-box error';
          elements.supportAlertBox.textContent = 'Por favor completa todos los campos requeridos.';
          elements.supportAlertBox.classList.remove('hidden');
        }
        return;
      }

      if (elements.btnSubmitSupport) {
        elements.btnSubmitSupport.disabled = true;
        elements.btnSubmitSupport.innerHTML = '<span>Enviando mensaje a colorbookaadministracion@gmail.com...</span>';
      }

      if (elements.supportAlertBox) {
        elements.supportAlertBox.className = 'auth-alert-box';
        elements.supportAlertBox.textContent = 'Enviando mensaje a la administración de COLOR BOOK...';
        elements.supportAlertBox.classList.remove('hidden');
      }

      const fullSubject = `[Soporte COLOR BOOK] ${subject}`;
      const fullBody = `Hola equipo de COLOR BOOK,\n\n${message}\n\n---\nAtentamente,\nNombre / Taller: ${name}\nCorreo de contacto: ${email}`;
      const directGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=colorbookaadministracion@gmail.com&su=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(fullBody)}`;

      try {
        const res = await fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          if (elements.supportAlertBox) {
            elements.supportAlertBox.className = 'auth-alert-box success';
            elements.supportAlertBox.innerHTML = `
              🚀 ¡Mensaje procesado para <b>colorbookaadministracion@gmail.com</b>!
              <div style="margin-top:8px;">
                <a href="${directGmailUrl}" target="_blank" class="btn-gmail-direct" style="display:inline-flex; font-size:0.8rem; padding:8px 14px; text-decoration:none; margin-top:4px;">
                  👉 Abrir también en Gmail Web para envío directo
                </a>
              </div>
            `;
          }
          showToast('Mensaje enviado a soporte técnico de COLOR BOOK', 'success');
          window.audioEffects.playSaved();
          if (elements.supportSubject) elements.supportSubject.value = '';
          if (elements.supportMessage) elements.supportMessage.value = '';
        } else {
          if (elements.supportAlertBox) {
            elements.supportAlertBox.className = 'auth-alert-box error';
            elements.supportAlertBox.innerHTML = `
              ⚠️ ${data.error || 'No se pudo entregar por el servidor.'}<br>
              <a href="${directGmailUrl}" target="_blank" style="color:#ffd700; font-weight:bold; text-decoration:underline; display:inline-block; margin-top:6px;">
                👉 Haz clic aquí para enviarlo directo desde tu Gmail Web
              </a>
            `;
          }
          window.audioEffects.playNotice();
        }
      } catch (err) {
        if (elements.supportAlertBox) {
          elements.supportAlertBox.className = 'auth-alert-box error';
          elements.supportAlertBox.innerHTML = `
            Error de conexión con el servidor.<br>
            <a href="${directGmailUrl}" target="_blank" style="color:#ffd700; font-weight:bold; text-decoration:underline; display:inline-block; margin-top:6px;">
              👉 Haz clic aquí para enviarlo directo desde tu Gmail Web
            </a>
          `;
        }
      } finally {
        if (elements.btnSubmitSupport) {
          elements.btnSubmitSupport.disabled = false;
          elements.btnSubmitSupport.innerHTML = `<span>Enviar Mensaje a la Administración</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
        }
      }
    });
  }

  // Botón directo para redactar en Gmail Web
  const btnOpenSupportGmail = document.getElementById('btnOpenSupportGmail');
  if (btnOpenSupportGmail) {
    btnOpenSupportGmail.addEventListener('click', () => {
      const name = elements.supportName ? elements.supportName.value.trim() : '';
      const email = elements.supportEmail ? elements.supportEmail.value.trim() : '';
      const subject = elements.supportSubject ? elements.supportSubject.value.trim() : 'Consulta de Soporte';
      const message = elements.supportMessage ? elements.supportMessage.value.trim() : '';

      const fullSubject = `[Soporte COLOR BOOK] ${subject}`;
      const fullBody = `Hola equipo de COLOR BOOK,\n\n${message || '(Escribe tu mensaje aquí)'}\n\n---\nAtentamente,\nNombre / Taller: ${name || 'Colorista'}\nCorreo de contacto: ${email || ''}`;

      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=colorbookaadministracion@gmail.com&su=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(fullBody)}`;
      window.open(gmailUrl, '_blank');
    });
  }

  // Cajón desplegable para configurar contraseña de Gmail de la administración
  const btnToggleGmailConfig = document.getElementById('btnToggleGmailConfig');
  const gmailConfigContent = document.getElementById('gmailConfigContent');
  if (btnToggleGmailConfig && gmailConfigContent) {
    btnToggleGmailConfig.addEventListener('click', () => {
      gmailConfigContent.classList.toggle('hidden');
    });
  }

  const btnSaveAdminGmailPass = document.getElementById('btnSaveAdminGmailPass');
  const adminGmailPassInput = document.getElementById('adminGmailPassInput');
  const adminGmailStatusAlert = document.getElementById('adminGmailStatusAlert');

  if (btnSaveAdminGmailPass && adminGmailPassInput) {
    btnSaveAdminGmailPass.addEventListener('click', async () => {
      const pass = adminGmailPassInput.value.trim().replace(/\s+/g, '');
      if (!pass) {
        if (adminGmailStatusAlert) {
          adminGmailStatusAlert.className = 'auth-alert-box error';
          adminGmailStatusAlert.textContent = 'Ingresa la contraseña de aplicación de 16 letras de Google.';
          adminGmailStatusAlert.classList.remove('hidden');
        }
        return;
      }

      btnSaveAdminGmailPass.disabled = true;
      btnSaveAdminGmailPass.textContent = 'Verificando y guardando...';

      try {
        const res = await fetch('/api/email/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: 'colorbookaadministracion@gmail.com',
            pass: pass
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (adminGmailStatusAlert) {
            adminGmailStatusAlert.className = 'auth-alert-box success';
            adminGmailStatusAlert.textContent = '✅ ¡Contraseña de Gmail guardada en el servidor! Ahora todos los correos automáticos y de soporte se entregarán en vivo.';
            adminGmailStatusAlert.classList.remove('hidden');
          }
          showToast('Gmail oficial conectado para COLOR BOOK', 'success');
          window.audioEffects.playSaved();
          adminGmailPassInput.value = '';
        } else {
          if (adminGmailStatusAlert) {
            adminGmailStatusAlert.className = 'auth-alert-box error';
            adminGmailStatusAlert.textContent = data.error || 'No se pudo guardar la contraseña.';
            adminGmailStatusAlert.classList.remove('hidden');
          }
          window.audioEffects.playNotice();
        }
      } catch (err) {
        if (adminGmailStatusAlert) {
          adminGmailStatusAlert.className = 'auth-alert-box error';
          adminGmailStatusAlert.textContent = 'Error de conexión con el servidor.';
          adminGmailStatusAlert.classList.remove('hidden');
        }
      } finally {
        btnSaveAdminGmailPass.disabled = false;
        btnSaveAdminGmailPass.textContent = 'Guardar Contraseña';
      }
    });
  }

  // ==========================================
  // PWA ENGINE: INSTALACIÓN EN PC Y CELULARES
  // ==========================================
  let deferredInstallPrompt = null;
  const btnInstallApp = document.getElementById('btnInstallApp');
  const btnMobileInstallApp = document.getElementById('btnMobileInstallApp');
  const installModal = document.getElementById('installModal');
  const btnCloseInstallModal = document.getElementById('btnCloseInstallModal');
  const btnUnderstandInstall = document.getElementById('btnUnderstandInstall');
  const pwaPromptBox = document.getElementById('pwaPromptBox');
  const btnTriggerPwaInstall = document.getElementById('btnTriggerPwaInstall');

  // Registrar Service Worker para permitir instalación y modo offline
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        console.log('✅ [COLOR BOOK PWA] Service Worker registrado exitosamente:', reg.scope);
      }).catch((err) => {
        console.warn('⚠️ [COLOR BOOK PWA] Error registrando Service Worker:', err);
      });
    });
  }

  // Capturar evento nativo de instalación de Chrome/Edge/Android
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (pwaPromptBox) pwaPromptBox.classList.remove('hidden');
    if (btnInstallApp) {
      btnInstallApp.title = '¡Haz clic para instalar COLOR BOOK como app en este dispositivo!';
    }
  });

  // Evento cuando la app fue instalada exitosamente
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    showToast('🎉 ¡COLOR BOOK se instaló con éxito en este dispositivo!', 'success');
    window.audioEffects.playSaved();
    if (pwaPromptBox) pwaPromptBox.classList.add('hidden');
    if (installModal) installModal.classList.remove('visible');
  });

  async function handleInstallClick() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('Instalando COLOR BOOK...', 'info');
      }
      deferredInstallPrompt = null;
    } else {
      // Si el navegador no soporta el prompt nativo o es Safari iOS, abrir guía visual
      if (installModal) installModal.classList.add('visible');
    }
  }

  if (btnInstallApp) {
    btnInstallApp.addEventListener('click', handleInstallClick);
  }

  if (btnMobileInstallApp) {
    btnMobileInstallApp.addEventListener('click', handleInstallClick);
  }

  if (btnTriggerPwaInstall) {
    btnTriggerPwaInstall.addEventListener('click', handleInstallClick);
  }

  if (btnCloseInstallModal) {
    btnCloseInstallModal.addEventListener('click', () => {
      if (installModal) installModal.classList.remove('visible');
    });
  }

  if (btnUnderstandInstall) {
    btnUnderstandInstall.addEventListener('click', () => {
      if (installModal) installModal.classList.remove('visible');
    });
  }

  function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-popup toast-${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 20);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  showToast('Colorbook listo', 'info');

  // Cargar catálogo de fórmulas en segundo plano sin congelar los botones
  window.formulaDB.init().then(() => {
    updateAuthUI();
    state.formulasList = window.formulaDB.cache || [];
    renderCatalog();
    if (state.formulasList.length > 0) {
      loadFormula(state.formulasList[0], false);
    } else {
      state.currentFormula = createEmptyFormula();
      updateWorkbenchUI();
    }
  }).catch(err => {
    console.warn('Base de datos local en modo seguro:', err);
  });
}

// Ejecución instantánea sin depender de si DOMContentLoaded ya ocurrió o no
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
