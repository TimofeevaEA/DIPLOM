import React, { useState, useEffect } from 'react';
import './Trainer.css';

function Trainer() {
    const [trainers, setTrainers] = useState([]);
    const [users, setUsers] = useState([]); // Для выбора пользователя
    const [formData, setFormData] = useState({
        description: '',
        photo: null,
        user_id: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchTrainers();
        fetchUsers();
    }, []);

    const fetchTrainers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/trainers');
            const data = await response.json();
            setTrainers(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка при загрузке тренеров' });
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users');
            const data = await response.json();
            // Фильтруем только тренеров
            const trainersOnly = data.filter(user => user.role === 'trainer');
            setUsers(trainersOnly);
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка при загрузке пользователей' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('description', formData.description);
        formDataToSend.append('user_id', formData.user_id);
        if (formData.photo) {
            formDataToSend.append('photo', formData.photo);
        }

        try {
            const url = editingId 
                ? `http://localhost:5000/api/trainers/${editingId}`
                : 'http://localhost:5000/api/trainers';
            const method = editingId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                body: formDataToSend
            });

            if (response.ok) {
                setMessage({ type: 'success', text: `Тренер успешно ${editingId ? 'обновлен' : 'создан'}` });
                setFormData({ description: '', photo: null, user_id: '' });
                setEditingId(null);
                fetchTrainers();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка при сохранении тренера' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этого тренера?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/trainers/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setMessage({ type: 'success', text: 'Тренер успешно удален' });
                    fetchTrainers();
                }
            } catch (error) {
                setMessage({ type: 'error', text: 'Ошибка при удалении тренера' });
            }
        }
    };

    const handleEdit = (trainer) => {
        setFormData({
            description: trainer.description,
            user_id: trainer.user_id,
            photo: null
        });
        setEditingId(trainer.id);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, photo: e.target.files[0] });
    };

    return (
        <div className="container">
            <h1>УПРАВЛЕНИЕ ТРЕНЕРАМИ</h1>
            
            <div className="messages-container">
                {message && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="form-section">
                <h2>{editingId ? 'Редактировать тренера' : 'Добавить тренера'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Пользователь:</label>
                        <select
                            title="Выберите пользователя"
                            aria-label="Выберите пользователя"
                            value={formData.user_id}
                            onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                            required
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
                        <label>Описание:</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                            placeholder="Введите описание тренера"
                            title="Описание тренера"
                            aria-label="Описание тренера"
                        />
                    </div>

                    <div className="form-group">
                        <label>Фото:</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                            title="Выберите фото тренера"
                            aria-label="Выберите фото тренера"
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
                                    setFormData({ description: '', photo: null, user_id: '' });
                                }}
                            >
                                Отмена
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="trainers-list">
                <h2>Список тренеров</h2>
                {trainers.map(trainer => (
                    <div key={trainer.id} className="trainer-item">
                        <div className="trainer-content">
                            <img 
                                src={trainer.photo} 
                                alt="Фото тренера" 
                                className="trainer-photo"
                            />
                            <div className="info">
                                <p>{trainer.description}</p>
                            </div>
                        </div>
                        <div className="trainer-actions">
                            <button
                                onClick={() => handleEdit(trainer)}
                                className="edit-btn"
                            >
                                Редактировать
                            </button>
                            <button
                                onClick={() => handleDelete(trainer.id)}
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

export default Trainer;