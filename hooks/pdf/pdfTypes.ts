import { PersonalFinancialPlan } from '../useStore';

export interface PDFGeneratorOptions {
    personalFinancialPlan: PersonalFinancialPlan;
    currency?: string;
    language?: 'ru' | 'en' | 'kz';
    onStatusChange?: (status: 'generating' | 'sharing' | 'success' | 'error') => void;
    onProgressChange?: (progress: number) => void;
    onMessageChange?: (message: string) => void;
}

export interface Translations {
    title: string;
    client: string;
    birthDate: string;
    fullName: string;
    city: string;
    citizenship: string;
    residence: string;
    activity: string;
    financialDependents: string;
    riskProfile: string;
    securityPillow: string;
    insurance: string;
    lifeInsurance: string;
    disabilityInsurance: string;
    medicalInsurance: string;
    createdDate: string;
    updatedDate: string;
    incomes: string;
    expenses: string;
    assets: string;
    liabilities: string;
    goals: string;
    total: string;
    name: string;
    amount: string;
    yield: string;
    regularity: string;
}

export interface FinancialSummary {
    totalIncomes: number;
    totalExpenses: number;
    totalActives: number;
    totalPassives: number;
    netWorth: number;
    monthlyBalance: number;
}
