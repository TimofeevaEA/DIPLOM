import React, { useState, useEffect } from 'react';
import './viewTrainer.css';

function ViewTrainer() {
    const [trainers, setTrainers] = useState([]);

    useEffect(() => {
        // Используем кэширование через localStorage
        const cachedData = localStorage.getItem('trainersData');
        const cachedTimestamp = localStorage.getItem('trainersTimestamp');
        const cacheExpiry = 5 * 60 * 1000; // 5 минут в миллисекундах

        const loadTrainers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/trainers');
                const data = await response.json();
                setTrainers(data);
                // Сохраняем данные в кэш
                localStorage.setItem('trainersData', JSON.stringify(data));
                localStorage.setItem('trainersTimestamp', Date.now().toString());
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        // Проверяем актуальность кэша
        if (cachedData && cachedTimestamp && (Date.now() - parseInt(cachedTimestamp)) < cacheExpiry) {
            // Используем кэшированные данные
            setTrainers(JSON.parse(cachedData));
        } else {
            // Загружаем новые данные
            loadTrainers();
        }
    }, []);

    // Обработчик загрузки изображения
    const handleImageLoad = (event) => {
        event.target.classList.add('loaded');
    };

    return (
        <div className="trainers-view">
            <div className="container">
                <h1 className="trainers-title">ПЕДАГОГИ</h1>
                
                <div className="trainers-grid">
                    {trainers.map(trainer => (
                        <div key={trainer.id} className="trainer-card">
                            <div className="trainer-image-container">
                                <img 
                                    src={trainer.photo} 
                                    alt="Фото тренера" 
                                    className="trainer-image"
                                    onLoad={handleImageLoad}
                                />
                            </div>
                            <div className="trainer-info">
                                <p className="trainer-specialization">{trainer.user_name}</p>
                                <button className="read-more-btn">читать о педагоге</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ViewTrainer;
