import React, { useState, useEffect } from 'react';
import './header.css';
import menuIcon from '/img/header/menu.png';
import profileIcon from '/img/header/profile.png';
import AuthModal from '../authorization/authorization';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(() => {
        // Получаем пользователя из localStorage при инициализации
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [scrollPosition, setScrollPosition] = useState(0);

    const toggleMenu = () => {
        if (!isMenuOpen) {
            // Сохраняем текущую позицию прокрутки перед открытием меню
            const currentScroll = window.pageYOffset;
            setScrollPosition(currentScroll);
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${currentScroll}px`;
            document.body.style.paddingRight = '15px'; // Компенсируем ширину скроллбара
        } else {
            // Восстанавливаем позицию прокрутки при закрытии меню
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            document.body.style.paddingRight = '';
            window.scrollTo(0, scrollPosition);
        }
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogin = (user) => {
        setCurrentUser(user);
        // Сохраняем пользователя в localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/authorization/logout', {
                method: 'POST',
            });

            if (response.ok) {
                setCurrentUser(null);
                // Удаляем пользователя из localStorage
                localStorage.removeItem('currentUser');
            }
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    return (
        <header className="header">
            <div className="container">
                <a href="#" className="header_link" onClick={(e) => {
                    e.preventDefault(); // Предотвращаем переход по ссылке
                    toggleMenu();
                }}>
                    <img src={menuIcon} alt="Меню" />
                    <p className="header_text">МЕНЮ</p>
                </a>
                <a href="#" className="header_link logo">LOGO</a>
                <div className="profile-section">
                    {currentUser ? (
                        <>
                            <span className="user-name">{currentUser.name}</span>
                            <a href="#" className="header_link" onClick={(e) => {
                                e.preventDefault();
                                handleLogout();
                            }}>
                                <img src={profileIcon} alt="Выйти" />
                            </a>
                        </>
                    ) : (
                        <a href="#" className="header_link" onClick={(e) => {
                            e.preventDefault();
                            setIsAuthModalOpen(true);
                        }}>
                            <img src={profileIcon} alt="Войти" />
                        </a>
                    )}
                </div>
            </div>

            {/* Боковое меню */}
            <div className={`side_menu ${isMenuOpen ? 'open' : ''}`}>
                <button className="close_button" onClick={toggleMenu}>×</button>
                <ul className="menu_list">
                    <li><a href="#section1">Расписание</a></li>
                    <li><a href="#section2">Спорт</a></li>
                    <li><a href="#section3">Питание</a></li>
                </ul>
            </div>

            {/* Полупрозрачный фон для закрытия меню */}
            {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}

            <AuthModal 
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onLogin={handleLogin}
            />
        </header>
    );
}

export default Header;
