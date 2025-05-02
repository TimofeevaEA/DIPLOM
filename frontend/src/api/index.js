const BASE_URL = 'http://localhost:5000/api';

export const authAPI = {
    login: async (email, password) => {
        const response = await fetch(`${BASE_URL}/authorization/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            throw new Error('Ошибка авторизации');
        }
        return response.json();
    },

    register: async (userData) => {
        const response = await fetch(`${BASE_URL}/authorization/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            throw new Error('Ошибка регистрации');
        }
        return response.json();
    },

    logout: async () => {
        const response = await fetch(`${BASE_URL}/authorization/logout`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Ошибка при выходе');
        }
        return response.json();
    },

    changePassword: async (email, currentPassword, newPassword) => {
        const response = await fetch(`${BASE_URL}/authorization/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email,
                currentPassword,
                newPassword
            })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка при смене пароля');
        }
        return data;
    }
};

export const userAPI = {
    // Получение записей пользователя
    getUserBookings: async (userId) => {
        const response = await fetch(`${BASE_URL}/users/${userId}/bookings`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке записей');
        }
        return response.json();
    },

    // Отмена записи
    cancelBooking: async (bookingId) => {
        const response = await fetch(`${BASE_URL}/client-schedule/${bookingId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Ошибка при отмене записи');
        }
        return response.json();
    }
};

export const subscriptionAPI = {
    // Получение всех абонементов
    getAllSubscriptions: async () => {
        const response = await fetch(`${BASE_URL}/purchased_subscriptions`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке абонементов');
        }
        return response.json();
    },

    // Получение активного абонемента пользователя
    getUserActiveSubscription: async (userId) => {
        const subscriptions = await subscriptionAPI.getAllSubscriptions();
        return subscriptions.find(sub => 
            sub.client_id === userId && sub.remaining_sessions > 0
        );
    }
};

export const scheduleAPI = {
    // Получение расписания
    getSchedule: async (weekId) => {
        const response = await fetch(`${BASE_URL}/schedule/week/${weekId}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке расписания');
        }
        return response.json();
    },

    // Запись на тренировку
    bookTraining: async (scheduleId, clientId) => {
        const response = await fetch(`${BASE_URL}/schedule/${scheduleId}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clientId })
        });
        if (!response.ok) {
            throw new Error('Ошибка при записи на тренировку');
        }
        return response.json();
    }
};

export const adminAPI = {
    // Получение общей статистики
    getStatistics: async () => {
        const response = await fetch(`${BASE_URL}/admin/statistics`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке статистики');
        }
        return response.json();
    }
};

export const trainerAPI = {
    getSalary: async (trainerId, month, year) => {
        const response = await fetch(
            `http://localhost:5000/api/trainer/salary?month=${month}&year=${year}&trainer_id=${trainerId}`
        );
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка при расчете зарплаты');
        }
        return data;
    },
    getTrainerIdByUserId: async (userId) => {
        const response = await fetch(`http://localhost:5000/api/trainer/by_user/${userId}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка при получении trainer_id');
        }
        return data.trainer_id;
    }
};

const savedUser = JSON.parse(localStorage.getItem('currentUser'));
const response = await fetch(`http://localhost:5000/api/trainer/by_user/${savedUser.id}`);
const data = await response.json();
if (data.trainer_id) {
    // Сохрани trainer_id в состоянии или localStorage
} 