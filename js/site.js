/* ============================================================
   Forever Young — site público
   Renderiza o conteúdo a partir dos dados (data.js) e trata as
   interações: reservas, mensagens, galeria, menu e animações.
   ============================================================ */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = FY.escapeHtml;

  let data;
  const money = (v) => FY.fmtMoney(v, ((data || {}).settings || {}).currency || 'MT');

  /* ---------- utilidades ---------- */
  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  const DAY = 86400000;
  const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('pt', { day: '2-digit', month: 'short' });
  const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';

  /* ---------- conteúdo dinâmico ---------- */
  function applyBindings() {
    $$('[data-bind]').forEach(el => {
      const v = get(data, el.dataset.bind);
      if (v != null) el.textContent = v;
    });
    const s = data.settings;
    $('#brand-logo').src = s.logoImage;
    $('#footer-logo').src = s.logoImage;
    document.title = `${s.brandName} | Hotel, Restaurante e Bar`;

    $('#about-img-1').src = s.aboutImage1;
    $('#about-img-2').src = s.aboutImage2;
    $('#map-frame').src = s.mapEmbed;
    const markerMatch = (s.mapEmbed || '').match(/marker=([\-\d.,]+)/);
    const mapQuery = markerMatch ? markerMatch[1] : (s.address || '');
    const mapOpen = $('#map-open');
    if (mapOpen) mapOpen.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapQuery);

    $('#hero-chips').innerHTML = String(s.heroChips || '')
      .split('·').map(t => t.trim()).filter(Boolean)
      .map(t => `<span>${esc(t)}</span>`).join('');

    $('#about-features').innerHTML = (s.aboutFeatures || []).map(f =>
      `<li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>${esc(f)}</li>`).join('');

    $('#about-stats').innerHTML = (s.stats || []).map(st =>
      `<div><strong>${esc(st.value)}</strong><span>${esc(st.label)}</span></div>`).join('');

    const waHref = FY.waLink(s.whatsapp, `Olá ${s.brandName}! Gostaria de fazer uma reserva.`);
    $$('.js-wa').forEach(a => { a.href = waHref; a.target = '_blank'; a.rel = 'noopener'; });
    const socialMap = {
      '.js-insta': s.instagramUrl,
      '.js-facebook': s.facebookUrl,
      '.js-tiktok': s.tiktokUrl,
      '.js-yt': s.youtubeUrl,
      '.js-trip': s.tripadvisorUrl
    };
    Object.keys(socialMap).forEach(sel => {
      $$(sel).forEach(a => {
        const url = (socialMap[sel] || '').trim();
        a.href = url || '#';
        a.style.display = url ? '' : 'none';
        if (url) { a.target = '_blank'; a.rel = 'noopener'; }
      });
    });
    $$('.js-phone').forEach(a => { a.href = 'tel:+' + FY.digitsOnly(s.whatsapp); });
  }

  function renderRooms() {
    $('#rooms-grid').innerHTML = data.rooms.map((r, i) => `
      <article class="room-card reveal" style="transition-delay:${(i % 3) * 110}ms">
        <div class="room-media">
          <img src="${esc(r.image)}" alt="${esc(r.name)}" loading="lazy" />
          <span class="room-price">${money(r.price)}<span>/noite</span></span>
        </div>
        <div class="room-body">
          <h3>${esc(r.name)}</h3>
          <ul class="room-meta">
            <li><svg class="icon" aria-hidden="true"><use href="#i-maximize"/></svg> ${esc(r.size)}</li>
            <li><svg class="icon" aria-hidden="true"><use href="#i-users"/></svg> ${esc(r.guests)}</li>
            <li><svg class="icon" aria-hidden="true"><use href="#i-eye"/></svg> ${esc(r.view)}</li>
          </ul>
          <ul class="room-feats">
            ${(r.features || []).map(f => `<li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>${esc(f)}</li>`).join('')}
          </ul>
          <button type="button" class="btn btn-gold btn-block btn-book" data-room="${esc(r.id)}">Reservar este quarto</button>
        </div>
      </article>`).join('');
  }

  function renderAmenities() {
    $('#amenities-grid').innerHTML = data.amenities.map((a, i) => `
      <div class="amenity reveal" style="transition-delay:${(i % 3) * 110}ms">
        <div class="amenity-icon"><svg class="icon" aria-hidden="true"><use href="#i-${esc(a.icon)}"/></svg></div>
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.desc)}</p>
      </div>`).join('');
  }

  function renderPayments() {
    const pays = data.payments || [];
    $('#pay-badges').innerHTML = pays.map(p =>
      `<span class="pay-badge pm-${esc(p.color)}">${esc(p.name)}</span>`).join('');
    $('#pay-grid').innerHTML = pays.map((p, i) => `
      <div class="pay-card reveal" style="transition-delay:${(i % 3) * 110}ms">
        <div class="pay-head">
          <span class="pay-icon"><svg class="icon" aria-hidden="true"><use href="#i-${esc(p.icon)}"/></svg></span>
          <h3>${esc(p.name)}</h3>
        </div>
        <p>${esc(p.details)}</p>
        <a class="pay-cta" href="${FY.waLink(data.settings.whatsapp, `Olá ${data.settings.brandName}! Sobre o pagamento por ${p.name}…`)}" target="_blank" rel="noopener">Falar no WhatsApp →</a>
      </div>`).join('');
  }

  function renderGallery() {
    $('#gallery-grid').innerHTML = data.gallery.map((g, i) => `
      <figure class="g-item reveal" style="transition-delay:${(i % 3) * 110}ms" tabindex="0" role="button"
              aria-label="Ampliar foto: ${esc(g.caption)}" data-idx="${i}">
        <img src="${esc(g.image)}" alt="${esc(g.caption)}" loading="lazy" />
        <figcaption>${esc(g.caption)}</figcaption>
      </figure>`).join('');
  }

  function renderTestimonials() {
    $('#testimonials-grid').innerHTML = data.testimonials.map((t, i) => `
      <blockquote class="testimonial reveal" style="transition-delay:${(i % 3) * 110}ms">
        <span class="stars" aria-label="Avaliação: 5 de 5 estrelas">★★★★★</span>
        <p>${esc(t.text)}</p>
        <footer>
          <span class="avatar" aria-hidden="true">${esc(initials(t.name))}</span>
          <div><strong>${esc(t.name)}</strong><span>${esc(t.origin)}</span></div>
        </footer>
      </blockquote>`).join('');
  }

  function fillRoomSelect(keepId) {
    const sel = $('#room');
    sel.innerHTML = data.rooms.map(r =>
      `<option value="${esc(r.id)}">${esc(r.name)} · ${money(r.price)}</option>`).join('');
    if (keepId && data.rooms.some(r => r.id === keepId)) sel.value = keepId;
  }

  /* ---------- banner rotativo (hero) ---------- */
  let heroTimer = null, heroIdx = 0, heroEls = [], heroData = [];

  function renderHeroSlider() {
    heroData = (Array.isArray(data.heroSlides) && data.heroSlides.length)
      ? data.heroSlides
      : [{ image: data.settings.heroImage, title: '', highlight: '', subtitle: '' }];
    const wrap = $('#hero-slides');
    wrap.innerHTML = heroData.map((s, i) =>
      `<div class="hero-slide${i === 0 ? ' active' : ''}" style="background-image:url('${esc(s.image)}')" role="img" aria-label="${esc(s.title || 'Banner do hotel')}"></div>`).join('');
    heroEls = $$('.hero-slide', wrap);
    $('#hero-dots').innerHTML = heroData.map((s, i) =>
      `<button type="button" aria-label="Ir para o banner ${i + 1}" data-i="${i}" class="${i === 0 ? 'active' : ''}"></button>`).join('');

    $('#hero-prev').addEventListener('click', () => heroGo(heroIdx - 1, true));
    $('#hero-next').addEventListener('click', () => heroGo(heroIdx + 1, true));
    $('#hero-dots').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b) heroGo(Number(b.dataset.i) || 0, true);
    });

    const hero = $('#inicio');
    hero.addEventListener('mouseenter', heroPause);
    hero.addEventListener('mouseleave', heroPlay);
    let touchX = null;
    hero.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', e => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) heroGo(heroIdx + (dx < 0 ? 1 : -1), true);
      touchX = null;
    }, { passive: true });

    applySlide(0);
    heroPlay();
  }

  function applySlide(i) {
    if (!heroEls.length) return;
    heroIdx = (i + heroEls.length) % heroEls.length;
    heroEls.forEach((el, k) => el.classList.toggle('active', k === heroIdx));
    $$('#hero-dots button').forEach((d, k) => d.classList.toggle('active', k === heroIdx));
    const sl = heroData[heroIdx] || {};
    const s = data.settings;
    const content = $('.hero-content');
    content.classList.add('switching');
    setTimeout(() => {
      $('#hero-title').textContent = sl.title || s.heroTitle;
      $('#hero-highlight').textContent = sl.highlight || s.heroHighlight;
      $('#hero-subtitle').textContent = sl.subtitle || s.heroSubtitle;
      content.classList.remove('switching');
    }, 240);
  }

  function heroGo(i, manual) {
    applySlide(i);
    if (manual) heroPlay();
  }
  function heroPlay() {
    heroPause();
    if (heroEls.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      heroTimer = setInterval(() => applySlide(heroIdx + 1), 6000);
    }
  }
  function heroPause() {
    if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
  }

  /* ---------- header, menu e navegação ---------- */
  const header = $('#header');
  const toTop = $('#to-top');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    toTop.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const hamburger = $('#hamburger');
  const nav = $('#nav');
  const closeMenu = () => {
    nav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    header.classList.remove('menu-open');
    document.body.style.overflow = '';
  };
  hamburger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    header.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.nav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu();
  });

  const links = $$('.nav-link');
  const sections = links.map(l => $(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  function setupReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const ro = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => ro.observe(el));
  }

  /* ---------- formulário de reservas ---------- */
  const checkin = $('#checkin');
  const checkout = $('#checkout');
  const roomSel = $('#room');
  const guestsSel = $('#guests');
  const bookingMsg = $('#booking-msg');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkin.min = toISO(today);
  checkout.min = toISO(new Date(today.getTime() + DAY));
  checkin.addEventListener('change', () => {
    if (!checkin.value) return;
    const d = new Date(checkin.value + 'T12:00:00');
    checkout.min = toISO(new Date(d.getTime() + DAY));
    if (checkout.value && checkout.value <= checkin.value) checkout.value = checkout.min;
  });

  function clearMsg(el) { el.classList.remove('ok', 'err', 'show'); }

  $('#booking-form').addEventListener('submit', e => {
    e.preventDefault();
    clearMsg(bookingMsg);
    const name = $('#bname').value.trim();
    const phone = $('#bphone').value.trim();

    if (!name) {
      bookingMsg.textContent = 'Diga-nos o seu nome para registar a reserva.';
      bookingMsg.classList.add('err', 'show');
      return;
    }
    if (!checkin.value || !checkout.value) {
      bookingMsg.textContent = 'Escolha as datas de check-in e check-out.';
      bookingMsg.classList.add('err', 'show');
      return;
    }
    if (checkout.value <= checkin.value) {
      bookingMsg.textContent = 'A data de check-out deve ser posterior à data de check-in.';
      bookingMsg.classList.add('err', 'show');
      return;
    }

    const room = data.rooms.find(r => r.id === roomSel.value) || data.rooms[0];
    const nights = Math.round((new Date(checkout.value) - new Date(checkin.value)) / DAY);
    const guests = guestsSel.options[guestsSel.selectedIndex].text;
    const payment = $('#payment').value || 'M-Pesa';
    const total = nights * (Number(room.price) || 0);

    FY.Store.addBooking({
      id: FY.uid('bk'),
      createdAt: new Date().toISOString(),
      name, phone,
      checkin: checkin.value,
      checkout: checkout.value,
      roomId: room.id,
      roomName: room.name,
      guests,
      nights,
      total,
      currency: data.settings.currency || 'MT',
      payment: payment,
      status: 'nova'
    });

    const wa = FY.waLink(phone || data.settings.whatsapp,
      `Olá ${data.settings.brandName}! Sou ${name}. Gostaria de reservar o ${room.name} ` +
      `de ${fmtDate(checkin.value)} a ${fmtDate(checkout.value)} (${nights} noite${nights > 1 ? 's' : ''}, ` +
      `${guests.toLowerCase()}). Valor estimado: ${money(total)}. Pagamento pretendido: ${payment}.`);

    bookingMsg.innerHTML =
      `✔ Reserva registada, <strong>${esc(name.split(' ')[0])}</strong>! ${nights} noite${nights > 1 ? 's' : ''} no ` +
      `<strong>${esc(room.name)}</strong>, de ${fmtDate(checkin.value)} a ${fmtDate(checkout.value)} — ` +
      `estimativa <strong>${money(total)}</strong>. Confirme já pelo WhatsApp:` +
      ` <a class="btn btn-gold btn-sm" href="${wa}" target="_blank" rel="noopener">Falar no WhatsApp</a>`;
    bookingMsg.classList.add('ok', 'show');
    e.target.reset();
    fillRoomSelect(room.id);
  });

  $('#rooms-grid').addEventListener('click', e => {
    const btn = e.target.closest('.btn-book');
    if (!btn) return;
    fillRoomSelect(btn.dataset.room);
    $('#reservar').scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => $('#bname').focus({ preventScroll: true }), 600);
  });

  /* ---------- formulário de contato ---------- */
  const contactMsg = $('#contact-msg');
  $('#contact-form').addEventListener('submit', e => {
    e.preventDefault();
    clearMsg(contactMsg);
    const name = $('#c-name').value.trim();
    const email = $('#c-email').value.trim();
    const phone = $('#c-phone').value.trim();
    const text = $('#c-msg').value.trim();

    if (!name || !email || !text) {
      contactMsg.textContent = 'Preencha nome, e-mail e mensagem para enviar.';
      contactMsg.classList.add('err', 'show');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      contactMsg.textContent = 'Informe um e-mail válido.';
      contactMsg.classList.add('err', 'show');
      return;
    }

    FY.Store.addMessage({
      id: FY.uid('msg'),
      createdAt: new Date().toISOString(),
      name, email, phone, text,
      read: false
    });

    const wa = FY.waLink(phone || data.settings.whatsapp,
      `Olá ${data.settings.brandName}! Sou ${name} (${email}${phone ? ', ' + phone : ''}). ${text}`);
    contactMsg.innerHTML =
      `✔ Mensagem preparada, <strong>${esc(name.split(' ')[0])}</strong>! Chegue até nós num toque:` +
      ` <a class="btn btn-gold btn-sm" href="${wa}" target="_blank" rel="noopener">Enviar pelo WhatsApp</a>`;
    contactMsg.classList.add('ok', 'show');
    e.target.reset();
  });

  /* ---------- newsletter ---------- */
  $('#newsletter-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#newsletter-email').value.trim();
    if (!email) return;
    FY.Store.addMessage({
      id: FY.uid('nl'),
      createdAt: new Date().toISOString(),
      name: 'Newsletter',
      email,
      phone: '',
      text: 'Subscrição de ofertas e novidades.',
      read: false
    });
    $('#newsletter-note').textContent = 'Subscrição confirmada! Em breve você recebe as nossas ofertas. ✔';
    e.target.reset();
  });

  /* ---------- lightbox ---------- */
  const lightbox = $('#lightbox');
  const lbImg = $('#lb-img');
  const lbCap = $('#lb-cap');
  let idx = 0;

  const showSlide = i => {
    const items = $$('.g-item');
    if (!items.length) return;
    idx = (i + items.length) % items.length;
    const img = $('img', items[idx]);
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = $('figcaption', items[idx]).textContent;
  };
  const openLb = i => {
    showSlide(i);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLb = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  $('#gallery-grid').addEventListener('click', e => {
    const item = e.target.closest('.g-item');
    if (item) openLb(Number(item.dataset.idx) || 0);
  });
  $('#gallery-grid').addEventListener('keydown', e => {
    const item = e.target.closest('.g-item');
    if (item && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLb(Number(item.dataset.idx) || 0); }
  });
  $('#lb-close').addEventListener('click', closeLb);
  $('#lb-prev').addEventListener('click', () => showSlide(idx - 1));
  $('#lb-next').addEventListener('click', () => showSlide(idx + 1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showSlide(idx - 1);
    if (e.key === 'ArrowRight') showSlide(idx + 1);
  });

  /* ---------- reserva visual para imagens que falham ---------- */
  const FALLBACK = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#23232a"/><stop offset="1" stop-color="#050506"/>' +
    '</linearGradient></defs>' +
    '<rect width="800" height="600" fill="url(#g)"/>' +
    '<path d="M150 320c60-45 120-45 180 0s120 45 180 0 90-35 140-10" stroke="#c39a52" stroke-width="14" fill="none" stroke-linecap="round" opacity=".8"/>' +
    '<text x="400" y="430" text-anchor="middle" font-family="Georgia,serif" font-size="40" fill="#e9d7b0">Forever Young</text>' +
    '</svg>'
  );
  document.addEventListener('error', e => {
    const img = e.target;
    if (img.tagName === 'IMG' && !img.dataset.fbk) {
      img.dataset.fbk = '1';
      img.src = FALLBACK;
    }
  }, true);

  /* ---------- atalho para a gestão: Ctrl+Shift+A ---------- */
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      location.href = 'admin.html';
    }
  });

  /* ---------- arranque ---------- */
  (async () => {
    data = await FY.loadPublicData();
    applyBindings();
    renderHeroSlider();
    renderRooms();
    renderAmenities();
    renderPayments();
    renderGallery();
    renderTestimonials();
    fillRoomSelect();
    setupReveal();
    onScroll();
    $('#year').textContent = new Date().getFullYear();
  })();
})();
