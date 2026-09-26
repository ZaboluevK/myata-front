/* ============================================================
   МЯТА LOUNGE — логика меню (порт front/src на чистом JS, без
   сборки и без бэкенда). Данные (MENU/BAR/RULES) и геометрия
   монограммы (DISC/LETTER/ORNAMENT/gradientsDefsHTML) подключаются
   отдельными файлами перед этим скриптом — см. index.html.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
   * Журнал заходов (lib/visitLog.ts): первый заход за вечер получает
   * полную заставку, повторный — короткую (в 0.45 раза).
   * ------------------------------------------------------------------ */
  const VISIT_KEY = 'myata.visits';
  const SERVICE_DAY_START_HOUR = 6;
  const MAX_ENTRIES = 50;

  function serviceDay(at) {
    // Считаем по местному времени (не UTC): иначе в Москве граница
    // «вечера» уезжала на 09:00 вместо 06:00.
    const d = new Date(at);
    d.setHours(d.getHours() - SERVICE_DAY_START_HOUR);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }
  function readVisits() {
    try {
      const raw = window.localStorage.getItem(VISIT_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((e) => e && typeof e.at === 'number') : [];
    } catch {
      return [];
    }
  }
  function recordVisit(now) {
    now = now || Date.now();
    const previous = readVisits();
    const today = serviceDay(now);
    const tonightBefore = previous.filter((e) => serviceDay(e.at) === today).length;
    const next = previous.concat([{ at: now }]).slice(-MAX_ENTRIES);
    let stored = false;
    try {
      window.localStorage.setItem(VISIT_KEY, JSON.stringify(next));
      stored = true;
    } catch {
      /* приватное окно — считаем заход первым */
    }
    return { isRepeat: stored && tonightBefore > 0 };
  }
  const VISIT = recordVisit();

  /* ---------------------------------------------------------------------
   * Данные меню (data/menu.ts → MENU, data/bar.ts → BAR/BAR_TABS,
   * data/rules.ts → RULES) — глобальные константы из отдельных файлов.
   * ------------------------------------------------------------------ */
  const STOPLIST = new Set();
  /** Фото, которые уже успешно загружались хоть раз за сессию — при
   *  повторной вставке той же карточки (после любого тыка, из-за
   *  полной перерисовки ленты) рисуем их сразу «готовыми», без
   *  fade-in с нуля. Так фото не «мигают» при каждом действии. */
  const LOADED_IMAGES = new Set();
  MENU.forEach((d, i) => { d._id = 'd' + i; });
  const SEASON = MENU.filter((d) => d.season);
  const KITCHEN = MENU.filter((d) => !d.season);
  /** Порядок вкладок кухни — как в печатном меню. «Завтраки» вкладкой не
   *  показываем (эти позиции остаются доступны через «Всё»); всё прочее,
   *  что сюда не попало, уходит в хвост. */
  const CATEGORY_ORDER = ['Салаты', 'Супы', 'Закуски', 'Пицца', 'Паста', 'Вок', 'Поке', 'Роллы', 'Десерты'];
  const HIDDEN_CATS = ['Завтраки'];
  const kitchenCats = new Set(KITCHEN.map((d) => d.category));
  const restCats = [...kitchenCats].filter((c) => !CATEGORY_ORDER.includes(c) && !HIDDEN_CATS.includes(c));
  const CATEGORIES = ['Всё', 'Сезонное', ...CATEGORY_ORDER.filter((c) => kitchenCats.has(c)), ...restCats];
  /** Порядок карточек во вкладке «Всё»: сначала как в печатном меню
   *  (CATEGORY_ORDER), затем прочие категории вкладок, затем скрытые
   *  («Завтраки»). Внутри каждой категории — порядок как в исходных
   *  данных (sort стабильный). «Перемешать» по-прежнему может сбить
   *  этот порядок вручную. */
  const ALL_ORDER_RANK = new Map(
    [...CATEGORY_ORDER, ...restCats, ...HIDDEN_CATS].map((c, i) => [c, i]),
  );
  const DEFAULT_ORDER = KITCHEN.map((_, i) => i).sort(
    (a, b) => (ALL_ORDER_RANK.get(KITCHEN[a].category) ?? 999) - (ALL_ORDER_RANK.get(KITCHEN[b].category) ?? 999),
  );
  /* ---------------------------------------------------------------------
   * Предзагрузка фото: стартует сразу, пока идёт заставка (~4 с), в
   * порядке «что гость увидит первым»: первые кадры кухни → бар →
   * кальяны → вторые/третьи ракурсы. Готовые (скачанные и
   * декодированные) попадают в LOADED_IMAGES и дальше вставляются
   * в ленту сразу, без проявления.
   * ------------------------------------------------------------------ */
  const PRELOAD_KEEP = [];
  (function preloadPhotos() {
    const firsts = [];
    const rests = [];
    const add = (photos) => {
      if (!photos || !photos.length) return;
      firsts.push(photos[0]);
      rests.push(...photos.slice(1));
    };
    SEASON.forEach((d) => add(d.photos));
    DEFAULT_ORDER.forEach((i) => add(KITCHEN[i].photos));
    const walk = (sec) => {
      if (sec.items) sec.items.forEach((it) => add(it.photos));
      if (sec.subs) sec.subs.forEach((sub) => sub.items.forEach((it) => add(it.photos)));
      if (sec.groups) sec.groups.forEach((g) => g.items.forEach((it) => add(it.photos)));
    };
    (typeof BAR_TABS !== 'undefined' ? BAR_TABS.map((t) => BAR[t.key]).filter(Boolean) : Object.values(BAR)).forEach(walk);
    Object.values(HOOKAH).forEach(walk);
    const queue = [...new Set(firsts.concat(rests))].map((f) => `img/${f}`);
    let next = 0;
    function pump() {
      if (next >= queue.length) return;
      const src = queue[next++];
      if (LOADED_IMAGES.has(src)) { pump(); return; }
      const im = new Image();
      im.decoding = 'async';
      const done = () => { LOADED_IMAGES.add(src); pump(); };
      im.onload = () => {
        if (im.decode) im.decode().then(done, done);
        else done();
      };
      im.onerror = () => pump();
      im.src = src;
      PRELOAD_KEEP.push(im);
    }
    for (let k = 0; k < 6; k += 1) pump();
  })();

  const TOP_TABS = [
    { key: 'season', label: 'Акции' },
    { key: 'kitchen', label: 'Кухня' },
    { key: 'bar', label: 'Бар' },
    { key: 'hookah', label: 'Кальяны' },
  ];
  const FILTERS = [
    { key: 'veg', label: 'Вегетарианское' },
    { key: 'nogluten', label: 'Без глютена' },
    { key: 'nolactose', label: 'Без лактозы' },
    { key: 'nonuts', label: 'Без орехов' },
  ];

  /** lib/search.ts: кухня и бар одним индексом. Порядок как во вкладке
   *  «Всё»: сначала сезонные, затем кухня по DEFAULT_ORDER. */
  const KITCHEN_RANK = new Map(DEFAULT_ORDER.map((ki, rank) => [KITCHEN[ki]._id, rank]));
  const SEARCHABLE = (() => {
    const dishes = MENU.map((dish, i) => ({
      id: `dish-${i}`,
      name: dish.name,
      category: dish.season ? 'Сезонное' : dish.category,
      sub: dish.weight ? `${dish.weight} г · ${dish.kcal} ккал` : '',
      price: dish.price,
      tags: dish.tags,
      keywords: dish.ingredients,
      photos: dish.photos,
      _rank: KITCHEN_RANK.has(dish._id) ? KITCHEN_RANK.get(dish._id) : -100000 + i,
    })).sort((a, b) => a._rank - b._rank);
    const bar = Object.entries(BAR).flatMap(([key, section]) => {
      if (section.kind === 'cards') {
        return section.items.map((item, i) => ({
          id: `${key}-${i}`,
          name: item.name,
          category: section.title,
          sub: item.meta || item.description,
          price: item.price,
          tags: [],
          keywords: [item.description],
          photos: item.photos || [],
        }));
      }
      if (section.kind === 'tabGroup') {
        return section.subs.flatMap((sub) =>
          sub.items.map((item, i) =>
            sub.kind === 'list'
              ? {
                  id: `${key}-${sub.key}-${i}`,
                  name: item.name,
                  category: `${section.title} · ${sub.label}`,
                  sub: item.volume,
                  price: item.price,
                  tags: [],
                  keywords: [],
                  photos: [],
                }
              : {
                  id: `${key}-${sub.key}-${i}`,
                  name: item.name,
                  category: `${section.title} · ${sub.label}`,
                  sub: item.meta || item.description,
                  price: item.price,
                  tags: [],
                  keywords: [item.description],
                  photos: item.photos || [],
                },
          ),
        );
      }
      if (section.kind === 'cardGroups') {
        return section.groups.flatMap((group, gi) =>
          group.items.map((item, i) => ({
            id: `${key}-${gi}-${i}`,
            name: item.name,
            category: `${section.title} · ${group.group}`,
            sub: item.meta || item.description,
            price: item.price,
            tags: [],
            keywords: [item.description],
            photos: item.photos || [],
          })),
        );
      }
      return section.groups.flatMap((group, gi) =>
        group.items.map((item, i) => ({
          id: `${key}-${gi}-${i}`,
          name: item.name,
          category: `${section.title} · ${group.group}`,
          sub: item.volume,
          price: item.price,
          tags: [],
          keywords: [],
          photos: [],
        })),
      );
    });
    return dishes.concat(bar);
  })();
  function filterEntries(query, filters) {
    const q = query.trim().toLowerCase();
    return SEARCHABLE.filter((entry) => {
      const haystack = `${entry.name} ${entry.keywords.join(' ')} ${entry.category}`.toLowerCase();
      const hit = !q || haystack.includes(q);
      return hit && [...filters].every((tag) => entry.tags.includes(tag));
    });
  }

  /** lib/format.ts */
  function rub(value) {
    return value ? `${value.toLocaleString('ru-RU')} ₽` : '—';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[c]);
  }

  /* ---------------------------------------------------------------------
   * Монограмма (components/LoungeMark, screens/SplashScreen,
   * screens/StartScreen): DISC/LETTER/ORNAMENT и gradientsDefsHTML
   * приходят из paths.js/gradients.js.
   * ------------------------------------------------------------------ */
  let markSeq = 0;
  function loungeMarkHTML(extraClass) {
    const p = `lm${markSeq++}-`;
    const orn = ORNAMENT.map(
      (o) => `<path d="${o.d}" fill="${o.fill.replace('url(#', 'url(#' + p)}"/>`,
    ).join('');
    const letter = LETTER.map((d) => `<path d="${d}" fill="#FFFFFF"/>`).join('');
    return `<svg class="mark${extraClass ? ' ' + extraClass : ''}" viewBox="0 0 263 263" aria-hidden="true">${gradientsDefsHTML(p)}<path d="${DISC}" fill="black"/>${orn}${letter}</svg>`;
  }

  /** Дуги кольца обложки: сектор 70° на диагонали, по одной на раздел. */
  const ARCS = [
    'M 9.40 84.02 A 92 92 0 0 1 84.02 9.40',
    'M 115.98 9.40 A 92 92 0 0 1 190.60 84.02',
    'M 190.60 115.98 A 92 92 0 0 1 115.98 190.60',
    'M 84.02 190.60 A 92 92 0 0 1 9.40 115.98',
  ];
  const SPOKES = [
    { key: 'kitchen', name: 'Кухня', at: 'nw' },
    { key: 'bar', name: 'Бар', at: 'ne' },
    { key: 'hookah', name: 'Кальяны', at: 'se' },
    { key: 'season', name: 'Акции', at: 'sw' },
  ];

  /** Полная длительность заставки при темпе 1, мс; повтор идёт вдвое быстрее. */
  const SPLASH_FULL_MS = 3900;
  const SPLASH_REPEAT_TEMPO = 0.45;

  function renderSplash(tempo) {
    const p = `sp${markSeq++}-`;
    const orn = ORNAMENT.map(
      (o) =>
        `<path class="orn" d="${o.d}" fill="${o.fill.replace('url(#', 'url(#' + p)}" style="--d:${o.delay};--dx:${o.dx};--dy:${o.dy};--rot:${o.rot}"/>`,
    ).join('');
    const letterPlain = LETTER.map((d) => `<path pathLength="1" d="${d}"/>`).join('');
    const letterFill = LETTER.map((d) => `<path d="${d}" fill="#FFFFFF"/>`).join('');
    return `<section class="screen splash" style="--t:${tempo}" data-action="skip-splash">
      <div class="vignette"></div>
      <div class="dial">
        <div class="face">
          <div class="slot markWrap">
            <div class="plateGlow"></div>
            <svg viewBox="0 0 263 263" aria-hidden="true">
              ${gradientsDefsHTML(p)}
              <path d="${DISC}" fill="black"/>
              <g class="ornGroup">${orn}</g>
            </svg>
            <svg class="line" viewBox="0 0 263 263" aria-hidden="true">${letterPlain}</svg>
            <svg class="glint" viewBox="0 0 263 263" aria-hidden="true">${letterPlain}</svg>
            <svg class="fill" viewBox="0 0 263 263" aria-hidden="true">${letterFill}</svg>
          </div>
        </div>
      </div>
      <span class="skip">Нажмите, чтобы пропустить</span>
    </section>`;
  }

  function renderStart(spawn) {
    const arcs = ARCS.map((d, i) => `<path d="${d}" pathLength="1" style="--i:${i}"/>`).join('');
    const spokes = SPOKES.map(
      (sp, i) =>
        `<button type="button" class="spoke ${sp.at}" style="--i:${i}" data-action="open-section" data-key="${sp.key}">${sp.name}</button>`,
    ).join('');
    return `<section class="screen start${spawn ? ' spawning' : ''}">
      <div class="brand">
        <span class="wordmark">Мята</span>
        <span class="subword">Lounge</span>
      </div>
      <div class="dial">
        <div class="face">
          <svg class="ring" viewBox="0 0 200 200" aria-hidden="true">${arcs}</svg>
          <div class="slot">${loungeMarkHTML('mono')}</div>
          ${spokes}
        </div>
      </div>
      <span class="foot">Выберите раздел</span>
    </section>`;
  }

  /* ---------------------------------------------------------------------
   * Фото позиции (components/Shot): один кадр, свайп по ракурсам
   * или заглушка «Фото скоро».
   * ------------------------------------------------------------------ */
  function shotHTML(photos, { className = '', compact = false, eager = false } = {}) {
    const root = `shot${className ? ' ' + className : ''}${compact ? ' compact' : ''}`;
    if (!photos || photos.length === 0) {
      return `<div class="${root}"><div class="nophoto"><span>Фото скоро</span></div></div>`;
    }
    const img = (file, i) => {
      const src = `img/${file}`;
      const ready = LOADED_IMAGES.has(src);
      // Размытое 16-пиксельное превью (lqip.js) стоит фоном и видно сразу;
      // настоящее фото ложится поверх, как только скачается.
      const ph = !ready && typeof LQIP !== 'undefined' && LQIP[file] ? ` style="background-image:url(${LQIP[file]})"` : '';
      const prio = eager && !i ? ' fetchpriority="high"' : '';
      return `<img src="${src}" alt="" loading="eager" decoding="${ready ? 'sync' : 'async'}"${prio}${ready ? ' class="ready"' : ''}${ph} onload="mnImgReady(this)"/>`;
    };
    if (photos.length === 1) {
      return `<div class="${root}">${img(photos[0], 0)}</div>`;
    }
    const dots = photos.map((f, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('');
    return `<div class="${root}">
      <div class="swipe" onscroll="mnSyncDots(this)">${photos.map((f, i) => img(f, i)).join('')}</div>
      <div class="dots">${dots}</div>
    </div>`;
  }

  /* ---------------------------------------------------------------------
   * Карточка позиции кухни/сезона (components/DishItem).
   * ------------------------------------------------------------------ */
  function dishItemHTML(dish, { eager = false } = {}) {
    const soldOut = STOPLIST.has(dish.name);
    const id = dish._id;
    const open = state.openDish === id;
    const detailOpen = open && state.detailOpen;
    const gram = dish.noData ? '' : `${dish.weight} г · ${dish.kcal} ккал`;
    const shotClass = dish.name === 'Мороженое'
      ? 'cardShot cardShotTall iceCreamShot'
      : 'cardShot';
    const detailInner = dish.noData
      ? `<p class="lede faint noDataLede">Состав и КБЖУ по этой позиции ещё не передали.</p>`
      : `<button type="button" class="plusrow" aria-expanded="${detailOpen}" data-action="toggle-detail">КБЖУ и аллергены<span class="q">+</span></button>
        <div class="detailWrap${detailOpen ? ' detailOpen' : ''}"${detailOpen ? '' : ' inert'}>
          <div class="detailClip">
            <div class="detail">
              <div class="blk">
                <span class="lbl">Пищевая ценность на порцию ${dish.weight} г</span>
                <div class="grid">
                  <div class="cell"><span>Ккал</span><b>${dish.kcal}</b></div>
                  <div class="cell"><span>Белки</span><b>${dish.protein}</b></div>
                  <div class="cell"><span>Жиры</span><b>${dish.fat}</b></div>
                  <div class="cell"><span>Углев.</span><b>${dish.carbs}</b></div>
                </div>
              </div>
              <div class="blk"><span class="lbl">Аллергены</span><p class="faint">Уточняется — скажите официанту о своих ограничениях, подскажем при заказе.</p></div>
            </div>
          </div>
        </div>`;
    const compositionLede = dish.noData
      ? ''
      : `<p class="lede">${esc(dish.ingredients.join(', '))}.</p>`;
    return `<div class="item${soldOut ? ' out' : ''}${open ? ' open' : ''}" data-dish="${id}">
      <button type="button" class="card" data-action="toggle-dish" data-key="${id}">
        ${shotHTML(dish.photos, { className: shotClass, eager })}
        <div class="meta"><h3>${esc(dish.name)}</h3><span class="price metaPrice">${rub(dish.price)}</span></div>
        ${gram ? `<div class="gram">${gram}</div>` : ''}
        ${soldOut ? '<span class="stop">Нет в наличии</span>' : ''}
      </button>
      <div class="body"${open ? '' : ' inert'}>
        <div class="bodyInner">
          ${compositionLede}
          ${detailInner}
          <button type="button" class="collapse" data-action="toggle-dish" data-key="${id}"><span class="chev">↑</span>Свернуть</button>
        </div>
      </div>
    </div>`;
  }

  /** components/Promo: акцентный блок ленты. */
  function promoHTML({ eyebrow, title, children, dishes, lead }) {
    const row =
      dishes && dishes.length
        ? `<div class="promoRow">${dishes
            .map(
              (d) =>
                `<div class="promoMini">${shotHTML(d.photos, { className: 'promoMiniShot' })}<b>${esc(d.name)}</b><span>${d.weight} г</span></div>`,
            )
            .join('')}</div>`
        : '';
    return `<div class="promo${lead ? ' promoLead' : ''}">
      <span class="eyebrow">${esc(eyebrow)}</span>
      <h3>${esc(title)}</h3>
      <p>${esc(children)}</p>
      ${row}
    </div>`;
  }

  /** Действующие акции. Порядок = порядок слайдов в карусели. */
  const PROMOS = [
    {
      eyebrow: 'Акция',
      title: 'Коктейли по 600 ₽',
      children: 'Каждую субботу — все коктейли из бара по 600 ₽.',
    },
    {
      eyebrow: 'Акция',
      title: 'Три пива за 500 ₽',
      children: 'Возьмите три пива — заплатите всего 500 ₽. Условия уточняйте у официанта.',
    },
  ];

  /** Карусель акций в ленте: листается свайпом, точки показывают слайд. */
  const promoCarousel = () => {
    if (PROMOS.length === 1) return promoHTML(PROMOS[0]);
    const slides = PROMOS.map((p) => promoHTML(p)).join('');
    const dots = PROMOS.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('');
    return `<div class="promoSwipe">
      <div class="promoTrack" onscroll="mnSyncDots(this)">${slides}</div>
      <div class="dots promoDots">${dots}</div>
    </div>`;
  };

  /* ---------------------------------------------------------------------
   * Барная карта (components/BarSection).
   * ------------------------------------------------------------------ */
  function barItemHTML(item) {
    return `<div class="item">
      <div class="card${item.noPhoto ? ' noPhoto' : ''}">
        ${item.noPhoto ? '' : shotHTML(item.photos || [], { className: 'cardShot cardShotTall' })}
        <div class="meta"><h3>${esc(item.name)}</h3><span class="price metaPrice">${rub(item.price)}</span></div>
        ${item.meta ? `<div class="gram">${esc(item.meta)}</div>` : ''}
        <p class="lede cardLede">${esc(item.description)}</p>
      </div>
    </div>`;
  }
  function barRowHTML(item) {
    return `<div class="barrow"><b>${esc(item.name)}</b><span class="vol">${esc(item.volume)}</span><span class="barFill"></span><span class="price rowPrice">${rub(item.price)}</span></div>`;
  }
  function renderTabGroupSubInner(section, subKey) {
    const sub = section.subs.find((s) => s.key === subKey) || section.subs[0];
    const body =
      sub.kind === 'list'
        ? sub.items.map(barRowHTML).join('')
        : `<div class="feed">${sub.items.map(barItemHTML).join('')}</div>`;
    return body + (sub.note ? `<p class="barnote">${esc(sub.note)}</p>` : '');
  }
  function renderBarInner(key) {
    const section = BAR[key];
    if (section.kind === 'tabGroup') {
      const activeKey = state.tabGroupActive[key] || section.subs[0].key;
      const subTabs = section.subs
        .map(
          (s) =>
            `<button type="button" class="tab" data-action="tabgroup-tab" data-group="${key}" data-key="${s.key}" aria-pressed="${activeKey === s.key}">${esc(s.label)}</button>`,
        )
        .join('');
      return `<div class="tabs tabsSub" id="tabGroupTabs" role="group" aria-label="Подкатегории">${subTabs}</div>
        ${section.note ? `<p class="barnote">${esc(section.note)}</p>` : ''}
        <div class="swapBase" id="tabGroupFeed">${renderTabGroupSubInner(section, activeKey)}</div>`;
    }
    if (section.kind === 'cards') {
      return (
        `<div class="feed">${section.items.map(barItemHTML).join('')}</div>` +
        (section.note ? `<p class="barnote">${esc(section.note)}</p>` : '')
      );
    }
    if (section.kind === 'cardGroups') {
      return (
        section.groups
          .map(
            (g) =>
              `<div>${g.group ? `<div class="grouphead">${esc(g.group)}</div>` : ''}<div class="feed">${g.items.map(barItemHTML).join('')}</div></div>`,
          )
          .join('') + (section.note ? `<p class="barnote">${esc(section.note)}</p>` : '')
      );
    }
    return (
      section.groups
        .map(
          (g) =>
            `<div><div class="grouphead">${esc(g.group)}</div>${g.items.map(barRowHTML).join('')}</div>`,
        )
        .join('') + (section.note ? `<p class="barnote">${esc(section.note)}</p>` : '')
    );
  }

  /** Кальянная карта (data/hookah.js → HOOKAH/HOOKAH_TABS) — та же вёрстка
   *  карточками, что и у бара; фото пока не прислали. */
  function renderHookahInner(key) {
    const section = HOOKAH[key];
    if (section.kind === 'cards') {
      const note = section.hidePhotoNote
        ? section.note
          ? `<p class="barnote">${esc(section.note)}</p>`
          : ''
        : section.note
          ? `<p class="barnote">${esc(section.note)}</p>`
          : '';
      return `<div class="feed">${section.items.map(barItemHTML).join('')}</div>` + note;
    }
    return (
      section.groups
        .map(
          (g) =>
            `<div>${g.group ? `<div class="grouphead">${esc(g.group)}</div>` : ''}${g.items.map(barRowHTML).join('')}</div>`,
        )
        .join('') + (section.note ? `<p class="barnote">${esc(section.note)}</p>` : '')
    );
  }

  /* ---------------------------------------------------------------------
   * Состояние приложения и переходы (заменяет App.tsx + useSwapPhase).
   * ------------------------------------------------------------------ */
  const state = {
    screen: 'splash',
    fromSplash: false,
    section: 'season',
    category: 'Всё',
    barTab: 'strong',
    tabGroupActive: {},
    hookahTab: 'formats',
    order: DEFAULT_ORDER,
    priceSorted: false,
    openDish: null,
    detailOpen: false,
    infoOpen: false,
    damageOpen: false,
    query: '',
    filters: new Set(),
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const host = document.getElementById('host');
  const glow = document.getElementById('glow');

  /** Плавная смена содержимого узла: гаснет → подменяем → проявляем. */
  function fadeSwap(el, apply, { onSwap, instant = false, quick = false } = {}) {
    if (!el) return;
    if (instant) {
      apply();
      if (onSwap) onSwap();
      return;
    }
    if (quick) {
      // Вкладки/категории: новое содержимое вставляем СРАЗУ (без паузы на
      // угасание старого) и лишь коротко проявляем — 0,18 с.
      apply();
      if (onSwap) onSwap();
      el.classList.remove('swapOut', 'swapPre');
      el.classList.add('swapQuick');
      void el.offsetWidth;
      el.classList.remove('swapQuick');
      return;
    }
    el.classList.add('swapBase');
    el.classList.remove('swapPre');
    el.classList.add('swapOut');
    window.setTimeout(() => {
      apply();
      if (onSwap) onSwap();
      el.classList.remove('swapOut');
      el.classList.add('swapPre');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('swapPre')));
    }, 140);
  }

  /** lib/scrollToTop.ts: подводит элемент к верху его ленты. */
  function scrollToTopOfFeed(el, threshold) {
    threshold = threshold || 0;
    const scroller = el.closest('[data-scroller]');
    if (!scroller) return;
    const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    if (Math.abs(top - scroller.scrollTop) <= threshold) return;
    scroller.scrollTo({ top, behavior: 'smooth' });
  }

  let dishScrollTimer = 0;

  /** Подскроллить карточку блюда к верху ленты после любого раскрытия/
   *  сворачивания (и самого блюда, и его состава) — так же, как при
   *  первом открытии. */
  function scrollDishIntoView(feed, id) {
    const card = feed && feed.querySelector(`[data-dish="${id}"]`);
    if (!card) return;
    window.clearTimeout(dishScrollTimer);
    dishScrollTimer = window.setTimeout(() => {
      scrollToTopOfFeed(card, 8);
      dishScrollTimer = 0;
    }, 60);
  }

  function renderFeedInner() {
    if (state.section === 'season') {
      if (!PROMOS.length) return `<div class="empty">Акции скоро появятся.</div>`;
      return `<div class="promoList">${PROMOS.map((p) => promoHTML(p)).join('')}</div>`;
    }
    if (state.section === 'hookah') {
      const tabs = HOOKAH_TABS.map(
        (t) =>
          `<button type="button" class="tab" data-action="hookah-tab" data-key="${t.key}" aria-pressed="${state.hookahTab === t.key}">${t.label}</button>`,
      ).join('');
      return `<div class="tabs tabsSub" id="hookahTabs" role="group" aria-label="Разделы кальянной карты">${tabs}</div>
        <div class="swapBase" id="hookahFeed">${renderHookahInner(state.hookahTab)}</div>`;
    }
    if (state.section === 'bar') {
      const tabs = BAR_TABS.map(
        (t) =>
          `<button type="button" class="tab" data-action="bar-tab" data-key="${t.key}" aria-pressed="${state.barTab === t.key}">${t.label}</button>`,
      ).join('');
      return `<div class="tabs tabsSub" id="barTabs" role="group" aria-label="Разделы бара">${tabs}</div>
        <div class="swapBase" id="barFeed">${renderBarInner(state.barTab)}</div>`;
    }
    // kitchen
    if (state.category === 'Сезонное') {
      if (SEASON.length === 0) return `<div class="empty">В этом разделе пока пусто.</div>`;
      return SEASON.map((d, i) => dishItemHTML(d, { eager: i < 2 })).join('');
    }
    const kitchenList = state.order
      .map((i) => KITCHEN[i])
      .filter((d) => state.category === 'Всё' || d.category === state.category);
    const list = state.category === 'Всё' ? SEASON.concat(kitchenList) : kitchenList;
    if (list.length === 0) return `<div class="empty">В этом разделе пока пусто.</div>`;
    return list
      .map((d, i) => {
        const next = list[i + 1];
        const categoryEnds = state.category === 'Всё' && next && next.category !== d.category;
        return dishItemHTML(d, { eager: i < 2 }) + (categoryEnds ? promoCarousel() : '');
      })
      .join('');
  }

  function buildMenuHTML() {
    const topTabs = TOP_TABS.map(
      (t) =>
        `<button type="button" class="tab" data-action="top-tab" data-key="${t.key}" aria-pressed="${state.section === t.key}">${t.label}</button>`,
    ).join('');
    const catTabs = CATEGORIES.map(
      (c) =>
        `<button type="button" class="tab" data-action="cat-tab" data-key="${esc(c)}" aria-pressed="${state.category === c}">${esc(c)}</button>`,
    ).join('');
    return `<section class="screen">
      <div class="column">
        <div class="appbar">
          <button type="button" class="iconbtn back" aria-label="На обложку" data-action="goto-start">←</button>
          ${loungeMarkHTML('barMark')}
          <span class="brandLockup">
            <span class="wordmark titleWordmark">Мята</span>
            <span class="loungeTag">Lounge</span>
          </span>
          <span class="actions">
            <button type="button" class="iconbtn" aria-label="Сортировать по цене: сначала дорогие" aria-pressed="${state.priceSorted}" data-action="shuffle">⇅</button>
            <button type="button" class="iconbtn iconbtnSearch" aria-label="Поиск" data-action="goto-search">⌕</button>
            <button type="button" class="iconbtn" aria-label="Правила и информация" data-action="open-info"><svg class="ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9.25"/><path d="M12 10.75v6"/><circle cx="12" cy="7.4" r="0.9" fill="currentColor" stroke="none"/></svg></button>
          </span>
        </div>
        <div class="tabs tabsMain" id="topTabs" role="group" aria-label="Разделы">${topTabs}</div>
        <div class="tabline"></div>
        <div class="subrow${state.section === 'kitchen' ? ' subrowOpen' : ''}" id="subrow"${state.section === 'kitchen' ? '' : ' inert'}>
          <div class="subrowClip"><div class="tabs tabsSub" id="catTabs" role="group" aria-label="Категории">${catTabs}</div></div>
        </div>
        <div class="scroll" data-scroller id="feedScroll">
          <div class="pad"><div class="feed swapBase" id="feed">${renderFeedInner()}</div></div>
          <div class="botspace"></div>
        </div>
      </div>
    </section>`;
  }

  function buildSearchHTML() {
    const results = filterEntries(state.query, state.filters);
    const filterTabs = FILTERS.map(
      (f) =>
        `<button type="button" class="tab" data-action="diet-filter" data-key="${f.key}" aria-pressed="${state.filters.has(f.key)}">${f.label}</button>`,
    ).join('');
    const rows = results.length
      ? results
          .map(
            (e) =>
              `<div class="resrow">${shotHTML(e.photos.slice(0, 1), { className: 'resShot', compact: true })}<div class="resT"><b>${esc(e.name)}</b><span>${esc(e.category)}${e.sub ? ' · ' + esc(e.sub) : ''}</span></div><span class="price resPrice">${rub(e.price)}</span></div>`,
          )
          .join('')
      : `<div class="empty">Ничего не нашлось.<br/>Попробуйте другое слово или снимите фильтр.</div>`;
    return `<section class="screen">
      <div class="column">
        <div class="appbar">
          <button type="button" class="iconbtn back" aria-label="Назад" data-action="goto-menu">←</button>
        </div>
        <div class="pad">
          <label class="searchbar">
            <span class="faint glyph">⌕</span>
            <input type="search" placeholder="Блюдо или ингредиент" autocomplete="off" value="${esc(state.query)}" oninput="mnSearchInput(this.value)"/>
          </label>
        </div>
        <div class="tabs tabsSub" style="padding-top:16px" role="group" aria-label="Фильтры">${filterTabs}</div>
        <div class="tabline"></div>
        <div class="scroll" data-scroller>
          <div class="pad" id="searchResults">${rows}</div>
          <div class="botspace"></div>
        </div>
      </div>
    </section>`;
  }

  function renderScreenHTML() {
    if (state.screen === 'splash') {
      const tempo = VISIT.isRepeat ? SPLASH_REPEAT_TEMPO : 1;
      return renderSplash(tempo);
    }
    if (state.screen === 'start') return renderStart(state.fromSplash);
    if (state.screen === 'search') return buildSearchHTML();
    return buildMenuHTML();
  }

  function goto(screen, opts) {
    opts = opts || {};
    const instant = screen === 'splash' || state.screen === 'splash';
    fadeSwap(
      host,
      () => {
        state.screen = screen;
        host.innerHTML = renderScreenHTML();
        afterScreenRender();
      },
      { instant, onSwap: opts.onSwap },
    );
    glow.classList.toggle('on', screen === 'splash' || screen === 'start');
  }

  let splashTimer = null;
  function afterScreenRender() {
    if (state.screen === 'splash') {
      const tempo = VISIT.isRepeat ? SPLASH_REPEAT_TEMPO : 1;
      window.clearTimeout(splashTimer);
      splashTimer = window.setTimeout(finishSplash, SPLASH_FULL_MS * tempo);
    }
  }
  function finishSplash() {
    window.clearTimeout(splashTimer);
    state.fromSplash = true;
    goto('start');
  }

  /* ---------------------------------------------------------------------
   * Действия: один делегированный обработчик кликов на весь документ.
   * ------------------------------------------------------------------ */
  function scrollFeedTop() {
    const el = document.getElementById('feedScroll') || $('.scroll');
    if (el) el.scrollTop = 0;
  }

  /* ---------------------------------------------------------------------
   * lib/dragScroll.ts + «зажал и води» (components/Tabs, эффект скраба):
   * ряд вкладок (топ-вкладки, категории кухни, вкладки бара) различает два
   * жеста. Быстрая протяжка — обычная прокрутка (тач скроллится нативно,
   * мышь/перо — через drag ниже). А если задержать палец на ленте ~0,24 с
   * и не двигать — включается скраб: выбор вкладки идёт прямо за пальцем,
   * лента сама подскролливается у края, лёгкая вибрация подтверждает
   * каждую переключённую вкладку. Отпустили — остаётся то, что было под
   * пальцем.
   * ------------------------------------------------------------------ */
  function centerTab(tab) {
    if (!tab) return;
    const row = tab.closest('.tabsSub');
    if (!row) return;
    // Нажатую вкладку плавно выкатываем в центр ряда (у краёв — сколько
    // позволяет прокрутка).
    const left = tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2;
    const max = row.scrollWidth - row.clientWidth;
    row.scrollTo({ left: Math.min(max, Math.max(0, left)), behavior: 'smooth' });
  }
  let suppressTabClick = false;
  (function () {
    const HOLD = 240;
    const EDGE = 48;
    let row = null, g = null, timer = 0, raf = 0, lastX = 0;

    function scrubbableRow(target) {
      const el = target.closest('.tabsMain, .tabsSub');
      // Фильтры на поиске — множественный выбор чекбоксами, скраб им не нужен.
      return el && el.getAttribute('aria-label') !== 'Фильтры' ? el : null;
    }
    function tabAt(x) {
      const b = row.querySelectorAll('.tab');
      for (let i = 0; i < b.length; i += 1) {
        if (x < b[i].getBoundingClientRect().right + 11) return b[i];
      }
      return b[b.length - 1] || null;
    }
    function pick(x) {
      const btn = tabAt(x);
      if (!btn || btn === g.active) return;
      g.active = btn;
      if (navigator.vibrate) { try { navigator.vibrate(6); } catch (_) {} }
      const action = actions[btn.dataset.action];
      if (action) action(btn, { scrub: true });
    }
    function loop() {
      if (!g || !g.scrub) return;
      const r = row.getBoundingClientRect();
      let v = 0;
      if (lastX < r.left + EDGE) v = -Math.min(1, (r.left + EDGE - lastX) / EDGE) * 14;
      else if (lastX > r.right - EDGE) v = Math.min(1, (lastX - (r.right - EDGE)) / EDGE) * 14;
      if (v) { row.scrollLeft += v; pick(lastX); }
      raf = requestAnimationFrame(loop);
    }
    function start() {
      g.scrub = true;
      row.classList.add('scrub');
      try { row.setPointerCapture(g.id); } catch (_) {}
      if (navigator.vibrate) { try { navigator.vibrate(10); } catch (_) {} }
      pick(lastX);
      loop();
    }
    function down(e) {
      if (e.pointerType === 'mouse' && e.button > 0) return;
      const el = scrubbableRow(e.target);
      if (!el) return;
      row = el;
      g = {
        id: e.pointerId, x: e.clientX, y: e.clientY, left: row.scrollLeft,
        touch: e.pointerType !== 'mouse', moved: false, scrub: false, drag: false,
        active: row.querySelector('.tab[aria-pressed="true"]'),
      };
      lastX = e.clientX;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { if (g && !g.moved) start(); }, HOLD);
    }
    function move(e) {
      if (!g || e.pointerId !== g.id) return;
      lastX = e.clientX;
      if (g.scrub) { pick(e.clientX); return; }
      const dx = e.clientX - g.x, dy = e.clientY - g.y;
      if (!g.moved && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        g.moved = true;
        window.clearTimeout(timer);
        if (!g.touch) {
          g.drag = true;
          row.classList.add('dragging');
          try { row.setPointerCapture(g.id); } catch (_) {}
        }
      }
      if (g.drag) row.scrollLeft = g.left - dx;
    }
    function end() {
      if (!g) return;
      window.clearTimeout(timer);
      window.cancelAnimationFrame(raf);
      const was = g.scrub || g.drag;
      row.classList.remove('scrub', 'dragging');
      g = null;
      row = null;
      if (was) {
        suppressTabClick = true;
        window.setTimeout(() => { suppressTabClick = false; }, 80);
      }
    }
    function click(e) { if (suppressTabClick) { e.stopPropagation(); e.preventDefault(); } }
    function touchmove(e) { if (g && g.scrub && e.cancelable) e.preventDefault(); }
    function ctx(e) { if (g) e.preventDefault(); }
    document.addEventListener('pointerdown', down);
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
    document.addEventListener('click', click, true);
    document.addEventListener('touchmove', touchmove, { passive: false });
    document.addEventListener('contextmenu', ctx);
  })();

  /* ---------------------------------------------------------------------
   * Инфо-модалка (кнопка «i»): мятные правила, порча имущества и ссылки
   * на приложение в App Store / Google Play.
   * ------------------------------------------------------------------ */
  const APPLE_APP_URL = 'https://apps.apple.com/ru/app/%D0%BC%D1%8F%D1%82%D0%B0-loyalty/id1550136852';
  const GOOGLE_APP_URL = 'https://play.google.com/store/apps/details?id=com.myata';
  // Логотипы App Store/Google Play — растровые PNG (из присланных иконок),
  // перекрашенные в акцентный цвет приложения (--accent), встроены как data URI.
  const APPLE_ICON = '<img src="data:image/png;base64,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" alt="" width="33" height="40"/>';
  const ANDROID_ICON = '<img src="data:image/png;base64,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" alt="" width="33" height="40"/>';

  function infoModalHTML() {
    const rules = RULES.map(
      (r, i) => `<li class="rule"><span class="ruleNum">${String(i + 1).padStart(2, '0')}</span><p class="ruleText">${r}</p></li>`,
    ).join('');
    const damageRows = DAMAGE_LIST.map(
      (d) => `<div class="barrow"><b>${esc(d.name)}</b><span class="barFill"></span><span class="price rowPrice">${rub(d.price)}</span></div>`,
    ).join('');
    return `<div class="modalBackdrop" data-action="close-info"></div>
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle">
        <div class="sheetTop" id="sheetDrag">
          <span class="sheetGrip" aria-hidden="true"></span>
          <div class="sheetHead">
            <span class="eyebrow">Оферта</span>
            <button type="button" class="sheetClose" aria-label="Закрыть" data-action="close-info"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          </div>
        </div>
        <div class="sheetBody" id="sheetBody">
          <h3 class="sheetTitle" id="sheetTitle">Мятные правила</h3>
          <p class="lede sheetLede">Порядок посещения клуба и компенсация за порчу имущества. Полный список правил есть у администратора.</p>
          <ol class="sheetRules">${rules}</ol>
          <button type="button" class="plusrow" aria-expanded="${state.damageOpen}" aria-controls="damageList" data-action="toggle-damage">Порча имущества — прайс<span class="q">+</span></button>
          <div class="detailWrap${state.damageOpen ? ' detailOpen' : ''}" id="damageList"${state.damageOpen ? '' : ' inert'}>
            <div class="detailClip">
              <div class="detail">${damageRows}</div>
            </div>
          </div>
          <div class="storeRow">
            <a class="storeLogo" href="${APPLE_APP_URL}" target="_blank" rel="noopener" aria-label="Скачать в App Store">${APPLE_ICON}</a>
            <a class="storeLogo" href="${GOOGLE_APP_URL}" target="_blank" rel="noopener" aria-label="Доступно в Google Play">${ANDROID_ICON}</a>
          </div>
        </div>
        <div class="sheetFoot">
          <button type="button" class="sheetOk" data-action="close-info">Понятно</button>
        </div>
      </div>`;
  }
  /** Свайп вниз за шапку шторки (или за контент, когда он прокручен в самый верх) — закрыть. */
  function bindSheetSwipe(root) {
    const sheet = root.querySelector('.sheet');
    const body = root.querySelector('#sheetBody');
    if (!sheet) return;
    let y0 = null, dy = 0, fromBody = false;
    sheet.addEventListener('touchstart', (e) => {
      fromBody = body && body.contains(e.target);
      if (fromBody && body.scrollTop > 0) { y0 = null; return; }
      y0 = e.touches[0].clientY; dy = 0;
      sheet.style.transition = 'none';
    }, { passive: true });
    sheet.addEventListener('touchmove', (e) => {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      if (fromBody && body.scrollTop > 0) { y0 = null; sheet.style.transition = ''; sheet.style.transform = ''; return; }
      if (fromBody && dy === 0) return;
      if (dy > 0 && e.cancelable) e.preventDefault();
      sheet.style.transform = `translateY(${dy}px)`;
    }, { passive: false });
    const end = () => {
      if (y0 === null) return;
      sheet.style.transition = '';
      y0 = null;
      if (dy > 90) { actions['close-info'](); }
      else sheet.style.transform = '';
    };
    sheet.addEventListener('touchend', end);
    sheet.addEventListener('touchcancel', end);
  }
  function renderInfo() {
    const root = document.getElementById('modalRoot');
    if (!root) return;
    if (state.infoOpen) {
      root.innerHTML = infoModalHTML();
      root.hidden = false;
      document.documentElement.classList.add('sheetLock');
      bindSheetSwipe(root);
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('modalOpen')));
    } else {
      root.classList.remove('modalOpen');
      const sheet = root.querySelector('.sheet');
      if (sheet) sheet.style.transform = '';
      document.documentElement.classList.remove('sheetLock');
      window.setTimeout(() => {
        if (!state.infoOpen) { root.hidden = true; root.innerHTML = ''; }
      }, 460);
    }
  }

  function setDishOpen(item, open) {
    item.classList.toggle('open', open);
    const body = item.querySelector(':scope > .body');
    if (body) {
      if (open) body.removeAttribute('inert');
      else body.setAttribute('inert', '');
    }
  }
  function setDetailOpen(item, open) {
    const btn = item.querySelector('.plusrow');
    const wrap = item.querySelector('.detailWrap');
    if (btn) btn.setAttribute('aria-expanded', String(open));
    if (!wrap) return;
    wrap.classList.toggle('detailOpen', open);
    if (open) wrap.removeAttribute('inert');
    else wrap.setAttribute('inert', '');
  }

  const actions = {
    'skip-splash': () => finishSplash(),
    'open-section': (t) => {
      state.section = t.dataset.key;
      state.category = 'Всё';
      state.openDish = null;
      state.detailOpen = false;
      goto('menu');
    },
    'goto-start': () => {
      state.fromSplash = false;
      goto('start');
    },
    'goto-search': () => goto('search'),
    'goto-menu': () => goto('menu'),
    'top-tab': (t, opts) => {
      const key = t.dataset.key;
      if (key === state.section) return;
      state.section = key;
      state.category = 'Всё';
      state.openDish = null;
      state.detailOpen = false;
      if (key === 'bar') state.barTab = 'strong';
      if (key === 'hookah') state.hookahTab = 'formats';
      $('#topTabs')
        .querySelectorAll('.tab')
        .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.key === key)));
      const subrow = $('#subrow');
      if (subrow) {
        subrow.classList.toggle('subrowOpen', key === 'kitchen');
        if (key === 'kitchen') subrow.removeAttribute('inert');
        else subrow.setAttribute('inert', '');
      }
      fadeSwap($('#feed'), () => { $('#feed').innerHTML = renderFeedInner(); }, { onSwap: scrollFeedTop, instant: !!(opts && opts.scrub), quick: true });
    },
    'cat-tab': (t, opts) => {
      const key = t.dataset.key;
      if (key === state.category) return;
      state.category = key;
      $('#catTabs')
        .querySelectorAll('.tab')
        .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.key === key)));
      centerTab(t);
      fadeSwap($('#feed'), () => { $('#feed').innerHTML = renderFeedInner(); }, { onSwap: scrollFeedTop, instant: !!(opts && opts.scrub), quick: true });
    },
    'bar-tab': (t, opts) => {
      const key = t.dataset.key;
      if (key === state.barTab) return;
      state.barTab = key;
      $('#barTabs')
        .querySelectorAll('.tab')
        .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.key === key)));
      centerTab(t);
      fadeSwap($('#barFeed'), () => { $('#barFeed').innerHTML = renderBarInner(key); }, { onSwap: scrollFeedTop, instant: !!(opts && opts.scrub), quick: true });
    },
    'tabgroup-tab': (t, opts) => {
      const group = t.dataset.group;
      const key = t.dataset.key;
      if (key === (state.tabGroupActive[group] || '')) return;
      state.tabGroupActive[group] = key;
      $('#tabGroupTabs')
        .querySelectorAll('.tab')
        .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.key === key)));
      centerTab(t);
      fadeSwap($('#tabGroupFeed'), () => { $('#tabGroupFeed').innerHTML = renderTabGroupSubInner(BAR[group], key); }, { onSwap: scrollFeedTop, instant: !!(opts && opts.scrub), quick: true });
    },
    'hookah-tab': (t, opts) => {
      const key = t.dataset.key;
      if (key === state.hookahTab) return;
      state.hookahTab = key;
      $('#hookahTabs')
        .querySelectorAll('.tab')
        .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.key === key)));
      centerTab(t);
      fadeSwap($('#hookahFeed'), () => { $('#hookahFeed').innerHTML = renderHookahInner(key); }, { onSwap: scrollFeedTop, instant: !!(opts && opts.scrub), quick: true });
    },
    // Кнопка «⇅»: не случайное перемешивание, а переключатель — по цене
    // (сначала дорогие) туда-обратно к исходному порядку категорий.
    shuffle: (t) => {
      if (state.priceSorted) {
        state.order = DEFAULT_ORDER.slice();
        state.priceSorted = false;
      } else {
        state.order = KITCHEN.map((_, i) => i).sort((a, b) => KITCHEN[b].price - KITCHEN[a].price);
        state.priceSorted = true;
      }
      if (t) t.setAttribute('aria-pressed', String(state.priceSorted));
      if (state.section === 'kitchen') {
        fadeSwap($('#feed'), () => { $('#feed').innerHTML = renderFeedInner(); }, { onSwap: scrollFeedTop, quick: true });
      }
    },
    'toggle-dish': (t) => {
      // id блюда, на которое реально тыкнули — берём именно с этой кнопки,
      // а не из состояния, чтобы «Свернуть» всегда закрывало ту самую
      // карточку, а не какую-то другую.
      // Раскрываем/сворачиваем НА МЕСТЕ (классы), без перерисовки ленты:
      // фото не пересоздаются и не мигают, работает плавная анимация.
      const id = t.dataset.key;
      const feed = $('#feed');
      const item = feed && feed.querySelector(`[data-dish="${id}"]`);
      const wasOpen = state.openDish === id;
      if (wasOpen && state.detailOpen) {
        // Состав уже открыт — первое нажатие «Свернуть» закрывает только
        // его, возвращая к виду «блюдо + описание». Карточка целиком
        // закрывается только повторным нажатием.
        state.detailOpen = false;
        if (item) setDetailOpen(item, false);
        scrollDishIntoView(feed, id);
        return;
      }
      // Ранее открытую другую карточку закрываем тем же плавным переходом,
      // что используется при обычном сворачивании позиции.
      if (state.openDish && state.openDish !== id) {
        const prev = feed && feed.querySelector(`[data-dish="${state.openDish}"]`);
        if (prev) {
          setDetailOpen(prev, false);
          setDishOpen(prev, false);
        }
      }
      state.openDish = wasOpen ? null : id;
      state.detailOpen = false;
      if (item) {
        setDetailOpen(item, false);
        setDishOpen(item, !wasOpen);
      }
      // И при открытии, и при сворачивании возвращаем карточку к тому же
      // месту экрана — иначе после сворачивания лента прыгает и блюдо
      // теряется из виду.
      scrollDishIntoView(feed, id);
    },
    'toggle-detail': (t) => {
      window.clearTimeout(dishScrollTimer);
      dishScrollTimer = 0;
      state.detailOpen = !state.detailOpen;
      const item = t.closest('.item');
      if (item) setDetailOpen(item, state.detailOpen);
    },
    'diet-filter': (t) => {
      const key = t.dataset.key;
      if (state.filters.has(key)) state.filters.delete(key);
      else state.filters.add(key);
      t.setAttribute('aria-pressed', String(state.filters.has(key)));
      const results = $('#searchResults');
      if (results) results.innerHTML = buildSearchHTMLResultsOnly();
    },
    'open-info': () => { state.infoOpen = true; state.damageOpen = false; renderInfo(); },
    'close-info': () => { state.infoOpen = false; renderInfo(); },
    'toggle-damage': (t) => {
      // Раскрываем на месте, без перерисовки — иначе шторка прыгает в начало.
      state.damageOpen = !state.damageOpen;
      t.setAttribute('aria-expanded', String(state.damageOpen));
      const wrap = document.getElementById('damageList');
      if (!wrap) return;
      wrap.classList.toggle('detailOpen', state.damageOpen);
      if (state.damageOpen) {
        wrap.removeAttribute('inert');
        window.setTimeout(() => t.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      } else wrap.setAttribute('inert', '');
    },
  };

  document.addEventListener('click', (event) => {
    if (suppressTabClick) { suppressTabClick = false; return; }
    const t = event.target.closest('[data-action]');
    if (!t) return;
    const action = actions[t.dataset.action];
    if (action) action(t);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.infoOpen) actions['close-info']();
  });

  /** Помечаем фото как загруженное — и в DOM (плавный fade-in при первом
   *  показе), и в LOADED_IMAGES, чтобы при следующей перерисовке этой же
   *  карточки (после любого тыка) оно вставлялось уже готовым, без
   *  повторного мигания. */
  window.mnImgReady = function (imgEl) {
    imgEl.classList.add('ready');
    LOADED_IMAGES.add(imgEl.getAttribute('src'));
  };

  function syncTabFade(row) {
    const max = row.scrollWidth - row.clientWidth;
    row.classList.toggle('fadeL', row.scrollLeft > 2);
    row.classList.toggle('fadeR', row.scrollLeft < max - 2);
  }
  document.addEventListener('scroll', (e) => {
    const t = e.target;
    if (t && t.classList && t.classList.contains('tabsSub')) syncTabFade(t);
  }, true);
  const syncAllTabFades = () => document.querySelectorAll('.tabsSub').forEach(syncTabFade);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncAllTabFades);
  new MutationObserver(() => requestAnimationFrame(syncAllTabFades)).observe(host, { childList: true, subtree: true });
  window.addEventListener('resize', syncAllTabFades);

  window.mnSyncDots = function (swipeEl) {
    const index = Math.round(swipeEl.scrollLeft / swipeEl.clientWidth);
    const dots = swipeEl.nextElementSibling;
    if (!dots) return;
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === index));
  };
  window.mnSearchInput = function (value) {
    state.query = value;
    const results = $('#searchResults');
    if (results) results.innerHTML = buildSearchHTMLResultsOnly();
  };
  function buildSearchHTMLResultsOnly() {
    const results = filterEntries(state.query, state.filters);
    return results.length
      ? results
          .map(
            (e) =>
              `<div class="resrow">${shotHTML(e.photos.slice(0, 1), { className: 'resShot', compact: true })}<div class="resT"><b>${esc(e.name)}</b><span>${esc(e.category)}${e.sub ? ' · ' + esc(e.sub) : ''}</span></div><span class="price resPrice">${rub(e.price)}</span></div>`,
          )
          .join('')
      : `<div class="empty">Ничего не нашлось.<br/>Попробуйте другое слово или снимите фильтр.</div>`;
  }

  /* ---------------------------------------------------------------------
   * Старт.
   * ------------------------------------------------------------------ */
  host.innerHTML = renderScreenHTML();
  host.classList.add('swapBase');
  glow.classList.add('on');
  afterScreenRender();
})();
