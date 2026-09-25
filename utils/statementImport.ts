// Импорт операций из PDF-выписки банка.
//
// Файл разбирает сервер (admin-app: /api/public/statements/parse) и присылает
// операции. Здесь — всё, что происходит потом на телефоне: категория по
// названию магазина, понятное имя записи, что отметить к импорту по умолчанию
// и как превратить строки в записи доходов и расходов.

import type { Asset } from '@/hooks/store/types';
import { findCategory, OTHER_CATEGORY_ID, type RecordKind } from '@/constants/categories';

// ---- Ответ сервера (lib/statements/types.ts в admin-app) ----

export type StatementTransactionKind =
  | 'purchase'
  | 'transfer'
  | 'topup'
  | 'cash'
  | 'fee'
  | 'own_transfer'
  | 'refund'
  | 'loan'
  | 'other';

export interface StatementTransaction {
  date: string;
  amount: number;
  currency: string;
  description: string;
  operation: string;
  kind: StatementTransactionKind;
  foreignAmount?: number;
  foreignCurrency?: string;
  fee?: number;
}

export interface StatementResult {
  bank: string;
  bankName: string;
  parser: 'kaspi' | 'halyk' | 'jusan' | 'generic';
  confidence: 'high' | 'medium' | 'low';
  period: { from: string; to: string } | null;
  openingBalance: number | null;
  closingBalance: number | null;
  checks: { id: 'balance'; ok: boolean; expected: number; actual: number }[];
  transactions: StatementTransaction[];
  warnings: string[];
}

// ---- Категории по названию ----

type Rule = [RegExp, string, string?];

/** Магазины и сервисы Казахстана → категория и подкатегория расходов. Порядок важен: первое совпадение. */
const EXPENSE_RULES: Rule[] = [
  [/(GLOVO|WOLT|ЯНДЕКС ЕДА|YANDEX ?EDA|CHOCOFOOD|ДОСТАВКА ЕДЫ)/i, 'food', 'delivery'],
  [/(MAGNUM|SMALL|GALMART|ANVAR|АНВАР|TOIMART|METRO CASH|RAMSTORE|РАМСТОР|SMART ?MARKET|ASTYK|СУПЕРМАРКЕТ|ПРОДУКТ)/i, 'food', 'groceries'],
  [/(CAFE|КАФЕ|COFFEE|КОФЕ|RESTAURANT|РЕСТОРАН|BURGER|KFC|MCDONALD|DODO|PIZZA|ПИЦЦ|DONER|ДОНЕР|SAFIA|STARBUCKS|ШАШЛЫК)/i, 'food', 'eating-out'],
  [/(YANDEX\.?\s?GO|ЯНДЕКС ?ТАКСИ|UBER|INDRIVE|TAXI|ТАКСИ)/i, 'transport', 'taxi'],
  [/(SINOOIL|HELIOS|QAZAQ OIL|GAZPROM|ГАЗПРОМ|КАЗМУНАЙГАЗ|ROYAL PETROL|АЗС|PETROL)/i, 'transport', 'fuel'],
  [/(АВТОМОЙКА|CAR ?WASH)/i, 'transport', 'carwash'],
  [/(ПАРКОВК|ПАРКИНГ|PARKING|АВТОСЕРВИС|ШИНОМОНТАЖ)/i, 'transport', 'car'],
  [/(ONAY|АВТОБУС)/i, 'transport'],
  [/(АПТЕК|APTEKA|PHARM|ФАРМ|БИОСФЕРА)/i, 'medicine', 'pharmacy'],
  [/(CLINIC|КЛИНИК|СТОМАТОЛ|DENTAL|INVITRO|ИНВИТРО|OLYMP|ОЛИМП|МЕДЦЕНТР|MEDICAL)/i, 'medicine', 'doctor'],
  [/(ALSECO|АЛСЕКО|КОММУНАЛ|ЖКХ|ЭНЕРГОСБЫТ|ENERGOSBYT|ВОДОКАНАЛ|ГОРГАЗ|QAZAQGAZ)/i, 'home', 'utilities'],
  [/(KCELL|BEELINE|TELE2|ALTEL|ACTIV)/i, 'connection', 'phone'],
  [/(КАЗАХТЕЛЕКОМ|KAZAKHTELECOM|ALMATEL|АЛМАТЕЛ|ИНТЕРНЕТ|INTERNET)/i, 'connection', 'internet'],
  [/(SULPAK|TECHNODOM|ТЕХНОДОМ|MECHTA|МЕЧТА|ALSER|EVRIKA|WHITE WIND)/i, 'shopping', 'electronics'],
  [/(LC WAIKIKI|ZARA|H&M|DEFACTO|KOTON|COLINS|BERSHKA|ОДЕЖД|ОБУВ)/i, 'shopping', 'clothing'],
  [/(WILDBERRIES|OZON|LAMODA|ALIEXPRESS|TEMU|IKEA|LEROY|FIX ?PRICE|KASPI ?(МАГАЗИН|MAGAZIN))/i, 'shopping', 'other-shopping'],
  [/(NETFLIX|SPOTIFY|YOUTUBE|APPLE\.COM|ITUNES|GOOGLE|OPENAI|CHATGPT|ANTHROPIC|YANDEX ?PLUS|ЯНДЕКС ?ПЛЮС|KINOPOISK)/i, 'entertainment', 'subscriptions'],
  [/(KINOPARK|CINEMAX|CHAPLIN|KINO\.KZ|КИНОТЕАТР|ТЕАТР|TICKETON)/i, 'entertainment', 'cinema'],
  [/(FITNESS|ФИТНЕС|GYM|INVICTUS|WORLD CLASS|БАССЕЙН)/i, 'sport'],
  [/(COURSERA|UDEMY|SKILLBOX|КУРСЫ|ОБУЧЕНИ)/i, 'education', 'courses'],
  [/(ШКОЛ|ДЕТСАД|ДЕТСКИЙ САД|SCHOOL)/i, 'education', 'school'],
  [/(ПОГАШЕНИЕ КРЕДИТА|ПЛАТЕЖ ПО КРЕДИТУ|РАССРОЧК|KASPI RED)/i, 'loans', 'loan'],
  [/(ИПОТЕК|ОТБАСЫ|OTBASY)/i, 'loans', 'mortgage'],
  [/(БЛАГОТВОРИТ|ПОЖЕРТВОВАН|DONATION)/i, 'charity'],
];

