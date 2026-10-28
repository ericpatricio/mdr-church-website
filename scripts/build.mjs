import fs from 'node:fs';
import { church, languages, ministries, events, sermons } from '../content/site.mjs';

const pages = ['index', 'nosotros', 'ministerios', 'eventos', 'mensajes', 'visitanos'];
const base = 'https://ericpatricio.github.io/mdr-church-website';
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<span aria-hidden="true">↗</span>';
const link = (label, href, cls = 'button') => `<a class="${cls}" href="${esc(href)}">${esc(label)}${arrow}</a>`;
const image = (file, alt, cls = '', eager = false, width = 1920, height = 1132) => `<img class="${cls}" src="../assets/${file}" alt="${esc(alt)}" width="${width}" height="${height}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

for (const [lang, t] of Object.entries(languages)) {
  const other = lang === 'es' ? 'en' : 'es';
  const sectionHead = (eyebrow, title, more = '') => `<div class="section-heading"><div><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(title)}</h2></div>${more}</div>`;
  const exterior = () => `<figure class="church-photo">${image('church-exterior.webp', t.exterior, '', false, 680, 510)}<figcaption>${esc(church.address)}</figcaption></figure>`;
  const serviceTimes = () => `<section class="service-section" id="horarios"><div class="container service-layout"><div><p class="eyebrow">${t.serviceLabel}</p><h2>${t.schedule}</h2><p>${t.local}</p><address>${esc(church.address)}</address>${link(t.directions, church.maps, 'text-link light-link')}</div><div><dl class="service-list">${t.days.map((day,i) => `<div><dt>${day}<span>${t.services[i]}</span></dt><dd>${t.times[i]}</dd></div>`).join('')}</dl><p class="fine-print">${t.verify}</p></div></div></section>`;
  const community = () => `<section class="section"><div class="container editorial"><figure class="community-photo">${image('community-worship.jpg', t.photo, '', false, 1400, 825)}<figcaption>${t.photo} · MDR</figcaption></figure><div class="editorial-copy"><p class="eyebrow">${t.community}</p><h2>${t.communityTitle}</h2><p class="lead">${t.communityText}</p>${link(t.about, 'nosotros.html', 'text-link')}</div></div></section>`;
  const leadership = (full = false) => `<section class="section leadership" id="liderazgo"><div class="container leadership-layout"><div><p class="eyebrow">${t.leaders}</p><h2>${t.leadersTitle}</h2>${!full ? link(t.leadershipLink, 'nosotros.html#liderazgo', 'text-link') : ''}</div><div class="pastor-name"><p class="eyebrow">${t.senior}</p><h3>Raúl <span>&amp;</span><br>Cindy Cardona</h3><p>${t.leaderNote}</p></div></div></section>`;
  const ministryName = m => m.id === 'mujeres' && lang === 'en' ? 'Women' : m.name;
  const ministryPreview = () => `<section class="section"><div class="container">${sectionHead(t.ministries, t.ministriesTitle, link(t.nav[2], 'ministerios.html', 'text-link'))}<div class="ministry-preview">${ministries.map((m,i) => `<a class="ministry-item" href="ministerios.html#${m.id}">${image(m.image, `${t.ministryAlt} ${ministryName(m)}`, '', false, 150, 150)}<span><small>0${i+1}</small><strong>${esc(ministryName(m))}</strong><span class="ministry-more">${t.details} ↗</span></span></a>`).join('')}</div></div></section>`;
  const emptyEvents = () => `<div class="empty-event" data-empty-events><div><span class="section-number" aria-hidden="true">MDR</span></div><div><h3>${t.noEvents}</h3><p>${t.eventEmpty}</p>${link(t.visit, 'visitanos.html', 'text-link')}</div></div>`;
  const eventCards = (limit = Infinity) => events.filter(e => e.verified === true && new Date(e.end ?? e.start) >= new Date()).slice(0, limit).map(e => `<article class="event" data-category="${esc(e.category)}">${e.image ? image(e.image, e.title[lang]) : ''}<div><p class="eyebrow"><time datetime="${esc(e.start)}">${new Intl.DateTimeFormat(lang,{dateStyle:'long',timeStyle:'short',timeZone:'America/New_York'}).format(new Date(e.start))}</time></p><h3>${esc(e.title[lang])}</h3><p>${esc(e.location)}</p><p>${esc(e.description[lang])}</p><details><summary>${t.eventDetails}</summary><p>${esc(e.details[lang])}</p></details></div></article>`).join('');
  const eventSection = () => `<section class="section soft"><div class="container">${sectionHead(t.upcoming, t.eventTitle, link(t.allEvents, 'eventos.html', 'text-link'))}${eventCards(3) || emptyEvents()}</div></section>`;
  const messageSection = () => `<section class="section message-section"><div class="container message-layout"><div><p class="eyebrow">${t.messages}</p><h2>${t.messagesTitle}</h2><p>${t.messageEmpty}</p>${link(t.library, 'mensajes.html', 'text-link light-link')}</div><figure>${image('instagram-worship.jpg', t.photo)}<figcaption>${t.photo} · MDR</figcaption></figure></div></section>`;
  const invitation = () => `<section class="section invitation"><div class="container invitation-layout"><div><p class="eyebrow">${t.welcome}</p><h2>${t.invitation}</h2><p class="lead">${t.invitationText}</p>${link(t.visit, 'visitanos.html')}</div><a href="visitanos.html" class="invitation-image" aria-label="${t.visit}">${image('church-exterior.webp', t.exterior, '', false, 680, 510)}</a></div></section>`;
  const pageIntro = (index, title, text) => `<section class="page-intro"><div class="container"><p class="breadcrumb"><a href="index.html">${t.nav[0]}</a><span aria-hidden="true">/</span>${t.nav[index]}</p><p class="eyebrow">${t.nav[index]}</p><h1>${title}</h1><p class="lead">${text}</p></div></section>`;

  for (const [index, page] of pages.entries()) {
    let body = '';
    if (page === 'index') body = `<section class="hero"><div class="hero-copy"><p class="eyebrow">Kissimmee, Florida · ${t.welcome}</p><h1>${t.headline}</h1><p class="lead">${t.intro}</p><div class="hero-actions">${link(t.visit, 'visitanos.html')}${link(t.events, 'eventos.html', 'button secondary')}</div><a class="sunday-link" href="visitanos.html#horarios"><span class="status-dot" aria-hidden="true"></span>${t.days[0]} · 11:00 AM ${arrow}</a><a class="hero-address" href="${church.maps}">${esc(church.address)}</a></div><figure class="hero-photo">${image('instagram-worship.jpg', t.photo, '', true)}<figcaption>${t.photo} · MDR</figcaption></figure></section>${serviceTimes()}${community()}${eventSection()}${leadership()}${ministryPreview()}${messageSection()}`;
    if (page === 'nosotros') body = `${pageIntro(index, t.communityTitle, t.aboutIntro)}<section class="section"><div class="container editorial about-editorial"><div><p class="eyebrow">${t.identity}</p><h2>${t.about}</h2><p class="lead">${t.communityText}</p><p class="affiliation">${t.affiliation}</p><p class="muted">${t.historyNote}</p></div>${exterior()}</div></section>${leadership(true)}${ministryPreview()}`;
    if (page === 'ministerios') body = `${pageIntro(index, t.ministriesTitle, t.ministriesIntro)}<section class="section"><div class="container ministry-directory">${ministries.map(m => `<article class="ministry-detail" id="${m.id}">${image(m.image, `${t.ministryAlt} ${ministryName(m)}`, '', false, 150, 150)}<div><p class="eyebrow">${t.ministries}</p><h2>${esc(ministryName(m))}</h2><p>${t.ministryDetails}</p><details><summary>${t.details}</summary><p>${t.ministryNote}</p>${link(t.visit, 'visitanos.html', 'text-link')}</details></div></article>`).join('')}<aside class="announcement"><img src="../assets/mdr-announcements.jpg" alt="${t.announcements}" width="80" height="80" loading="lazy"><div><h2>${t.announcements}</h2><p>${t.announcementsText}</p></div>${link(t.events,'eventos.html','text-link')}</aside></div></section>`;
    if (page === 'eventos') body = `${pageIntro(index, t.eventTitle, t.eventEmpty)}<section class="section"><div class="container"><div class="filters" role="group" aria-label="${t.filterLabel}">${['all','worship','community'].map((category,i) => `<button type="button" data-filter="${category}" data-label="${t.categories[i]}" aria-pressed="${i===0}">${t.categories[i]}</button>`).join('')}</div><p class="filter-status" role="status" data-filter-status data-prefix="${t.results}">${t.results}: ${events.filter(e=>e.verified && new Date(e.end??e.start)>=new Date()).length} · ${t.categories[0]}</p><div class="event-list">${eventCards() || ''}</div>${emptyEvents()}</div></section>${serviceTimes()}`;
    if (page === 'mensajes') body = `${pageIntro(index, t.libraryTitle, t.messageEmpty)}<section class="section"><div class="container editorial"><figure class="community-photo">${image('instagram-worship.jpg',t.photo)}<figcaption>${t.photo} · MDR</figcaption></figure><div><p class="eyebrow">${t.messages}</p><h2>${t.messagesTitle}</h2><p class="lead">${t.messageEmpty}</p>${sermons.filter(s=>s.verified).map(s=>`<article class="sermon"><h3>${esc(s.title[lang])}</h3><p>${esc(s.speaker)} · <time datetime="${esc(s.date)}">${esc(s.date)}</time></p>${link(t.watch,s.url)}</article>`).join('')}${link(t.visit,'visitanos.html','text-link')}</div></div></section>`;
    if (page === 'visitanos') body = `${pageIntro(index, t.visitTitle, t.visitIntro)}${serviceTimes()}<section class="section"><div class="container editorial"><div>${exterior()}</div><div><p class="eyebrow">${t.location}</p><h2>${t.welcome}</h2><address class="large-address">4360 Monterey Rd<br>Kissimmee, FL 34758</address>${link(t.directions,church.maps)}<div class="contact"><h3>${t.contact}</h3><a class="text-link" href="tel:${church.phone}">${church.phoneDisplay} ${arrow}</a><p class="fine-print">${t.phoneSource}</p><a class="text-link" href="${church.instagram}">${t.social} ${arrow}</a></div></div></div></section><section class="section soft"><div class="container faq-layout"><div><p class="eyebrow">${t.faq}</p><h2>${t.expect}</h2><p class="lead">${t.expectText}</p></div><div class="faq">${t.questions.map((q,i)=>`<details><summary>${q}</summary><p>${t.answers[i]}</p></details>`).join('')}</div></div></section>`;

    const nav = () => pages.map((key,i) => `<a href="${key}.html"${index===i?' aria-current="page"':''}>${t.nav[i]}</a>`).join('');
    const url = `${base}/${lang}/${page}.html`;
    const title = `${t.nav[index]} | ${church.name}`;
    const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#082B4B">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(index===0?t.intro:index===5?t.visitIntro:t.nav[index]+' · '+church.name+' · Kissimmee, Florida.')}">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="es" href="${base}/es/${page}.html">
  <link rel="alternate" hreflang="en" href="${base}/en/${page}.html">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(t.intro)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${base}/assets/instagram-worship.jpg">
  <link rel="icon" href="../assets/mdr-logo.png" type="image/png">
  <link rel="stylesheet" href="../assets/style.css">
  <script src="../assets/app.js" defer></script>
</head>
<body>
<a class="skip-link" href="#main">${t.skip}</a>
<div class="review-banner">${t.review}</div>
<header class="site-header"><div class="container header-inner">
  <a class="brand" href="index.html"><img src="../assets/mdr-logo.png" alt="${t.logoAlt}" width="58" height="58"><span>Iglesia de Dios<strong>Manantial de Restauración</strong></span></a>
  <nav class="desktop-nav" aria-label="${t.navigation}">${nav()}</nav>
  <div class="language-switch" aria-label="${lang==='es'?'Idioma':'Language'}"><a href="../es/${page}.html" lang="es" aria-label="Español"${lang==='es'?' aria-current="true"':''}>ES</a><a href="../en/${page}.html" lang="en" aria-label="English"${lang==='en'?' aria-current="true"':''}>EN</a></div>
  ${link(t.visit,'visitanos.html','button header-visit')}
  <button class="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="false" aria-label="${t.open}" data-menu-toggle data-open="${t.open}" data-close="${t.close}"><span aria-hidden="true">☰</span></button>
</div><nav class="mobile-nav" id="mobile-menu" aria-label="${t.mobileNavigation}" hidden>${nav()}${link(t.visit,'visitanos.html')}</nav></header>
<main id="main" tabindex="-1">${body}${page==='visitanos'?'':invitation()}</main>
<footer class="site-footer"><div class="container"><div class="footer-layout"><div class="footer-brand"><img src="../assets/mdr-logo.png" width="72" height="72" loading="lazy" alt="${t.logoAlt}"><p class="church-name">${church.name}</p><p>${church.address}</p>${link(t.directions,church.maps,'text-link light-link')}</div><div><h2>${t.explore}</h2><nav class="footer-links" aria-label="${t.footerNavigation}">${nav()}</nav></div><div><h2>${t.serviceLabel}</h2><p>${t.days.map((d,i)=>`${d} · ${t.times[i]}`).join('<br>')}</p></div><div><h2>${t.contact}</h2><a href="tel:${church.phone}">${church.phoneDisplay}</a><p class="fine-print">${t.phoneSource}</p><a href="${church.instagram}">${t.social} ↗</a></div></div><div class="footer-bottom">© ${new Date().getFullYear()} ${church.name}<span>Kissimmee, Florida</span></div></div></footer>
</body>
</html>
`;
    fs.writeFileSync(`${lang}/${page}.html`, html);
  }
}
fs.writeFileSync('index.html', `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=es/index.html"><title>${church.name}</title></head><body><a href="es/index.html">Español</a> · <a href="en/index.html">English</a></body></html>`);
console.log('Generated 12 bilingual pages.');
