import React, { useState, useEffect } from 'react';
import './Schedule.css';
import CreateWeekModal from './CreateWeekModal';
import CreateLessonModal from './CreateLessonModal';
import TrainingClients from './TrainingClients';
import CompletedTrainingClients from './CompletedTrainingClients';

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
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  
  const timeSlots = [
    { value: 8, label: '8:00' },
    { value: 9, label: '9:00' },
    { value: 10, label: '10:00' },
    { value: 11, label: '11:00' },
    { value: 12, label: '12:00' },
    { value: 13, label: '13:00' },
    { value: 14, label: '14:00' },
    { value: 15, label: '15:00' },
    { value: 16, label: '16:00' },
    { value: 17, label: '17:00' },
    { value: 18, label: '18:00' },
    { value: 19, label: '19:00' },
    { value: 20, label: '20:00' },
    { value: 21, label: '21:00' }
  ];
  
  const days = [
    { id: 1, name: 'Пн' },
    { id: 2, name: 'Вт' },
    { id: 3, name: 'Ср' },
    { id: 4, name: 'Чт' },
    { id: 5, name: 'Пт' },
    { id: 6, name: 'Сб' },
    { id: 7, name: 'Вс' }
  ];

  const rooms = [1, 2];

  const dayMapping = {
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
    7: 'SUNDAY'
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
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setIsAdmin(user?.role === 'admin');
  }, []);

  const fetchWeeks = async () => {
    try {
      const response = await fetch('/api/weeks');
      const data = await response.json();
      setWeeksList(data);
      
      const today = new Date();
      const nearestWeek = data.find(week => !week.is_template && 
        new Date(week.start_date) <= today && 
        new Date(week.end_date) >= today
      );
      
      if (nearestWeek) {
        setCurrentWeek(nearestWeek);
      } else {
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

      fetchWeeks();
    } catch (error) {
      console.error('Error creating new week:', error);
      alert('Ошибка при создании новой недели');
    }
  };

  const fetchScheduleData = async (weekId) => {
    try {
        const response = await fetch(`/api/schedule/week/${weekId}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Failed to fetch schedule');
        }
        const data = await response.json();
        console.log('Received schedule data:', data);
        setScheduleData(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        setScheduleData([]);
    }
  };

  const handleWeekChange = (direction) => {
    const regularWeeks = weeksList.filter(week => !week.is_template);
    const currentIndex = regularWeeks.findIndex(week => week.id === currentWeek.id);

    if (direction === 'next') {
        if (currentIndex < regularWeeks.length - 1) {
            setCurrentWeek(regularWeeks[currentIndex + 1]);
        } else {
            // Если следующей недели нет, создаем новую
            const lastWeek = regularWeeks[regularWeeks.length - 1];
            const nextWeekStart = new Date(lastWeek.end_date);
            nextWeekStart.setDate(nextWeekStart.getDate() + 1);
            
            if (window.confirm('Создать следующую неделю?')) {
                createNewWeek(nextWeekStart.toISOString().split('T')[0]);
            }
        }
    } else if (direction === 'prev' && currentIndex > 0) {
        setCurrentWeek(regularWeeks[currentIndex - 1]);
    }
  };

  const getFilteredTimeSlots = () => {
    switch (timeFilter) {
      case 'morning':
        return timeSlots.filter(time => {
          const hour = parseInt(time.label.split(':')[0]);
          return hour >= 8 && hour < 12;
        });
      case 'day':
        return timeSlots.filter(time => {
          const hour = parseInt(time.label.split(':')[0]);
          return hour >= 12 && hour < 17;
        });
      case 'evening':
        return timeSlots.filter(time => {
          const hour = parseInt(time.label.split(':')[0]);
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

  const handleCellClick = (schedule) => {
    if (schedule) {
        setSelectedSchedule(schedule);
    } else if (isAdmin) {
        setSelectedCell({
            weekId: currentWeek.id,
            dayId: selectedCell.dayId,
            timeSlot: selectedCell.timeSlot,
            roomId: selectedCell.roomId
        });
        setShowLessonModal(true);
    }
  };

  const handleCloseModal = () => {
    setSelectedSchedule(null);
    if (currentWeek?.id) {
        fetchScheduleData(currentWeek.id);
    }
  };

  const handleEmptyCellClick = (timeSlot, day, roomId) => {
    if (isAdmin) {
        const newCell = {
            weekId: currentWeek.id,
            dayId: day.id,
            timeSlot: timeSlot.value,
            roomId: roomId
        };
        console.debug('Creating training:', {
            day: ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][day.id],
            time: `${timeSlot.value}:00`,
            room: roomId
        });
        setSelectedCell(newCell);
        setShowLessonModal(true);
    }
  };

  const renderScheduleCell = (timeSlot, day, roomId) => {
    const scheduleItems = scheduleData.filter(item => 
        item.start_time === timeSlot.value && 
        item.day_of_week === day.id && 
        item.room_id === roomId
    );

    if (scheduleItems.length > 0) {
        const item = scheduleItems[0];
        return (
            <div 
                className="schedule-cell-content"
                onClick={() => setSelectedSchedule(item)}
            >
                <div className={`training-item ${item.is_completed ? 'completed' : ''}`}>
                    <div className="training-name">{item.direction_name}</div>
                    <div className="trainer-name">{item.trainer_name}</div>
                    <div className="capacity">
                        Мест: {item.spots_left || 0}/{item.capacity}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`schedule-cell-empty ${isAdmin ? 'clickable' : ''}`}
            onClick={() => handleEmptyCellClick(timeSlot, day, roomId)}
        >
            {isAdmin && <span className="add-button">+</span>}
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

      fetchWeeks();
      setShowCreateWeekModal(false);
    } catch (error) {
      console.error('Error creating week:', error);
      alert('Ошибка при создании недели');
    }
  };

  const handleDeleteTraining = async (scheduleId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту тренировку?')) {
        try {
            const response = await fetch(`/api/schedule/${scheduleId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete training');
            }

            // Обновляем данные расписания после удаления
            fetchScheduleData(currentWeek.id);
        } catch (error) {
            console.error('Error deleting training:', error);
            alert('Ошибка при удалении тренировки');
        }
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
            <div key={day.id} className="day-column">{day.name}</div>
          ))}
        </div>
        
        <div className="schedule__body">
          {getFilteredTimeSlots().map(timeSlot => (
            <div key={timeSlot.value} className="time-row">
              <div className="time-cell">{timeSlot.label}</div>
              {days.map(day => (
                <div key={`${day.id}-${timeSlot.value}`} className="day-cell">
                  {rooms.map(roomId => (
                    <div key={`${day.id}-${timeSlot.value}-${roomId}`} className="room-cell">
                      {renderScheduleCell(timeSlot, day, roomId)}
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
          key={`modal-${selectedCell.dayId}-${selectedCell.timeSlot}-${selectedCell.roomId}`}
          cellData={selectedCell}
          onClose={() => {
            setShowLessonModal(false);
            setSelectedCell(null);
          }}
          onSave={async (lessonData) => {
            try {
              const completeData = {
                ...lessonData,
                week_id: selectedCell.weekId,
                day_of_week: selectedCell.dayId,
                start_time: selectedCell.timeSlot,
                room_id: selectedCell.roomId,
                spots_left: lessonData.capacity
              };

              const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(completeData)
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create lesson');
              }

              await fetchScheduleData(currentWeek.id);
              setShowLessonModal(false);
              setSelectedCell(null);
            } catch (error) {
              console.error('Error creating lesson:', error);
              alert('Ошибка при создании тренировки: ' + error.message);
            }
          }}
        />
      )}

      {selectedSchedule && (
        selectedSchedule.is_completed ? (
            <CompletedTrainingClients
                scheduleId={selectedSchedule.id}
                onClose={handleCloseModal}
            />
        ) : (
            <TrainingClients
                scheduleId={selectedSchedule.id}
                onClose={handleCloseModal}
                onScheduleUpdate={() => fetchScheduleData(currentWeek.id)}
                weekId={currentWeek?.id}
            />
        )
      )}
    </div>
  );
};

export default Schedule;