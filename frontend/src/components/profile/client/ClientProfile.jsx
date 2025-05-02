import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, subscriptionAPI } from '../../../api';
import ChangePassword from '../ChangePassword';
import './ClientProfile.css';

function ClientProfile() {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        role: '',
        activeSubscription: null,
        upcomingBookings: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const loadUserData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Получаем данные пользователя из localStorage
            const savedUser = JSON.parse(localStorage.getItem('currentUser'));
            
            // Загружаем данные параллельно
            const [activeSubscription, bookings] = await Promise.all([
                subscriptionAPI.getUserActiveSubscription(savedUser.id),
                userAPI.getUserBookings(savedUser.id)
            ]);

            setUserData({
                name: savedUser.name,
                email: savedUser.email,
                phone: savedUser.phone || 'Не указан',
                birthDate: savedUser.birth_date ? new Date(savedUser.birth_date).toLocaleDateString() : 'Не указана',
                role: savedUser.role,
                activeSubscription,
                upcomingBookings: bookings
            });
        } catch (err) {
            console.error('Ошибка при загрузке данных:', err);
            setError('Произошла ошибка при загрузке данных');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    const handleBuySubscription = () => {
        navigate('/subscriptions');
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            await userAPI.cancelBooking(bookingId);
            // Обновляем только список записей, не перезагружая все данные
            setUserData(prev => ({
                ...prev,
                upcomingBookings: prev.upcomingBookings.filter(booking => booking.id !== bookingId)
            }));
        } catch (err) {
            console.error('Ошибка при отмене записи:', err);
            setError('Не удалось отменить запись');
        }
    };

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="client-profile">
            <div className="client-header">
                <h1>Личный кабинет</h1>
            </div>
            
            <div className="client-content">
                <div className="client-info-card">
                    <h2>Персональная информация</h2>
                    <div className="info-row">
                        <span>Имя:</span>
                        <span>{userData.name}</span>
                    </div>
                    <div className="info-row">
                        <span>Email:</span>
                        <span>{userData.email}</span>
                    </div>
                    <div className="info-row">
                        <span>Телефон:</span>
                        <span>{userData.phone}</span>
                    </div>
                    <div className="info-row">
                        <span>Дата рождения:</span>
                        <span>{userData.birthDate}</span>
                    </div>
                </div>

                
                {userData.role !== 'admin' && (
                    <div className="subscription-card">
                        <h2>Активный абонемент</h2>
                        {userData.activeSubscription ? (
                            <div className="subscription-info">
                                <div className="info-row">
                                    <span>Тип абонемента:</span>
                                    <span>{userData.activeSubscription.subscription_name}</span>
                                </div>
                                <div className="info-row highlight">
                                    <span>Осталось занятий:</span>
                                    <span>{userData.activeSubscription.remaining_sessions}</span>
                                </div>
                                <div className="info-row highlight">
                                    <span>Осталось дней:</span>
                                    <span>{userData.activeSubscription.remaining_days}</span>
                                </div>
                                
                                <button 
                                    className="buy-subscription-btn secondary"
                                    onClick={handleBuySubscription}
                                >
                                    Купить новый абонемент
                                </button>
                            </div>
                        ) : (
                            <div className="no-subscription">
                                <p>У вас нет активного абонемента</p>
                                <button 
                                    className="buy-subscription-btn primary"
                                    onClick={handleBuySubscription}
                                >
                                    Купить абонемент
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="bookings-card">
                    <h2>Ближайшие записи</h2>
                    {userData.upcomingBookings && userData.upcomingBookings.length > 0 ? (
                        <div className="bookings-list">
                            {userData.upcomingBookings.map(booking => (
                                <div key={booking.id} className="booking-item">
                                    <div className="booking-info">
                                        <span className="booking-direction">{booking.direction_name}</span>
                                        <span className="booking-trainer">Тренер: {booking.trainer_name}</span>
                                        <div className="booking-time-info">
                                            <span className="booking-day">
                                                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][booking.day_of_week - 1]}
                                            </span>
                                            <span className="booking-time">{booking.start_time}</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="cancel-booking-btn"
                                        onClick={() => handleCancelBooking(booking.id)}
                                    >
                                        Отменить
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-bookings">Нет предстоящих записей</p>
                    )}
                </div>
                <div className="client-info-card">
                    <ChangePassword />
                </div>

            </div>
        </div>
    );
}

export default ClientProfile; 