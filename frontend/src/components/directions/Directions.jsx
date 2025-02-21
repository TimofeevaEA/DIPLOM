import React, { useState } from 'react';
import card1Img from '/img/directions/highheels.png';
import card2Img from '/img/directions/dance.png'; // Добавьте вторую картинку
import card3Img from '/img/directions/yoga.png'; // Добавьте третью картинку
import './directions.css';

const Directions = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const cards = [
        {
            img: card1Img,
            title: 'High Heels',
            description: 'Танцевальное направление high heels — это стиль, который сочетает в себе элементы женственcтвенных движений и яркой выразительности, выполненный на обуви на высоком каблуке.',
        },
        {
            img: card2Img,
            title: 'Dance',
            description: 'Танцевальное направление, которое включает различные стили танцев, направленные на развитие гибкости и координации движений.',
        },
        {
            img: card3Img,
            title: 'Yoga',
            description: 'Йога — это система физической, умственной и духовной практики, направленная на улучшение общего самочувствия и здоровья.',
        }
    ];

    // Создаем бесконечный массив карточек
    const infiniteCards = [...cards, ...cards, ...cards];

    const handleNext = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            // Если дошли до конца первого набора карточек, плавно перематываем в начало
            if (nextIndex >= cards.length) {
                setTimeout(() => {
                    setCurrentIndex(0);
                }, 0);
                return cards.length;
            }
            return nextIndex;
        });
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => {
            const prevIndexValue = prevIndex - 1;
            // Если дошли до начала, плавно перематываем в конец
            if (prevIndexValue < 0) {
                setTimeout(() => {
                    setCurrentIndex(cards.length - 1);
                }, 0);
                return -1;
            }
            return prevIndexValue;
        });
    };

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
                        {infiniteCards.map((card, index) => (
                            <div className="directions_card" key={index}>
                                <img src={card.img} alt={card.title} className="directions_card_img" />
                                <div className="directions_card_content">
                                    <div className="directions_card_title">{card.title}</div>
                                    <div className="directions_card_description">{card.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="directions_slider_button left" onClick={handlePrev}>←</button>
                    <button className="directions_slider_button right" onClick={handleNext}>→</button>
                </div>
            </div>
        </section>
    );
};

export default Directions;