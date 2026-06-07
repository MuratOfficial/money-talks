"use strict";
/**
 * Финансовые калькуляторы для PDF генератора
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.formatAmount = exports.getCurrencyRatio = exports.getCurrencySymbol = exports.recalculateMonthlyInvestment = exports.calculateYearsLeft = exports.calculateTotalMonthsLeft = exports.monthNameToIndex = exports.calculateMonthlyInvestment = exports.calculateCapitalWithDeposits = exports.calculateCapitalGrowth = exports.calculateRequiredReturn = void 0;
// 1. Расчет требуемой доходности
const calculateRequiredReturn = (startCapital, targetCapital, years) => {
    if (years === 0 || startCapital === 0)
        return '0.00';
    return ((Math.pow(targetCapital / startCapital, 1 / years) - 1) * 100).toFixed(2);
};
exports.calculateRequiredReturn = calculateRequiredReturn;
// 2. Расчет роста начального капитала
const calculateCapitalGrowth = (startCapital, annualReturn, years) => {
    return Math.round(startCapital * Math.pow(1 + annualReturn / 100, years));
};
exports.calculateCapitalGrowth = calculateCapitalGrowth;
// 3. Расчет роста капитала с ежемесячными пополнениями
const calculateCapitalWithDeposits = (startCapital, monthlyDeposit, annualReturn, years) => {
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;
    // Рост начального капитала
    const futureValueStart = startCapital * Math.pow(1 + monthlyRate, months);
    // Рост ежемесячных пополнений (аннуитет)
    if (monthlyRate === 0) {
        return Math.round(futureValueStart + monthlyDeposit * months);
    }
    const futureValueDeposits = monthlyDeposit * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return Math.round(futureValueStart + futureValueDeposits);
};
exports.calculateCapitalWithDeposits = calculateCapitalWithDeposits;
// 4. Расчет требуемого ежемесячного инвестирования
const calculateMonthlyInvestment = (targetCapital, startCapital, annualReturn, years) => {
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;
    // Будущая стоимость начального капитала
    const futureValueStart = startCapital * Math.pow(1 + monthlyRate, months);
    // Оставшаяся сумма, которую нужно набрать ежемесячными взносами
    const remainingAmount = targetCapital - futureValueStart;
    if (remainingAmount <= 0)
        return 0;
    if (monthlyRate === 0) {
        return Math.round(remainingAmount / months);
    }
    // Требуемый ежемесячный взнос
    const monthlyPayment = remainingAmount / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return Math.round(monthlyPayment);
};
exports.calculateMonthlyInvestment = calculateMonthlyInvestment;
// Конвертация русского названия месяца в индекс (0-11)
const monthNameToIndex = (monthName) => {
    var _a;
    const months = {
        'Январь': 0, 'Февраль': 1, 'Март': 2, 'Апрель': 3,
        'Май': 4, 'Июнь': 5, 'Июль': 6, 'Август': 7,
        'Сентябрь': 8, 'Октябрь': 9, 'Ноябрь': 10, 'Декабрь': 11,
    };
    return (_a = months[monthName]) !== null && _a !== void 0 ? _a : 0;
};
exports.monthNameToIndex = monthNameToIndex;
// Расчёт полного числа месяцев от текущей даты до target
const calculateTotalMonthsLeft = (timeframe) => {
    const now = new Date();
    const targetYear = parseInt(timeframe.year, 10);
    const targetMonthIdx = (0, exports.monthNameToIndex)(timeframe.month);
    const totalMonths = (targetYear - now.getFullYear()) * 12 + (targetMonthIdx - now.getMonth());
    return Math.max(1, totalMonths);
};
exports.calculateTotalMonthsLeft = calculateTotalMonthsLeft;
// Вспомогательные функции
const calculateYearsLeft = (timeframe) => {
    const totalMonths = (0, exports.calculateTotalMonthsLeft)(timeframe);
    // Возвращаем дробное кол-во лет, но минимум 1
    return Math.max(1, Math.round((totalMonths / 12) * 10) / 10);
};
exports.calculateYearsLeft = calculateYearsLeft;
/**
 * Расчёт требуемого ежемесячного взноса для достижения цели.
 *
 * Формула будущей стоимости аннуитета с учётом:
 *  - инфляции (целевая сумма индексируется на срок),
 *  - ожидаемой доходности вложений (returnRate, сложный процент),
 *  - уже накопленной суммы (collected) как стартового капитала.
 *
 * FV_target  = amount × (1 + инфляция)^лет
 * collected  растёт по сложному проценту за n месяцев
 * PMT        = (FV_target − выросший_collected) × r / ((1+r)^n − 1)
 */
const recalculateMonthlyInvestment = (amount, inflationRate, returnRate, totalMonths, collected = 0) => {
    if (isNaN(amount) || totalMonths <= 0)
        return 0;
    const years = totalMonths / 12;
    // Целевая сумма с поправкой на инфляцию
    const futureTarget = amount * Math.pow(1 + inflationRate / 100, years);
    // Месячная ставка доходности
    const r = (isNaN(returnRate) ? 0 : returnRate) / 100 / 12;
    // Уже накопленное, выросшее за срок по сложному проценту
    const grownCollected = (isNaN(collected) ? 0 : collected) * Math.pow(1 + r, totalMonths);
    const remaining = futureTarget - grownCollected;
    if (remaining <= 0)
        return 0;
    // Без доходности — простое деление остатка на число месяцев
    if (r === 0)
        return remaining / totalMonths;
    // Требуемый ежемесячный взнос (аннуитет)
    return (remaining * r) / (Math.pow(1 + r, totalMonths) - 1);
};
exports.recalculateMonthlyInvestment = recalculateMonthlyInvestment;
const getCurrencySymbol = (currency) => {
    if (currency === 'USD' || currency === '$')
        return '$';
    if (currency === 'EUR' || currency === '€')
        return '€';
    return '₸';
};
exports.getCurrencySymbol = getCurrencySymbol;
const getCurrencyRatio = (goalCurrency) => {
    if (goalCurrency === 'KZT' || goalCurrency === '₸')
        return { kzt: 1, usd: 0.0021, eur: 0.0019 };
    if (goalCurrency === 'USD' || goalCurrency === '$')
        return { kzt: 470, usd: 1, eur: 0.92 };
    if (goalCurrency === 'EUR' || goalCurrency === '€')
        return { kzt: 510, usd: 1.09, eur: 1 };
    return { kzt: 1, usd: 0.0021, eur: 0.0019 };
};
exports.getCurrencyRatio = getCurrencyRatio;
const formatAmount = (amount, curr = '₸') => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ' + curr;
};
exports.formatAmount = formatAmount;
const formatDate = (birthDate) => {
    return `${birthDate.day}.${birthDate.month}.${birthDate.year}`;
};
exports.formatDate = formatDate;
