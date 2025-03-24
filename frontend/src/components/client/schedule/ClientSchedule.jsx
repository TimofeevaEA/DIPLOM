import React, { useState, useEffect } from 'react';
import './ClientSchedule.css';

const ClientSchedule = () => {
    const [scheduleData, setScheduleData] = useState([]);
    const [weeksList, setWeeksList] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(null);
    const [myBookings, setMyBookings] = useState([]);
    const [timeFilter, setTimeFilter] = useState('all');
    const [viewMode, setViewMode] = useState('all');
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

    useEffect(() => {
        fetchWeeks();
        if (currentUser) {
            fetchMyBookings();
        }
    }, []);

    useEffect(() => {
        if (currentWeek) {
            fetchScheduleData(currentWeek.id);
        }
    }, [currentWeek]);

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
            }
        } catch (error) {
            console.error('Error fetching weeks:', error);
        }
    };

    const fetchScheduleData = async (weekId) => {
        try {
            const response = await fetch(`/api/schedule/week/${weekId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch schedule');
            }
            const data = await response.json();
            console.log('Полученное расписание:', data);
            setScheduleData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching schedule:', error);
            setScheduleData([]);
        }
    };

    const fetchMyBookings = async () => {
        try {
            console.log('Fetching bookings for user:', currentUser.id);
            const response = await fetch(`/api/users/${currentUser.id}/bookings`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Received bookings:', data);
            setMyBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setMyBookings([]);
        }
    };

    const handleBookTraining = async (scheduleId) => {
        const existingBooking = myBookings.find(booking => booking.schedule_id === scheduleId);
        if (existingBooking) {
            alert('Вы уже записаны на эту тренировку!');
            return;
        }

        if (window.confirm('Хотите записаться на эту тренировку?')) {
            try {
                const response = await fetch(`/api/schedule/${scheduleId}/book`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ clientId: currentUser.id })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Ошибка при записи');
                }

                alert('Вы успешно записаны!');
                fetchMyBookings();
                fetchScheduleData(currentWeek.id);
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const renderScheduleCell = (timeSlot, day) => {
        const scheduleItems = scheduleData.filter(item => {
            const baseFilter = item.start_time === timeSlot.value && 
                             item.day_of_week === day.id;
            
            if (viewMode === 'my') {
                const isBooked = myBookings.some(booking => booking.schedule_id === item.id);
                console.log(`Checking booking for item ${item.id}:`, isBooked);
                return baseFilter && isBooked;
            }
            return baseFilter;
        });

        if (scheduleItems.length > 0) {
            const item = scheduleItems[0];
            const isBooked = myBookings.some(booking => booking.schedule_id === item.id);
            console.log(`Cell ${item.id} isBooked:`, isBooked);

            return (
                <div className={`schedule-cell-content ${isBooked ? 'booked' : ''}`}>
                    <div className="training-item">
                        <div className="training-name">{item.direction_name}</div>
                        <div className="trainer-name">{item.trainer_name}</div>
                        <div className="capacity">
                            Мест: {item.spots_left}/{item.capacity}
                        </div>
                        {!item.is_completed && (
                            isBooked ? (
                                <div className="booked-status">Вы записаны</div>
                            ) : (
                                viewMode === 'all' && item.spots_left > 0 && (
                                    <button 
                                        className="book-button"
                                        onClick={() => handleBookTraining(item.id)}
                                    >
                                        Записаться
                                    </button>
                                )
                            )
                        )}
                    </div>
                </div>
            );
        }

        return <div className="schedule-cell-empty" />;
    };

    const handleWeekChange = (direction) => {
        const regularWeeks = weeksList.filter(week => !week.is_template);
        const currentIndex = regularWeeks.findIndex(week => week.id === currentWeek.id);

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
                    <div className="view-controls">
                        <button 
                            className={`view-button ${viewMode === 'all' ? 'active' : ''}`}
                            onClick={() => setViewMode('all')}
                        >
                            Все тренировки
                        </button>
                        <button 
                            className={`view-button ${viewMode === 'my' ? 'active' : ''}`}
                            onClick={() => setViewMode('my')}
                        >
                            Мои записи
                        </button>
                    </div>

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
                        >
                            →
                        </button>
                    </div>
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
        </div>
    );
};

export default ClientSchedule;