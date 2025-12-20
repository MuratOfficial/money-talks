import { Asset } from '@/hooks/useStore';

/**
 * Утилиты для фильтрации финансовых данных по датам
 */

export type DateFilterType = 'Сегодня' | 'За месяц' | 'За год' | 'Все время';

/**
 * Фильтрует массив активов по дате создания
 * @param assets - Массив активов для фильтрации
 * @param filterType - Тип фильтра по дате
 * @returns Отфильтрованный массив активов
 */
export const filterAssetsByDate = (
    assets: Asset[],
    filterType: DateFilterType
): Asset[] => {
    if (filterType === 'Все время' || !assets) {
        return assets;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return assets.filter((asset) => {
        if (!asset.createdAt) {
            // Если нет даты создания, показываем элемент (для обратной совместимости)
            return true;
        }

        const createdDate = new Date(asset.createdAt);
        const createdDateOnly = new Date(
            createdDate.getFullYear(),
            createdDate.getMonth(),
            createdDate.getDate()
        );

        switch (filterType) {
            case 'Сегодня':
                return createdDateOnly.getTime() === today.getTime();

            case 'За месяц':
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return createdDateOnly >= monthAgo;

            case 'За год':
                const yearAgo = new Date(today);
                yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                return createdDateOnly >= yearAgo;

            default:
                return true;
        }
    });
};

/**
 * Получает количество элементов для каждого периода
 * @param assets - Массив активов
 * @returns Объект с количеством элементов для каждого периода
 */
export const getAssetCountsByPeriod = (assets: Asset[]) => {
    return {
        today: filterAssetsByDate(assets, 'Сегодня').length,
        month: filterAssetsByDate(assets, 'За месяц').length,
        year: filterAssetsByDate(assets, 'За год').length,
        all: assets.length,
    };
};

/**
 * Форматирует дату для отображения
 * @param date - Дата для форматирования
 * @returns Отформатированная строка даты
 */
export const formatAssetDate = (date: Date | undefined): string => {
    if (!date) return 'Дата не указана';

    const assetDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const assetDateOnly = new Date(
        assetDate.getFullYear(),
        assetDate.getMonth(),
        assetDate.getDate()
    );

    if (assetDateOnly.getTime() === today.getTime()) {
        return 'Сегодня';
    } else if (assetDateOnly.getTime() === yesterday.getTime()) {
        return 'Вчера';
    } else {
        return assetDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }
};

/**
 * Группирует активы по датам
 * @param assets - Массив активов
 * @returns Объект с активами, сгруппированными по датам
 */
export const groupAssetsByDate = (assets: Asset[]) => {
    const grouped: { [key: string]: Asset[] } = {};

    assets.forEach((asset) => {
        const dateKey = formatAssetDate(asset.createdAt);
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(asset);
    });

    return grouped;
};
