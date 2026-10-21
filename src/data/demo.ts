import { paletteTags } from "@/lib/color/palette";
import type { Product, ProductStatus, Shop, UserRole } from "@/lib/types";
import palettes from "./demo-palettes.json";

const PALETTES: Record<string, string[]> = palettes;

/**
 * Demo data: 10 shops and 50+ products with Ukrainian copy.
 * Used directly in demo mode and by supabase/seed.ts to populate a real database.
 * Photos: Unsplash (see scripts/demo-images.json for attribution ids).
 */

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
}

export const DEMO_PASSWORD = "demo1234";

const img = (name: string) => `/demo/${name}.jpg`;

const users: Array<Omit<DemoUser, "password" | "createdAt" | "avatarUrl">> = [
  { id: "u-olena", email: "olena@lavka.demo", fullName: "Олена Гончар", role: "seller" },
  { id: "u-marta", email: "marta@lavka.demo", fullName: "Марта Срібна", role: "seller" },
  { id: "u-iryna", email: "iryna@lavka.demo", fullName: "Ірина Льонко", role: "seller" },
  { id: "u-vasyl", email: "vasyl@lavka.demo", fullName: "Василь Теплий", role: "seller" },
  { id: "u-halyna", email: "halyna@lavka.demo", fullName: "Галина Вишняк", role: "seller" },
  { id: "u-petro", email: "petro@lavka.demo", fullName: "Петро Дубенко", role: "seller" },
  { id: "u-sofia", email: "sofia@lavka.demo", fullName: "Софія Воскова", role: "seller" },
  { id: "u-andrii", email: "andrii@lavka.demo", fullName: "Андрій Акварель", role: "seller" },
  { id: "u-taras", email: "taras@lavka.demo", fullName: "Тарас Ремінь", role: "seller" },
  { id: "u-oksana", email: "oksana@lavka.demo", fullName: "Оксана Плетій", role: "seller" },
  { id: "u-buyer", email: "buyer@lavka.demo", fullName: "Катерина Покупець", role: "buyer" },
  { id: "u-buyer2", email: "dmytro@lavka.demo", fullName: "Дмитро Коваль", role: "buyer" },
  { id: "u-buyer3", email: "olha@lavka.demo", fullName: "Ольга Мельник", role: "buyer" },
  { id: "u-buyer4", email: "nazar@lavka.demo", fullName: "Назар Ткачук", role: "buyer" },
  { id: "u-buyer5", email: "yulia@lavka.demo", fullName: "Юлія Бондар", role: "buyer" },
  { id: "u-admin", email: "admin@lavka.demo", fullName: "Адміністратор Lavka", role: "admin" },
];

export const DEMO_USERS: DemoUser[] = users.map((u) => ({
  ...u,
  password: DEMO_PASSWORD,
  avatarUrl: null,
  createdAt: "2026-01-10T09:00:00.000Z",
}));

