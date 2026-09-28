/** Барная карта из печатного меню: коктейли карточками (фото — img/b_*.webp, 3:4), остальное — списком. */
const BAR = {
  cocktails: {
    title: "Коктейли",
    kind: 'tabGroup',
    subs: [
      {
        key: 'author',
        label: "Авторские",
        kind: 'cards',
        note: "Все авторские коктейли — 800 ₽",
        items: [
          {
            name: "Шёлк агавы",
            photos: ["b_agave_1.webp", "b_agave_2.webp"],
            price: 800,
            meta: "текила, ликёр ваниль, ликёр личи",
            description: "Мягкий, нежный, текстурный коктейль на текиле с нотами ванили и личи. Шёлковый, сливочный, но не тяжёлый.",
          },
          {
            name: "Кастильский десерт",
            photos: ["b_castella.webp"],
            price: 800,
            meta: "белый ром, пино гриджо, кордиал кастелла кейк, белок",
            description: "Воздушный ванильно-винный коктейль с мягкой сладостью и лёгкой кислинкой.",
          },
          {
            name: "Райский восход",
            photos: ["b_paradise.webp"],
            price: 800,
            meta: "ром, ликёр личи",
            description: "Сбалансированный коктейль с фруктовой сладостью личи и освежающей кислинкой лайма.",
          },
          {
            name: "Ромовый закат",
            photos: ["b_oakheart.webp"],
            price: 800,
            meta: "бакарди оакхарт, лимонный фреш, белок",
            description: "Пряный сауэр с плотной текстурой, яркой кислинкой и тёплой ромовой пряностью.",
          },
          {
            name: "Персиковый поцелуй",
            photos: ["b_peach.webp"],
            price: 800,
            meta: "джин, персиковое пюре, белок",
            description: "Коктейльная рюмка. Свежий персиковый коктейль с лёгкой ноткой джина и воздушной пеной.",
          },
          {
            name: "Лунный тоник",
            photos: ["b_luna.webp"],
            price: 800,
            meta: "ром, джин, ликёр бузины, безалкогольное игристое",
            description: "Лёгкий, игристый, цветочный коктейль с мягкими ботаническими акцентами.",
          },
          {
            name: "Сад теней",
            photos: ["b_midnight.webp"],
            price: 800,
            meta: "смородиновая водка, ликёр бузины, кордиал фиалка-цитрус",
            description: "Освежающий ягодно-цветочный лонг с яркой смородиной и лёгкой фиалковой свежестью.",
          },
        ],
      },
      {
        key: 'classic',
        label: "Классические",
        kind: 'cards',
        note: "Все классические коктейли — 800 ₽",
        items: [
          {
            name: "Белый русский",
            photos: ["b_whiterussian.webp"],
            price: 800,
            meta: "",
            description: "Бархатистый и обволакивающий коктейль, сочетающий кофейную горчинку, согревающие нотки и нежную сливочность.",
          },
          {
            name: "Дайкири",
            photos: ["b_daiquiri.webp"],
            price: 800,
            meta: "",
            description: "Простой, но безупречный баланс рома, сока лайма и сахарного сиропа.",
          },
          {
            name: "Маргарита",
            photos: ["b_margarita.webp"],
            price: 800,
            meta: "",
            description: "Взрыв освежающего цитруса и тепла текилы, обрамлённый соленой кромкой.",
          },
          {
            name: "Негрони",
            photos: ["b_negroni_1.webp", "b_negroni_2.webp"],
            price: 800,
            meta: "",
            description: "Апогей баланса и гармонии, напиток для неспешного наслаждения.",
          },
          {
            name: "Яблочный тини",
            photos: ["b_appletini.webp"],
            price: 800,
            meta: "",
            description: "Освежающий и яркий коктейль, воплощающий сочную сладость зелёного яблока.",
          },
          {
            name: "Лонг Айлэнд",
            photos: ["b_longisland.webp"],
            price: 800,
            meta: "",
            description: "Коктейль для тех, кто уверен в своих силах и готов к последствиям.",
          },
          {
            name: "Космополитан",
            photos: ["b_cosmo.webp"],
            price: 800,
            meta: "",
            description: "Искушение в розовом цвете. Терпкий и сладкий вкус создаёт атмосферу романтики.",
          },
          {
            name: "Виски сауэр",
            photos: ["b_whiskeysour.webp"],
            price: 800,
            meta: "",
            description: "Тепло виски, кислинка лимонного сока и сладость сахарного сиропа.",
          },
          {
            name: "Апероль спритц",
            photos: ["b_aperol.webp"],
            price: 800,
            meta: "",
            description: "Как закат солнца на побережье Италии: яркий, тёплый и незабываемый.",
          },
          {
            name: "Мартини Фиеро тоник",
            photos: ["b_fiero.webp"],
            price: 800,
            meta: "",
            description: "Гармоничное сочетание сладости, горчинки и цитрусовых нот.",
          },
          {
            name: "Пина колада",
            photos: ["b_pinacolada.webp"],
            price: 800,
            meta: "",
            description: "Десерт и напиток одновременно, настоящее наслаждение для сладкоежек.",
          },
        ],
      },
      {
        key: 'season',
        label: "Сезонные",
        kind: 'cards',
        note: "Все сезонные коктейли — 800 ₽",
        items: [
          {
            name: "Каллисто",
            photos: ["b_callisto.webp"],
            price: 800,
            meta: "текила, мартини россо, Campari, кордиал костела кейк",
            description: "Текила, мартини россо, Campari и кордиал костела кейк — тёплый, немного горьковатый коктейль с десертной ноткой.",
          },
          {
            name: "Альсеида",
            photos: ["b_alseida.webp"],
            price: 800,
            meta: "водка, концентрат киви, кордиал эстрагон-яблоко-алоэ, сироп бергамот, Kiwi Cuvee Sauvignon Blanc",
            description: "Водка с концентратом киви, кордиалом эстрагон-яблоко-алоэ, сиропом бергамот и Kiwi Cuvee Sauvignon Blanc.",
          },
          {
            name: "Дафна",
            photos: ["b_daphne.webp"],
            price: 800,
            meta: "джин, лимончелло, раствор молочной кислоты, сахарный сироп",
            description: "Джин, лимончелло, раствор молочной кислоты и сахарный сироп — яркий цитрусовый сауэр.",
          },
          {
            name: "Филиация",
            photos: ["b_filiatsia.webp"],
            price: 800,
            meta: "джин, концентрат персик, кордиал смородина-фиалка-цитрус, раствор молочной кислоты",
            description: "Джин, концентрат персика, кордиал смородина-фиалка-цитрус и раствор молочной кислоты.",
          },
        ],
      },
    ],
  },
  wine: {
    title: "Вино",
    note: "Все позиции — 125 мл.",
    kind: 'list',
    groups: [
      {
        group: "Игристое",
        items: [
          { name: "\"Conti Valli\" Spumante Brut", volume: "белое, брют · Италия", price: 650 },
          { name: "\"Conti Valli\" Spumante Moscato", volume: "белое, сладкое · Италия", price: 650 },
          { name: "Mountain River Pinot Grigio", volume: "белое, экстра брют · ЮАР", price: 700 },
          { name: "Martini Brut", volume: "белое, брют · Италия", price: 700 },
        ],
      },
      {
        group: "Белое",
        items: [
          { name: "Johann Klauss Gruner Veltliner", volume: "сухое · Чили", price: 700 },
          { name: "Peter Mertes Riesling Kabinett Halbtrocken", volume: "полусухое · Германия", price: 700 },
          { name: "Kiwi Cuvee Sauvignon Blanc", volume: "сухое · ЮАР", price: 700 },
          { name: "La Merita Vinho Verde DOC", volume: "полусухое · Португалия", price: 700 },
        ],
      },
      {
        group: "Красное",
        items: [
          { name: "Santa Alba Reserve Pinot Noir", volume: "сухое · Чили", price: 700 },
          { name: "Santa Alba Reserve Cabernet Sauvignon", volume: "сухое · Чили", price: 700 },
          { name: "Сахли Киндзмараули (кувшин)", volume: "полусладкое · Грузия", price: 550 },
        ],
      },
      {
        group: "Розовое",
        items: [
          { name: "Feral Roots White Zinfandel", volume: "полусладкое · США", price: 650 },
        ],
      },
    ],
  },
  strong: {
    title: "Крепкий алкоголь",
    note: "",
    kind: 'list',
    groups: [
      {
        group: "Водка",
        items: [
          { name: "LAB · classic 50°, лесные ягоды и брусника, ваниль и бобы тонка, груша и айва, смородина и бузина, клюква и мята", volume: "40 мл", price: 480 },
          { name: "Mamont", volume: "40 мл", price: 600 },
          { name: "Белуга Transatlantic", volume: "1 л", price: 4700 },
        ],
      },
      {
        group: "Виски",
        items: [
          { name: "Jim Beam", volume: "40 мл", price: 480 },
          { name: "Chivas Regal 12 лет", volume: "40 мл", price: 900 },
          { name: "William Lawson's · классический / super spiced", volume: "40 мл", price: 600 },
        ],
      },
      {
        group: "Коньяк",
        items: [
          { name: "Martel VS", volume: "40 мл", price: 750 },
        ],
      },
      {
        group: "Текила",
        items: [
          { name: "Olmeca Gold", volume: "40 мл", price: 600 },
          { name: "Olmeca Silver", volume: "40 мл", price: 550 },
        ],
      },
      {
        group: "Джин",
        items: [
          { name: "Beefeater", volume: "40 мл", price: 600 },
          { name: "Cruxland", volume: "40 мл", price: 700 },
          { name: "Bosford", volume: "40 мл", price: 550 },
        ],
      },
      {
        group: "Вермуты и аперитивы",
        items: [
          { name: "Martini Fiero / Rosso / Bianco", volume: "40 мл", price: 500 },
          { name: "Aperol", volume: "40 мл", price: 500 },
        ],
      },
      {
        group: "Дижестивы",
        items: [
          { name: "Jägermeister", volume: "40 мл", price: 600 },
          { name: "Limoncello di Capri", volume: "40 мл", price: 500 },
        ],
      },
    ],
  },
  beer: {
    title: "Пиво",
    note: "",
    kind: 'list',
    groups: [
      {
        group: "Бутылочное",
        items: [
          { name: "Hoegaarden", volume: "0.45", price: 750 },
          { name: "Corona Extra", volume: "0.33", price: 750 },
          { name: "Leffe Brune", volume: "0.33", price: 750 },
          { name: "Spaten", volume: "0.45", price: 750 },
          { name: "Chester's", volume: "0.45", price: 750 },
          { name: "Corona Extra Zero", volume: "0.33", price: 650 },
        ],
      },
      {
        group: "Разливное · чешский лежак",
        items: [
          { name: "Чешский лежак", volume: "0.3", price: 650 },
          { name: "Чешский лежак", volume: "0.5", price: 800 },
        ],
      },
    ],
  },
  tea: {
    title: "Чай",
    note: "Двойной объём — двойная цена. Добавки (фруктовое пюре, имбирь, чабрец, лимон, сироп, лайм, мята, мёд) — 150 ₽.",
    kind: 'tabGroup',
    subs: [
      {
        key: 'author',
        label: "Авторский · 0,5 л",
        kind: 'list',
        items: [
          { name: "Маракуйя-личи", volume: "0,5 л", price: 1100 },
          { name: "Яблоко-корица", volume: "0,5 л", price: 1100 },
          { name: "Бергамот-юдзу", volume: "0,5 л", price: 1100 },
          { name: "Ягодный", volume: "0,5 л", price: 1100 },
          { name: "Облепиховый", volume: "0,5 л", price: 1100 },
          { name: "Вишнёвый кекс", volume: "0,5 л", price: 1100 },
          { name: "Маракуйя-земляника", volume: "0,5 л", price: 1100 },
          { name: "Яблочный пирог", volume: "0,5 л", price: 1100 },
        ],
      },
      {
        key: 'classic',
        label: "Классический · 0,5 л",
        kind: 'list',
        items: [
          { name: "Эрл грей", volume: "0,5 л", price: 900 },
          { name: "Ассам", volume: "0,5 л", price: 900 },
          { name: "Иван-чай", volume: "0,5 л", price: 900 },
          { name: "Печенька", volume: "0,5 л", price: 900 },
          { name: "Травяной сбор", volume: "0,5 л", price: 900 },
          { name: "Сенча", volume: "0,5 л", price: 900 },
        ],
      },
      {
        key: 'chinese',
        label: "Китайский · 2 л",
        kind: 'list',
        note: "Два пролива по 1 л.",
        items: [
          { name: "Бай Хао Инь Чжень · белый", volume: "2 л", price: 1600 },
          { name: "Шоу Мэй · белый", volume: "2 л", price: 1500 },
          { name: "Моли Било Чунь · зелёный", volume: "2 л", price: 1600 },
          { name: "Тай Пин Хоу Куй · зелёный", volume: "2 л", price: 1500 },
          { name: "Те Гуань Инь · улун", volume: "2 л", price: 1700 },
          { name: "Те Ло Хань · улун", volume: "2 л", price: 1800 },
          { name: "Фен Хуан Дан Цун «Морозный пик» · улун", volume: "2 л", price: 2000 },
          { name: "Габа Лао Ча Ван · улун", volume: "2 л", price: 2000 },
          { name: "Най Сянь Цзинь Сюань · улун", volume: "2 л", price: 1600 },
          { name: "Да Ху Я · шу пуэр", volume: "2 л", price: 1800 },
          { name: "Гунтин из Биндао · шу пуэр", volume: "2 л", price: 1700 },
          { name: "Ци Дао Я Гу Шу · шен пуэр", volume: "2 л", price: 1700 },
          { name: "И Шен Ча · красный", volume: "2 л", price: 1700 },
          { name: "Дян Хун Цзинь Хао · красный", volume: "2 л", price: 1900 },
          { name: "Варка чая", volume: "к чаю", price: 300 },
        ],
      },
    ],
  },
  coffee: {
    title: "Кофе",
    note: "Двойной объём — двойная цена.",
    kind: 'list',
    groups: [
      {
        group: "Кофе",
        items: [
          { name: "Эспрессо", volume: "20 мл", price: 300 },
          { name: "Американо", volume: "250 мл", price: 400 },
          { name: "Флэт уайт", volume: "250 мл", price: 600 },
          { name: "Латте", volume: "250 мл", price: 450 },
          { name: "Капучино", volume: "250 мл", price: 500 },
          { name: "Раф", volume: "250 мл", price: 600 },
          { name: "Глясе", volume: "250 мл", price: 600 },
          { name: "Матча латте", volume: "250 мл", price: 600 },
          { name: "Альтернативное молоко", volume: "200 мл", price: 250 },
        ],
      },
    ],
  },
  cocoa: {
    title: "Какао",
    note: "Двойной объём — двойная цена.",
    kind: 'cards',
    items: [
      {
        name: "Какао",
        photos: ["b_cocoa_1.webp"],
        price: 450,
        meta: "250 мл",
        description: "Какао на молоке. По желанию — с зефирками сверху.",
      },
    ],
  },
  lemonade: {
    title: "Лимонады",
    note: "",
    kind: 'list',
    groups: [
      {
        group: "Авторские лимонады · 1 л",
        items: [
          { name: "Вишня-персик", volume: "1 л", price: 1500 },
          { name: "Мохито", volume: "1 л", price: 1500 },
          { name: "Барбарис-грейпфрут", volume: "1 л", price: 1500 },
          { name: "Яблоко-жасмин", volume: "1 л", price: 1500 },
          { name: "Грейпфрут-бузина", volume: "1 л", price: 1500 },
          { name: "Персик-земляника", volume: "1 л", price: 1500 },
          { name: "Груша-жасмин", volume: "1 л", price: 1500 },
          { name: "Базилик-кокос", volume: "1 л", price: 1500 },
        ],
      },
    ],
  },
  fresh: {
    title: "Фреши",
    note: "",
    kind: 'list',
    groups: [
      {
        group: "Фреши · 0,3 л",
        items: [
          { name: "Яблоко", volume: "0.3 л", price: 800 },
          { name: "Апельсин", volume: "0.3 л", price: 800 },
          { name: "Грейпфрут", volume: "0.3 л", price: 800 },
          { name: "Ананас", volume: "0.3 л", price: 1400 },
          { name: "Гранат", volume: "0.3 л", price: 1400 },
        ],
      },
    ],
  },
  soft: {
    title: "Без алкоголя",
    note: "",
    kind: 'list',
    groups: [
      {
        group: "Холодные напитки",
        items: [
          { name: "Coca-Cola · classic / zero", volume: "0.33", price: 500 },
          { name: "Fanta", volume: "0.33", price: 500 },
          { name: "Sprite", volume: "0.33", price: 500 },
          { name: "Schweppes", volume: "0.33", price: 500 },
          { name: "Rich", volume: "0.2", price: 500 },
          { name: "Red Bull", volume: "0.25", price: 500 },
          { name: "Dr.Pepper", volume: "0.33", price: 500 },
          { name: "San Benedetto · с газом / без газа", volume: "0.25", price: 500 },
          { name: "San Benedetto · с газом / без газа", volume: "0.75", price: 950 },
        ],
      },
    ],
  },
};

const BAR_TABS = [
  { key: 'strong', label: "Крепкий алкоголь" },
  { key: 'cocktails', label: "Коктейли" },
  { key: 'wine', label: "Вино" },
  { key: 'beer', label: "Пиво" },
  { key: 'coffee', label: "Кофе" },
  { key: 'cocoa', label: "Какао" },
  { key: 'tea', label: "Чай" },
  { key: 'lemonade', label: "Лимонады" },
  { key: 'fresh', label: "Фреши" },
  { key: 'soft', label: "Безалкогольные напитки" },
];
