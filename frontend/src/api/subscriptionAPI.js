const BASE_URL = 'http://localhost:5000/api';

// Кэш для типов абонементов
let subscriptionTypesCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

export const subscriptionAPI = {
    // Получение всех абонементов
    getAllSubscriptions: async () => {
        const response = await fetch(`${BASE_URL}/purchased_subscriptions`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке абонементов');
        }
        const subscriptions = await response.json();
        
        // Получаем типы абонементов из кэша или с сервера
        const subscriptionTypes = await subscriptionAPI.getSubscriptionTypes();
        
        // Объединяем информацию
        return subscriptions.map(sub => ({
            ...sub,
            subscription_info: subscriptionTypes.find(type => type.id === sub.subscription_id)
        }));
    },

    // Получение активного абонемента пользователя
    getUserActiveSubscription: async (userId) => {
        const subscriptions = await subscriptionAPI.getAllSubscriptions();
        return subscriptions.find(sub => 
            sub.client_id === userId && sub.remaining_sessions > 0
        );
    },

    // Получение всех типов абонементов с кэшированием
    getSubscriptionTypes: async () => {
        const now = Date.now();
        
        // Если есть кэш и он не устарел, используем его
        if (subscriptionTypesCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
            return subscriptionTypesCache;
        }

        const response = await fetch(`${BASE_URL}/subscriptions`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке типов абонементов');
        }
        
        subscriptionTypesCache = await response.json();
        lastFetchTime = now;
        return subscriptionTypesCache;
    },

    // Покупка абонемента
    purchaseSubscription: async (data) => {
        const response = await fetch(`${BASE_URL}/purchased_subscriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('Ошибка при покупке абонемента');
        }
        return response.json();
    },

    // Удаление абонемента
    deleteSubscription: async (id) => {
        const response = await fetch(`${BASE_URL}/purchased_subscriptions/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Ошибка при удалении абонемента');
        }
        return response.json();
    },

    // Обновление абонемента
    updateSubscription: async (id, data) => {
        const response = await fetch(`${BASE_URL}/purchased_subscriptions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('Ошибка при обновлении абонемента');
        }
        return response.json();
    },

    // Очистка кэша (вызывать при изменении типов абонементов)
    clearCache: () => {
        subscriptionTypesCache = null;
        lastFetchTime = null;
    }
};