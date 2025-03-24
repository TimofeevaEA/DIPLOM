import React, { useState, useEffect, useCallback } from 'react';
import TrainingClients from '../../schedule/TrainingClients';
import './TrainerSchedule.css';

const TrainerSchedule = () => {
    const [scheduleData, setScheduleData] = useState([]);
    const [weeksList, setWeeksList] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

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

    const fetchTrainerSchedule = useCallback(async (weekId) => {
        if (!currentUser?.id) return;
        
        try {
            const response = await fetch(`/api/schedule/week/${weekId}/trainer/${currentUser.id}`);
            const data = await response.json();
            setScheduleData(data);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        if (currentWeek?.id) {
            fetchTrainerSchedule(currentWeek.id);
        }
    }, [currentWeek?.id, fetchTrainerSchedule]);

    useEffect(() => {
        fetchWeeks();
    }, []);

    const fetchWeeks = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/weeks');
            const data = await response.json();
            console.log('Полученные недели:', data);
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
                if (firstRegularWeek) {
                    setCurrentWeek(firstRegularWeek);
                }
            }
        } catch (error) {
            console.error('Error fetching weeks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteTraining = async (scheduleId) => {
        if (window.confirm('Завершить тренировку?')) {
            try {
                const response = await fetch(`/api/schedule/${scheduleId}/complete`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to complete training');
                }

                fetchTrainerSchedule(currentWeek.id);
                alert('Тренировка завершена');
            } catch (error) {
                alert('Ошибка при завершении тренировки');
            }
        }
    };

    const renderScheduleCell = (timeSlot, day) => {
        const scheduleItems = scheduleData.filter(item => 
            item.start_time === timeSlot.value && 
            item.day_of_week === day.id
        );

        if (scheduleItems.length > 0) {
            const item = scheduleItems[0];
            return (
                <div 
                    className={`schedule-cell-content ${item.is_completed ? 'completed' : ''}`}
                    onClick={() => setSelectedSchedule(item)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="training-item">
                        <div className="training-name">{item.direction_name}</div>
                        <div className="capacity">
                            Мест: {item.spots_left}/{item.capacity}
                        </div>
                        <div className="training-status">
                            {item.is_completed ? 
                                <span className="status completed">Завершена</span> : 
                                <span className="status active">Активна</span>
                            }
                        </div>
                    </div>
                </div>
            );
        }

        return <div className="schedule-cell-empty" />;
    };

    const handleWeekChange = (direction) => {
        const regularWeeks = weeksList.filter(week => !week.is_template);
        const currentIndex = regularWeeks.findIndex(week => week.id === currentWeek.id);
        console.log('Current index:', currentIndex, 'Direction:', direction);

        if (direction === 'next' && currentIndex < regularWeeks.length - 1) {
            setCurrentWeek(regularWeeks[currentIndex + 1]);
        } else if (direction === 'prev' && currentIndex > 0) {
            setCurrentWeek(regularWeeks[currentIndex - 1]);
        }
    };

    const formatWeekDates = (week) => {
        if (!week) return '';
        const start = new Date(week.start_date);
        const end = new Date(week.end_date);
        return `${start.toLocaleDateString('ru-RU')} - ${end.toLocaleDateString('ru-RU')}`;
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
                        <h2>{currentWeek ? formatWeekDates(currentWeek) : 'Нет расписания'}</h2>
                        <button 
                            className="week-navigation__btn"
                            onClick={() => handleWeekChange('next')}
                            disabled={!currentWeek || 
                                weeksList.filter(w => !w.is_template)[weeksList.filter(w => !w.is_template).length - 1]?.id === currentWeek.id}
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading">Загрузка расписания...</div>
            ) : (
                <div className="schedule">
                    <div className="schedule__header">
                        <div className="time-column">Время</div>
                        {days.map(day => (
                            <div key={day.id} className="day-column">{day.name}</div>
                        ))}
                    </div>
                    
                    <div className="schedule__body">
                        {timeSlots.map(timeSlot => (
                            <div key={timeSlot.value} className="time-row">
                                <div className="time-cell">{timeSlot.label}</div>
                                {days.map(day => (
                                    <div key={`${day.id}-${timeSlot.value}`} className="day-cell">
                                        {renderScheduleCell(timeSlot, day)}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedSchedule && (
                <TrainingClients
                    scheduleId={selectedSchedule.id}
                    onClose={() => {
                        setSelectedSchedule(null);
                        if (currentWeek) {
                            fetchTrainerSchedule(currentWeek.id);
                        }
                    }}
                    onScheduleUpdate={() => {
                        if (currentWeek) {
                            fetchTrainerSchedule(currentWeek.id);
                        }
                    }}
                    weekId={currentWeek?.id}
                />
            )}
        </div>
    );
};

export default TrainerSchedule;
