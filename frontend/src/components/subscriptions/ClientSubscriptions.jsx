import React, { useState, useEffect } from 'react';
import './ClientSubscriptions.css';

function ClientSubscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/subscriptions');
            const data = await response.json();
            setSubscriptions(data);
        } catch (error) {
            console.error('Ошибка при загрузке абонементов:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Формируем текст сообщения
        const message = encodeURIComponent(`Здравствуйте! Хочу записаться на пробное занятие.

Имя: ${formData.name}
Телефон: ${formData.phone}`);
        
        // Формируем ссылку для Telegram
        const telegramLink = `https://t.me/justhateveryone?text=${message}`;
        
        // Открываем ссылку в новом окне
        window.open(telegramLink, '_blank');
        
        // Очищаем форму
        setFormData({
            name: '',
            phone: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="pricing-page">
            <div className="trial-form-card">
                <h2 className="trial-form-title">Записаться на пробное бесплатное занятие</h2>
                <form onSubmit={handleSubmit} className="trial-form">
                    <div className="trial-form-input-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="ВВЕДИТЕ ВАШЕ ИМЯ"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="trial-form-input"
                            required
                        />
                    </div>
                    <div className="trial-form-input-group">
                        <input
                            type="tel"
                            name="phone"
                            placeholder="+7"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="trial-form-input"
                            required
                        />
                    </div>
                    <button type="submit" className="trial-form-submit">
                        ОСТАВИТЬ ЗАЯВКУ НА САЙТЕ
                    </button>
                </form>
            </div>

            <div className="pricing-content">
                <h1 className="pricing-title">СТОИМОСТЬ ЗАНЯТИЙ</h1>
                <p className="pricing-subtitle">Все абонементы универсальные, срок действия - 1 месяц с момента покупки</p>
                <p className="pricing-discount">При покупке первого абонемента скидка 10%</p>
                
                <div className="pricing-grid">
                    {subscriptions.map(subscription => (
                        <div key={subscription.id} className="pricing-card">
                            <h3 className="pricing-card-title">{subscription.name}</h3>
                            <div className="pricing-card-info">
                                <div className="pricing-original">
                                    <span className="pricing-amount">{subscription.price} р.</span>
                                    <span className="pricing-per-session">
                                        {Math.round(subscription.price / subscription.session_count)} р./занятие
                                    </span>
                                </div>
                                <div className="pricing-discounted">
                                    <span className="pricing-amount">{subscription.discounted_price} р.</span>
                                    <span className="pricing-per-session">
                                        {Math.round(subscription.discounted_price / subscription.session_count)} р./занятие
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className="pricing-card pricing-single">
                        <h3 className="pricing-card-title">Разовое занятие</h3>
                        <div className="pricing-card-info">
                            <div className="pricing-single-price">
                                <span className="pricing-amount">650 р.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClientSubscriptions; 