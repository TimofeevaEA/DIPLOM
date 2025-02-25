import React, { useState, useEffect } from 'react';
import './users.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        birth_date: '',
        role: 'user'
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Загрузка пользователей
    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Создание/обновление пользователя
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            const url = editingId 
                ? `http://localhost:5000/api/users/${editingId}`
                : 'http://localhost:5000/api/users';
            
            const method = editingId ? 'PATCH' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Что-то пошло не так');
            }

            setSuccess(editingId ? 'Пользователь успешно обновлен' : 'Пользователь успешно создан');
            fetchUsers();
            setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                birth_date: '',
                role: 'user'
            });
            setEditingId(null);
        } catch (error) {
            setError(error.message);
        }
    };

    // Удаление пользователя
    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                const response = await fetch(`/api/users/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    fetchUsers();
                }
            } catch (error) {
                console.error('Ошибка при удалении:', error);
            }
        }
    };

    // Редактирование пользователя
    const handleEdit = (user) => {
        // Форматируем дату в формат YYYY-MM-DD
        let formattedDate = '';
        if (user.birth_date) {
            // Преобразуем строку даты в объект Date
            const date = new Date(user.birth_date);
            // Форматируем дату в YYYY-MM-DD
            formattedDate = date.toISOString().split('T')[0];
        }
    
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '',
            birth_date: formattedDate, // Используем отформатированную дату
            role: user.role || 'user'
        });
        setEditingId(user.id);
    };

    return (
        <div className="user-management">
            <div className="container">
                <h1>Управление пользователями</h1>
                
                {/* Выносим сообщения в отдельный контейнер */}
                <div className="messages-container">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}
                </div>

                {/* Форма создания/редактирования */}
                <div className="form-section">
                    <h2>{editingId ? 'Редактировать пользователя' : 'Создать пользователя'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Имя"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="tel"
                                placeholder="Телефон"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Пароль"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required={!editingId}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="date"
                                value={formData.birth_date}
                                onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                required
                            >
                                <option value="user">Пользователь</option>
                                <option value="admin">Администратор</option>
                            </select>
                        </div>
                        <button type="submit" className="submit-btn">
                            {editingId ? 'Обновить' : 'Создать'}
                        </button>
                        {editingId && (
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({
                                        name: '',
                                        email: '',
                                        phone: '',
                                        password: '',
                                        birth_date: '',
                                        role: 'user'
                                    });
                                }}
                            >
                                Отмена
                            </button>
                        )}
                    </form>
                </div>

                {/* Таблица пользователей */}
                <div className="users-table">
                    <h2>Список пользователей</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Имя</th>
                                <th>Email</th>
                                <th>Телефон</th>
                                <th>Дата рождения</th>
                                <th>Роль</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>{user.birth_date}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEdit(user)}
                                        >
                                            Редактировать
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;