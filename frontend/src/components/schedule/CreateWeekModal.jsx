import React, { useState } from 'react';
import './CreateWeekModal.css';

const CreateWeekModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    start_date: '',
    is_template: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Вычисляем конец недели (start_date + 6 дней)
    const startDate = new Date(formData.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const weekData = {
      start_date: formData.start_date,
      end_date: endDate.toISOString().split('T')[0],
      is_template: formData.is_template
    };

    onSave(weekData);
  };

  return (
    <div className="week-modal-overlay">
      <div className="week-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Создать новую неделю</h2>
        
        <form onSubmit={handleSubmit} className="week-form">
          <div className="form-group">
            <label>Дата начала недели:</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              required
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.is_template}
                onChange={(e) => setFormData({...formData, is_template: e.target.checked})}
              />
              Шаблонная неделя
            </label>
          </div>

          <div className="form-info">
            {formData.start_date && (
              <p>
                Неделя будет создана с {new Date(formData.start_date).toLocaleDateString('ru-RU')} по{' '}
                {new Date(new Date(formData.start_date).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}
              </p>
            )}
          </div>

          <button type="submit" className="save-btn">
            Создать неделю
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWeekModal; 