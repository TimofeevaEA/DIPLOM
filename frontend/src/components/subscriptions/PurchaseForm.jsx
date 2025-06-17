import React from 'react';

function PurchaseForm({ users, subscriptions, selectedUser, selectedSubscription, onUserChange, onSubscriptionChange, onPurchase }) {
    return (
        <div className="form-section">
            <h2>Новый абонемент</h2>
            <div className="form-group">
                <label>Выберите пользователя:</label>
                <select
                    title="Выберите пользователя"
                    aria-label="Выберите пользователя"
                    value={selectedUser?.id || ''}
                    onChange={(e) => onUserChange(users.find(user => user.id === parseInt(e.target.value)))}
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
                    onChange={(e) => onSubscriptionChange(subscriptions.find(sub => sub.id === parseInt(e.target.value)))}
                >
                    <option value="">Выберите абонемент</option>
                    {subscriptions.map(subscription => (
                        <option key={subscription.id} value={subscription.id}>
                            {subscription.name}
                        </option>
                    ))}
                </select>
            </div>

            <button onClick={onPurchase} className="purchase-btn">
                Оформить абонемент
            </button>
        </div>
    );
}

export default PurchaseForm; 