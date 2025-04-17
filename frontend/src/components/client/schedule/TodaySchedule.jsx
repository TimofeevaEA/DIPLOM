import React, { useState, useEffect } from 'react';
import './TodaySchedule.css';

const TodaySchedule = () => {
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchTodaySchedule();
    }, []);

    const fetchTodaySchedule = async () => {
        try {
            const dayOfWeek = currentDate.getDay() || 7; // Преобразуем 0 (воскресенье) в 7
            const response = await fetch(`/api/schedule/today`);
            if (!response.ok) {
                throw new Error('Failed to fetch schedule');
            }
            const data = await response.json();
            // Сортируем по времени
            const sortedData = data.sort((a, b) => 
                a.start_time - b.start_time
            );
            setTodaySchedule(sortedData);
        } catch (error) {
            console.error('Error fetching today schedule:', error);
            setTodaySchedule([]);
        }
    };

    const formatDate = (date) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return date.toLocaleDateString('ru-RU', options);
    };

    const formatTime = (hour) => {
        return `${hour}:00-${hour}:55`;
    };

    return (
        
        <div className="container">
            <h1>РАСПИСАНИЕ В СТУДИИ СЕГОДНЯ</h1>
            <div className="today-schedule__header">
                
                <p className="today-date">{formatDate(currentDate)}</p>
            </div>
            
            <div className="schedule-list">
                {todaySchedule.map((item, index) => (
                    <div key={index} className="schedule-item">
                        <div className="time-slot">
                            {formatTime(item.start_time)}
                        </div>
                        <div className="training-info">
                            <span className="training-name">
                                {item.direction_name}
                            </span>
                        </div>
                        <div className="trainer-name">
                            {item.trainer_name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodaySchedule;