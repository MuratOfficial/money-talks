import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { PDFGeneratorOptions } from './pdf/pdfTypes';
import { generateLFPHtmlContent } from './pdf/pdfGenerator';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Генерирует и сохраняет PDF с прогрессом
 */
export const generateLFPPDFWithProgress = async (
    options: PDFGeneratorOptions
): Promise<boolean> => {
    try {
        const { personalFinancialPlan, onStatusChange, onProgressChange, onMessageChange } = options;

        if (!personalFinancialPlan) {
            Alert.alert('Ошибка', 'Данные ЛФП не найдены');
            return false;
        }

        // Этап 1: Инициализация
        onStatusChange?.('generating');
        onMessageChange?.('Инициализация процесса...');
        onProgressChange?.(10);
        await delay(500);

        // Этап 2: Генерация HTML
        onMessageChange?.('Генерация HTML контента...');
        onProgressChange?.(25);
        const htmlContent = generateLFPHtmlContent(options);
        await delay(800);

        // Этап 3: Создание PDF
        onMessageChange?.('Создание PDF файла...');
        onProgressChange?.(60);
        await delay(1000);

        const { uri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false,
            width: 595,
            height: 842,
            margins: {
                top: 20,
                bottom: 20,
                left: 20,
                right: 20,
            },
        });

        console.log('PDF создан:', uri);

        // Этап 4: Подготовка к отправке
        onStatusChange?.('sharing');
        onMessageChange?.('Подготовка файла для сохранения...');
        onProgressChange?.(85);
        await delay(500);

        // Этап 5: Показ меню сохранения
        onProgressChange?.(100);
        await Sharing.shareAsync(uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
            dialogTitle: `Личный Финансовый План - ${personalFinancialPlan.fio}`,
        });

        // Успех
        onStatusChange?.('success');
        onMessageChange?.('PDF файл успешно создан и готов к использованию!');

        return true;
    } catch (error) {
        console.error('Ошибка при создании PDF:', error);
        Alert.alert('Ошибка', 'Не удалось создать PDF файл');
        return false;
    }
};

/**
 * Печатает PDF с прогрессом
 */
export const printLFPPDFWithProgress = async (
    options: PDFGeneratorOptions
): Promise<boolean> => {
    try {
        const { personalFinancialPlan, onStatusChange, onProgressChange, onMessageChange } = options;

        if (!personalFinancialPlan) {
            Alert.alert('Ошибка', 'Данные ЛФП не найдены');
            return false;
        }

        onStatusChange?.('generating');
        onMessageChange?.('Подготовка к печати...');
        onProgressChange?.(20);
        await delay(500);

        const htmlContent = generateLFPHtmlContent(options);

        onMessageChange?.('Отправка на печать...');
        onProgressChange?.(80);
        await delay(700);

        await Print.printAsync({
            html: htmlContent,
            printerUrl: undefined,
        });

        onStatusChange?.('success');
        onMessageChange?.('Документ отправлен на печать!');
        onProgressChange?.(100);

        return true;
    } catch (error) {
        console.error('Ошибка при печати PDF:', error);
        Alert.alert('Ошибка', 'Не удалось отправить на печать');
        return false;
    }
};

/**
 * Хук для генерации PDF
 */
export const usePDFGenerate = () => {
    return {
        generatePDF: generateLFPPDFWithProgress,
        printPDF: printLFPPDFWithProgress,
    };
};

export default usePDFGenerate;