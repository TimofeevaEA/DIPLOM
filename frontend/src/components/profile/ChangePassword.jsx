import React, { useState } from 'react';
import { authAPI } from '../../api';
import './ChangePassword.css';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Новые пароли не совпадают');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Новый пароль должен содержать минимум 6 символов');
            return;
        }

        try {
            // Получаем email пользователя из localStorage
            const savedUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!savedUser || !savedUser.email) {
                throw new Error('Не удалось получить данные пользователя');
            }

            await authAPI.changePassword(
                savedUser.email,
                formData.currentPassword,
                formData.newPassword
            );

            setSuccess('Пароль успешно изменен');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="change-password-container">
            <h2>Смена пароля</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Текущий пароль:</label>
                    <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Новый пароль:</label>
                    <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Подтвердите новый пароль:</label>
                    <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        required
                    />
                </div>
                
                <button type="submit" className="submit-btn">Изменить пароль</button>
            </form>
        </div>
    );
};

export default ChangePassword; 