/**
 * Финансовые калькуляторы для PDF генератора
 */

// 1. Расчет требуемой доходности
export const calculateRequiredReturn = (
    startCapital: number,
    targetCapital: number,
    years: number
): string => {
    if (years === 0 || startCapital === 0) return '0.00';
    return ((Math.pow(targetCapital / startCapital, 1 / years) - 1) * 100).toFixed(2);
};

// 2. Расчет роста начального капитала
export const calculateCapitalGrowth = (
    startCapital: number,
    annualReturn: number,
    years: number
): number => {
    return Math.round(startCapital * Math.pow(1 + annualReturn / 100, years));
};

// 3. Расчет роста капитала с ежемесячными пополнениями
export const calculateCapitalWithDeposits = (
    startCapital: number,
    monthlyDeposit: number,
    annualReturn: number,
    years: number
): number => {
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;

    // Рост начального капитала
    const futureValueStart = startCapital * Math.pow(1 + monthlyRate, months);

    // Рост ежемесячных пополнений (аннуитет)
    if (monthlyRate === 0) {
        return Math.round(futureValueStart + monthlyDeposit * months);
    }

    const futureValueDeposits =
        monthlyDeposit * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    return Math.round(futureValueStart + futureValueDeposits);
};

// 4. Расчет требуемого ежемесячного инвестирования
export const calculateMonthlyInvestment = (
    targetCapital: number,
    startCapital: number,
    annualReturn: number,
    years: number
): number => {
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;

    // Будущая стоимость начального капитала
    const futureValueStart = startCapital * Math.pow(1 + monthlyRate, months);

    // Оставшаяся сумма, которую нужно набрать ежемесячными взносами
    const remainingAmount = targetCapital - futureValueStart;

    if (remainingAmount <= 0) return 0;

    if (monthlyRate === 0) {
        return Math.round(remainingAmount / months);
    }

    // Требуемый ежемесячный взнос
    const monthlyPayment =
        remainingAmount / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    return Math.round(monthlyPayment);
};

// Вспомогательные функции
export const calculateYearsLeft = (timeframe: {
    day: string;
    month: string;
    year: string;
}): number => {
    const targetDate = new Date(parseInt(timeframe.year), parseInt(timeframe.month) - 1);
    const currentDate = new Date();
    return Math.max(1, targetDate.getFullYear() - currentDate.getFullYear());
};

export const getCurrencySymbol = (currency: string): string => {
    if (currency === 'USD' || currency === '$') return '$';
    if (currency === 'EUR' || currency === '€') return '€';
    return '₸';
};

export const getCurrencyRatio = (goalCurrency: string) => {
    if (goalCurrency === 'KZT' || goalCurrency === '₸') return { kzt: 1, usd: 0.0021, eur: 0.0019 };
    if (goalCurrency === 'USD' || goalCurrency === '$') return { kzt: 470, usd: 1, eur: 0.92 };
    if (goalCurrency === 'EUR' || goalCurrency === '€') return { kzt: 510, usd: 1.09, eur: 1 };
    return { kzt: 1, usd: 0.0021, eur: 0.0019 };
};

export const formatAmount = (amount: number, curr = '₸'): string => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ' + curr;
};

export const formatDate = (birthDate: { day: string; month: string; year: string }): string => {
    return `${birthDate.day}.${birthDate.month}.${birthDate.year}`;
};
