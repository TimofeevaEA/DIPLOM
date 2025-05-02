import React, { useState } from 'react';
import './authorization.css';

const AuthModal = ({ isOpen, onClose, onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await fetch('http://localhost:5000/api/authorization/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка авторизации');
            }

            if (!data.user) {
                throw new Error('Сервер не вернул данные пользователя');
            }

            const requiredFields = ['id', 'name', 'email', 'role', 'phone'];
            const missingFields = requiredFields.filter(field => !data.user[field]);
            
            if (missingFields.length > 0) {
                throw new Error('Неполные данные пользователя');
            }

            onLogin(data.user);
            onClose();
        } catch (error) {
            setError(error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal">
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2>Вход в систему</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Пароль:</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="submit-btn">Войти</button>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;