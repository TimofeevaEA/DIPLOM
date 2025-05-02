import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../api';
import ChangePassword from '../ChangePassword';
import './AdminProfile.css';

function AdminProfile() {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'admin',
        statistics: {
            totalUsers: 0,
            activeSubscriptions: 0,
            totalTrainers: 0,
            totalClients: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const savedUser = JSON.parse(localStorage.getItem('currentUser'));
                
                if (savedUser) {
                    setUserData(prevState => ({
                        ...prevState,
                        name: savedUser.name,
                        email: savedUser.email,
                        phone: savedUser.phone || 'Не указан',
                        role: savedUser.role
                    }));
                }

                const statistics = await adminAPI.getStatistics();
                setUserData(prevState => ({
                    ...prevState,
                    statistics
                }));
            } catch (err) {
                setError('Произошла ошибка при загрузке данных');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="admin-profile">
            <div className="admin-header">
                <h1>Панель администратора</h1>
            </div>
            
            <div className="admin-content">
                {/* Персональная информация */}
                <div className="admin-info-card">
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
                        <span>Роль:</span>
                        <span>Администратор</span>
                    </div>
                </div>

                

                {/* Статистика */}
                <div className="admin-statistics-card">
                    <h2>Общая статистика</h2>
                    <div className="statistics-grid">
                        <div className="stat-item">
                            <h3>Пользователей</h3>
                            <span className="stat-number">{userData.statistics.totalUsers}</span>
                        </div>
                        <div className="stat-item">
                            <h3>Активных абонементов</h3>
                            <span className="stat-number">{userData.statistics.activeSubscriptions}</span>
                        </div>
                        <div className="stat-item">
                            <h3>Тренеров</h3>
                            <span className="stat-number">{userData.statistics.totalTrainers}</span>
                        </div>
                        <div className="stat-item">
                            <h3>Клиентов</h3>
                            <span className="stat-number">{userData.statistics.totalClients}</span>
                        </div>
                    </div>
                </div>

                {/* Быстрые действия */}
                <div className="admin-actions-card">
                    <h2>Быстрые действия</h2>
                    <div className="actions-grid">
                        <button onClick={() => window.location.href = '/admin/users'}>
                            Управление пользователями
                        </button>
                        <button onClick={() => window.location.href = '/admin/subscriptions'}>
                            Управление абонементами
                        </button>
                        <button onClick={() => window.location.href = '/admin/trainers'}>
                            Управление тренерами
                        </button>
                        <button onClick={() => window.location.href = '/schedule'}>
                            Управление расписанием
                        </button>
                    </div>
                </div>
                {/* Смена пароля */}
                <div className="admin-info-card">
                    <ChangePassword />
                </div>
            </div>
        </div>
    );
}

export default AdminProfile; 