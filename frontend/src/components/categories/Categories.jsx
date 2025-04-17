import React, { useState, useEffect } from 'react';
import './categories.css';

function Categories() {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Загрузка категорий
    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/categories');
            const data = await response.json();
            if (response.ok) {
                setCategories(data);
            }
        } catch (error) {
            setError('Ошибка при загрузке категорий');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Отправка формы (создание или редактирование)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const url = editingId 
                ? `http://localhost:5000/api/categories/${editingId}`
                : 'http://localhost:5000/api/categories';
            
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
                throw new Error(data.error);
            }

            setSuccess(editingId ? 'Категория обновлена' : 'Категория создана');
            fetchCategories();
            setFormData({ name: '', description: '' });
            setEditingId(null);
        } catch (error) {
            setError(error.message);
        }
    };

    // Удаление категории
    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setSuccess('Категория удалена');
                fetchCategories();
            } else {
                const data = await response.json();
                throw new Error(data.error);
            }
        } catch (error) {
            setError(error.message);
        }
    };

    // Начать редактирование
    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        setEditingId(category.id);
    };

    return (
        <div className="categories-container" style={{ marginTop: '60px' }}>
            <h1>Управление категориями</h1>
            <div className="messages-container">
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
            </div>

            <div className="form-section">
                <h2>{editingId ? 'Редактировать категорию' : 'Добавить категорию'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Название:</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Описание:</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="submit-btn">
                            {editingId ? 'Сохранить' : 'Добавить'}
                        </button>
                        {editingId && (
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ name: '', description: '' });
                                }}
                            >
                                Отмена
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="categories-list">
                <h2>Список категорий</h2>
                {categories.map(category => (
                    <div key={category.id} className="category-item">
                        <div className="category-content">
                            <h3>{category.name}</h3>
                            <p>{category.description}</p>
                        </div>
                        <div className="category-actions">
                            <button 
                                className="edit-btn"
                                onClick={() => handleEdit(category)}
                            >
                                Редактировать
                            </button>
                            <button 
                                className="delete-btn"
                                onClick={() => handleDelete(category.id)}
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

export default Categories;
