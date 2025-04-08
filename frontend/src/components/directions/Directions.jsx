import React, { useState, useEffect } from 'react';
import './directions.css';

const Directions = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [directions, setDirections] = useState([]);
    const [selectedDirection, setSelectedDirection] = useState(null);

    useEffect(() => {
        fetchDirections();
    }, []);

    const fetchDirections = async () => {
        try {
            const response = await fetch('/api/directions');
            const data = await response.json();
            setDirections(data);
        } catch (error) {
            console.error('Ошибка при загрузке направлений:', error);
        }
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            if (nextIndex >= directions.length) {
                return 0;
            }
            return nextIndex;
        });
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => {
            const prevIndexValue = prevIndex - 1;
            if (prevIndexValue < 0) {
                return directions.length - 1;
            }
            return prevIndexValue;
        });
    };

    const handleDirectionClick = (direction) => {
        setSelectedDirection(direction);
        const index = directions.findIndex(d => d.id === direction.id);
        if (index !== -1) {
            setCurrentIndex(index);
        }
    };

    // Создаем массив для бесконечной прокрутки
    const infiniteDirections = [...directions, ...directions, ...directions];

    return (
        <section className="directions">
            <div className="container">
                <h1>НАПРАВЛЕНИЯ</h1>
                <div className="directions_arrows">
                    <svg width="17" height="13" viewBox="0 0 17 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 6.5L1.5 6.5M1.5 6.5L7 12M1.5 6.5L7 1" stroke="white" strokeWidth="1" />
                    </svg>
                    <svg width="17" height="13" viewBox="0 0 17 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 6.5H15.5M15.5 6.5L10 1M15.5 6.5L10 12" stroke="white" strokeWidth="1" />
                    </svg>
                </div>
                <div className="directions_slider">
                    <div 
                        className="directions_slider_container" 
                        style={{ 
                            transform: `translateX(-${currentIndex * 734}px)`,
                            transition: 'transform 0.5s ease',
                            display: 'flex'
                        }}
                    >
                        {infiniteDirections.map((direction, index) => {
                            return (
                                <div className="directions_card" key={index}>
                                    <img 
                                        src={direction.photo ? `/img/directions/${direction.photo}` : '/img/directions/default.png'} 
                                        alt={direction.name} 
                                        className="directions_card_img" 
                                    />
                                    <div className="directions_card_content">
                                        <div className="directions_card_title">{direction.name}</div>
                                        <div className="directions_card_description">{direction.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button className="directions_slider_button left" onClick={handlePrev}>←</button>
                    <button className="directions_slider_button right" onClick={handleNext}>→</button>
                </div>
                <div className="direction-buttons">
                    {directions.map((direction) => (
                        <button
                            key={direction.id}
                            className={`direction-button ${selectedDirection?.id === direction.id ? 'active' : ''}`}
                            onClick={() => handleDirectionClick(direction)}
                        >
                            {direction.name}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Directions;