export const DEMO_SHOPS: Shop[] = [
  {
    id: "s-ceramics",
    ownerId: "u-olena",
    slug: "hlynianyi-dim",
    name: "Глиняний дім",
    tagline: "Посуд, який хочеться тримати в руках",
    story:
      "Майстерня народилася в Опішні — столиці української кераміки. Олена працює з місцевою червоною глиною, випалює посуд при 1200 °C і покриває харчовими глазурями. Кожна чашка трохи інша: так і має бути, коли річ зроблена руками, а не формою.",
    regionSlug: "poltava",
    city: "Опішня",
    avatarUrl: img("shop-ceramics-avatar"),
    coverUrl: img("shop-ceramics-cover"),
    isHidden: false,
    createdAt: "2026-01-12T10:00:00.000Z",
  },
  {
    id: "s-jewelry",
    ownerId: "u-marta",
    slug: "sribna-nytka",
    name: "Срібна нитка",
    tagline: "Срібло та натуральне каміння ручного кування",
    story:
      "Марта вчилася ювелірній справі у Львівській академії мистецтв і десять років працює з сріблом 925 проби. Кожна прикраса кується, паяється та полірується вручну в маленькій майстерні на Личакові. Камені — тільки натуральні, з перевірених українських постачальників.",
    regionSlug: "lviv",
    city: "Львів",
    avatarUrl: img("shop-jewelry-avatar"),
    coverUrl: img("shop-jewelry-cover"),
    isHidden: false,
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "s-linen",
    ownerId: "u-iryna",
    slug: "lon-i-son",
    name: "Льон і Сон",
    tagline: "Домашній текстиль зі 100 % українського льону",
    story:
      "Ми шиємо постіль, подушки та рушники з льону, вирощеного й витканого на Чернігівщині. Тканину попередньо перемо та м'якшимо, щоб вона була приємною до тіла з першої ночі. Усі краї оброблені подвійним швом — речі служать роками й стають лише м'якшими.",
    regionSlug: "chernihiv",
    city: "Чернігів",
    avatarUrl: img("shop-linen-avatar"),
    coverUrl: img("shop-linen-cover"),
    isHidden: false,
    createdAt: "2026-01-20T10:00:00.000Z",
  },
  {
    id: "s-knit",
    ownerId: "u-vasyl",
    slug: "teplo-viazane",
    name: "Тепло в'язане",
    tagline: "Пледи та светри з карпатської вовни",
    story:
      "Василь із родиною в'яже пледи грубої в'язки з вовни овець, що пасуться на полонинах під Яремчем. Пряжу фарбуємо рослинними барвниками — цибулиння, горіх, звіробій. Один плед — це три дні роботи та приблизно два кілометри нитки.",
    regionSlug: "ivano-frankivsk",
    city: "Яремче",
    avatarUrl: img("shop-knit-avatar"),
    coverUrl: img("shop-knit-cover"),
    isHidden: false,
    createdAt: "2026-01-25T10:00:00.000Z",
  },
  {
    id: "s-embroidery",
    ownerId: "u-halyna",
    slug: "vyshyvana",
    name: "Вишивана",
    tagline: "Сучасна вишивка в п'яльцях і набори для початківців",
    story:
      "Галина вишиває з дитинства, а п'ять років тому почала перетворювати традиційні подільські мотиви на сучасні панно в дерев'яних п'яльцях. У лавці також є набори з усім необхідним, щоб вишити свою першу роботу за вечір.",
    regionSlug: "vinnytsia",
    city: "Вінниця",
    avatarUrl: img("shop-embroidery-avatar"),
    coverUrl: img("shop-embroidery-cover"),
    isHidden: false,
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "s-wood",
    ownerId: "u-petro",
    slug: "dubova-lavka",
    name: "Дубова лавка",
    tagline: "Дошки, ложки та іграшки з закарпатського дерева",
    story:
      "Столярня Петра стоїть на березі Тиси. Працюємо з дубом, ясенем і горіхом, які сушимо природним способом щонайменше рік. Дошки просочуємо лляною олією з бджолиним воском, іграшки — лише олією: їх можна гризти.",
    regionSlug: "zakarpattia",
    city: "Хуст",
    avatarUrl: img("shop-wood-avatar"),
    coverUrl: img("shop-wood-cover"),
    isHidden: false,
    createdAt: "2026-02-05T10:00:00.000Z",
  },
  {
    id: "s-candles",
    ownerId: "u-sofia",
    slug: "teplyi-visk",
    name: "Теплий віск",
    tagline: "Соєві свічки з ароматами українського літа",
    story:
      "Софія варить свічки з соєвого воску без парафіну, з бавовняними ґнотами та натуральними ефірними оліями. Аромати — наші: липа, степовий полин, море в Одесі після дощу. Банки можна повернути й отримати знижку на наступну свічку.",
    regionSlug: "odesa",
    city: "Одеса",
    avatarUrl: img("shop-candles-avatar"),
    coverUrl: img("shop-candles-cover"),
    isHidden: false,
    createdAt: "2026-02-10T10:00:00.000Z",
  },
  {
    id: "s-art",
    ownerId: "u-andrii",
    slug: "akvarelnyi-dvir",
    name: "Акварельний двір",
    tagline: "Оригінальні акварелі та авторські принти",
    story:
      "Андрій — художник із Харкова, малює міста, сади та тварин аквареллю на бавовняному папері. Кожна робота в лавці — оригінал в одному примірнику або принт обмеженим тиражем із підписом автора. Усі роботи надсилаються в твердому конверті з паспарту.",
    regionSlug: "kharkiv",
    city: "Харків",
    avatarUrl: img("shop-art-avatar"),
    coverUrl: img("shop-art-cover"),
    isHidden: false,
    createdAt: "2026-02-14T10:00:00.000Z",
  },
  {
    id: "s-leather",
    ownerId: "u-taras",
    slug: "remin",
    name: "Ремінь",
    tagline: "Шкіряні гаманці та сумки з довічною гарантією",
    story:
      "Тарас шиє зі шкіри рослинного дублення італійських і українських чинбарень. Усе — вручну, сідельним швом вощеною ниткою, який не розпускається, навіть якщо перетреться одна нитка. На кожен виріб — довічна гарантія на шви.",
    regionSlug: "dnipro",
    city: "Дніпро",
    avatarUrl: img("shop-leather-avatar"),
    coverUrl: img("shop-leather-cover"),
    isHidden: false,
    createdAt: "2026-02-18T10:00:00.000Z",
  },
  {
    id: "s-home",
    ownerId: "u-oksana",
    slug: "pletyvo",
    name: "Плетиво",
    tagline: "Макраме та лозоплетіння для затишного дому",
    story:
      "Оксана плете панно й кашпо з бавовняного шнура, а кошики — з верболозу, який сама заготовляє на Київщині навесні. Кожен кошик вимочується, обдирається та плететься кілька днів, зате прослужить довше за будь-який пластиковий.",
    regionSlug: "kyiv",
    city: "Васильків",
    avatarUrl: img("shop-home-avatar"),
    coverUrl: img("shop-home-cover"),
    isHidden: false,
    createdAt: "2026-02-22T10:00:00.000Z",
  },
];

interface DemoProductSeed {
  id: string;
  shopId: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  materials: string[];
  price: number; // UAH
  compareAt?: number; // UAH
  stock: number;
  images: string[];
  tags: string[];
  featured?: boolean;
  status?: ProductStatus;
  daysAgo: number;
}

