import React, { useState, useEffect } from 'react';
import './TrainerSchedule.css';
import { scheduleAPI } from '../../../api';

const daysOfWeek = {
    1: 'Понедельник',
    2: 'Вторник',
    3: 'Среда',
    4: 'Четверг',
    5: 'Пятница',
    6: 'Суббота',
    7: 'Воскресенье',
};

function formatTime(time) {
    if (!time) return '';
    if (typeof time === 'number') {
        return `${String(time).padStart(2, '0')}:00`;
    }
    if (/^\d{1,2}$/.test(time)) {
        return `${String(time).padStart(2, '0')}:00`;
    }
    return time.slice(0, 5);
}

const TrainerSchedule = ({ trainerId }) => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (trainerId) {
            loadSchedule();
        }
    }, [trainerId]);

    const loadSchedule = async () => {
        try {
            setLoading(true);
            setError('');
            const scheduleData = await scheduleAPI.getUpcomingSchedule(trainerId);
            setSchedule(scheduleData);
        } catch (err) {
            setError('Ошибка при загрузке расписания');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Загрузка расписания...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="currentColor"/>
                </svg>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="trainer-schedule">
            <div className="week-info">
            </div>
            <div className="schedule-list">
                {schedule.length > 0 ? (
                    schedule.map((lesson) => (
                        <div key={lesson.id} className="schedule-card">
                            <div className="schedule-card__day">
                                {daysOfWeek[lesson.day_of_week]}
                            </div>
                            <div className="schedule-card__time">
                                {formatTime(lesson.start_time)}
                            </div>
                            <div className="schedule-card__name">
                                {lesson.direction_name}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-schedule">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p>Нет предстоящих тренировок</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainerSchedule; 