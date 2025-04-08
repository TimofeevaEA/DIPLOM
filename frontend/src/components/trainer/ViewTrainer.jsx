import React, { useState, useEffect } from 'react';
import './viewTrainer.css';

function ViewTrainer() {
    const [trainers, setTrainers] = useState([]);

    useEffect(() => {
        const loadTrainers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/trainers');
                const data = await response.json();
                console.log('Загруженные тренеры:', data); // Добавим для отладки
                setTrainers(data);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        loadTrainers();
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
                    {trainers && trainers.length > 0 ? (
                        trainers.map(trainer => (
                            <div key={trainer.id} className="trainer-card">
                                <div className="trainer-image-container">
                                <img 
                                    src={trainer.photo ? `/img/trainers/${trainer.photo}` : '/img/default-trainer.jpg'} 
                                    alt={`Фото тренера ${trainer.user_name}`}
                                    className="trainer-image"
                                    onLoad={handleImageLoad}
                                    onError={(e) => {
                                        console.error('Ошибка загрузки изображения:', e.target.src);
                                        e.target.src = '/img/default-trainer.jpg'; // Fallback изображение
                                    }}
                                />
                                </div>
                                <div className="trainer-info">
                                    <p className="trainer-specialization">{trainer.user_name}</p>
                                    <button className="read-more-btn">читать о педагоге</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Загрузка тренеров...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ViewTrainer;
