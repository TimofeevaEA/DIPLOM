import React, { useState, useEffect } from 'react';
import './AdminPurchaseSubscription.css';

function AdminPurchaseSubscription() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [users, setUsers] = useState([]);
    const [purchasedSubscriptions, setPurchasedSubscriptions] = useState([]);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState(null);
    const [editingSubscription, setEditingSubscription] = useState(null);

    useEffect(() => {
        fetchSubscriptions();
        fetchUsers();
        fetchPurchasedSubscriptions();
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 3000); // Уведомление исчезнет через 3 секунды

            // Очищаем таймер при размонтировании компонента
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchPurchasedSubscriptions = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/purchased_subscriptions');
            const data = await response.json();
            setPurchasedSubscriptions(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка при загрузке купленных абонементов' });
        }
    };

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/subscriptions');
            const data = await response.json();
            setSubscriptions(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка при загрузке абонементов' });
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка при загрузке пользователей' });
        }
    };

    const handlePurchase = async () => {
        if (!selectedSubscription || !selectedUser) {
            setMessage({ type: 'error', text: 'Выберите пользователя и абонемент для оформления' });
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/purchased_subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: selectedUser.id,
                    subscription_id: selectedSubscription.id,
                    remaining_sessions: selectedSubscription.session_count
                })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Абонемент успешно оформлен' });
                fetchPurchasedSubscriptions();
                setSelectedUser(null);
                setSelectedSubscription(null);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка при оформлении абонемента' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот абонемент?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/purchased_subscriptions/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setMessage({ type: 'success', text: 'Абонемент успешно удален' });
                    fetchPurchasedSubscriptions();
                }
            } catch (error) {
                setMessage({ type: 'error', text: 'Ошибка при удалении абонемента' });
            }
        }
    };

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Неизвестный пользователь';
    };

    const getSubscriptionName = (subscriptionId) => {
        const subscription = subscriptions.find(s => s.id === subscriptionId);
        return subscription ? subscription.name : 'Неизвестный абонемент';
    };

    // Функция для расчета оставшихся дней
    const calculateRemainingDays = (purchaseDate, dayCount) => {
        const purchaseDateTime = new Date(purchaseDate).getTime();
        const expirationDateTime = purchaseDateTime + (dayCount * 24 * 60 * 60 * 1000);
        const currentDateTime = new Date().getTime();
        const remainingDays = Math.ceil((expirationDateTime - currentDateTime) / (24 * 60 * 60 * 1000));
        return remainingDays > 0 ? remainingDays : 0;
    };

    // Получаем количество дней абонемента по ID
    const getSubscriptionDays = (subscriptionId) => {
        const subscription = subscriptions.find(s => s.id === subscriptionId);
        return subscription ? subscription.day_count : 0;
    };

    // Функция для обновления купленного абонемента
    const handleEdit = async (e) => {
        e.preventDefault();
        if (!editingSubscription) return;

        try {
            const response = await fetch(`http://localhost:5000/api/purchased_subscriptions/${editingSubscription.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    remaining_sessions: editingSubscription.remaining_sessions,
                    purchase_date: editingSubscription.purchase_date
                })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Абонемент успешно обновлен' });
                setEditingSubscription(null);
                fetchPurchasedSubscriptions();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка при обновлении абонемента' });
        }
    };

    // Функция для начала редактирования
    const startEditing = (subscription) => {
        setEditingSubscription({
            ...subscription,
            purchase_date: new Date(subscription.purchase_date).toISOString().split('T')[0]
        });
    };

    return (
        <div className="container" style={{ marginTop: '100px' }}>
            <h1>Оформление абонемента</h1>
            
            <div className="messages-container">
                {message && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="form-section">
                <h2>Новый абонемент</h2>
                <div className="form-group">
                    <label>Выберите пользователя:</label>
                    <select
                        title="Выберите пользователя"
                        aria-label="Выберите пользователя"
                        value={selectedUser?.id || ''}
                        onChange={(e) => setSelectedUser(users.find(user => user.id === parseInt(e.target.value)))}
                    >
                        <option value="">Выберите пользователя</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Выберите абонемент:</label>
                    <select
                        title="Выберите абонемент"
                        aria-label="Выберите абонемент"
                        value={selectedSubscription?.id || ''}
                        onChange={(e) => setSelectedSubscription(subscriptions.find(sub => sub.id === parseInt(e.target.value)))}
                    >
                        <option value="">Выберите абонемент</option>
                        {subscriptions.map(subscription => (
                            <option key={subscription.id} value={subscription.id}>
                                {subscription.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button onClick={handlePurchase} className="purchase-btn">
                    Оформить абонемент
                </button>
            </div>

            <div className="purchased-subscriptions-section">
                <h2>Список активных абонементов</h2>
                <div className="purchased-subscriptions-list">
                    {purchasedSubscriptions.map(ps => {
                        const remainingDays = calculateRemainingDays(ps.purchase_date, getSubscriptionDays(ps.subscription_id));
                        const isExpiring = remainingDays <= 7;
                        
                        if (editingSubscription && editingSubscription.id === ps.id) {
                            // Форма редактирования
                            return (
                                <div key={ps.id} className="purchased-subscription-item editing">
                                    <form onSubmit={handleEdit} className="edit-form">
                                        <div className="edit-form-group">
                                            <label>Клиент: {getUserName(ps.client_id)}</label>
                                        </div>
                                        <div className="edit-form-group">
                                            <label>Абонемент: {getSubscriptionName(ps.subscription_id)}</label>
                                        </div>
                                        <div className="edit-form-group">
                                            <label>Осталось занятий:</label>
                                            <input
                                                type="number"
                                                value={editingSubscription.remaining_sessions}
                                                onChange={(e) => setEditingSubscription({
                                                    ...editingSubscription,
                                                    remaining_sessions: parseInt(e.target.value)
                                                })}
                                                min="0"
                                                required
                                                placeholder="Количество оставшихся занятий"
                                                title="Оставшиеся занятия"
                                                aria-label="Оставшиеся занятия"
                                            />
                                        </div>
                                        <div className="edit-form-group">
                                            <label>Дата покупки:</label>
                                            <input
                                                type="date"
                                                value={editingSubscription.purchase_date}
                                                onChange={(e) => setEditingSubscription({
                                                    ...editingSubscription,
                                                    purchase_date: e.target.value
                                                })}
                                                required
                                                title="Дата покупки"
                                                aria-label="Дата покупки"
                                            />
                                        </div>
                                        <div className="edit-form-buttons">
                                            <button type="submit" className="save-btn">
                                                Сохранить
                                            </button>
                                            <button
                                                type="button"
                                                className="cancel-btn"
                                                onClick={() => setEditingSubscription(null)}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            );
                        }

                        // Обычное отображение
                        return (
                            <div key={ps.id} className="purchased-subscription-item">
                                <div className="purchased-subscription-info">
                                    <h3>Клиент: {getUserName(ps.client_id)}</h3>
                                    <p>Абонемент: {getSubscriptionName(ps.subscription_id)}</p>
                                    <p>Осталось занятий: {ps.remaining_sessions}</p>
                                    <p>Дата покупки: {new Date(ps.purchase_date).toLocaleDateString()}</p>
                                    <p className={`remaining-days ${isExpiring ? 'expiring' : ''}`}>
                                        Осталось дней: {remainingDays}
                                        {isExpiring && remainingDays > 0 && 
                                            <span className="expiring-warning">
                                                (Срок истекает скоро!)
                                            </span>
                                        }
                                        {remainingDays === 0 && 
                                            <span className="expired-warning">
                                                (Срок действия истек!)
                                            </span>
                                        }
                                    </p>
                                </div>
                                <div className="purchased-subscription-actions">
                                    <button
                                        onClick={() => startEditing(ps)}
                                        className="edit-btn"
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ps.id)}
                                        className="delete-btn"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default AdminPurchaseSubscription;
