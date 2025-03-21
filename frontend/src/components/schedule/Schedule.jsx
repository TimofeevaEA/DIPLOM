import React, { useState, useEffect } from 'react';
import './Schedule.css';
import CreateWeekModal from './CreateWeekModal';
import CreateLessonModal from './CreateLessonModal';

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [weeksList, setWeeksList] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateWeekModal, setShowCreateWeekModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  
  const timeSlots = [
    "8:00", "9:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00", 
    "18:00", "19:00", "20:00", "21:00"
  ];
  
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const rooms = ['Зал 1', 'Зал 2'];

  const dayMapping = {
    'Пн': 'MONDAY',
    'Вт': 'TUESDAY',
    'Ср': 'WEDNESDAY',
    'Чт': 'THURSDAY',
    'Пт': 'FRIDAY',
    'Сб': 'SATURDAY',
    'Вс': 'SUNDAY'
  };

  const dayMappingToEng = {
    'Пн': 'MONDAY',
    'Вт': 'TUESDAY',
    'Ср': 'WEDNESDAY',
    'Чт': 'THURSDAY',
    'Пт': 'FRIDAY',
    'Сб': 'SATURDAY',
    'Вс': 'SUNDAY'
  };

  useEffect(() => {
    fetchWeeks();
  }, []);

  useEffect(() => {
    if (currentWeek) {
      fetchScheduleData(currentWeek.id);
    }
  }, [currentWeek]);

  useEffect(() => {
    // Проверяем роль пользователя
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setIsAdmin(user?.role === 'admin');
  }, []);

  const fetchWeeks = async () => {
    try {
      const response = await fetch('/api/weeks');
      const data = await response.json();
      setWeeksList(data);
      
      // Находим ближайшую неделю к текущей дате
      const today = new Date();
      const nearestWeek = data.find(week => !week.is_template && 
        new Date(week.start_date) <= today && 
        new Date(week.end_date) >= today
      );
      
      if (nearestWeek) {
        setCurrentWeek(nearestWeek);
      } else {
        // Если нет текущей недели, берем первую не шаблонную
        const firstRegularWeek = data.find(week => !week.is_template);
        setCurrentWeek(firstRegularWeek);
      }
    } catch (error) {
      console.error('Error fetching weeks:', error);
    }
  };

  const createNewWeek = async (startDate) => {
    try {
      const response = await fetch('/api/weeks/copy-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ start_date: startDate })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create new week');
      }

      // Обновляем список недель
      fetchWeeks();
    } catch (error) {
      console.error('Error creating new week:', error);
    }
  };

  const fetchScheduleData = async (weekId) => {
    try {
      const response = await fetch(`/api/schedule/week/${weekId}`);
      const data = await response.json();
      console.log('Данные, полученные с сервера:', data);
      setScheduleData(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const handleWeekChange = (direction) => {
    const currentIndex = weeksList.findIndex(week => week.id === currentWeek.id);
    const regularWeeks = weeksList.filter(week => !week.is_template);
    const currentRegularIndex = regularWeeks.findIndex(week => week.id === currentWeek.id);

    if (direction === 'next') {
      if (currentRegularIndex < regularWeeks.length - 1) {
        setCurrentWeek(regularWeeks[currentRegularIndex + 1]);
      } else {
        // Если следующей недели нет, предлагаем создать новую
        const lastWeek = regularWeeks[regularWeeks.length - 1];
        const nextWeekStart = new Date(lastWeek.end_date);
        nextWeekStart.setDate(nextWeekStart.getDate() + 1);
        
        if (window.confirm('Создать следующую неделю?')) {
          createNewWeek(nextWeekStart.toISOString().split('T')[0]);
        }
      }
    } else if (direction === 'prev' && currentRegularIndex > 0) {
      setCurrentWeek(regularWeeks[currentRegularIndex - 1]);
    }
  };

  const getFilteredTimeSlots = () => {
    switch (timeFilter) {
      case 'morning':
        return timeSlots.filter(time => {
          const hour = parseInt(time.split(':')[0]);
          return hour >= 8 && hour < 12;
        });
      case 'day':
        return timeSlots.filter(time => {
          const hour = parseInt(time.split(':')[0]);
          return hour >= 12 && hour < 17;
        });
      case 'evening':
        return timeSlots.filter(time => {
          const hour = parseInt(time.split(':')[0]);
          return hour >= 17;
        });
      default:
        return timeSlots;
    }
  };

  const formatWeekDates = (week) => {
    if (!week) return '';
    const start = new Date(week.start_date);
    const end = new Date(week.end_date);
    return `${start.toLocaleDateString('ru-RU')} - ${end.toLocaleDateString('ru-RU')}`;
  };

  const handleCellClick = (time, day, room) => {
    if (!isAdmin) return;
    
    setSelectedCell({
      time,
      day: dayMapping[day],
      room,
      week_id: currentWeek.id
    });
    setShowLessonModal(true);
  };

  const renderScheduleCell = (time, day, room) => {
    // Добавим отладочную информацию для входных данных
    console.log('Данные с сервера:', scheduleData);
    console.log('Параметры ячейки до преобразования:', { time, day, room });

    // Преобразуем день недели в английский формат
    const englishDay = dayMappingToEng[day];
    
    console.log('День недели после преобразования:', englishDay);

    const scheduleItems = scheduleData.filter(item => {
      // Проверяем каждое условие отдельно для отладки
      const timeMatch = item.start_time === time;
      const dayMatch = item.day_of_week === englishDay;
      const roomMatch = item.room === room;

      console.log('Детали сравнения:', {
        'Запись из БД': {
          time: item.start_time,
          day: item.day_of_week,
          room: item.room
        },
        'Параметры ячейки': {
          time: time,
          day: englishDay,
          room: room
        },
        'Результаты сравнения': {
          timeMatch,
          dayMatch,
          roomMatch
        }
      });

      return timeMatch && dayMatch && roomMatch;
    });

    if (scheduleItems.length > 0) {
      return (
        <div className="schedule-cell-content">
          {scheduleItems.map((item, index) => (
            <div key={item.id} className="training-item">
              <div className="training-name">{item.direction_name}</div>
              <div className="trainer-name">{item.trainer_name}</div>
              <div className="capacity">Мест: {item.capacity}</div>
              {index < scheduleItems.length - 1 && <div className="divider"></div>}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div 
        className="schedule-cell-empty"
        onClick={() => handleCellClick(time, day, room)}
      >
        {isAdmin ? '+' : ''}
      </div>
    );
  };

  const handleCreateWeek = async (weekData) => {
    try {
      const response = await fetch('/api/weeks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(weekData)
      });

      if (!response.ok) {
        throw new Error('Failed to create week');
      }

      // Обновляем список недель
      fetchWeeks();
      setShowCreateWeekModal(false);
    } catch (error) {
      console.error('Error creating week:', error);
      alert('Ошибка при создании недели');
    }
  };

  return (
    <div className="content">
      <div className="content__header">
        <div className="week-controls">
          <div className="week-navigation">
            <button 
              className="week-navigation__btn"
              onClick={() => handleWeekChange('prev')}
              disabled={!currentWeek || weeksList.filter(w => !w.is_template)[0]?.id === currentWeek.id}
            >
              ←
            </button>
            <h2>{currentWeek ? formatWeekDates(currentWeek) : 'Нет созданных недель'}</h2>
            <button 
              className="week-navigation__btn"
              onClick={() => handleWeekChange('next')}
            >
              →
            </button>
          </div>
          
          <button 
            className="create-week-btn"
            onClick={() => setShowCreateWeekModal(true)}
          >
            Создать неделю
          </button>
        </div>
        
        <div className="time-filters">
          <button 
            className={`time-filter__btn ${timeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTimeFilter('all')}
          >
            Все
          </button>
          <button 
            className={`time-filter__btn ${timeFilter === 'morning' ? 'active' : ''}`}
            onClick={() => setTimeFilter('morning')}
          >
            Утро
          </button>
          <button 
            className={`time-filter__btn ${timeFilter === 'day' ? 'active' : ''}`}
            onClick={() => setTimeFilter('day')}
          >
            День
          </button>
          <button 
            className={`time-filter__btn ${timeFilter === 'evening' ? 'active' : ''}`}
            onClick={() => setTimeFilter('evening')}
          >
            Вечер
          </button>
        </div>
      </div>

      <div className="schedule">
        <div className="schedule__header">
          <div className="time-column">Время</div>
          {days.map(day => (
            <div key={day} className="day-column">{day}</div>
          ))}
        </div>
        
        <div className="schedule__body">
          {getFilteredTimeSlots().map(time => (
            <div key={time} className="time-row">
              <div className="time-cell">{time}</div>
              {days.map(day => (
                <div key={`${day}-${time}`} className="day-cell">
                  {rooms.map(room => (
                    <div key={`${day}-${time}-${room}`} className="room-cell">
                      {renderScheduleCell(time, day, room)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showCreateWeekModal && (
        <CreateWeekModal
          onClose={() => setShowCreateWeekModal(false)}
          onSave={handleCreateWeek}
        />
      )}

      {showLessonModal && selectedCell && (
        <CreateLessonModal
          cellData={selectedCell}
          onClose={() => {
            setShowLessonModal(false);
            setSelectedCell(null);
          }}
          onSave={async (lessonData) => {
            try {
              console.log('Отправляемые данные:', lessonData);
              const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(lessonData)
              });

              if (!response.ok) {
                const errorData = await response.json();
                console.error('Ошибка от сервера:', errorData);
                throw new Error(errorData.error || 'Failed to create lesson');
              }

              // Обновляем данные расписания
              fetchScheduleData(currentWeek.id);
              setShowLessonModal(false);
              setSelectedCell(null);
            } catch (error) {
              console.error('Error creating lesson:', error);
              alert('Ошибка при создании тренировки');
            }
          }}
        />
      )}
    </div>
  );
};

export default Schedule;
