import React from 'react';

function SubscriptionsTable({ 
    subscriptions, 
    users, 
    onEdit, 
    onDelete, 
    editingSubscription, 
    onEditSubmit, 
    onEditCancel,
    isLoading 
}) {
    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Неизвестный пользователь';
    };

    const getSubscriptionName = (subscription) => {
        return subscription.subscription_info?.name || 'Неизвестный абонемент';
    };

    const calculateRemainingDays = (purchaseDate, dayCount) => {
        const purchaseDateTime = new Date(purchaseDate).getTime();
        const expirationDateTime = purchaseDateTime + (dayCount * 24 * 60 * 60 * 1000);
        const currentDateTime = new Date().getTime();
        const remainingDays = Math.ceil((expirationDateTime - currentDateTime) / (24 * 60 * 60 * 1000));
        return remainingDays > 0 ? remainingDays : 0;
    };

    const getSubscriptionDays = (subscription) => {
        return subscription.subscription_info?.day_count || 0;
    };

    if (isLoading) {
        return (
            <div className="purchased-subscriptions-table loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Загрузка данных...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="purchased-subscriptions-table">
            <table>
                <thead>
                    <tr>
                        <th>Клиент</th>
                        <th>Абонемент</th>
                        <th>Осталось занятий</th>
                        <th>Дата покупки</th>
                        <th>Осталось дней</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {subscriptions.map(ps => {
                        const remainingDays = calculateRemainingDays(ps.purchase_date, getSubscriptionDays(ps));
                        const isExpiring = remainingDays <= 7;
                        
                        if (editingSubscription && editingSubscription.id === ps.id) {
                            return (
                                <tr key={ps.id} className="editing-row">
                                    <td colSpan="6">
                                        <form onSubmit={onEditSubmit} className="edit-form">
                                            <div className="edit-form-group">
                                                <label>Клиент: {getUserName(ps.client_id)}</label>
                                            </div>
                                            <div className="edit-form-group">
                                                <label>Абонемент: {getSubscriptionName(ps)}</label>
                                            </div>
                                            <div className="edit-form-group">
                                                <label>Осталось занятий:</label>
                                                <input
                                                    type="number"
                                                    value={editingSubscription.remaining_sessions}
                                                    onChange={(e) => onEdit({
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
                                                    onChange={(e) => onEdit({
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
                                                    onClick={onEditCancel}
                                                >
                                                    Отмена
                                                </button>
                                            </div>
                                        </form>
                                    </td>
                                </tr>
                            );
                        }

                        return (
                            <tr key={ps.id} className={isExpiring ? 'expiring' : ''}>
                                <td>{getUserName(ps.client_id)}</td>
                                <td>{getSubscriptionName(ps)}</td>
                                <td>{ps.remaining_sessions}</td>
                                <td>{new Date(ps.purchase_date).toLocaleDateString()}</td>
                                <td className={isExpiring ? 'expiring' : ''}>
                                    {remainingDays}
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
                                </td>
                                <td>
                                    <button
                                        onClick={() => onEdit(ps)}
                                        className="edit-btn"
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        onClick={() => onDelete(ps.id)}
                                        className="delete-btn"
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default SubscriptionsTable; 