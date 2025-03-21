import React, { useState, useEffect } from 'react';
import './CreateLessonModal.css';

const CreateLessonModal = ({ cellData, onClose, onSave }) => {
  const [directions, setDirections] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [formData, setFormData] = useState({
    week_id: cellData.week_id,
    day_of_week: cellData.day,
    start_time: cellData.time,
    room: cellData.room,
    direction_id: '',
    trainer_id: '',
    capacity: 10
  });

  useEffect(() => {
    console.log('Начальные данные формы:', formData);
    fetchDirections();
    fetchTrainers();
  }, []);

  const fetchDirections = async () => {
    try {
      const response = await fetch('/api/directions');
      const data = await response.json();
      setDirections(data);
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await fetch('/api/trainers');
      const data = await response.json();
      setTrainers(data);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Преобразуем данные в нужный формат
    const lessonData = {
      ...formData,
      direction_id: parseInt(formData.direction_id),
      trainer_id: parseInt(formData.trainer_id),
      day_of_week: formData.day_of_week.toUpperCase(),
      week_id: parseInt(formData.week_id)
    };
    
    console.log('Отправляем данные:', lessonData); // добавим для отладки
    onSave(lessonData);
  };

  return (
    <div className="lesson-modal-overlay">
      <div className="lesson-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Создать тренировку</h2>
        
        <form onSubmit={handleSubmit} className="lesson-form">
          <div className="form-info">
            <p>День: {cellData.day}</p>
            <p>Время: {cellData.time}</p>
            <p>Зал: {cellData.room}</p>
          </div>

          <div className="form-group">
            <label>Направление:</label>
            <select
              value={formData.direction_id}
              onChange={(e) => setFormData({...formData, direction_id: e.target.value})}
              required
            >
              <option value="">Выберите направление</option>
              {directions.map(dir => (
                <option key={dir.id} value={dir.id}>{dir.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Тренер:</label>
            <select
              value={formData.trainer_id}
              onChange={(e) => setFormData({...formData, trainer_id: e.target.value})}
              required
            >
              <option value="">Выберите тренера</option>
              {trainers.map(trainer => (
                <option key={trainer.id} value={trainer.id}>{trainer.user_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Количество мест:</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
              min="1"
              max="50"
              required
            />
          </div>

          <button type="submit" className="save-btn">
            Создать тренировку
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateLessonModal; 