/** Поступления → категория доходов. */
const INCOME_RULES: Rule[] = [
  [/(ЗАРПЛАТ|ЗАРАБОТН|ЖАЛАҚЫ|SALARY|ОПЛАТА ТРУДА)/i, 'salary'],
  [/(ПРЕМИ|BONUS)/i, 'bonus'],
  [/(КЕШБ[ЭЕ]К|CASHBACK)/i, 'cashback'],
  [/(ДИВИДЕНД|DIVIDEND)/i, 'investments', 'dividends'],
  [/(ВОЗНАГРАЖДЕНИ|ПРОЦЕНТЫ ПО|INTEREST)/i, 'investments', 'interest'],
];

/** «Айгерим С.», «Иван Петров И.» — перевод человеку или от человека. */
const PERSON = /^\p{Lu}[\p{Ll}'’-]+(?:\s+\p{Lu}[\p{Ll}'’-]+)*\s+\p{Lu}\.$/u;

const REQUIRED_EXPENSES = new Set(['food', 'transport', 'medicine', 'home', 'connection', 'loans', 'education']);
const PASSIVE_INCOMES = new Set(['investments', 'rent', 'cashback']);
const REGULAR = new Set(['salary', 'utilities', 'phone', 'internet', 'subscriptions', 'loan', 'mortgage']);

function match(rules: Rule[], text: string): { category: string; subcategory?: string } | null {
  for (const [re, category, subcategory] of rules) {
    if (re.test(text)) return { category, subcategory };
  }
  return null;
}

export function categorize(tx: StatementTransaction): { kind: RecordKind; category: string; subcategory?: string } {
  const text = `${tx.operation} ${tx.description}`;
  if (tx.amount > 0) {
    const found = match(INCOME_RULES, text);
    if (found) return { kind: 'income', ...found };
    if (PERSON.test(tx.description.trim()) || tx.kind === 'transfer') {
      return { kind: 'income', category: 'transfers', subcategory: 'card' };
    }
    return { kind: 'income', category: OTHER_CATEGORY_ID };
  }
  if (tx.kind === 'fee') return { kind: 'expence', category: 'loans', subcategory: 'bank-fees' };
  const found = match(EXPENSE_RULES, text);
  if (found) return { kind: 'expence', ...found };
  return { kind: 'expence', category: OTHER_CATEGORY_ID };
}

/** Имя записи: у покупки — магазин, у перевода — кому или от кого. */
export function recordName(tx: StatementTransaction): string {
  const description = tx.description.replace(/\s+/g, ' ').trim();
  const clip = (text: string) => (text.length > 60 ? `${text.slice(0, 57)}…` : text);
  if (PERSON.test(description)) return clip(tx.amount > 0 ? `Перевод от ${description}` : `Перевод: ${description}`);
  if (tx.kind === 'cash') return description ? clip(`Снятие наличных · ${description}`) : 'Снятие наличных';
  if (tx.kind === 'fee' && !description) return 'Комиссия банка';
  return clip(description || tx.operation || (tx.amount > 0 ? 'Поступление' : 'Списание'));
}

