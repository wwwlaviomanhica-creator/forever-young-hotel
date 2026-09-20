/* ============================================================
   Forever Young — Hotel Restaurante e Bar
   Dados padrão + camada de armazenamento (localStorage).
   Carregado pelo site público (site.js) e pelo painel (admin.js).
   ============================================================ */
(function (global) {
  'use strict';

  var KEY_DATA = 'fy_data_v1';
  var KEY_BOOKINGS = 'fy_bookings_v1';
  var KEY_MESSAGES = 'fy_messages_v1';
  var KEY_AUTH = 'fy_auth_v1';
  var KEY_SESSION = 'fy_session';
  var KEY_AUDIT = 'fy_audit_v1';

  var DEFAULT_DATA = {
    settings: {
      brandName: 'Forever Young',
      brandSuffix: 'HOTEL · RESTAURANTE · BAR',
      logoImage: 'img/logo.jpg',
      heroImage: 'img/restaurante.jpg',
      heroEyebrow: 'Bem-vindo ao Forever Young',
      heroTitle: 'Seu momento a dois',
      heroHighlight: 'começa aqui',
      heroSubtitle: 'Hotel, Restaurante e Bar no coração de Malhampsene — hospitalidade moçambicana, segurança 24 horas e um café da manhã completo para começar bem o dia.',
      heroChips: 'Segurança 24h · Estacionamento · Café da manhã incluso',
      phoneDisplay: '+258 84 416 0174',
      whatsapp: '258844160174',
      email: 'geral@foreveryoung.com',
      address: 'Av. Samora Machel, Bairro de Malhampsene, Paragem 120 — Matola, Moçambique',
      facebookUrl: 'https://www.fb.com/foreveryoung',
      instagramUrl: 'https://www.instagram.com/foreveryounghotel',
      tiktokUrl: '',
      youtubeUrl: '',
      tripadvisorUrl: '',
      website: 'www.foreveryoung.com',
      hours: 'Recepção e segurança 24 horas',
      currency: 'MT',
      mapEmbed: 'https://www.openstreetmap.org/export/embed.html?bbox=32.4287,-25.8984,32.4407,-25.8864&layer=mapnik&marker=-25.8924064,32.4347087',
      aboutTitle: 'Um espaço feito para momentos a dois',
      aboutText1: 'O Forever Young nasceu para oferecer um ambiente super confortável para casais, com quartos climatizados, segurança 24 horas e uma equipa que recebe como família.',
      aboutText2: 'No nosso restaurante e bar, o sabor de Moçambique está em conta: grelhados no ponto, peixe fresco do Índico, pratos da terra e um bar cheio de escolhas.',
      aboutBadgeValue: '24h',
      aboutBadgeLabel: 'de segurança',
      aboutImage1: 'img/quarto.jpg',
      aboutImage2: 'img/restaurante.jpg',
      aboutFeatures: [
        'Localização de fácil acesso na Paragem 120',
        'Restaurante acolhedor e bar com bebidas variadas',
        'Café da manhã completo incluso na estadia',
        'Segurança 24 horas e estacionamento próprio'
      ],
      stats: [
        { value: '3', label: 'modalidades de quarto' },
        { value: '24h', label: 'segurança e recepção' },
        { value: '100%', label: 'café da manhã incluso' }
      ],
      footerText: 'Hotel, Restaurante e Bar — hospitalidade moçambicana na Av. Samora Machel, Malhampsene, Paragem 120, Matola. Kanimambo por nos escolher!'
    },
    rooms: [
      {
        id: 'r1',
        name: 'Quarto Casal Standard',
        price: 2500,
        size: '18 m²',
        guests: '2 hóspedes',
        view: 'Vista interior',
        image: 'img/quarto.jpg',
        features: ['Cama de casal confortável', 'Banheiro privativo', 'TV e ar-condicionado']
      },
      {
        id: 'r2',
        name: 'Quarto Casal Deluxe',
        price: 3500,
        size: '24 m²',
        guests: '2 hóspedes',
        view: 'Vista para a cidade',
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80',
        features: ['Cama queen e poltrona de apoio', 'TV de tela plana e ar-condicionado', 'Café da manhã completo incluído']
      },
      {
        id: 'r3',
        name: 'Suíte Momento a Dois',
        price: 5000,
        size: '32 m²',
        guests: '2 hóspedes',
        view: 'Vista privilegiada',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
        features: ['Espaço amplo com área de estar', 'Decoração especial para casais', 'Detalhes de boas-vindas']
      }
    ],
    amenities: [
      { id: 'a1', icon: 'shield', title: 'Segurança 24h', desc: 'Vigilância e recepção a qualquer hora, para você relaxar.' },
      { id: 'a2', icon: 'car', title: 'Estacionamento', desc: 'Estacionamento próprio para hóspedes e visitantes.' },
      { id: 'a3', icon: 'coffee', title: 'Café da manhã completo', desc: 'Incluso na estadia, servido no nosso restaurante.' },
      { id: 'a4', icon: 'utensils', title: 'Restaurante acolhedor', desc: 'Grelhados no ponto, peixe fresco do Índico e pratos da terra — venha fazer o seu pedido.' },
      { id: 'a5', icon: 'wine', title: 'Bar variado', desc: 'Bar com diversidades de bebidas para brindar o momento.' },
      { id: 'a6', icon: 'snow', title: 'Ar-condicionado e TV', desc: 'Quartos climatizados e com televisão para o seu conforto.' },
      { id: 'a7', icon: 'bed', title: 'Espaço para casais', desc: 'Ambiente reservado e confortável para um momento a dois.' },
      { id: 'a8', icon: 'bell', title: 'Atendimento dedicado', desc: 'Equipa atenciosa do check-in ao check-out.' }
    ],
    gallery: [
      { id: 'g1', image: 'img/quarto.jpg', caption: 'Quarto confortável' },
      { id: 'g2', image: 'img/restaurante.jpg', caption: 'Nosso restaurante' },
      { id: 'g3', image: 'img/grelhados.jpg', caption: 'Grelhados do Forever Young' },
      { id: 'g4', image: 'img/flyer-hotel.jpg', caption: 'Forever Young Hotel' },
      { id: 'g5', image: 'img/cortesias.jpg', caption: 'Cortesias para hóspedes' },
      { id: 'g6', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', caption: 'Para descontrair' }
    ],
    testimonials: [
      { id: 't1', text: 'Ambiente super aconchegante e um atendimento de primeira. O grelhado do restaurante é imperdível — voltaremos com certeza!', name: 'Amílcar & Sónia', origin: 'Matola' },
      { id: 't2', text: 'Quarto limpo, ar-condicionado potente e um café da manhã que já vale a estadia. Segurança atenciosa do início ao fim.', name: 'Rosita M.', origin: 'Boane' },
      { id: 't3', text: 'Marcação rápida pelo WhatsApp e tudo pronto quando chegámos. O melhor espaço da Paragem 120 para um momento a dois. Kanimambo!', name: 'Carlos J.', origin: 'Maputo' }
    ],
    heroSlides: [
      { id: 'h1', image: 'img/quarto.jpg', title: 'Seu momento a dois', highlight: 'começa aqui', subtitle: '' },
      { id: 'h2', image: 'img/restaurante.jpg', title: 'Sabor de Moçambique', highlight: 'à sua mesa', subtitle: 'Grelhados no ponto, peixe fresco do Índico e um bar cheio de escolhas.' },
      { id: 'h3', image: 'img/grelhados.jpg', title: 'Venha fazer o seu pedido', highlight: 'grelhado do dia', subtitle: '' },
      { id: 'h4', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=80', title: 'Conforto que se sente', highlight: 'em cada detalhe', subtitle: '' }
    ],
    payments: [
      { id: 'pay1', name: 'M-Pesa', icon: 'phone', color: 'red', details: 'Vodacom M-Pesa para o +258 84 416 0174 (Forever Young). Envie o comprovativo pelo WhatsApp e confirmamos logo.' },
      { id: 'pay2', name: 'e-Mola', icon: 'wallet', color: 'orange', details: 'Movitel e-Mola: transfira para o número do hotel e envie o comprovativo pelo WhatsApp.' },
      { id: 'pay3', name: 'mKesh', icon: 'wallet', color: 'blue', details: 'Tmcel mKesh: transfira para o número do hotel e envie o comprovativo pelo WhatsApp.' },
      { id: 'pay4', name: 'Transferência bancária', icon: 'bank', color: 'ochre', details: 'BCI, BIM ou Standard Bank — o IBAN é enviado pelo WhatsApp. Envie o comprovativo para garantir a reserva.' },
      { id: 'pay5', name: 'Visa / Mastercard', icon: 'card', color: 'navy', details: 'Pagamento por TPA no check-in ou, para pagamento à distância, peça o link pelo WhatsApp.' },
      { id: 'pay6', name: 'PayPal', icon: 'globe', color: 'wine', details: 'Para pagamentos internacionais enviamos o link do PayPal pelo WhatsApp.' }
    ]
  };

  function readJSON(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) { global.localStorage.setItem(key, JSON.stringify(value)); }
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }
  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (s) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s];
    });
  }
  function fmtMoney(value, currency) {
    var n = Number(value) || 0;
    return n.toLocaleString('pt-BR') + ' ' + (currency || 'MT');
  }
  function digitsOnly(s) { return String(s || '').replace(/\D/g, ''); }
  function waLink(phone, text) {
    return 'https://wa.me/' + digitsOnly(phone) + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  /* Conteúdo publicado na Internet: em http(s) o site lê content.json;
     aberto direto do computador (file://), usa o conteúdo do navegador. */
  function mergeData(base, pub) {
    if (!pub || typeof pub !== 'object') return base;
    var out = clone(base);
    if (pub.settings) {
      Object.keys(pub.settings).forEach(function (k) { out.settings[k] = pub.settings[k]; });
    }
    ['rooms', 'amenities', 'gallery', 'testimonials'].forEach(function (k) {
      if (Array.isArray(pub[k])) out[k] = pub[k];
    });
    return out;
  }
  function loadPublicData() {
    return new Promise(function (resolve) {
      var local = Store.loadData();
      var settled = false;
      function finish(d) { if (!settled) { settled = true; resolve(d); } }
      if (location.protocol === 'http:' || location.protocol === 'https:') {
        fetch('content.json?v=' + Date.now(), { cache: 'no-store' })
          .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error(String(r.status))); })
          .then(function (pub) { finish(mergeData(local, pub && pub.data ? pub.data : null)); })
          .catch(function () { finish(local); });
        setTimeout(function () { finish(local); }, 4000);
      } else {
        finish(local);
      }
    });
  }

  function fallbackHash(t) {
    var h1 = 5381, h2 = 52711;
    t = String(t);
    for (var i = 0; i < t.length; i++) {
      var c = t.charCodeAt(i);
      h1 = ((h1 << 5) + h1 + c) >>> 0;
      h2 = ((h2 << 7) + h2 + c) >>> 0;
    }
    return 'fb-' + h1.toString(16) + h2.toString(16);
  }

  /* ---- Derivação de senha: PBKDF2-SHA256 (NIST SP 800-132) ---- */
  function bytesToB64(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }
  function b64ToBytes(b64) {
    var s = atob(b64), out = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  function randomSalt() {
    var bytes = new Uint8Array(16);
    if (global.crypto && global.crypto.getRandomValues) global.crypto.getRandomValues(bytes);
    else for (var i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    return bytesToB64(bytes);
  }
  function hashPassword(password, saltB64, iterations) {
    var salt = b64ToBytes(saltB64);
    try {
      if (global.crypto && global.crypto.subtle && global.TextEncoder) {
        return global.crypto.subtle
          .importKey('raw', new TextEncoder().encode(String(password)), 'PBKDF2', false, ['deriveBits'])
          .then(function (key) {
            return global.crypto.subtle.deriveBits(
              { name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: iterations || 150000 },
              key, 256
            );
          })
          .then(function (bits) { return bytesToB64(new Uint8Array(bits)); });
      }
    } catch (e) { /* usa o fallback abaixo */ }
    /* Sem WebCrypto: derivação iterada com sal (mais fraca, mas nunca texto puro) */
    var t = fallbackHash(saltB64 + ':' + String(password));
    for (var i = 0; i < 5000; i++) t = fallbackHash(t + ':' + i);
    return Promise.resolve(t);
  }
  /* Comparação em tempo constante para evitar ataques de tempo */
  function slowEqual(a, b) {
    a = String(a); b = String(b);
    if (a.length !== b.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  var Store = {
    /* ---- conteúdo do site ---- */
    loadData: function () { return clone(readJSON(KEY_DATA, null) || DEFAULT_DATA); },
    saveData: function (d) { writeJSON(KEY_DATA, d); },
    resetData: function () { global.localStorage.removeItem(KEY_DATA); },

    /* ---- reservas (vêm do formulário do site) ---- */
    listBookings: function () { return readJSON(KEY_BOOKINGS, []); },
    saveBookings: function (list) { writeJSON(KEY_BOOKINGS, list); },
    addBooking: function (b) { var l = Store.listBookings(); l.unshift(b); Store.saveBookings(l); },
    updateBooking: function (id, patch) {
      Store.saveBookings(Store.listBookings().map(function (b) {
        return b.id === id ? Object.assign({}, b, patch) : b;
      }));
    },
    removeBooking: function (id) {
      Store.saveBookings(Store.listBookings().filter(function (b) { return b.id !== id; }));
    },

    /* ---- mensagens (contato + newsletter) ---- */
    listMessages: function () { return readJSON(KEY_MESSAGES, []); },
    saveMessages: function (list) { writeJSON(KEY_MESSAGES, list); },
    addMessage: function (m) { var l = Store.listMessages(); l.unshift(m); Store.saveMessages(l); },
    updateMessage: function (id, patch) {
      Store.saveMessages(Store.listMessages().map(function (m) {
        return m.id === id ? Object.assign({}, m, patch) : m;
      }));
    },
    removeMessage: function (id) {
      Store.saveMessages(Store.listMessages().filter(function (m) { return m.id !== id; }));
    },

    /* ---- acesso ao painel: PBKDF2-SHA256, 150.000 iterações + sal ---- */
    getCredentials: function () { return readJSON(KEY_AUTH, null); },
    hasCredentials: function () {
      var c = Store.getCredentials();
      return !!(c && c.kdf && c.salt && c.hash);
    },
    saveCredentials: function (c) { writeJSON(KEY_AUTH, c); },
    createCredentials: function (user, password) {
      var iterations = 150000;
      var salt = randomSalt();
      return hashPassword(password, salt, iterations).then(function (h) {
        var rec = {
          user: String(user || 'admin').trim() || 'admin',
          kdf: 'PBKDF2-SHA256',
          iterations: iterations,
          salt: salt,
          hash: h,
          createdAt: new Date().toISOString()
        };
        Store.saveCredentials(rec);
        return rec;
      });
    },
    verifyCredentials: function (user, password) {
      var c = Store.getCredentials();
      if (!c || !c.kdf || !c.hash) return Promise.resolve(null);
      if (String(user || '').toLowerCase() !== String(c.user).toLowerCase()) return Promise.resolve(false);
      return hashPassword(password, c.salt, c.iterations || 150000).then(function (h) {
        return slowEqual(h, c.hash);
      });
    },
    changePassword: function (currentPassword, newPassword) {
      var c = Store.getCredentials();
      if (!c) return Promise.resolve(false);
      return Store.verifyCredentials(c.user, currentPassword).then(function (ok) {
        if (ok !== true) return false;
        return Store.createCredentials(c.user, newPassword).then(function () { return true; });
      });
    },

    /* ---- registo de auditoria (local a este navegador) ---- */
    addAudit: function (event, ok) {
      var l = readJSON(KEY_AUDIT, []);
      l.unshift({ at: new Date().toISOString(), event: event, ok: ok !== false });
      writeJSON(KEY_AUDIT, l.slice(0, 50));
    },
    listAudit: function () { return readJSON(KEY_AUDIT, []); },
    clearAudit: function () { writeJSON(KEY_AUDIT, []); },

    /* ---- sessão com expiração por inatividade (ver admin.js) ---- */
    isLoggedIn: function () {
      try { return !!JSON.parse(global.sessionStorage.getItem(KEY_SESSION) || 'null'); }
      catch (e) { return false; }
    },
    login: function () {
      global.sessionStorage.setItem(KEY_SESSION, JSON.stringify({ at: Date.now() }));
    },
    logout: function () { global.sessionStorage.removeItem(KEY_SESSION); }
  };

  global.FY = {
    DEFAULT_DATA: DEFAULT_DATA,
    Store: Store,
    uid: uid,
    clone: clone,
    escapeHtml: escapeHtml,
    fmtMoney: fmtMoney,
    waLink: waLink,
    loadPublicData: loadPublicData,
    digitsOnly: digitsOnly,
    hashPassword: hashPassword
  };
})(window);