const seeds: DemoProductSeed[] = [
  // --- Глиняний дім -------------------------------------------------------
  {
    id: "p-mug-white", shopId: "s-ceramics", slug: "chashka-ranok-molochna", title: "Чашка «Ранок» молочно-біла",
    description: "Чашка на 300 мл із червоної глини, вкрита молочною глазур'ю з легким крапом. Товсті стінки довго тримають тепло, а широка ручка зручна навіть у рукавицях на балконі. Можна мити в посудомийці.",
    category: "ceramics", materials: ["clay"], price: 540, stock: 12, images: ["mug-white-1", "mug-white-2"], tags: ["чашка", "кава", "глазур"], featured: true, daysAgo: 3,
  },
  {
    id: "p-bowls-set", shopId: "s-ceramics", slug: "nabir-pial-rizhnokolorovykh", title: "Набір із 6 піал «Палітра»",
    description: "Шість піал по 250 мл у різних глазурях: теракота, шавлія, вівсянка, небо, слива, пісок. Ідеальні для сніданків, соусів і морозива. Кожна піала виточена на крузі й розписана вручну.",
    category: "ceramics", materials: ["clay"], price: 2400, compareAt: 2800, stock: 4, images: ["bowls-set-1", "bowls-set-2"], tags: ["піали", "набір", "подарунок"], featured: true, daysAgo: 12,
  },
  {
    id: "p-mug-blue", shopId: "s-ceramics", slug: "horniatko-indyho", title: "Горнятко «Індиго» 350 мл",
    description: "Велике горнятко для чаю або какао з матовою глазур'ю кольору індиго. Усередині — глянцева біла емаль, щоб було видно колір напою. Висота 10 см.",
    category: "ceramics", materials: ["clay"], price: 620, stock: 7, images: ["mug-blue-1"], tags: ["горнятко", "чай", "синій"], daysAgo: 20,
  },
  {
    id: "p-mug-mustard", shopId: "s-ceramics", slug: "chashka-hirchytsia", title: "Чашка «Гірчиця» з написом",
    description: "Сонячна чашка на 320 мл із тисненим написом happiness. Глазур насиченого гірчичного кольору, ручка підкреслено масивна. Чудова пара до набору піал «Палітра».",
    category: "ceramics", materials: ["clay"], price: 580, stock: 9, images: ["mug-mustard-1", "mug-mustard-2"], tags: ["чашка", "жовтий", "напис"], daysAgo: 8,
  },
  {
    id: "p-vases-sand", shopId: "s-ceramics", slug: "vazy-pisok-nabir", title: "Набір ваз «Пісок», 3 шт.",
    description: "Три матові вази різної висоти (12, 16 і 20 см) у теплих пісочних відтінках. Створені для сухоцвітів і однієї-двох живих гілок. Неглазуровані зовні — фактура глини відчувається на дотик.",
    category: "ceramics", materials: ["clay"], price: 1850, stock: 3, images: ["vases-sand-1", "vases-sand-2"], tags: ["ваза", "декор", "сухоцвіти"], featured: true, daysAgo: 30,
  },
  {
    id: "p-vase-black", shopId: "s-ceramics", slug: "vaza-pliashka-chorna", title: "Ваза-пляшка чорна",
    description: "Лаконічна ваза з вузьким горлом, вкрита чорною матовою глазур'ю. Висота 22 см. Тримає одну виразну гілку — евкаліпт, вербу або сухий соняшник.",
    category: "ceramics", materials: ["clay"], price: 980, stock: 5, images: ["vase-black-1"], tags: ["ваза", "чорний", "мінімалізм"], daysAgo: 45,
  },
  {
    id: "p-bowls-grey", shopId: "s-ceramics", slug: "mysky-tuman-nabir", title: "Миски «Туман», набір із 3",
    description: "Глибокі миски по 500 мл для супів і салатів у сіро-блакитних глазурях. Стійкі, з потовщеним денцем. Можна ставити в духовку до 220 °C.",
    category: "ceramics", materials: ["clay"], price: 1350, stock: 6, images: ["bowls-grey-1"], tags: ["миска", "посуд", "кухня"], daysAgo: 60,
  },
  {
    id: "p-vase-teal", shopId: "s-ceramics", slug: "vaza-krapelka-biriuza", title: "Ваза «Крапелька» бірюзова",
    description: "Маленька ваза висотою 14 см із глянцевою бірюзовою глазур'ю, що переливається на світлі. Для однієї квітки на письмовому столі або підвіконні.",
    category: "ceramics", materials: ["clay", "glass"], price: 720, stock: 0, images: ["vase-teal-1"], tags: ["ваза", "бірюза", "подарунок"], daysAgo: 70,
  },
  {
    id: "p-mug-dots", shopId: "s-ceramics", slug: "horniatko-konfeti", title: "Горнятко «Конфеті»",
    description: "Біле горнятко на 280 мл із кольоровим крапом, що з'являється при випалі — малюнок у кожного свій. Ідеально для ранкової кави з молоком.",
    category: "ceramics", materials: ["porcelain"], price: 490, stock: 15, images: ["mug-dots-1"], tags: ["горнятко", "крап", "кава"], daysAgo: 5,
  },
  {
    id: "p-cups-set", shopId: "s-ceramics", slug: "chashky-dlia-espresso-nabir", title: "Чашки для еспресо, 4 шт.",
    description: "Чотири маленькі чашки по 90 мл без ручок — тримати їх у долонях приємно й тепло. Молочна глазур із золотавою смужкою на вінцях.",
    category: "ceramics", materials: ["clay"], price: 1100, stock: 8, images: ["cups-set-1"], tags: ["еспресо", "кава", "набір"], daysAgo: 15,
  },

  // --- Срібна нитка -------------------------------------------------------
  {
    id: "p-earrings-drop", shopId: "s-jewelry", slug: "serezhky-krapla-sriblo", title: "Сережки «Крапля» зі срібла",
    description: "Витягнуті сережки-краплі зі срібла 925 проби з полірованою поверхнею. Довжина 4 см, вага пари 3,2 г. Застібка — англійська, надійна для щоденного носіння.",
    category: "jewelry", materials: ["silver"], price: 1450, stock: 6, images: ["earrings-drop-1", "earrings-drop-2"], tags: ["сережки", "срібло", "мінімалізм"], featured: true, daysAgo: 4,
  },
  {
    id: "p-earrings-leaf", shopId: "s-jewelry", slug: "serezhky-lystia", title: "Сережки «Листя» ажурні",
    description: "Ажурні сережки у формі листя з чорненого срібла з фіанітами. Довжина 5,5 см — для вечірнього виходу або вишиванки на свято.",
    category: "jewelry", materials: ["silver", "stone"], price: 2300, compareAt: 2650, stock: 3, images: ["earrings-leaf-1"], tags: ["сережки", "ажур", "вечірні"], daysAgo: 18,
  },
  {
    id: "p-earrings-turquoise", shopId: "s-jewelry", slug: "serezhky-z-biriuzoiu", title: "Сережки з бірюзою в латуні",
    description: "Квіткові сережки з натуральною бірюзою в латунній оправі ручного кування. Латунь із часом темніє й набуває теплого патинованого вигляду.",
    category: "jewelry", materials: ["brass", "stone"], price: 1200, stock: 5, images: ["earrings-turquoise-1"], tags: ["сережки", "бірюза", "латунь"], daysAgo: 25,
  },
  {
    id: "p-earrings-hoops", shopId: "s-jewelry", slug: "serezhky-kiltsia-krucheni", title: "Сережки-кільця кручені",
    description: "Класичні кільця діаметром 2,5 см із кручених срібних дротів. Легкі (2 г пара), не відтягують мочку, личать до всього.",
    category: "jewelry", materials: ["silver"], price: 1050, stock: 10, images: ["earrings-hoops-1"], tags: ["кільця", "срібло", "щодня"], daysAgo: 9,
  },
  {
    id: "p-necklace-pearl", shopId: "s-jewelry", slug: "namysto-khvylia-sriblo", title: "Намисто «Хвиля» з срібла та перлів",
    description: "Масивне намисто-комір із срібних пластин і дрібних річкових перлів. Довжина 42 см із подовжувачем. Прикраса для весілля, випускного або просто гарного вечора.",
    category: "jewelry", materials: ["silver", "stone"], price: 6800, stock: 1, images: ["necklace-pearl-1"], tags: ["намисто", "перли", "весілля"], featured: true, daysAgo: 40,
  },
  {
    id: "p-bracelet-stone", shopId: "s-jewelry", slug: "braslet-z-amazonitom", title: "Браслет з амазонітом",
    description: "Браслет із широкою латунною основою та великим кабошоном амазоніту м'ятного кольору. Регулюється під зап'ястя 15–18 см.",
    category: "jewelry", materials: ["brass", "stone"], price: 1750, stock: 2, images: ["bracelet-stone-1"], tags: ["браслет", "камінь", "латунь"], daysAgo: 55,
  },
  {
    id: "p-earrings-crystal", shopId: "s-jewelry", slug: "serezhky-veselka-krystaly", title: "Сережки «Веселка» з кристалами",
    description: "Святкові сережки з гранованими кристалами рожевого та бузкового кольорів у срібній оправі. Довжина 6 см, із замком-гачком.",
    category: "jewelry", materials: ["silver", "glass"], price: 1900, stock: 4, images: ["earrings-crystal-1"], tags: ["сережки", "кристали", "свято"], daysAgo: 2,
  },
  {
    id: "p-bracelet-beads", shopId: "s-jewelry", slug: "braslet-z-biseru-lito", title: "Браслет із бісеру «Літо»",
    description: "Тонкий браслет, сплетений із японського бісеру в зелено-блакитній гамі з квітковим візерунком. Довжина 17 см, застібка — срібний карабін.",
    category: "jewelry", materials: ["glass", "silver"], price: 650, stock: 14, images: ["bracelet-beads-1"], tags: ["браслет", "бісер", "літо"], daysAgo: 11,
  },

  // --- Льон і Сон ---------------------------------------------------------
  {
    id: "p-pillow-terracotta", shopId: "s-linen", slug: "navolochka-lniana-terakota", title: "Наволочка лляна «Теракота» 50×50",
    description: "Декоративна наволочка зі зм'якшеного льону теракотового кольору. Прихована блискавка, подвійні шви. Подушка-вкладка не входить у комплект.",
    category: "textile", materials: ["linen"], price: 690, stock: 20, images: ["pillow-terracotta-1", "pillow-terracotta-2", "pillow-terracotta-3"], tags: ["наволочка", "льон", "теракота"], featured: true, daysAgo: 6,
  },
  {
    id: "p-bedding-grey", shopId: "s-linen", slug: "postil-lniana-sira-dvospalna", title: "Постільна білизна лляна сіра, двоспальна",
    description: "Комплект: підковдра 200×220, простирадло 220×240 та дві наволочки 50×70. Льон попередньо випраний — м'який із першої ночі та стає ніжнішим із кожним пранням.",
    category: "textile", materials: ["linen"], price: 5900, compareAt: 6500, stock: 3, images: ["bedding-grey-1", "bedding-grey-2"], tags: ["постіль", "льон", "спальня"], featured: true, daysAgo: 22,
  },
  {
    id: "p-pouf", shopId: "s-linen", slug: "podushka-puf-kruhla-bezh", title: "Подушка-пуф кругла бежева",
    description: "Велика кругла подушка діаметром 45 см зі збірками, наповнена холофайбером. На підлогу, диван або у дитячу — як сидіння для читання.",
    category: "textile", materials: ["cotton", "linen"], price: 1450, stock: 5, images: ["pouf-1"], tags: ["подушка", "пуф", "декор"], daysAgo: 35,
  },
  {
    id: "p-pillow-tassels", shopId: "s-linen", slug: "podushka-z-kytytsiamy-bila", title: "Подушка з китицями біла",
    description: "Біла лляна подушка 45×45 з китицями по кутах, у комплекті з гіпоалергенною вкладкою. Створює той самий відчутний «готельний» затишок.",
    category: "textile", materials: ["linen"], price: 890, stock: 11, images: ["pillow-tassels-1", "pillow-tassels-2"], tags: ["подушка", "китиці", "білий"], daysAgo: 14,
  },
  {
    id: "p-towels", shopId: "s-linen", slug: "rushnyky-lniani-nabir-3", title: "Набір лляних рушників, 3 шт.",
    description: "Три кухонні рушники 50×70 у натуральних відтінках: небілений льон, сірий і блакитний. Швидко сохнуть, не залишають ворсу на келихах.",
    category: "textile", materials: ["linen"], price: 780, stock: 16, images: ["towels-1"], tags: ["рушник", "кухня", "льон"], daysAgo: 28,
  },

  // --- Тепло в'язане ------------------------------------------------------
  {
    id: "p-blanket-cream", shopId: "s-knit", slug: "pled-hruboi-viazky-molochnyi", title: "Плед грубої в'язки молочний 130×170",
    description: "Плед із товстої мериносової пряжі, зв'язаний руками без спиць. Важкий, теплий і дуже фотогенічний. Чистити сухим способом або делікатно вручну.",
    category: "textile", materials: ["wool"], price: 4200, stock: 4, images: ["blanket-cream-1", "blanket-cream-2", "blanket-cream-3"], tags: ["плед", "вовна", "в'язання"], featured: true, daysAgo: 7,
  },
  {
    id: "p-blanket-mustard", shopId: "s-knit", slug: "pled-hirchychnyi-kosy", title: "Плед «Коси» гірчичний",
    description: "Плед 120×160 із візерунком «коси», зв'язаний спицями з напіввовни. Пофарбований цибулинням — колір теплий і нерівномірний, як справжнє осіннє листя.",
    category: "textile", materials: ["wool"], price: 3600, stock: 2, images: ["blanket-mustard-1"], tags: ["плед", "гірчиця", "осінь"], daysAgo: 19,
  },
  {
    id: "p-blanket-blue", shopId: "s-knit", slug: "pled-yahoda-synii", title: "Плед «Ягода» темно-синій",
    description: "Щільний плед 140×180 із рельєфним візерунком. Темно-синя вовна з Карпат, пофарбована чорницею й індиго. Для холодних вечорів на веранді.",
    category: "textile", materials: ["wool"], price: 4500, stock: 3, images: ["blanket-blue-1"], tags: ["плед", "синій", "вовна"], daysAgo: 33,
  },
  {
    id: "p-blankets-set", shopId: "s-knit", slug: "pledy-dytiachi-nabir", title: "Дитячі пледи, набір із 3",
    description: "Три м'які пледи 80×100 для немовлят у кольорах морської хвилі, вівсянки та графіту. Пряжа — мериносова, гіпоалергенна, не колеться.",
    category: "textile", materials: ["wool", "cotton"], price: 3900, compareAt: 4400, stock: 2, images: ["blankets-set-1"], tags: ["плед", "дитячий", "набір"], daysAgo: 50,
  },
  {
    id: "p-snood", shopId: "s-knit", slug: "snud-karamel", title: "Шарф-снуд «Карамель»",
    description: "Об'ємний снуд у два оберти з товстої вовняної пряжі карамельного кольору. Дуже теплий, не колеться, добре тримає форму.",
    category: "textile", materials: ["wool"], price: 1150, stock: 9, images: ["snood-1"], tags: ["снуд", "шарф", "зима"], daysAgo: 10,
  },
  {
    id: "p-sweater", shopId: "s-knit", slug: "svetr-oversaiz-bezh", title: "Светр оверсайз бежевий",
    description: "Светр вільного крою з натуральної небіленої вовни. В'яжеться під замовлення за вашими мірками за 10–14 днів. Розміри S–XL.",
    category: "textile", materials: ["wool"], price: 3200, stock: 5, images: ["sweater-1"], tags: ["светр", "оверсайз", "вовна"], daysAgo: 1,
  },

  // --- Вишивана -----------------------------------------------------------
  {
    id: "p-hoop-wreath", shopId: "s-embroidery", slug: "vyshyvka-vinok-u-pialtsiakh", title: "Вишивка «Вінок» у п'яльцях",
    description: "Квітковий вінок, вишитий гладдю на небіленому льоні, у дерев'яних п'яльцях діаметром 20 см. Готова до того, щоб повісити на стіну, — петелька ззаду.",
    category: "art", materials: ["linen", "cotton"], price: 1250, stock: 3, images: ["hoop-wreath-1", "hoop-wreath-2"], tags: ["вишивка", "панно", "квіти"], featured: true, daysAgo: 13,
  },
  {
    id: "p-hoop-flowers", shopId: "s-embroidery", slug: "vyshyvka-polovi-kvity-oval", title: "Вишивка «Польові квіти», овал",
    description: "Букет польових квітів у овальних п'яльцях 16×22 см. Вишито муліне в понад 20 відтінках за авторською схемою Галини.",
    category: "art", materials: ["linen", "cotton"], price: 1400, stock: 2, images: ["hoop-flowers-1"], tags: ["вишивка", "польові", "овал"], daysAgo: 26,
  },
  {
    id: "p-hoop-poppy", shopId: "s-embroidery", slug: "vyshyvka-mak-i-volosheky", title: "Вишивка «Мак і волошки»",
    description: "Яскраве панно з маком і волошками в п'яльцях 18 см. Поєднання гладі та французьких вузликів дає об'єм, який хочеться торкнутися.",
    category: "art", materials: ["linen", "cotton"], price: 1300, stock: 4, images: ["hoop-poppy-1"], tags: ["вишивка", "мак", "волошки"], daysAgo: 38,
  },
  {
    id: "p-embroidery-kit", shopId: "s-embroidery", slug: "nabir-dlia-vyshyvannia-pochatkivtsia", title: "Набір для вишивання «Перший вечір»",
    description: "Усе для першої роботи: п'яльця 15 см, лляна основа з нанесеним малюнком, муліне 8 кольорів, голки, ножиці та ілюстрована інструкція українською.",
    category: "art", materials: ["linen", "cotton"], price: 790, stock: 25, images: ["embroidery-kit-1"], tags: ["набір", "вишивання", "початківець"], daysAgo: 16,
  },
  {
    id: "p-hoop-sunflower", shopId: "s-embroidery", slug: "vyshyvka-soniakhy", title: "Вишивка «Соняхи» в п'яльцях",
    description: "Жовті соняхи на блакитному тлі — панно в п'яльцях 20 см. Вишито об'ємною гладдю; у центрі квітки — французькі вузлики.",
    category: "art", materials: ["linen", "cotton"], price: 1350, stock: 3, images: ["hoop-sunflower-1"], tags: ["вишивка", "соняхи", "україна"], daysAgo: 48,
  },

  // --- Дубова лавка -------------------------------------------------------
  {
    id: "p-board-handle", shopId: "s-wood", slug: "doshka-dubova-z-ruchkoiu", title: "Дошка дубова з ручкою",
    description: "Сервірувальна дошка з цільного дуба, 45×20 см, з ручкою й отвором для підвішування. Просочена лляною олією з бджолиним воском — безпечна для їжі.",
    category: "wood", materials: ["oak"], price: 890, stock: 10, images: ["board-handle-1", "board-handle-2"], tags: ["дошка", "дуб", "кухня"], featured: true, daysAgo: 5,
  },
  {
    id: "p-board-round", shopId: "s-wood", slug: "doshka-krugla-yasen", title: "Дошка кругла з ясена",
    description: "Кругла дошка діаметром 30 см для сиру, хліба й піци. Ясен має виразну текстуру і не вбирає запахи при належному догляді.",
    category: "wood", materials: ["ash"], price: 750, stock: 7, images: ["board-round-1", "board-round-2"], tags: ["дошка", "ясен", "сир"], daysAgo: 17,
  },
  {
    id: "p-board-endgrain", shopId: "s-wood", slug: "doshka-tortseva-velyka", title: "Дошка торцева велика",
    description: "Професійна торцева дошка 50×35×4 см із дуба та горіха. Волокна розташовані вертикально, тому ніж не тупиться, а сліди від порізів «затягуються».",
    category: "wood", materials: ["oak", "walnut"], price: 3400, stock: 2, images: ["board-endgrain-1", "board-endgrain-2"], tags: ["дошка", "торцева", "шеф"], featured: true, daysAgo: 29,
  },
  {
    id: "p-boards-set", shopId: "s-wood", slug: "doshky-nabir-3-dub", title: "Набір дубових дощок, 3 шт.",
    description: "Три дошки різного розміру (40×25, 32×20, 25×15 см) з дуба для м'яса, овочів і хліба. Кожна з виїмкою для соку та шкіряним шнурком.",
    category: "wood", materials: ["oak", "leather"], price: 1950, compareAt: 2250, stock: 4, images: ["boards-set-1", "boards-set-2"], tags: ["дошка", "набір", "дуб"], daysAgo: 42,
  },
  {
    id: "p-spoon-walnut", shopId: "s-wood", slug: "lozhka-rizblena-horikh", title: "Ложка різьблена з горіха",
    description: "Велика кухарська ложка 30 см, вирізана з одного шматка горіха. Не дряпає антипригарне покриття, не нагрівається, з роками стає лише темнішою й красивішою.",
    category: "wood", materials: ["walnut"], price: 420, stock: 18, images: ["spoon-walnut-1", "spoon-walnut-2"], tags: ["ложка", "горіх", "кухня"], daysAgo: 8,
  },
  {
    id: "p-spoons-set", shopId: "s-wood", slug: "lozhky-nabir-6-riznykh", title: "Набір із 6 ложок різних порід",
    description: "Шість ложок із дуба, ясена, горіха, вишні, яблуні та груші — у кожної свій колір і текстура. Чудовий подарунок тому, хто любить готувати.",
    category: "wood", materials: ["oak", "ash", "walnut"], price: 1600, stock: 5, images: ["spoons-set-1", "spoons-set-2"], tags: ["ложки", "набір", "подарунок"], daysAgo: 24,
  },
  {
    id: "p-toy-rocket", shopId: "s-wood", slug: "ihrashka-raketa-konstruktor", title: "Іграшка-конструктор «Ракета»",
    description: "Дерев'яна ракета з 8 деталей, що складаються в різній послідовності. Для дітей від 3 років. Шліфована, без лаку, просочена харчовою олією.",
    category: "wood", materials: ["ash"], price: 650, stock: 12, images: ["toy-rocket-1"], tags: ["іграшка", "ракета", "конструктор"], daysAgo: 21,
  },
  {
    id: "p-toy-pyramid", shopId: "s-wood", slug: "piramidka-kolorova-veselka", title: "Пірамідка «Веселка»",
    description: "Пірамідка з 7 кілець, пофарбованих водними барвниками, безпечними для дітей. Висота 20 см. Розвиває моторику й уявлення про розмір і колір.",
    category: "wood", materials: ["ash"], price: 580, stock: 9, images: ["toy-pyramid-1", "toy-pyramid-2"], tags: ["пірамідка", "дитяча", "кольори"], daysAgo: 36,
  },
  {
    id: "p-toy-animals", shopId: "s-wood", slug: "tvarynky-dereviani-nabir", title: "Дерев'яні тваринки, набір із 4",
    description: "Ведмідь, зайчик, лисиця та олень із натурального бука без фарбування. Висота фігурок 6–8 см. Для гри, казок і сортування.",
    category: "wood", materials: ["oak"], price: 720, stock: 6, images: ["toy-animals-1"], tags: ["тваринки", "іграшка", "дерево"], daysAgo: 53,
  },
  {
    id: "p-toy-clown", shopId: "s-wood", slug: "kloun-dereviana-ihrashka", title: "Клоун — дерев'яна іграшка-штовхалка",
    description: "Класична іграшка з червоною шапочкою на коліщатках: котиться, кланяється й усміхається. Фарби на водній основі, усе шліфоване вручну.",
    category: "wood", materials: ["ash"], price: 540, stock: 0, images: ["toy-clown-1"], tags: ["клоун", "іграшка", "ретро"], daysAgo: 65,
  },

  // --- Теплий віск --------------------------------------------------------
  {
    id: "p-candle-amber", shopId: "s-candles", slug: "svichka-soieva-lypa-bursztyn", title: "Соєва свічка «Липа» в бурштиновій банці",
    description: "Свічка 200 мл із соєвого воску з ароматом липового цвіту та меду. Бавовняний ґніт, горить до 45 годин. Банку можна повернути й отримати знижку 10 %.",
    category: "candles", materials: ["soy-wax", "glass"], price: 480, stock: 30, images: ["candle-amber-1", "candle-amber-2", "candle-amber-3"], tags: ["свічка", "соєва", "липа"], featured: true, daysAgo: 4,
  },
  {
    id: "p-candle-concrete", shopId: "s-candles", slug: "svichka-u-betoni-polyn", title: "Свічка в бетонній склянці «Полин»",
    description: "Соєва свічка з гірким ароматом степового полину й шавлії у склянці з бетону ручного лиття. Після вигорання — підставка або горщик для сукулента.",
    category: "candles", materials: ["soy-wax"], price: 620, stock: 8, images: ["candle-concrete-1"], tags: ["свічка", "бетон", "полин"], daysAgo: 19,
  },
  {
    id: "p-candles-set", shopId: "s-candles", slug: "svichky-nabir-vechir-3", title: "Набір свічок «Вечір», 3 шт.",
    description: "Три свічки по 100 мл у чорних банках: «Кава з кардамоном», «Тютюн і ваніль», «Дим багаття». Для тих, хто любить затишні вечори.",
    category: "candles", materials: ["soy-wax", "glass"], price: 980, compareAt: 1140, stock: 12, images: ["candles-set-1", "candles-set-2"], tags: ["свічки", "набір", "вечір"], featured: true, daysAgo: 11,
  },
  {
    id: "p-candle-flowers", shopId: "s-candles", slug: "svichka-z-sukhotsvitamy", title: "Свічка з сухоцвітами «Лука»",
    description: "Соєва свічка 250 мл із сухоцвітами на поверхні: волошка, календула, ромашка. Аромат свіжоскошеної трави. Декоративна, краще не залишати без нагляду.",
    category: "candles", materials: ["soy-wax", "glass"], price: 560, stock: 7, images: ["candle-flowers-1"], tags: ["свічка", "сухоцвіти", "лука"], daysAgo: 27,
  },
  {
    id: "p-tealights", shopId: "s-candles", slug: "svichky-tabletky-nabir-12", title: "Чайні свічки з бджолиного воску, 12 шт.",
    description: "Дванадцять чайних свічок із натурального бджолиного воску без ароматизаторів. Горять по 4 години, пахнуть медом і трохи очищують повітря.",
    category: "candles", materials: ["beeswax"], price: 390, stock: 40, images: ["tealights-1"], tags: ["чайні", "бджолиний віск", "набір"], daysAgo: 34,
  },
  {
    id: "p-pillars", shopId: "s-candles", slug: "svichky-stovpchyky-nabir", title: "Свічки-стовпчики, набір із 3",
    description: "Три свічки різної висоти (8, 12 і 15 см) із соєвого воску кольору слонової кістки. Без аромату — для столу, вікна й ванної.",
    category: "candles", materials: ["soy-wax"], price: 720, stock: 6, images: ["pillars-1"], tags: ["стовпчики", "декор", "стіл"], daysAgo: 46,
  },
  {
    id: "p-candle-mint", shopId: "s-candles", slug: "svichka-miata-i-more", title: "Свічка «М'ята і море»",
    description: "Бірюзова соєва свічка 180 мл з ароматом м'яти, солоного бризу та евкаліпта. Та сама Одеса після дощу. У комплекті — сірники.",
    category: "candles", materials: ["soy-wax", "glass"], price: 450, stock: 0, images: ["candle-mint-1"], tags: ["свічка", "м'ята", "море"], daysAgo: 58,
  },

  // --- Акварельний двір ---------------------------------------------------
  {
    id: "p-aquarelle-venice", shopId: "s-art", slug: "akvarel-mist-u-venetsii", title: "Акварель «Міст у Венеції»",
    description: "Оригінальна акварель 30×40 см на бавовняному папері 300 г. Вечірнє світло на каналі, написане з натури. Підпис автора, паспарту в комплекті.",
    category: "art", materials: ["paper"], price: 4200, stock: 1, images: ["aquarelle-venice-1"], tags: ["акварель", "оригінал", "венеція"], featured: true, daysAgo: 9,
  },
  {
    id: "p-aquarelle-garden", shopId: "s-art", slug: "akvarel-litnii-sad", title: "Акварель «Літній сад»",
    description: "Сонячний сад із пленеру під Харковом, 28×38 см. Світло крізь листя, тіні на доріжці — та сама легкість, за яку люблять акварель.",
    category: "art", materials: ["paper"], price: 3600, stock: 1, images: ["aquarelle-garden-1"], tags: ["акварель", "сад", "літо"], daysAgo: 23,
  },
  {
    id: "p-aquarelle-tulips", shopId: "s-art", slug: "akvarel-tiulpany", title: "Акварель «Тюльпани»",
    description: "Ніжний натюрморт із тюльпанами, 24×32 см. Виконаний «по-мокрому», тому пелюстки виглядають напівпрозорими. Чудово підійде для спальні.",
    category: "art", materials: ["paper"], price: 2800, stock: 1, images: ["aquarelle-tulips-1"], tags: ["акварель", "тюльпани", "квіти"], daysAgo: 31,
  },
  {
    id: "p-aquarelle-fox", shopId: "s-art", slug: "prynt-lys-akvarel", title: "Принт «Лис» з акварелі",
    description: "Жикле-принт акварельного лиса на матовому папері 21×30 см. Тираж 50 примірників, кожен підписаний і пронумерований. Ідеальний у дитячу.",
    category: "art", materials: ["paper"], price: 650, stock: 22, images: ["aquarelle-fox-1"], tags: ["принт", "лис", "дитяча"], featured: true, daysAgo: 6,
  },
  {
    id: "p-aquarelle-pines", shopId: "s-art", slug: "akvarel-sosny-nad-ozerom", title: "Акварель «Сосни над озером»",
    description: "Пейзаж із соснами над тихим озером, 30×40 см. Прохолодні сині та зелені — для кабінету або вітальні в спокійних тонах.",
    category: "art", materials: ["paper"], price: 3900, stock: 1, images: ["aquarelle-pines-1"], tags: ["акварель", "пейзаж", "озеро"], daysAgo: 44,
  },
  {
    id: "p-print-shapes", shopId: "s-art", slug: "prynt-formy-abstraktsiia", title: "Принт «Форми» абстрактний",
    description: "Мінімалістичний принт у теплих відтінках охри та графіту, 30×40 см. Друк на щільному папері 250 г. Рамка на фото не входить у комплект.",
    category: "art", materials: ["paper"], price: 550, stock: 30, images: ["print-shapes-1"], tags: ["принт", "абстракція", "мінімалізм"], daysAgo: 15,
  },
  {
    id: "p-print-wave", shopId: "s-art", slug: "prynt-khvylia-kolir", title: "Принт «Хвиля» кольоровий",
    description: "Яскравий принт із широкими мазками рожевого, жовтого та синього, 40×50 см. Для тих, кому бракує кольору в інтер'єрі.",
    category: "art", materials: ["paper"], price: 700, stock: 18, images: ["print-wave-1"], tags: ["принт", "колір", "мазки"], daysAgo: 37,
  },

  // --- Ремінь -------------------------------------------------------------
  {
    id: "p-wallet-brown", shopId: "s-leather", slug: "hamanets-klasychnyi-koniak", title: "Гаманець класичний «Коньяк»",
    description: "Гаманець-біфолд зі шкіри рослинного дублення кольору коньяку. 6 відділень для карток, 2 для купюр, кишеня для монет. Шов сідельний, ручний.",
    category: "leather", materials: ["leather"], price: 1900, stock: 6, images: ["wallet-brown-1", "wallet-brown-2"], tags: ["гаманець", "шкіра", "коньяк"], featured: true, daysAgo: 7,
  },
  {
    id: "p-cardholder", shopId: "s-leather", slug: "kartkholder-minimalist", title: "Картхолдер мінімалістичний",
    description: "Тонкий картхолдер на 4–6 карток і кілька складених купюр. Шкіра товщиною 1,4 мм, із часом набуває патини й форми ваших карток.",
    category: "leather", materials: ["leather"], price: 750, stock: 20, images: ["cardholder-1"], tags: ["картхолдер", "шкіра", "мінімалізм"], daysAgo: 12,
  },
  {
    id: "p-wallet-black", shopId: "s-leather", slug: "hamanets-chornyi-slim", title: "Гаманець чорний Slim",
    description: "Компактний чорний гаманець із гладкої шкіри: 4 слоти для карток, відділення для купюр без підкладки. Товщина порожнього — 8 мм.",
    category: "leather", materials: ["leather"], price: 1600, stock: 8, images: ["wallet-black-1", "wallet-black-2"], tags: ["гаманець", "чорний", "slim"], daysAgo: 26,
  },
  {
    id: "p-bag-satchel", shopId: "s-leather", slug: "sumka-portfel-vintazh", title: "Сумка-портфель «Вінтаж»",
    description: "Портфель із товстої шкіри 2,5 мм з двома відділеннями, під ноутбук 15\". Латунна фурнітура, регульований ремінь. На шви — довічна гарантія.",
    category: "leather", materials: ["leather", "brass"], price: 7800, stock: 2, images: ["bag-satchel-1", "bag-satchel-2"], tags: ["сумка", "портфель", "ноутбук"], featured: true, daysAgo: 39,
  },
  {
    id: "p-bag-tote", shopId: "s-leather", slug: "sumka-shoper-shkiriana", title: "Сумка-шопер шкіряна",
    description: "Містка сумка-шопер із м'якої шкіри кольору карамелі, без підкладки, з внутрішньою кишенею. Вміщує ноутбук 13\" і все на день.",
    category: "leather", materials: ["leather"], price: 4900, stock: 3, images: ["bag-tote-1"], tags: ["шопер", "сумка", "карамель"], daysAgo: 2,
  },
  {
    id: "p-bag-backpack", shopId: "s-leather", slug: "riukzak-shkirianyi-z-klapanom", title: "Рюкзак шкіряний з клапаном",
    description: "Міський рюкзак на 15 л із цільної шкіри та підкладкою з бавовни. Клапан на латунному замку, зовнішня кишеня, регульовані лямки.",
    category: "leather", materials: ["leather", "cotton", "brass"], price: 8900, compareAt: 9800, stock: 1, images: ["bag-backpack-1"], tags: ["рюкзак", "шкіра", "місто"], daysAgo: 51,
  },

  // --- Плетиво ------------------------------------------------------------
  {
    id: "p-macrame-wall", shopId: "s-home", slug: "panno-makrame-pir-ya", title: "Панно макраме «Пір'я»",
    description: "Настінне панно з бавовняного шнура на дерев'яній гілці, 60×80 см. Сплетене вручну, кожна китиця розчесана. Робить порожню стіну теплою за хвилину.",
    category: "home", materials: ["cotton", "oak"], price: 1900, stock: 4, images: ["macrame-wall-1", "macrame-wall-2"], tags: ["макраме", "панно", "стіна"], featured: true, daysAgo: 10,
  },
  {
    id: "p-macrame-planter", shopId: "s-home", slug: "kashpo-makrame-pidvisne", title: "Кашпо макраме підвісне",
    description: "Підвісне кашпо з бавовняного шнура довжиною 90 см для горщика діаметром до 18 см. Горщик і рослина на фото — для прикладу.",
    category: "home", materials: ["cotton"], price: 520, stock: 15, images: ["macrame-planter-1", "macrame-planter-2"], tags: ["кашпо", "макраме", "рослини"], daysAgo: 20,
  },
  {
    id: "p-basket-wicker", shopId: "s-home", slug: "koshyk-z-lozy-z-ruchkoiu", title: "Кошик з лози з ручкою",
    description: "Класичний кошик із верболозу, 35×25×20 см, із міцною ручкою. Для пікніка, грибів або хліба на столі. Лоза заготовлена та сплетена вручну.",
    category: "home", materials: ["wicker"], price: 980, stock: 7, images: ["basket-wicker-1", "basket-wicker-2"], tags: ["кошик", "лоза", "пікнік"], featured: true, daysAgo: 16,
  },
  {
    id: "p-basket-fruit", shopId: "s-home", slug: "koshyk-dlia-fruktiv-kruhlyi", title: "Кошик для фруктів круглий",
    description: "Низький круглий кошик діаметром 30 см для фруктів або хліба. Щільне плетіння, рівне дно, не хитається на столі.",
    category: "home", materials: ["wicker"], price: 640, stock: 10, images: ["basket-fruit-1"], tags: ["кошик", "фрукти", "стіл"], daysAgo: 30,
  },
  {
    id: "p-basket-plates", shopId: "s-home", slug: "tarili-pleteni-nastinni-nabir", title: "Плетені тарелі настінні, набір із 4",
    description: "Чотири плетені тарелі діаметром 20–35 см для композиції на стіні. Поєднання лози та джуту дає різну фактуру й відтінки.",
    category: "home", materials: ["wicker", "jute"], price: 1450, stock: 3, images: ["basket-plates-1"], tags: ["тарелі", "стіна", "декор"], daysAgo: 43,
  },
];

const BASE_DATE = new Date("2026-10-16T12:00:00.000Z").getTime();

function isoDaysAgo(days: number): string {
  return new Date(BASE_DATE - days * 86_400_000).toISOString();
}

export const DEMO_PRODUCTS: Product[] = seeds.map((s) => {
  const createdAt = isoDaysAgo(s.daysAgo);
  const palette = (PALETTES[s.images[0]] ?? []).slice(0, 4);
  return {
    id: s.id,
    shopId: s.shopId,
    slug: s.slug,
    title: s.title,
    description: s.description,
    categorySlug: s.category,
    materialSlugs: s.materials,
    price: s.price * 100,
    compareAtPrice: s.compareAt ? s.compareAt * 100 : null,
    stock: s.stock,
    status: s.status ?? "active",
    images: s.images.map((name, i) => ({ id: `${s.id}-img-${i}`, url: img(name), alt: s.title, sortOrder: i })),
    tags: s.tags,
    isFeatured: s.featured ?? false,
    palette,
    colorTags: paletteTags(palette),
    createdAt,
    updatedAt: createdAt,
  };
});
