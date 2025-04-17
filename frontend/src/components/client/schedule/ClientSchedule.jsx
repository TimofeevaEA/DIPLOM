import React, { useState, useEffect, useCallback } from 'react';
import './ClientSchedule.css';

const ClientSchedule = () => {
    const [scheduleData, setScheduleData] = useState([]);
    const [weeksList, setWeeksList] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(null);
    const [myBookings, setMyBookings] = useState([]);
    const [pastBookings, setPastBookings] = useState([]);
    const [viewMode, setViewMode] = useState('all');
    const [isLoadingAll, setIsLoadingAll] = useState(true);
    const [isLoadingMy, setIsLoadingMy] = useState(true);
    const [archiveLoading, setArchiveLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
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
            fetchTrainingHistory();
        }
    }, []);

    useEffect(() => {
        if (currentWeek) {
            fetchScheduleData(currentWeek.id);
        }
    }, [currentWeek]);

    const fetchWeeks = useCallback(async () => {
        setIsLoadingAll(true);
        try {
            const response = await fetch('/api/weeks');
            const data = await response.json();
            const regularWeeks = data.filter(week => !week.is_template);
            setWeeksList(regularWeeks);

            if (!currentWeek && regularWeeks.length > 0) {
                const today = new Date();
                const nearestWeek = regularWeeks.find(week =>
                    new Date(week.start_date) <= today && new Date(week.end_date) >= today
                );
                setCurrentWeek(nearestWeek || regularWeeks[0]);
            }
        } catch (error) {
            console.error('Error fetching weeks:', error);
        } finally {
            setIsLoadingAll(false);
        }
    }, [currentWeek]);

    const fetchScheduleData = useCallback(async (weekId) => {
        if (!weekId) return;
        setIsLoadingAll(true);
        try {
            const response = await fetch(`/api/schedule/week/${weekId}`);
            if (!response.ok) throw new Error('Failed to fetch schedule');
            const data = await response.json();
            setScheduleData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching schedule:', error);
            setScheduleData([]);
        } finally {
             setIsLoadingAll(false);
        }
    }, []);

    const fetchMyBookings = useCallback(async () => {
        if (!currentUser?.id) return;
        setIsLoadingMy(true);
        setArchiveLoading(true);
        
        try {
            const response = await fetch(`/api/users/${currentUser.id}/bookings`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            console.log('Все бронирования:', data); // Для отладки
            
            // Фильтруем и обрабатываем данные для текущих записей
            const currentBookings = data.filter(booking => 
                booking.status === 'Записан' || !booking.status
            );
            setMyBookings(currentBookings);
            
            // Фильтруем и обрабатываем данные для архива
            const archiveBookings = data.filter(booking => 
                booking.status === 'Посетил' || booking.status === 'Пропустил'
            );
            setPastBookings(archiveBookings);
            
            console.log('Архивные бронирования:', archiveBookings); // Для отладки
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setMyBookings([]);
            setPastBookings([]);
        } finally {
            setIsLoadingMy(false);
            setArchiveLoading(false);
        }
    }, [currentUser?.id]);

    const fetchTrainingHistory = useCallback(async (page = 1) => {
        if (!currentUser?.id) return;
        setArchiveLoading(true);
        
        try {
            const response = await fetch(`/api/users/${currentUser.id}/training-history?page=${page}&per_page=${itemsPerPage}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            console.log('История тренировок:', data);
            
            // Устанавливаем данные и информацию о пагинации
            if (data.items && Array.isArray(data.items)) {
                setPastBookings(data.items);
                setTotalPages(data.pages || 1);
                setCurrentPage(data.current_page || 1);
            } else {
                console.error('API вернул неверный формат данных:', data);
                setPastBookings([]);
                setTotalPages(1);
                setCurrentPage(1);
            }
        } catch (error) {
            console.error('Ошибка загрузки истории тренировок:', error);
            setPastBookings([]);
            setTotalPages(1);
            setCurrentPage(1);
        } finally {
            setArchiveLoading(false);
        }
    }, [currentUser?.id, itemsPerPage]);

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

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm('Вы уверены, что хотите отменить запись на эту тренировку?')) {
            try {
                const response = await fetch(`/api/client-schedule/${bookingId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Ошибка при отмене записи');
                }

                alert('Запись успешно отменена!');
                fetchMyBookings();
                if (currentWeek) {
                    fetchScheduleData(currentWeek.id);
                }
            } catch (error) {
                console.error('Error cancelling booking:', error);
                alert(error.message || 'Произошла ошибка при отмене записи');
            }
        }
    };

    const renderScheduleCell = (timeSlot, day) => {
        const scheduleItems = scheduleData.filter(item => {
            const baseFilter = item.start_time === timeSlot.value && 
                             item.day_of_week === day.id;
            
            if (viewMode === 'my') {
                const booking = myBookings.find(b => b.schedule_id === item.id);
                return baseFilter && !!booking;
            }
            return baseFilter;
        });

        if (scheduleItems.length > 0) {
            const item = scheduleItems[0];
            const booking = myBookings.find(b => b.schedule_id === item.id);
            const isBooked = !!booking;

            if (viewMode === 'my' && !isBooked) {
                return <div className="schedule-cell-empty" />;
            }

            return (
                <div className={`schedule-cell-content ${isBooked ? 'booked' : ''}`}>
                    <div className="training-item">
                        <div className="training-name">{item.direction_name}</div>
                        <div className="trainer-name">{item.trainer_name}</div>
                        <div className="capacity">
                            Мест: {item.spots_left !== undefined ? item.spots_left : item.capacity}/{item.capacity}
                        </div>
                        {!item.is_completed && (
                            isBooked ? (
                                <div className="booking-actions"> 
                                    <button 
                                        className="cancel-button"
                                        onClick={() => handleCancelBooking(booking.id)}
                                        title="Отменить запись"
                                        disabled={!booking?.id}
                                    >
                                        Выписаться
                                    </button>
                                </div>
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
        const currentIndex = weeksList.findIndex(week => week.id === currentWeek?.id);

        if (direction === 'next' && currentIndex < weeksList.length - 1) {
            setCurrentWeek(weeksList[currentIndex + 1]);
        } else if (direction === 'prev' && currentIndex > 0) {
            setCurrentWeek(weeksList[currentIndex - 1]);
        }
    };

    const formatWeekDates = (week) => {
        if (!week) return '';
        const start = new Date(week.start_date);
        const end = new Date(week.end_date);
        return `${start.toLocaleDateString('ru-RU')} - ${end.toLocaleDateString('ru-RU')}`;
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        if (mode === 'archive') {
            // Загружаем историю при переходе на вкладку архива
            fetchTrainingHistory(1); // Всегда начинаем с первой страницы
        }
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            fetchTrainingHistory(page);
        }
    };

    const renderArchive = () => {
        if (archiveLoading) {
            return <div className="loading">Загрузка истории тренировок...</div>;
        }
        
        if (!pastBookings || pastBookings.length === 0) {
            return (
                <div className="archive-empty">
                    <p>У вас нет архивных тренировок</p>
                </div>
            );
        }

        return (
            <div className="archive-container">
                <div className="archive-list">
                    {pastBookings.map((booking) => {
                        // Получаем день недели
                        const dayName = days.find(d => d.id === booking.day_of_week)?.name || 'День не указан';
                        
                        // Получаем время тренировки
                        const timeString = timeSlots.find(slot => slot.value === booking.start_time)?.label || '8:00';
                        
                        // Форматируем дату, если она есть
                        let dateString = 'Дата не указана';
                        if (booking.training_date) {
                            const date = new Date(booking.training_date);
                            dateString = date.toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                        }
                        
                        // Определяем класс для статуса
                        const statusClass = booking.status === 'Пропустил' ? 'missed' : 'attended';
                        
                        return (
                            <div key={booking.id} className="archive-item">
                                <div className="archive-item-header">
                                    <div className="archive-date">
                                        {dayName}, {dateString}
                                    </div>
                                    <div className="archive-time">{timeString}</div>
                                </div>
                                <div className="archive-content">
                                    <div className="archive-direction">{booking.direction_name}</div>
                                    <div className="archive-trainer">Тренер: {booking.trainer_name}</div>
                                    <div className={`archive-status ${statusClass}`}>
                                        {booking.status}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Пагинация */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button 
                            className="pagination-button" 
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            &laquo; Назад
                        </button>
                        
                        <div className="pagination-info">
                            Страница {currentPage} из {totalPages}
                        </div>
                        
                        <button 
                            className="pagination-button"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Вперед &raquo;
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="content">
            <div className="content__header">
                <div className="week-controls">
                    <div className="view-controls">
                        <button 
                            className={`view-button ${viewMode === 'all' ? 'active' : ''}`}
                            onClick={() => handleViewModeChange('all')}
                        >
                            Все тренировки
                        </button>
                        <button 
                            className={`view-button ${viewMode === 'my' ? 'active' : ''}`}
                            onClick={() => handleViewModeChange('my')}
                        >
                            Мои записи
                        </button>
                        <button 
                            className={`view-button ${viewMode === 'archive' ? 'active' : ''}`}
                            onClick={() => handleViewModeChange('archive')}
                        >
                            Архив
                        </button>
                    </div>

                    {viewMode !== 'archive' && (
                        <div className="week-navigation">
                            <button 
                                className="week-navigation__btn"
                                onClick={() => handleWeekChange('prev')}
                                disabled={!currentWeek || weeksList[0]?.id === currentWeek.id}
                            >
                                ←
                            </button>
                            <h2>{currentWeek ? formatWeekDates(currentWeek) : 'Нет расписания'}</h2>
                            <button 
                                className="week-navigation__btn"
                                onClick={() => handleWeekChange('next')}
                                disabled={!currentWeek || weeksList.slice(-1)[0]?.id === currentWeek.id}
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {viewMode === 'archive' ? (
                renderArchive()
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
        </div>
    );
};

export default ClientSchedule;