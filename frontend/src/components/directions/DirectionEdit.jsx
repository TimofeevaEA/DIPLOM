import React, { useState, useEffect } from 'react';
import './Directions.css';

function DirectionEdit() {
  const [directions, setDirections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: null,
    category_id: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchDirections();
    fetchCategories();
  }, []);

  const fetchDirections = async () => {
    try {
      const response = await fetch('/api/directions');
      const data = await response.json();
      setDirections(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при загрузке направлений' });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при загрузке категорий' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category_id', formData.category_id);
    if (formData.photo) {
      formDataToSend.append('photo', formData.photo);
    }

    try {
      const url = editingId 
        ? `/api/directions/${editingId}` 
        : '/api/directions';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        body: formDataToSend
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Направление успешно ${editingId ? 'обновлено' : 'создано'}` });
        setFormData({ name: '', description: '', photo: null, category_id: '' });
        setEditingId(null);
        fetchDirections();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при сохранении направления' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить это направление?')) {
      try {
        const response = await fetch(`/api/directions/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setMessage({ type: 'success', text: 'Направление успешно удалено' });
          fetchDirections();
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Ошибка при удалении направления' });
      }
    }
  };

  const handleEdit = (direction) => {
    setFormData({
      name: direction.name,
      description: direction.description,
      category_id: direction.category_id,
      photo: null
    });
    setEditingId(direction.id);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  return (
    <div className="container" style={{ marginTop: '100px' }}>
      <h1>Управление направлениями</h1>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-section">
        <div className="form-group">
          <label>Название:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            placeholder="Введите название"
            title="Название направления"
            aria-label="Название направления"
          />
        </div>

        <div className="form-group">
          <label>Описание:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Введите описание"
            title="Описание направления"
            aria-label="Описание направления"
          />
        </div>

        <div className="form-group">
          <label>Категория:</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
            required
          >
            <option value="">Выберите категорию</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Фото:</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            title="Выберите фото"
            aria-label="Выберите фото"
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
                setFormData({ name: '', description: '', photo: null, category_id: '' });
              }}
            >
              Отмена
            </button>
          )}
        </div>
      </form>

      <div className="directions-list">
        {directions.map(direction => (
          <div key={direction.id} className="direction-item">
            <div className="direction-content">
              <h3>{direction.name}</h3>
              
            </div>
            <div className="direction-actions">
              <button
                onClick={() => handleEdit(direction)}
                className="edit-btn"
              >
                Редактировать
              </button>
              <button
                onClick={() => handleDelete(direction.id)}
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

export default DirectionEdit;
