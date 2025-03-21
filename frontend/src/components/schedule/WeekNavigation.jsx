import React from 'react';

const formatWeekDates = (week) => {
  if (!week) return '';
  const start = new Date(week.start_date);
  const end = new Date(week.end_date);
  return `${start.toLocaleDateString('ru-RU')} - ${end.toLocaleDateString('ru-RU')}`;
};

const WeekNavigation = ({ currentWeek, weeksList, onWeekChange, onCreateWeek }) => {
  const regularWeeks = weeksList.filter(w => !w.is_template);
  const currentIndex = regularWeeks.findIndex(w => w.id === currentWeek?.id);
  
  return (
    <div className="week-controls">
      <div className="week-navigation">
        <button 
          className="week-navigation__btn"
          onClick={() => onWeekChange('prev')}
          disabled={!currentWeek || currentIndex === 0}
        >
          ←
        </button>
        <h2>{currentWeek ? formatWeekDates(currentWeek) : 'Нет созданных недель'}</h2>
        <button 
          className="week-navigation__btn"
          onClick={() => onWeekChange('next')}
        >
          →
        </button>
      </div>
      <button 
        className="create-week-btn"
        onClick={onCreateWeek}
      >
        Создать неделю
      </button>
    </div>
  );
};

export default WeekNavigation; 