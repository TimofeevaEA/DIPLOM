import React, { useState, useEffect } from 'react';
import './Subscriptions.css';

function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        session_count: '',
        day_count: '',
        price: '',
        discounted_price: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/subscriptions');
            const data = await response.json();
            setSubscriptions(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка при загрузке абонементов' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingId 
                ? `http://localhost:5000/api/subscriptions/${editingId}`
                : 'http://localhost:5000/api/subscriptions';
            const method = editingId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: `Абонемент успешно ${editingId ? 'обновлен' : 'создан'}` });
                setFormData({ name: '', session_count: '', day_count: '', price: '', discounted_price: '' });
                setEditingId(null);
                fetchSubscriptions();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка при сохранении абонемента' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот абонемент?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/subscriptions/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setMessage({ type: 'success', text: 'Абонемент успешно удален' });
                    fetchSubscriptions();
                }
            } catch (error) {
                setMessage({ type: 'error', text: 'Ошибка при удалении абонемента' });
            }
        }
    };

    const handleEdit = (subscription) => {
        setFormData({
            name: subscription.name,
            session_count: subscription.session_count,
            day_count: subscription.day_count,
            price: subscription.price,
            discounted_price: subscription.discounted_price
        });
        setEditingId(subscription.id);
    };

    return (
        <div className="container">
            <h1>УПРАВЛЕНИЕ АБОНЕМЕНТАМИ</h1>
            
            <div className="messages-container">
                {message && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="form-section">
                <h2>{editingId ? 'Редактировать абонемент' : 'Добавить абонемент'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Имя абонемента:</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Количество занятий:</label>
                        <input
                            type="number"
                            value={formData.session_count}
                            onChange={(e) => setFormData({...formData, session_count: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Количество дней:</label>
                        <input
                            type="number"
                            onChange={(e) => setFormData({...formData, day_count: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Цена:</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Цена со скидкой:</label>
                        <input
                            type="number"
                            value={formData.discounted_price}
                            onChange={(e) => setFormData({...formData, discounted_price: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="submit-btn">
                            {editingId ? 'Обновить' : 'Создать'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ name: '', session_count: '', day_count: '', price: '', discounted_price: '' });
                                }}
                            >
                                Отмена
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="subscriptions-list">
                <h2>Список абонементов</h2>
                {subscriptions.map(subscription => (
                    <div key={subscription.id} className="subscription-item">
                        <div className="subscription-content">
                            <p>Имя: {subscription.name}</p>
                            <p>Количество занятий: {subscription.session_count}</p>
                            <p>Количество дней: {subscription.day_count}</p>
                            <p>Цена: {subscription.price}</p>
                            <p>Цена со скидкой: {subscription.discounted_price}</p>
                        </div>
                        <div className="subscription-actions">
                            <button
                                onClick={() => handleEdit(subscription)}
                                className="edit-btn"
                            >
                                Редактировать
                            </button>
                            <button
                                onClick={() => handleDelete(subscription.id)}
                                className="delete-btn"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Subscriptions;
