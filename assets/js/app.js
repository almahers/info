const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const icons = {
  washer: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M7 7h.01M10 7h.01M7 11h10M12 14.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/></svg>',
  dishwasher: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 8h16M8 5.5h.01M11 5.5h.01M7 13h10M8 17h8"/></svg>',
  dryer: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M7 7h.01M10 7h.01M12 15.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/></svg>'
};

function setEntity(data) {
  const derived = {
    ...data,
    service_count: data.service_categories.length,
    website_host: new URL(data.website).host,
    phone_tel: `tel:${data.phone}`
  };
  $$('[data-entity]').forEach((node) => { node.textContent = derived[node.dataset.entity] ?? ''; });
  $$('[data-entity-href]').forEach((node) => { node.href = derived[node.dataset.entityHref] ?? node.href; });
}

function renderServices(services) {
  $('#service-grid').innerHTML = services.map((service) => `
    <article class="service-card glass-card" style="--accent:var(--${service.accent})">
      <div class="service-icon">${icons[service.icon]}</div>
      <h3>${service.name}</h3>
      <p>ضمن نطاق الخدمة العام للماهر للصيانة.</p>
    </article>`).join('');
}

function renderProfiles(profiles) {
  $('#social-grid').innerHTML = profiles.map((profile) => `
    <a class="social-card" href="${profile.url}" target="_blank" rel="noopener noreferrer" aria-label="${profile.name}: ${profile.handle}">
      <span class="social-icon">${profile.icon === 'x' ? 'X' : profile.icon.slice(0, 2).toUpperCase()}</span>
      <span><span class="social-name">${profile.name}</span><span class="social-handle">${profile.handle}</span></span>
      <span class="external" aria-hidden="true">↗</span>
    </a>`).join('');
  const whatsapp = profiles.find((profile) => profile.id === 'whatsapp');
  if (whatsapp) $$('[data-social-href="whatsapp"]').forEach((link) => { link.href = whatsapp.url; });
}

function renderRecord(entity, profiles) {
  const rows = [
    ['الاسم', entity.name_ar], ['الموقع الرسمي', new URL(entity.website).host],
    ['الموقع', entity.city], ['الدولة', entity.country_name_ar],
    ['اللغة', 'العربية / RTL'], ['نطاق الخدمة', entity.service_area],
    ['التواصل العام', entity.phone], ['ملفات الهوية', `${profiles.filter((profile) => profile.same_as).length} ملفات عامة`]
  ];
  $('#identity-record').innerHTML = rows.map(([term, definition]) => `<div><dt>${term}</dt><dd>${definition}</dd></div>`).join('');
}

function addStructuredData(entity, profiles) {
  if (document.getElementById('identity-schema')) return;

  const sameAs = profiles.filter((profile) => profile.same_as).map((profile) => profile.url);
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': entity.canonical_url, url: entity.canonical_url, name: `${entity.name_ar} | بطاقة الهوية الرقمية العامة`, inLanguage: 'ar', about: { '@id': `${entity.canonical_url}#organization` } },
      { '@type': 'Organization', '@id': `${entity.canonical_url}#organization`, name: entity.name_ar, alternateName: entity.name_en, url: entity.website, telephone: entity.phone, address: { '@type': 'PostalAddress', addressLocality: entity.city, addressCountry: entity.country }, sameAs }
    ]
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.append(script);
}

function setupNavigation() {
  const toggle = $('.nav-toggle');
  const links = $('#nav-links');
  const close = () => { links.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => { const isOpen = links.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', String(isOpen)); });
  $$('#nav-links a').forEach((link) => link.addEventListener('click', close));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { close(); toggle.focus(); } });
  document.addEventListener('click', (event) => { if (!links.contains(event.target) && !toggle.contains(event.target)) close(); });
}

async function loadData() {
  try {
    const [entityResponse, profilesResponse] = await Promise.all([fetch('data/almaher.json'), fetch('data/social-profiles.json')]);
    if (!entityResponse.ok || !profilesResponse.ok) throw new Error('Data response was not successful');
    const [entity, profiles] = await Promise.all([entityResponse.json(), profilesResponse.json()]);
    setEntity(entity); renderServices(entity.service_categories); renderProfiles(profiles); renderRecord(entity, profiles); addStructuredData(entity, profiles);
  } catch (error) {
    const status = $('#data-status');
    status.hidden = false;
    status.textContent = 'تعذّر تحميل سجل البيانات. يرجى فتح الصفحة عبر خادم محلي أو إعادة المحاولة.';
    console.error('Unable to load public identity data.', error);
  }
}

setupNavigation();
loadData();
