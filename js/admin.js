/* ============================================================
   Forever Young — Painel de gestão
   Login, dashboard, reservas, mensagens e edição de todo o
   conteúdo do site (quartos, comodidades, galeria, textos).
   ============================================================ */
(() => {
  'use strict';

  if (!window.FY) {
    document.body.innerHTML = '<p style="padding:30px">Erro: js/data.js não foi carregado.</p>';
    return;
  }

  const { Store, uid, escapeHtml: esc, fmtMoney } = FY;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const view = $('#view');
  let data = null;
  let currentTab = 'dashboard';
  let modalSaveHandler = null;
  let toastTimer = null;
  const KEY_PUBLISH = 'fy_publish_v1';
  const KEY_LOCK = 'fy_lockout_v1';
  const SESSION_MINUTES = 30;
  let sessionTimer = null;
  let lastActivity = 0;

  const ICONS = [
    ['shield', 'Escudo — segurança'],
    ['car', 'Carro — estacionamento'],
    ['coffee', 'Café — café da manhã'],
    ['utensils', 'Talheres — restaurante'],
    ['wine', 'Taça — bar'],
    ['snow', 'Floco — ar-condicionado'],
    ['bed', 'Cama — quarto'],
    ['bell', 'Sino — atendimento'],
    ['waves', 'Ondas — piscina/água'],
    ['leaf', 'Folha — natureza/spa'],
    ['dumbbell', 'Halter — academia'],
    ['wifi', 'Wi-Fi'],
    ['umbrella', 'Guarda-sol'],
    ['clock', 'Relógio — horários'],
    ['users', 'Pessoas — hóspedes'],
    ['eye', 'Olho — vistas'],
    ['maximize', 'Moldura — tamanho'],
    ['phone', 'Telefone'],
    ['mail', 'E-mail'],
    ['pin', 'Pin — localização'],
    ['globe', 'Globo — internet'],
    ['star', 'Estrela'],
    ['check', 'Visto']
  ];

  const STATUS = {
    nova: { label: 'Nova', cls: 'st-nova' },
    confirmada: { label: 'Confirmada', cls: 'st-ok' },
    hospedado: { label: 'Hospedado', cls: 'st-info' },
    cancelada: { label: 'Cancelada', cls: 'st-cancel' }
  };

  const TITLES = {
    dashboard: 'Painel geral',
    reservas: 'Reservas',
    mensagens: 'Mensagens',
    quartos: 'Quartos',
    banner: 'Banner rotativo (topo do site)',
    pagamentos: 'Formas de pagamento',
    comodidades: 'Comodidades e cortesias',
    galeria: 'Galeria de fotos',
    depoimentos: 'Depoimentos',
    configuracoes: 'Configurações do site'
  };

  const RENDER = {
    dashboard: renderDashboard,
    reservas: renderReservas,
    mensagens: renderMensagens,
    quartos: renderQuartos,
    banner: renderBanner,
    pagamentos: renderPagamentos,
    comodidades: renderComodidades,
    galeria: renderGaleria,
    depoimentos: renderDepoimentos,
    configuracoes: renderConfiguracoes
  };

  /* ================= utilidades ================= */

  function toast(msg, isErr) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('err', !!isErr);
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function fmtDateTime(iso) {
    try {
      return new Date(iso).toLocaleString('pt', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return '—'; }
  }
  function fmtDay(iso) {
    try {
      return new Date(iso + 'T12:00:00').toLocaleDateString('pt', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return iso || '—'; }
  }
  function money(v) { return fmtMoney(v, (data.settings || {}).currency || 'MT'); }

  function fText(label, name, value, placeholder) {
    return `<label class="f"><span>${label}</span><input type="text" name="${name}" value="${esc(value == null ? '' : value)}" placeholder="${esc(placeholder || '')}"></label>`;
  }
  function fPass(label, name, value, placeholder) {
    return `<label class="f"><span>${label}</span><input type="password" name="${name}" value="${esc(value == null ? '' : value)}" placeholder="${esc(placeholder || '')}" autocomplete="new-password"></label>`;
  }
  function fNum(label, name, value) {
    return `<label class="f"><span>${label}</span><input type="number" name="${name}" value="${Number(value) || 0}" min="0" step="1"></label>`;
  }
  function fArea(label, name, value, rows) {
    return `<label class="f"><span>${label}</span><textarea name="${name}" rows="${rows || 4}">${esc(value == null ? '' : value)}</textarea></label>`;
  }
  function fSelect(label, name, value, options) {
    const opts = options.map(o =>
      `<option value="${esc(o[0])}"${o[0] === value ? ' selected' : ''}>${esc(o[1])}</option>`).join('');
    return `<label class="f"><span>${label}</span><select name="${name}">${opts}</select></label>`;
  }

  function openModal(title, bodyHtml, handler) {
    $('#modal-title').textContent = title;
    $('#modal-body').innerHTML = bodyHtml;
    modalSaveHandler = handler;
    $('#modal').classList.remove('hidden');
    const first = $('#modal-body input, #modal-body textarea, #modal-body select');
    if (first) first.focus();
  }
  function closeModal() {
    $('#modal').classList.add('hidden');
    modalSaveHandler = null;
  }
  function onModalSave() {
    if (!modalSaveHandler) return;
    const fields = {};
    $$('#modal-body [name]').forEach(el => {
      fields[el.name] = el.type === 'number' ? Number(el.value || 0) : el.value;
    });
    const ok = modalSaveHandler(fields);
    if (ok === false) return;
    closeModal();
    persist();
  }
  function persist(msg) {
    Store.saveData(data);
    RENDER[currentTab]();
    updateBadges();
    toast(msg || 'Alterações guardadas ✔');
  }

  function updateBadges() {
    const novas = Store.listBookings().filter(b => b.status === 'nova').length;
    const unread = Store.listMessages().filter(m => !m.read).length;
    const bb = $('#badge-bk'), bm = $('#badge-msg');
    bb.textContent = novas; bb.classList.toggle('hidden', novas === 0);
    bm.textContent = unread; bm.classList.toggle('hidden', unread === 0);
  }

  function download(name, content, type) {
    const blob = new Blob([content], { type: type || 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function csvCell(v) {
    v = String(v == null ? '' : v);
    return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }

  /* ================= publicação na Internet ================= */

  function getPublishCfg() {
    try {
      return JSON.parse(localStorage.getItem(KEY_PUBLISH)) || { token: '', repo: '', branch: 'main' };
    } catch (e) { return { token: '', repo: '', branch: 'main' }; }
  }
  function savePublishCfg(cfg) { localStorage.setItem(KEY_PUBLISH, JSON.stringify(cfg)); }

  function ghHeaders(cfg) {
    return { 'Authorization': 'Bearer ' + cfg.token, 'Accept': 'application/vnd.github+json' };
  }
  async function ghGetFileSha(cfg, path) {
    const r = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${path}?ref=${encodeURIComponent(cfg.branch)}`, { headers: ghHeaders(cfg) });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('GitHub: ' + r.status);
    const j = await r.json();
    return j.sha;
  }
  async function ghPutFile(cfg, path, contentStr, message) {
    const sha = await ghGetFileSha(cfg, path);
    const body = { message: message, content: btoa(unescape(encodeURIComponent(contentStr))), branch: cfg.branch };
    if (sha) body.sha = sha;
    const r = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${path}`, {
      method: 'PUT',
      headers: Object.assign({ 'Content-Type': 'application/json' }, ghHeaders(cfg)),
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error('GitHub: ' + r.status + ' — ' + (await r.text()).slice(0, 140));
    return r.json();
  }
  async function testPublish() {
    const cfg = getPublishCfg();
    if (!cfg.token || !cfg.repo) { toast('Preencha o token e o repositório primeiro.', true); return; }
    toast('A testar a ligação…');
    try {
      const r = await fetch('https://api.github.com/repos/' + cfg.repo, { headers: ghHeaders(cfg) });
      if (r.ok) toast('Ligação OK ✔ — repositório ' + cfg.repo);
      else if (r.status === 401) toast('Token inválido (401). Crie um novo com a opção "repo" marcada.', true);
      else if (r.status === 404) toast('Repositório não encontrado (404). Use o formato utilizador/repo.', true);
      else toast('O GitHub respondeu ' + r.status, true);
    } catch (e) { toast('Sem ligação ao GitHub.', true); }
  }
  async function publishNow() {
    const cfg = getPublishCfg();
    if (!cfg.token || !cfg.repo) { toast('Preencha o token e o repositório antes de publicar.', true); return; }
    toast('A publicar…');
    try {
      const payload = { app: 'forever-young-hotel', publishedAt: new Date().toISOString(), data: data };
      await ghPutFile(cfg, 'content.json', JSON.stringify(payload, null, 2), 'Publicação do painel Forever Young');
      toast('Publicado ✔ O site atualiza na Internet em 1–2 minutos.');
    } catch (e) {
      toast(String(e.message || e), true);
    }
  }
  function downloadContentJson() {
    const payload = { app: 'forever-young-hotel', publishedAt: new Date().toISOString(), data: data };
    download('content.json', JSON.stringify(payload, null, 2), 'application/json');
    toast('content.json descarregado — envie-o para a pasta do site no repositório.');
  }

  /* ================= arranque e acesso ================= */

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    $('#login-form').addEventListener('submit', onLogin);
    $('#setup-form').addEventListener('submit', onSetup);
    $('#btn-logout').addEventListener('click', () => { Store.logout(); location.reload(); });
    $('#btn-view-site').addEventListener('click', () => window.open('index.html', '_blank'));
    $('#modal-close').addEventListener('click', closeModal);
    $('#modal-cancel').addEventListener('click', closeModal);
    $('#modal-save').addEventListener('click', onModalSave);
    $('#modal').addEventListener('click', e => { if (e.target === $('#modal')) closeModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !$('#modal').classList.contains('hidden')) closeModal();
    });
    $$('.pass-toggle').forEach(b => b.addEventListener('click', () => {
      const inp = document.getElementById(b.dataset.target);
      if (inp) {
        inp.type = inp.type === 'password' ? 'text' : 'password';
        b.classList.toggle('on', inp.type === 'text');
      }
    }));
    $('#setup-pass').addEventListener('input', e => updateMeter($('#setup-meter'), $('#setup-meter-label'), e.target.value));
    view.addEventListener('click', onViewClick);
    view.addEventListener('change', onViewChange);
    view.addEventListener('submit', onViewSubmit);
    $$('#side-nav button').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));

    if (Store.isLoggedIn()) enterApp();
    else if (Store.hasCredentials()) showLogin();
    else showSetup();
  }

  function showLogin() {
    $('#setup-view').classList.add('hidden');
    $('#app-view').classList.add('hidden');
    $('#login-view').classList.remove('hidden');
    $('#login-user').focus();
  }

  function showSetup() {
    $('#login-view').classList.add('hidden');
    $('#app-view').classList.add('hidden');
    $('#setup-view').classList.remove('hidden');
    $('#setup-user').focus();
  }

  /* ---- política de senha e medidor de força ---- */
  function passwordProblem(p) {
    if (!p || p.length < 10) return 'Use pelo menos 10 caracteres.';
    const cats = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(p)).length;
    if (cats < 3) return 'Combine pelo menos 3 tipos: maiúsculas, minúsculas, números e símbolos.';
    if (/^(?:password|senha|admin|forever|young|123456)/i.test(p)) return 'Senha demasiado óbvia — escolha outra.';
    return null;
  }
  function passStrength(p) {
    let score = 0;
    if (p.length >= 10) score++;
    if (p.length >= 14) score++;
    const cats = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(p)).length;
    score += Math.max(0, cats - 1);
    if (/(.)\1\1/.test(p)) score = Math.max(0, score - 1);
    return Math.max(0, Math.min(4, score));
  }
  function updateMeter(meterEl, labelEl, p) {
    if (!meterEl) return;
    const labels = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Excelente'];
    const s = p ? passStrength(p) : 0;
    meterEl.className = 'meter m' + s;
    const bar = $('i', meterEl);
    if (bar) bar.style.width = p ? Math.max(12, s * 25) + '%' : '0';
    if (labelEl) labelEl.textContent = p ? 'Força: ' + labels[s] : '';
  }

  /* ---- bloqueio anti-força-bruta ---- */
  function getLock() {
    try { return JSON.parse(localStorage.getItem(KEY_LOCK)) || { count: 0, until: 0 }; }
    catch (e) { return { count: 0, until: 0 }; }
  }
  function setLock(l) { localStorage.setItem(KEY_LOCK, JSON.stringify(l)); }

  async function onLogin(e) {
    e.preventDefault();
    const msg = $('#login-msg');
    msg.className = 'login-msg';
    const lock = getLock();
    const now = Date.now();
    if (lock.until > now) {
      const s = Math.ceil((lock.until - now) / 1000);
      msg.textContent = 'Por segurança, aguarde ' + (s > 60 ? Math.ceil(s / 60) + ' min' : s + ' s') + ' antes de tentar de novo.';
      return;
    }
    const user = $('#login-user').value.trim();
    const pass = $('#login-pass').value;
    const btn = $('#login-btn');
    btn.disabled = true;
    msg.textContent = 'A verificar…';
    msg.classList.add('loading');
    let res;
    try {
      res = await Store.verifyCredentials(user, pass);
    } catch (err) {
      msg.className = 'login-msg';
      msg.textContent = 'Erro ao verificar o acesso: ' + (err && err.message ? err.message : err);
      btn.disabled = false;
      return;
    }
    btn.disabled = false;
    msg.classList.remove('loading');
    if (res === true) {
      setLock({ count: 0, until: 0 });
      Store.addAudit('Sessão iniciada', true);
      Store.login();
      enterApp();
      return;
    }
    const count = lock.count + 1;
    const delayMs = count >= 3 ? Math.min(30000 * Math.pow(2, count - 3), 15 * 60 * 1000) : 0;
    setLock({ count: count, until: delayMs ? now + delayMs : 0 });
    Store.addAudit('Tentativa de entrada falhou', false);
    msg.textContent = 'Utilizador ou senha incorretos. ' +
      (delayMs
        ? 'Bloqueado por ' + Math.round(delayMs / 1000) + ' s.'
        : 'Restam ' + (3 - count) + ' tentativa(s) antes do bloqueio.');
    $('#login-pass').value = '';
    $('#login-pass').focus();
  }

  async function onSetup(e) {
    e.preventDefault();
    const msg = $('#setup-msg');
    const btn = $('#setup-btn');
    msg.className = 'login-msg';
    const user = ($('#setup-user').value.trim() || 'admin');
    const p1 = $('#setup-pass').value;
    const p2 = $('#setup-pass2').value;
    const prob = passwordProblem(p1);
    if (prob) { msg.textContent = prob; return; }
    if (p1 !== p2) { msg.textContent = 'As senhas não coincidem.'; return; }
    btn.disabled = true;
    msg.textContent = 'A criar o acesso…';
    msg.classList.add('loading');
    try {
      await Store.createCredentials(user, p1);
      Store.addAudit('Acesso criado (primeiro acesso)', true);
      Store.login();
      enterApp();
    } catch (err) {
      msg.className = 'login-msg';
      msg.textContent = 'Não foi possível criar o acesso: ' + (err && err.message ? err.message : err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Criar acesso seguro';
      msg.classList.remove('loading');
    }
  }

  /* ---- sessão com expiração por inatividade ---- */
  function sessionTouch() {
    const n = Date.now();
    if (n - lastActivity < 60000) return;
    lastActivity = n;
    try {
      const s = JSON.parse(sessionStorage.getItem('fy_session') || 'null');
      if (s) sessionStorage.setItem('fy_session', JSON.stringify({ at: n }));
    } catch (e) { /* ignora */ }
  }
  function sessionCheck() {
    let s = null;
    try { s = JSON.parse(sessionStorage.getItem('fy_session') || 'null'); } catch (e) { /* ignora */ }
    if (!s || Date.now() - (s.at || 0) > SESSION_MINUTES * 60000) forceLogout();
  }
  function forceLogout() {
    Store.logout();
    stopSessionWatch();
    if (view) view.innerHTML = '';
    $('#app-view').classList.add('hidden');
    showLogin();
    toast('Sessão expirada por inatividade. Entre de novo.', true);
  }
  function startSessionWatch() {
    stopSessionWatch();
    lastActivity = Date.now();
    ['click', 'keydown', 'mousemove', 'touchstart'].forEach(ev =>
      document.addEventListener(ev, sessionTouch, { passive: true }));
    sessionTimer = setInterval(sessionCheck, 30000);
  }
  function stopSessionWatch() {
    if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null; }
  }

  async function enterApp() {
    data = Store.loadData();
    /* No ar (http/https), começa a editar a partir do conteúdo já publicado */
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      try {
        const r = await fetch('content.json?v=' + Date.now(), { cache: 'no-store' });
        if (r.ok) {
          const pub = await r.json();
          if (pub && pub.data) {
            if (pub.data.settings) Object.keys(pub.data.settings).forEach(k => { data.settings[k] = pub.data.settings[k]; });
            ['rooms', 'amenities', 'gallery', 'testimonials'].forEach(k => {
              if (Array.isArray(pub.data[k])) data[k] = pub.data[k];
            });
          }
        }
      } catch (e) { /* segue com o conteúdo local */ }
    }
    $('#login-view').classList.add('hidden');
    $('#setup-view').classList.add('hidden');
    $('#app-view').classList.remove('hidden');
    showTab('dashboard');
    startSessionWatch();
  }

  function showTab(tab) {
    currentTab = tab;
    $$('#side-nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    $('#tab-title').textContent = TITLES[tab] || '';
    RENDER[tab]();
    updateBadges();
  }

  /* ================= eventos delegados ================= */

  function onViewClick(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const id = el.dataset.id;

    switch (action) {
      /* reservas */
      case 'bk-csv': exportCSV(); break;
      case 'bk-del':
        if (confirm('Apagar esta reserva?')) { Store.removeBooking(id); renderReservas(); updateBadges(); toast('Reserva apagada'); }
        break;

      /* mensagens */
      case 'msg-toggle': {
        const m = Store.listMessages().find(x => x.id === id);
        if (m) { Store.updateMessage(id, { read: !m.read }); renderMensagens(); updateBadges(); }
        break;
      }
      case 'msg-del':
        if (confirm('Apagar esta mensagem?')) { Store.removeMessage(id); renderMensagens(); updateBadges(); toast('Mensagem apagada'); }
        break;

      /* banner rotativo */
      case 'hs-add':
        if (!Array.isArray(data.heroSlides)) data.heroSlides = [];
        openModal('Nova imagem do banner', heroSlideForm(), f => saveHeroSlide(null, f));
        break;
      case 'hs-edit': {
        const s = (data.heroSlides || []).find(x => x.id === id);
        if (s) openModal('Editar imagem do banner', heroSlideForm(s), f => saveHeroSlide(s, f));
        break;
      }
      case 'hs-del':
        if (confirm('Apagar esta imagem do banner?')) {
          data.heroSlides = data.heroSlides.filter(x => x.id !== id);
          persist('Imagem apagada');
        }
        break;
      case 'hs-up': moveItem(data.heroSlides, id, -1); persist(); break;
      case 'hs-down': moveItem(data.heroSlides, id, 1); persist(); break;

      /* pagamentos */
      case 'pay-add':
        if (!Array.isArray(data.payments)) data.payments = [];
        openModal('Nova forma de pagamento', paymentForm(), f => savePayment(null, f));
        break;
      case 'pay-edit': {
        const p = (data.payments || []).find(x => x.id === id);
        if (p) openModal('Editar forma de pagamento', paymentForm(p), f => savePayment(p, f));
        break;
      }
      case 'pay-del':
        if (confirm('Apagar esta forma de pagamento?')) {
          data.payments = data.payments.filter(x => x.id !== id);
          persist('Forma de pagamento apagada');
        }
        break;
      case 'pay-up': moveItem(data.payments, id, -1); persist(); break;
      case 'pay-down': moveItem(data.payments, id, 1); persist(); break;

      /* quartos */
      case 'room-add': openModal('Novo quarto', roomForm(), f => saveRoom(null, f)); break;
      case 'room-edit': {
        const r = data.rooms.find(x => x.id === id);
        if (r) openModal('Editar quarto', roomForm(r), f => saveRoom(r, f));
        break;
      }
      case 'room-del':
        if (confirm('Apagar este quarto do site?')) {
          data.rooms = data.rooms.filter(x => x.id !== id);
          persist('Quarto apagado');
        }
        break;
      case 'room-up': moveItem(data.rooms, id, -1); persist(); break;
      case 'room-down': moveItem(data.rooms, id, 1); persist(); break;

      /* comodidades */
      case 'am-add': openModal('Nova comodidade', amenityForm(), f => saveAmenity(null, f)); break;
      case 'am-edit': {
        const a = data.amenities.find(x => x.id === id);
        if (a) openModal('Editar comodidade', amenityForm(a), f => saveAmenity(a, f));
        break;
      }
      case 'am-del':
        if (confirm('Apagar esta comodidade?')) {
          data.amenities = data.amenities.filter(x => x.id !== id);
          persist('Comodidade apagada');
        }
        break;

      /* galeria */
      case 'gal-add': openModal('Nova foto', galleryForm(), f => saveGallery(null, f)); break;
      case 'gal-edit': {
        const g = data.gallery.find(x => x.id === id);
        if (g) openModal('Editar foto', galleryForm(g), f => saveGallery(g, f));
        break;
      }
      case 'gal-del':
        if (confirm('Apagar esta foto da galeria?')) {
          data.gallery = data.gallery.filter(x => x.id !== id);
          persist('Foto apagada');
        }
        break;
      case 'gal-up': moveItem(data.gallery, id, -1); persist(); break;
      case 'gal-down': moveItem(data.gallery, id, 1); persist(); break;

      /* depoimentos */
      case 'ts-add': openModal('Novo depoimento', testimonialForm(), f => saveTestimonial(null, f)); break;
      case 'ts-edit': {
        const t = data.testimonials.find(x => x.id === id);
        if (t) openModal('Editar depoimento', testimonialForm(t), f => saveTestimonial(t, f));
        break;
      }
      case 'ts-del':
        if (confirm('Apagar este depoimento?')) {
          data.testimonials = data.testimonials.filter(x => x.id !== id);
          persist('Depoimento apagado');
        }
        break;

      /* publicação na Internet */
      case 'pub-test': testPublish(); break;
      case 'pub-now': publishNow(); break;
      case 'pub-json': downloadContentJson(); break;
      case 'pub-forget':
        localStorage.removeItem(KEY_PUBLISH);
        renderConfiguracoes();
        toast('Token removido deste navegador.');
        break;
      case 'sec-clear-audit':
        Store.clearAudit();
        renderConfiguracoes();
        toast('Registo de auditoria limpo.');
        break;

      /* configurações */
      case 'set-export': exportAll(); break;
      case 'set-reset':
        if (confirm('Restaurar todo o conteúdo original do site? As suas alterações serão perdidas.')) {
          Store.resetData();
          data = Store.loadData();
          persist('Conteúdo restaurado ao padrão');
        }
        break;
    }
  }

  function onViewChange(e) {
    const t = e.target;
    if (t.matches('select[data-action="bk-status"]')) {
      Store.updateBooking(t.dataset.id, { status: t.value });
      renderReservas();
      updateBadges();
      toast('Estado da reserva atualizado');
    }
    if (t.id === 'import-file' && t.files && t.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          let n = 0;
          if (parsed.data && parsed.data.settings) { Store.saveData(parsed.data); n++; }
          if (Array.isArray(parsed.bookings)) { Store.saveBookings(parsed.bookings); n++; }
          if (Array.isArray(parsed.messages)) { Store.saveMessages(parsed.messages); n++; }
          if (!n) throw new Error('formato');
          data = Store.loadData();
          persist('Backup importado ✔');
        } catch (err) {
          toast('Ficheiro inválido — use um backup exportado pelo painel.', true);
        }
      };
      reader.readAsText(t.files[0]);
      t.value = '';
    }
  }

  function onViewSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (form.id === 'settings-form') saveSettings(form);
    if (form.id === 'pass-form') changePassword(form);
    if (form.id === 'pub-form') {
      savePublishCfg({
        token: $('#p-token', form).value.trim(),
        repo: $('#p-repo', form).value.trim(),
        branch: ($('#p-branch', form).value.trim() || 'main')
      });
      toast('Dados de publicação guardados ✔');
    }
  }

  function moveItem(list, id, dir) {
    if (!Array.isArray(list)) return;
    const i = list.findIndex(x => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
  }

  /* ================= painel geral ================= */

  function renderDashboard() {
    const bks = Store.listBookings();
    const msgs = Store.listMessages();
    const novas = bks.filter(b => b.status === 'nova').length;
    const unread = msgs.filter(m => !m.read).length;
    const revenue = bks.filter(b => b.status !== 'cancelada')
      .reduce((s, b) => s + (Number(b.total) || 0), 0);

    const bkRows = bks.slice(0, 5).map(b =>
      `<li><span><strong>${esc(b.name)}</strong> · ${esc(b.roomName)}</span><span class="when">${fmtDay(b.checkin)}</span></li>`).join('');
    const msgRows = msgs.slice(0, 5).map(m =>
      `<li><span><strong>${esc(m.name)}</strong> — ${esc(String(m.text || '').slice(0, 42))}${String(m.text || '').length > 42 ? '…' : ''}</span><span class="when">${fmtDateTime(m.createdAt)}</span></li>`).join('');

    view.innerHTML = `
      <div class="cards">
        <div class="stat-card accent"><strong>${novas}</strong><span>reservas novas</span></div>
        <div class="stat-card"><strong>${unread}</strong><span>mensagens por ler</span></div>
        <div class="stat-card"><strong>${data.rooms.length}</strong><span>quartos no site</span></div>
        <div class="stat-card"><strong>${money(revenue)}</strong><span>valor estimado em reservas</span></div>
      </div>
      <div class="cards2">
        <div class="list-card">
          <h3>Últimas reservas</h3>
          ${bkRows ? `<ul>${bkRows}</ul>` : '<p class="empty">Ainda não há reservas — elas aparecem aqui quando os hóspedes usam o formulário do site.</p>'}
          <div class="form-foot"><button type="button" class="btn btn-outline btn-sm" data-tab-go="reservas">Ver todas</button></div>
        </div>
        <div class="list-card">
          <h3>Últimas mensagens</h3>
          ${msgRows ? `<ul>${msgRows}</ul>` : '<p class="empty">Ainda não há mensagens de contato ou subscrições de newsletter.</p>'}
          <div class="form-foot"><button type="button" class="btn btn-outline btn-sm" data-tab-go="mensagens">Ver todas</button></div>
        </div>
      </div>`;

    $$('[data-tab-go]', view).forEach(b => b.addEventListener('click', () => showTab(b.dataset.tabGo)));
  }

  /* ================= reservas ================= */

  function renderReservas() {
    const bks = Store.listBookings();
    const rows = bks.map(b => {
      const st = STATUS[b.status] || STATUS.nova;
      const waText = `Olá ${b.name}! Sobre a sua reserva no Forever Young (${b.roomName}, ` +
        `${fmtDay(b.checkin)} a ${fmtDay(b.checkout)})…`;
      return `<tr>
        <td>${fmtDateTime(b.createdAt)}</td>
        <td><strong>${esc(b.name)}</strong><br><small>${esc(b.phone || 'sem telefone')}</small></td>
        <td>${fmtDay(b.checkin)} → ${fmtDay(b.checkout)}<br><small>${b.nights} noite${b.nights > 1 ? 's' : ''}</small></td>
        <td>${esc(b.roomName)}<br><small>${esc(b.guests)}${b.payment ? ' · ' + esc(b.payment) : ''}</small></td>
        <td><strong>${money(b.total)}</strong></td>
        <td><span class="pill ${st.cls}">${st.label}</span></td>
        <td>
          <select data-action="bk-status" data-id="${b.id}" aria-label="Estado da reserva">
            ${Object.keys(STATUS).map(k => `<option value="${k}"${b.status === k ? ' selected' : ''}>${STATUS[k].label}</option>`).join('')}
          </select>
        </td>
        <td>
          <div class="cell-actions">
            <a class="mini" href="${FY.waLink(b.phone || (data.settings || {}).whatsapp, waText)}" target="_blank" rel="noopener">WhatsApp</a>
            <button type="button" class="mini danger" data-action="bk-del" data-id="${b.id}">Apagar</button>
          </div>
        </td>
      </tr>`;
    }).join('');

    view.innerHTML = `
      <div class="section-head-row">
        <p>Reservas pedidas pelo formulário do site. Confirme pelo WhatsApp e mude o estado aqui.</p>
        <div class="cell-actions">
          <button type="button" class="btn btn-outline btn-sm" data-action="bk-csv">Exportar CSV</button>
        </div>
      </div>
      ${bks.length ? `
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Pedido</th><th>Hóspede</th><th>Estadia</th><th>Quarto</th><th>Total</th><th>Estado</th><th></th><th>Ações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>` : '<p class="empty">Ainda não há reservas registadas.</p>'}`;
  }

  function exportCSV() {
    const bks = Store.listBookings();
    if (!bks.length) { toast('Não há reservas para exportar.', true); return; }
    const head = ['Data do pedido', 'Nome', 'Telefone', 'Check-in', 'Check-out', 'Quarto', 'Hóspedes', 'Noites', 'Total', 'Pagamento', 'Estado'];
    const lines = bks.map(b => [
      fmtDateTime(b.createdAt), b.name, b.phone, b.checkin, b.checkout,
      b.roomName, b.guests, b.nights, money(b.total), b.payment || '', (STATUS[b.status] || STATUS.nova).label
    ].map(csvCell).join(','));
    const csv = '\uFEFF' + head.map(csvCell).join(',') + '\n' + lines.join('\n');
    download('reservas-forever-young.csv', csv, 'text/csv;charset=utf-8');
    toast('CSV exportado ✔');
  }

  /* ================= mensagens ================= */

  function renderMensagens() {
    const msgs = Store.listMessages();
    const cards = msgs.map(m => `
      <div class="msg-card${m.read ? '' : ' unread'}">
        <div class="msg-head">
          <div><strong>${esc(m.name)}</strong> <span class="who">· ${esc(m.email)}${m.phone ? ' · ' + esc(m.phone) : ''}</span></div>
          <span class="who">${fmtDateTime(m.createdAt)}</span>
        </div>
        <p class="msg-text">${esc(m.text)}</p>
        <div class="msg-actions">
          <button type="button" class="mini" data-action="msg-toggle" data-id="${m.id}">${m.read ? 'Marcar como não lida' : 'Marcar como lida'}</button>
          ${m.email !== 'Newsletter' ? `<a class="mini" href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re: a sua mensagem ao Forever Young')}&body=${encodeURIComponent('Olá ' + m.name + ',\n\n')}">Responder por e-mail</a>` : ''}
          <button type="button" class="mini danger" data-action="msg-del" data-id="${m.id}">Apagar</button>
        </div>
      </div>`).join('');

    view.innerHTML = `
      <div class="section-head-row">
        <p>Mensagens enviadas pelo formulário do site e subscrições de ofertas.</p>
      </div>
      ${cards || '<p class="empty">Não há mensagens por agora.</p>'}`;
  }

  /* ================= banner rotativo ================= */

  function renderBanner() {
    const slides = data.heroSlides || [];
    const rows = slides.map(s => `
      <tr>
        <td><img class="thumb thumb-wide" src="${esc(s.image)}" alt=""></td>
        <td><strong>${esc(s.title || 'Texto geral do site')}</strong><br><small>${esc(s.subtitle || (s.highlight ? 'Destaque: ' + s.highlight : ''))}</small></td>
        <td>
          <div class="cell-actions">
            <button type="button" class="mini" data-action="hs-up" data-id="${s.id}" title="Mover para cima">↑</button>
            <button type="button" class="mini" data-action="hs-down" data-id="${s.id}" title="Mover para baixo">↓</button>
            <button type="button" class="mini" data-action="hs-edit" data-id="${s.id}">Editar</button>
            <button type="button" class="mini danger" data-action="hs-del" data-id="${s.id}">Apagar</button>
          </div>
        </td>
      </tr>`).join('');

    view.innerHTML = `
      <div class="section-head-row">
        <p>Imagens do banner rotativo no topo do site (trocam a cada 6 segundos). Campos de texto vazios usam o texto geral definido em Configurações → Página inicial.</p>
        <button type="button" class="btn btn-gold btn-sm" data-action="hs-add">+ Nova imagem</button>
      </div>
      ${slides.length ? `
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Imagem</th><th>Texto do slide</th><th>Ações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>` : '<p class="empty">Sem imagens — o site usa a imagem definida em Configurações → Página inicial.</p>'}`;
  }

  function heroSlideForm(sl) {
    sl = sl || {};
    return fText('Imagem (URL ou caminho)', 'image', sl.image, 'img/restaurante.jpg ou https://…') +
      fText('Título (opcional)', 'title', sl.title, 'Ex.: Sabor de Moçambique') +
      fText('Destaque dourado (opcional)', 'highlight', sl.highlight, 'Ex.: à sua mesa') +
      fArea('Subtítulo (opcional)', 'subtitle', sl.subtitle, 2);
  }

  function saveHeroSlide(existing, f) {
    if (!f.image || !f.image.trim()) { toast('Indique o caminho ou URL da imagem.', true); return false; }
    if (!Array.isArray(data.heroSlides)) data.heroSlides = [];
    const obj = {
      id: existing ? existing.id : uid('hs'),
      image: f.image.trim(),
      title: (f.title || '').trim(),
      highlight: (f.highlight || '').trim(),
      subtitle: (f.subtitle || '').trim()
    };
    if (existing) {
      data.heroSlides = data.heroSlides.map(x => x.id === existing.id ? obj : x);
    } else {
      data.heroSlides.push(obj);
    }
  }

  /* ================= pagamentos ================= */

  function renderPagamentos() {
    const pays = data.payments || [];
    const rows = pays.map(p => `
      <tr>
        <td><span class="pill pm-${esc(p.color)}">${esc(p.name)}</span></td>
        <td><strong>${esc(p.name)}</strong><br><small>${esc(p.details)}</small></td>
        <td>
          <div class="cell-actions">
            <button type="button" class="mini" data-action="pay-up" data-id="${p.id}" title="Mover para cima">↑</button>
            <button type="button" class="mini" data-action="pay-down" data-id="${p.id}" title="Mover para baixo">↓</button>
            <button type="button" class="mini" data-action="pay-edit" data-id="${p.id}">Editar</button>
            <button type="button" class="mini danger" data-action="pay-del" data-id="${p.id}">Apagar</button>
          </div>
        </td>
      </tr>`).join('');

    view.innerHTML = `
      <div class="section-head-row">
        <p>Formas de pagamento à distância mostradas na secção “Pagamentos” e na barra de reservas. Edite aqui os números e o IBAN reais do hotel.</p>
        <button type="button" class="btn btn-gold btn-sm" data-action="pay-add">+ Nova forma</button>
      </div>
      ${pays.length ? `
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Selo</th><th>Forma de pagamento</th><th>Ações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>` : '<p class="empty">Nenhuma forma de pagamento.</p>'}`;
  }

  function paymentForm(p) {
    p = p || {};
    return fText('Nome', 'name', p.name, 'Ex.: M-Pesa') +
      fSelect('Ícone', 'icon', p.icon || 'wallet', ICONS) +
      fSelect('Cor do selo', 'color', p.color || 'red', [['red', 'Vermelho'], ['ochre', 'Ocre'], ['green', 'Verde'], ['blue', 'Azul'], ['navy', 'Azul-marinho'], ['wine', 'Vinho'], ['orange', 'Laranja']]) +
      fArea('Instruções (número, IBAN, passos…)', 'details', p.details, 3);
  }

  function savePayment(existing, f) {
    if (!f.name || !f.name.trim()) { toast('Dê um nome à forma de pagamento.', true); return false; }
    if (!Array.isArray(data.payments)) data.payments = [];
    const obj = {
      id: existing ? existing.id : uid('pay'),
      name: f.name.trim(),
      icon: f.icon || 'wallet',
      color: f.color || 'red',
      details: f.details || ''
    };
    if (existing) {
      data.payments = data.payments.map(x => x.id === existing.id ? obj : x);
    } else {
      data.payments.push(obj);
    }
  }

  /* ================= quartos ================= */

  function renderQuartos() {
    const rows = data.rooms.map(r => `
      <tr>
        <td><img class="thumb" src="${esc(r.image)}" alt=""></td>
        <td><strong>${esc(r.name)}</strong><br><small>${esc(r.size)} · ${esc(r.guests)} · ${esc(r.view)}</small></td>
        <td><strong>${money(r.price)}</strong></td>
        <td>
          <div class="cell-actions">
            <button type="button" class="mini" data-action="room-up" data-id="${r.id}" title="Mover para cima">↑</button>
            <button type="button" class="mini" data-action="room-down" data-id="${r.id}" title="Mover para baixo">↓</button>
            <button type="button" class="mini" data-action="room-edit" data-id="${r.id}">Editar</button>
            <button type="button" class="mini danger" data-action="room-del" data-id="${r.id}">Apagar</button>
          </div>
        </td>
      </tr>`).join('');

    view.innerHTML = `
      <div class="section-head-row">
        <p>Use ↑ e ↓ para mudar a ordem em que os quartos aparecem no site.</p>
        <button type="button" class="btn btn-gold btn-sm" data-action="room-add">+ Novo quarto</button>
      </div>
      ${data.rooms.length ? `
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Foto</th><th>Quarto</th><th>Preço/noite</th><th>Ações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>` : '<p class="empty">Nenhum quarto — adicione o primeiro.</p>'}`;
  }

  function roomForm(r) {
    r = r || {};
    return fText('Nome do quarto', 'name', r.name, 'Ex.: Quarto Casal Standard') +
      fNum('Preço por noite (' + ((data.settings || {}).currency || 'MT') + ')', 'price', r.price) +
      `<div class="form-grid">` +
      fText('Tamanho', 'size', r.size, 'Ex.: 18 m²') +
      fText('Hóspedes', 'guests', r.guests, 'Ex.: 2 hóspedes') +
      fText('Vista', 'view', r.view, 'Ex.: Vista interior') +
      fText('Imagem (URL ou caminho)', 'image', r.image, 'img/quarto.jpg') +
      `</div>` +
      fArea('Destaques (um por linha)', 'features', (r.features || []).join('\n'), 4);
  }

  function saveRoom(existing, f) {
    if (!f.name || !f.name.trim()) { toast('Dê um nome ao quarto.', true); return false; }
    const features = String(f.features || '').split('\n').map(s => s.trim()).filter(Boolean);
    const obj = {
      id: existing ? existing.id : uid('room'),
      name: f.name.trim(),
      price: Number(f.price) || 0,
      size: f.size, guests: f.guests, view: f.view,
      image: f.image || 'img/quarto.jpg',
      features
    };
    if (existing) {
      data.rooms = data.rooms.map(x => x.id === existing.id ? obj : x);
    } else {
      data.rooms.push(obj);
    }
  }

  /* ================= comodidades ================= */

  function renderComodidades() {
    const rows = data.amenities.map(a => `
      <tr>
        <td style="width:52px"><span class="pill st-nova">${esc(a.icon)}</span></td>
        <td><strong>${esc(a.title)}</strong><br><small>${esc(a.desc)}</small></td>
        <td>
          <div class="cell-actions">
            <button type="button" class="mini" data-action="am-edit" data-id="${a.id}">Editar</button>
            <button type="button" class="mini danger" data-action="am-del" data-id="${a.id}">Apagar</button>
          </div>
        </td>
      </tr>`).join('');

    view.innerHTML = `
      <div class="section-head-row">
        <p>As cortesias e instalações mostradas na secção “Cortesias” do site.</p>
        <button type="button" class="btn btn-gold btn-sm" data-action="am-add">+ Nova comodidade</button>
      </div>
      ${data.amenities.length ? `
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Ícone</th><th>Comodidade</th><th>Ações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>` : '<p class="empty">Nenhuma comodidade.</p>'}`;
  }

  function amenityForm(a) {
    a = a || {};
    return fText('Título', 'title', a.title, 'Ex.: Segurança 24h') +
      fSelect('Ícone', 'icon', a.icon || 'shield', ICONS) +
      fArea('Descrição', 'desc', a.desc, 2);
  }

  function saveAmenity(existing, f) {
    if (!f.title || !f.title.trim()) { toast('Dê um título à comodidade.', true); return false; }
    const obj = {
      id: existing ? existing.id : uid('am'),
      icon: f.icon || 'shield',
      title: f.title.trim(),
      desc: f.desc || ''
    };
    if (existing) {
      data.amenities = data.amenities.map(x => x.id === existing.id ? obj : x);
    } else {
      data.amenities.push(obj);
    }
  }

  /* ================= galeria ================= */

  function renderGaleria() {
    const cards = data.gallery.map(g => `
      <div class="g-admin">
        <img src="${esc(g.image)}" alt="${esc(g.caption)}" loading="lazy">
        <div class="g-cap">${esc(g.caption)}</div>
        <div class="g-actions">
          <button type="button" class="mini" data-action="gal-up" data-id="${g.id}" title="Mover para a esquerda">←</button>
          <button type="button" class="mini" data-action="gal-down" data-id="${g.id}" title="Mover para a direita">→</button>
          <button type="button" class="mini" data-action="gal-edit" data-id="${g.id}">Editar</button>
          <button type="button" class="mini danger" data-action="gal-del" data-id="${g.id}">Apagar</button>
        </div>
      </div>`).join('');

    view.innerHTML = `
      <div class="section-head-row">
        <p>Fotos da galeria do site. Use ← e → para reordenar; pode usar fotos da pasta img/ ou links da internet.</p>
        <button type="button" class="btn btn-gold btn-sm" data-action="gal-add">+ Nova foto</button>
      </div>
      ${data.gallery.length ? `<div class="gallery-admin">${cards}</div>` : '<p class="empty">A galeria está vazia.</p>'}`;
  }

  function galleryForm(g) {
    g = g || {};
    return fText('Legenda', 'caption', g.caption, 'Ex.: Quarto confortável') +
      fText('Imagem (URL ou caminho)', 'image', g.image, 'img/quarto.jpg ou https://…');
  }

  function saveGallery(existing, f) {
    if (!f.image || !f.image.trim()) { toast('Indique o caminho ou URL da imagem.', true); return false; }
    const obj = {
      id: existing ? existing.id : uid('gal'),
      image: f.image.trim(),
      caption: f.caption || ''
    };
    if (existing) {
      data.gallery = data.gallery.map(x => x.id === existing.id ? obj : x);
    } else {
      data.gallery.push(obj);
    }
  }

  /* ================= depoimentos ================= */

  function renderDepoimentos() {
    const cards = data.testimonials.map(t => `
      <div class="ts-card">
        <span class="pill st-nova">★★★★★</span>
        <p>“${esc(t.text)}”</p>
        <div class="who"><strong>${esc(t.name)}</strong> — ${esc(t.origin)}</div>
        <div class="ts-actions">
          <button type="button" class="mini" data-action="ts-edit" data-id="${t.id}">Editar</button>
          <button type="button" class="mini danger" data-action="ts-del" data-id="${t.id}">Apagar</button>
        </div>
      </div>`).join('');

    view.innerHTML = `
      <div class="section-head-row">
        <p>Comentários de hóspedes exibidos na página inicial.</p>
        <button type="button" class="btn btn-gold btn-sm" data-action="ts-add">+ Novo depoimento</button>
      </div>
      ${cards || '<p class="empty">Nenhum depoimento.</p>'}`;
  }

  function testimonialForm(t) {
    t = t || {};
    return fArea('Texto do depoimento', 'text', t.text, 3) +
      `<div class="form-grid">` +
      fText('Nome', 'name', t.name, 'Ex.: Amílcar & Sónia') +
      fText('Origem', 'origin', t.origin, 'Ex.: Pemba') +
      `</div>`;
  }

  function saveTestimonial(existing, f) {
    if (!f.text || !f.text.trim()) { toast('Escreva o texto do depoimento.', true); return false; }
    const obj = {
      id: existing ? existing.id : uid('ts'),
      text: f.text.trim(),
      name: f.name || 'Hóspede',
      origin: f.origin || ''
    };
    if (existing) {
      data.testimonials = data.testimonials.map(x => x.id === existing.id ? obj : x);
    } else {
      data.testimonials.push(obj);
    }
  }

  /* ================= configurações ================= */

  function renderConfiguracoes() {
    const s = data.settings;
    const st = s.stats || [{}, {}, {}];
    const audit = Store.listAudit().slice(0, 10).map(a => `
      <li><span class="${a.ok ? '' : 'bad'}">${esc(a.event)}</span><span class="when">${fmtDateTime(a.at)}</span></li>`).join('');
    view.innerHTML = `
      <p class="page-sub">As alterações aparecem no site depois de guardar e atualizar a página do site (F5).</p>

      <form id="settings-form" novalidate>
        <div class="card">
          <h3>Marca</h3>
          <div class="form-grid">
            ${fText('Nome do hotel', 'brandName', s.brandName)}
            ${fText('Linha pequena do logótipo', 'brandSuffix', s.brandSuffix)}
            ${fText('Logótipo (caminho/URL)', 'logoImage', s.logoImage)}
            ${fText('Moeda (ex.: MT)', 'currency', s.currency)}
          </div>
        </div>

        <div class="card">
          <h3>Página inicial (hero)</h3>
          <div class="form-grid">
            ${fText('Imagem de fundo (caminho/URL)', 'heroImage', s.heroImage)}
            ${fText('Linha superior', 'heroEyebrow', s.heroEyebrow)}
            ${fText('Título principal', 'heroTitle', s.heroTitle)}
            ${fText('Destaque (em dourado)', 'heroHighlight', s.heroHighlight)}
          </div>
          ${fArea('Subtítulo', 'heroSubtitle', s.heroSubtitle, 2)}
          ${fText('Selos separados por “·”', 'heroChips', s.heroChips, 'Segurança 24h · Estacionamento · Café da manhã')}
        </div>

        <div class="card">
          <h3>Contactos e horários</h3>
          <div class="form-grid">
            ${fText('Telefone (como aparece)', 'phoneDisplay', s.phoneDisplay, '+258 84 416 0174')}
            ${fText('E-mail', 'email', s.email)}
            ${fText('Endereço', 'address', s.address)}
            ${fText('Horários / recepção', 'hours', s.hours)}
            ${fText('Website', 'website', s.website)}
            ${fText('Mapa (link de incorporação do Google Maps)', 'mapEmbed', s.mapEmbed)}
          </div>
        </div>

        <div class="card">
          <h3>Redes sociais</h3>
          <p class="card-sub">Cole os links completos (https://…). Campos vazios ficam escondidos no site.</p>
          <div class="form-grid">
            ${fText('WhatsApp (só números, com 258)', 'whatsapp', s.whatsapp, '258844160174')}
            ${fText('Instagram (link)', 'instagramUrl', s.instagramUrl)}
            ${fText('Facebook (link)', 'facebookUrl', s.facebookUrl)}
            ${fText('TikTok (link)', 'tiktokUrl', s.tiktokUrl)}
            ${fText('YouTube (link)', 'youtubeUrl', s.youtubeUrl)}
            ${fText('TripAdvisor (link)', 'tripadvisorUrl', s.tripadvisorUrl)}
          </div>
        </div>

        <div class="card">
          <h3>Secção “O Hotel”</h3>
          ${fText('Título', 'aboutTitle', s.aboutTitle)}
          ${fArea('Parágrafo 1', 'aboutText1', s.aboutText1, 3)}
          ${fArea('Parágrafo 2', 'aboutText2', s.aboutText2, 3)}
          <div class="form-grid">
            ${fText('Selo — valor', 'aboutBadgeValue', s.aboutBadgeValue, '24h')}
            ${fText('Selo — texto', 'aboutBadgeLabel', s.aboutBadgeLabel, 'de segurança')}
            ${fText('Foto grande', 'aboutImage1', s.aboutImage1)}
            ${fText('Foto sobreposta', 'aboutImage2', s.aboutImage2)}
          </div>
          ${fArea('Diferenciais (um por linha)', 'aboutFeatures', (s.aboutFeatures || []).join('\n'), 4)}
        </div>

        <div class="card">
          <h3>Números em destaque</h3>
          <div class="form-grid">
            ${fText('1 — valor', 'stat1v', (st[0] || {}).value)}
            ${fText('1 — texto', 'stat1l', (st[0] || {}).label)}
            ${fText('2 — valor', 'stat2v', (st[1] || {}).value)}
            ${fText('2 — texto', 'stat2l', (st[1] || {}).label)}
            ${fText('3 — valor', 'stat3v', (st[2] || {}).value)}
            ${fText('3 — texto', 'stat3l', (st[2] || {}).label)}
          </div>
        </div>

        <div class="card">
          <h3>Rodapé</h3>
          ${fArea('Texto de apresentação', 'footerText', s.footerText, 2)}
          <div class="form-foot">
            <button type="submit" class="btn btn-gold">Guardar configurações</button>
          </div>
        </div>
      </form>

      <div class="card">
        <h3>Segurança do painel</h3>
        <p class="card-sub">Senha protegida com PBKDF2-SHA256 (150.000 iterações + sal aleatório), bloqueio temporário após tentativas falhadas e sessão que expira após ${SESSION_MINUTES} minutos de inatividade.</p>
        <form id="pass-form" novalidate>
          <div class="form-grid">
            ${fText('Nome de utilizador', 'username', (Store.getCredentials() || {}).user || 'admin')}
            ${fPass('Senha atual', 'cur')}
            ${fPass('Nova senha', 'new1')}
            ${fPass('Repetir a nova senha', 'new2')}
          </div>
          <div class="meter" id="pass-meter"><i></i></div>
          <small class="meter-label" id="pass-meter-label"></small>
          <div class="form-foot"><button type="submit" class="btn btn-gold">Guardar novo acesso</button></div>
        </form>
      </div>

      <div class="card">
        <h3>Registo de auditoria</h3>
        <p class="card-sub">Entradas e tentativas de acesso neste navegador (guardamos os últimos 50 eventos).</p>
        <ul class="audit-list">
          ${audit || '<li><span class="empty">Sem eventos registados.</span></li>'}
        </ul>
        <div class="form-foot"><button type="button" class="btn btn-outline btn-sm" data-action="sec-clear-audit">Limpar registo</button></div>
      </div>

      <div class="card">
        <h3>Cópias de segurança</h3>
        <p class="card-sub">Guarde um ficheiro com todo o conteúdo (site, reservas e mensagens) ou importe um backup anterior.</p>
        <div class="form-foot">
          <button type="button" class="btn btn-outline" data-action="set-export">Exportar backup (.json)</button>
          <label class="btn btn-outline" style="cursor:pointer">Importar backup<input type="file" id="import-file" accept="application/json,.json" style="display:none"></label>
        </div>
      </div>

      <div class="card">
        <h3>Publicar na Internet</h3>
        <p class="card-sub">Envia o conteúdo editado para o seu repositório GitHub e a hospedagem atualiza o site em 1–2 minutos. Como criar o token grátis está no ficheiro <strong>GUIA-DE-PUBLICACAO.md</strong> (passo 3).</p>
        <form id="pub-form" novalidate>
          <div class="form-grid">
            ${fPass('Token do GitHub (guardado apenas neste navegador)', 'p-token', getPublishCfg().token, 'ghp_…')}
            ${fText('Repositório', 'p-repo', getPublishCfg().repo, 'utilizador/forever-young-hotel')}
            ${fText('Ramo (branch)', 'p-branch', getPublishCfg().branch, 'main')}
          </div>
          <div class="form-foot">
            <button type="submit" class="btn btn-outline">Guardar dados de publicação</button>
            <button type="button" class="btn btn-outline" data-action="pub-test">Testar ligação</button>
            <button type="button" class="btn btn-outline" data-action="pub-json">Descarregar content.json</button>
            <button type="button" class="mini danger" data-action="pub-forget" title="Apagar o token guardado neste navegador">Esquecer token</button>
            <button type="button" class="btn btn-gold" data-action="pub-now">Publicar agora</button>
          </div>
        </form>
      </div>

      <div class="card danger-zone">
        <h3>Zona de risco</h3>
        <p class="card-sub">Restaura todo o conteúdo original do site (quartos, textos, fotos…). Reservas e mensagens não são apagadas.</p>
        <div class="form-foot">
          <button type="button" class="btn btn-outline" data-action="set-reset">Restaurar conteúdo padrão</button>
        </div>
      </div>`;

    const newPass = $('#new1', view);
    if (newPass) newPass.addEventListener('input', e => updateMeter($('#pass-meter'), $('#pass-meter-label'), e.target.value));
  }

  function saveSettings(form) {
    const f = {};
    $$('[name]', form).forEach(el => { f[el.name] = el.value; });
    const s = data.settings;
    ['brandName', 'brandSuffix', 'logoImage', 'currency', 'heroImage', 'heroEyebrow', 'heroTitle',
      'heroHighlight', 'heroSubtitle', 'heroChips', 'phoneDisplay', 'whatsapp', 'email', 'address',
      'facebookUrl', 'instagramUrl', 'tiktokUrl', 'youtubeUrl', 'tripadvisorUrl',
      'website', 'hours', 'mapEmbed', 'aboutTitle', 'aboutText1', 'aboutText2',
      'aboutBadgeValue', 'aboutBadgeLabel', 'aboutImage1', 'aboutImage2', 'footerText'
    ].forEach(k => { if (f[k] != null) s[k] = f[k].trim(); });
    s.aboutFeatures = String(f.aboutFeatures || '').split('\n').map(x => x.trim()).filter(Boolean);
    s.stats = [
      { value: f.stat1v, label: f.stat1l },
      { value: f.stat2v, label: f.stat2l },
      { value: f.stat3v, label: f.stat3l }
    ];
    persist('Configurações guardadas ✔ — atualize o site para ver (F5)');
  }

  async function changePassword(form) {
    const g = n => $('[name="' + n + '"]', form).value;
    const username = (g('username') || '').trim() || 'admin';
    const cur = g('cur'), n1 = g('new1'), n2 = g('new2');

    const prob = passwordProblem(n1);
    if (prob) { toast(prob, true); return; }
    if (n1 !== n2) { toast('As duas senhas novas não coincidem.', true); return; }

    const ok = await Store.verifyCredentials((Store.getCredentials() || {}).user, cur);
    if (ok !== true) { toast('A senha atual está incorreta.', true); return; }

    const rec = await Store.createCredentials(username, n1);
    Store.addAudit('Acesso atualizado (nova senha)', true);
    form.reset();
    updateMeter($('#pass-meter'), $('#pass-meter-label'), '');
    toast('Acesso atualizado ✔ Utilizador: ' + rec.user);
  }

  /* ================= backup ================= */

  function exportAll() {
    const payload = {
      app: 'forever-young-hotel',
      exportedAt: new Date().toISOString(),
      data: data,
      bookings: Store.listBookings(),
      messages: Store.listMessages()
    };
    download('backup-forever-young.json', JSON.stringify(payload, null, 2), 'application/json');
    toast('Backup exportado ✔');
  }
})();
