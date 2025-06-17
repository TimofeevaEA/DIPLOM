import React, { useState, useEffect } from 'react';
import './CreateLessonModal.css';

const CreateLessonModal = React.memo(({ cellData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    direction_id: '',
    trainer_id: '',
    capacity: 10,
  });

  const [trainers, setTrainers] = useState([]);
  const [directions, setDirections] = useState([]);

  // Добавляем отображение информации о выбранной ячейке
  const timeSlots = {
    8: '8:00', 9: '9:00', 10: '10:00', 11: '11:00',
    12: '12:00', 13: '13:00', 14: '14:00', 15: '15:00',
    16: '16:00', 17: '17:00', 18: '18:00', 19: '19:00',
    20: '20:00', 21: '21:00'
  };

  const days = {
    1: 'Понедельник',
    2: 'Вторник',
    3: 'Среда',
    4: 'Четверг',
    5: 'Пятница',
    6: 'Суббота',
    7: 'Воскресенье'
  };

  useEffect(() => {
    fetchTrainers();
    fetchDirections();
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
    console.debug('Submitting training:', {
      ...formData,
      day: ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][cellData.dayId],
      time: `${cellData.timeSlot}:00`,
      room: cellData.roomId
    });
    onSave(formData);
  };

  return (
    <div className="lesson-modal-overlay" onClick={onClose}>
      <div className="lesson-modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="lesson-modal-title">Создать тренировку</h2>
        
        <div className="lesson-modal-cell-info">
          <p>Время: {timeSlots[cellData.timeSlot]}</p>
          <p>День недели: {days[cellData.dayId]}</p>
          <p>Зал: {cellData.roomId}</p>
        </div>

        <form onSubmit={handleSubmit} className="lesson-modal-form">
          <div className="lesson-modal-form-group">
            <label>Направление:</label>
            <select 
              value={formData.direction_id} 
              onChange={(e) => setFormData({...formData, direction_id: e.target.value})}
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

          <div className="lesson-modal-form-group">
            <label>Тренер:</label>
            <select 
              value={formData.trainer_id} 
              onChange={(e) => setFormData({...formData, trainer_id: e.target.value})}
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

          <div className="lesson-modal-form-group">
            <label>Количество мест:</label>
            <input 
              type="number" 
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
              min="1"
              required
              placeholder="Введите количество мест"
              title="Количество мест"
              aria-label="Количество мест"
            />
          </div>

          <div className="lesson-modal-buttons">
            <button type="button" onClick={onClose} className="lesson-modal-cancel-btn">
              Отмена
            </button>
            <button type="submit" className="lesson-modal-save-btn">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default CreateLessonModal; 