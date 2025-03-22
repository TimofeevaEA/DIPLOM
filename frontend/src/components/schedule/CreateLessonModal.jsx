import React, { useState, useEffect } from 'react';
import './CreateLessonModal.css';

const CreateLessonModal = ({ cellData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    direction_id: '',
    trainer_id: '',
    capacity: 10,
    week_id: cellData.week_id,
    day_of_week: cellData.day_of_week,
    start_time: cellData.time,
    room_id: cellData.room_id
  });

  const [directions, setDirections] = useState([]);
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    fetchDirections();
    fetchTrainers();
  }, []);

  const fetchDirections = async () => {
    try {
      const response = await fetch('/api/directions');
      if (!response.ok) throw new Error('Failed to fetch directions');
      const data = await response.json();
      setDirections(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await fetch('/api/trainers');
      if (!response.ok) throw new Error('Failed to fetch trainers');
      const data = await response.json();
      setTrainers(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Преобразуем данные в правильный формат перед отправкой
    const dataToSend = {
        direction_id: parseInt(formData.direction_id),
        trainer_id: parseInt(formData.trainer_id),
        capacity: parseInt(formData.capacity),
        week_id: parseInt(formData.week_id),
        day_of_week: parseInt(formData.day_of_week),
        start_time: formData.start_time,
        room_id: parseInt(formData.room_id)
    };

    console.log('Sending data:', dataToSend); // для отладки
    onSave(dataToSend);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Создать тренировку</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Направление:</label>
            <select 
              name="direction_id" 
              value={formData.direction_id}
              onChange={handleChange}
              required
            >
              <option value="">Выберите направление</option>
              {directions.map(direction => (
                <option key={direction.id} value={direction.id}>
                  {direction.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Тренер:</label>
            <select 
              name="trainer_id" 
              value={formData.trainer_id}
              onChange={handleChange}
              required
            >
              <option value="">Выберите тренера</option>
              {trainers.map(trainer => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Количество мест:</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              max="50"
              required
            />
          </div>

          <div className="form-info">
            <p>Время: {formData.start_time}</p>
            <p>День недели: {formData.day_of_week}</p>
            <p>Зал: {formData.room_id}</p>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="save-btn">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLessonModal; 