// ---- Строки предпросмотра ----

export interface ImportRow {
  key: string;
  tx: StatementTransaction;
  kind: RecordKind;
  name: string;
  /** Всегда положительная — направление задаёт kind. */
  amount: number;
  category: string;
  subcategory?: string;
  selected: boolean;
  /** Почему строка не отмечена по умолчанию — показываем под ней. */
  note?: string;
}

const CURRENCY_CODES: Record<string, string> = { '₸': 'KZT', $: 'USD', '€': 'EUR', '₽': 'RUB' };

/** Дата записи в приложении как YYYY-MM-DD в местном времени. */
function localDay(value: Date | string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function skipReason(tx: StatementTransaction, userCurrency: string): string | undefined {
  if (tx.kind === 'own_transfer') return 'Перевод между своими счетами — не доход и не расход';
  if (tx.kind === 'loan') return 'Зачисление кредита — это не доход';
  if (tx.kind === 'refund') return 'Возврат покупки';
  if (tx.kind === 'cash') return 'Снятие наличных — деньги остались у вас';
  // Чаще всего это свои деньги со своей же карты — в доходах они исказят картину.
  if (tx.amount > 0 && /с карты другого банка/i.test(tx.description)) return 'Если это ваша карта в другом банке — это не доход';
  if (tx.currency !== userCurrency) return `Операция в ${tx.currency}, а учёт у вас в ${userCurrency}`;
  return undefined;
}

export function buildRows(
  result: StatementResult,
  existing: { incomes: Asset[]; expences: Asset[] },
  currencySymbol: string
): ImportRow[] {
  const userCurrency = CURRENCY_CODES[currencySymbol] ?? 'KZT';

  // Запись в приложении с той же датой, направлением и суммой — вероятный дубль:
  // выписку загрузили повторно или операцию уже внесли руками.
  const known = new Set<string>();
  const remember = (kind: RecordKind, list: Asset[]) => {
    for (const asset of list) {
      const day = localDay(asset.createdAt);
      if (day) known.add(`${kind}|${day}|${Math.round(asset.amount * 100)}`);
    }
  };
  remember('income', existing.incomes);
  remember('expence', existing.expences);

  return result.transactions.map((tx, index) => {
    const { kind, category, subcategory } = categorize(tx);
    const amount = Math.abs(tx.amount);
    const duplicate = known.has(`${kind}|${tx.date}|${Math.round(amount * 100)}`);
    const note = skipReason(tx, userCurrency) ?? (duplicate ? 'Похоже, эта операция уже есть в приложении' : undefined);
    return {
      key: String(index),
      tx,
      kind,
      name: recordName(tx),
      amount,
      category,
      subcategory,
      selected: !note,
      note,
    };
  });
}

/** Полдень местного времени: дата не «съедет» на соседний день из-за часового пояса. */
function dayToDate(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date, 12, 0, 0);
}

export function toRecords(rows: ImportRow[]): { incomes: Omit<Asset, 'id'>[]; expences: Omit<Asset, 'id'>[] } {
  const incomes: Omit<Asset, 'id'>[] = [];
  const expences: Omit<Asset, 'id'>[] = [];
  for (const row of rows) {
    if (!row.selected) continue;
    const category = findCategory(row.kind, row.category);
    const categoryTab =
      row.kind === 'income'
        ? PASSIVE_INCOMES.has(row.category) ? 'passive' : 'active'
        : REQUIRED_EXPENSES.has(row.category) ? 'required' : 'notRequired';
    const record: Omit<Asset, 'id'> = {
      name: row.name,
      amount: row.amount,
      icon: category?.icon,
      iconType: 'ionicons',
      color: category?.color,
      category: category?.id ?? OTHER_CATEGORY_ID,
      subcategory: row.subcategory,
      categoryTab,
      regularity: REGULAR.has(row.subcategory ?? row.category) ? 'regular' : 'irregular',
      createdAt: dayToDate(row.tx.date),
    };
    (row.kind === 'income' ? incomes : expences).push(record);
  }
  return { incomes, expences };
}

export function summarize(rows: ImportRow[]): { count: number; income: number; expense: number } {
  let income = 0;
  let expense = 0;
  let count = 0;
  for (const row of rows) {
    if (!row.selected) continue;
    count += 1;
    if (row.kind === 'income') income += row.amount;
    else expense += row.amount;
  }
  return { count, income: Math.round(income * 100) / 100, expense: Math.round(expense * 100) / 100 };
}
