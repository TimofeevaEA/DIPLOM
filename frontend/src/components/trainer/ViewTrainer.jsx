import React, { useState, useEffect } from 'react';
import './viewTrainer.css';

function ViewTrainer() {
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadTrainers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/trainers');
                const data = await response.json();
                console.log('Загруженные тренеры:', data);
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

    const handleOpenModal = (trainer) => {
        setSelectedTrainer(trainer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTrainer(null);
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
                                    <button 
                                        className="read-more-btn"
                                        onClick={() => handleOpenModal(trainer)}
                                    >
                                        читать о педагоге
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Загрузка тренеров...</p>
                    )}
                </div>
            </div>

            {/* Модальное окно */}
            {isModalOpen && selectedTrainer && (
                <div className="trainer-modal-overlay" onClick={handleCloseModal}>
                    <div className="trainer-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="trainer-modal-close" onClick={handleCloseModal}>×</button>
                        <div className="trainer-modal-header">
                            <img 
                                src={selectedTrainer.photo ? `/img/trainers/${selectedTrainer.photo}` : '/img/default-trainer.jpg'} 
                                alt={`Фото тренера ${selectedTrainer.user_name}`}
                                className="trainer-modal-trainer-image"
                            />
                            <h2>{selectedTrainer.user_name}</h2>
                        </div>
                        <div className="trainer-modal-body">
                            <div className="trainer-modal-details">
                                <div className="trainer-modal-description">
                                    <h3>О педагоге:</h3>
                                    <p>{selectedTrainer.description || 'Описание отсутствует'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ViewTrainer;
