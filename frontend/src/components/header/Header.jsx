import React, { useState, useEffect } from 'react';
import './header.css';
import menuIcon from '/img/header/menu.png';
import profileIcon from '/img/header/profile.png';
import AuthModal from '../authorization/authorization';
import { Link } from 'react-router-dom';

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
        // Добавляем роль в объект пользователя, если её нет
        const userWithRole = {
            ...user,
            role: user.role || 'user' // По умолчанию роль 'user', если не указана
        };
        setCurrentUser(userWithRole);
        // Сохраняем пользователя в localStorage
        localStorage.setItem('currentUser', JSON.stringify(userWithRole));
        // Добавляем событие для обновления App
        window.dispatchEvent(new Event('authChange'));
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
                // Добавляем событие для обновления App
                window.dispatchEvent(new Event('authChange'));
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
                    {/* Общие ссылки */}
                    <li><Link to="/" onClick={toggleMenu}>Главная</Link></li>
                    <li><Link to="/articles">Статьи</Link></li>
                    <li><Link to="/directions">Направления</Link></li>
                    
                    {/* Ссылки для клиента (если залогинен и не админ/тренер) */}
                    {currentUser && currentUser.role === 'user' && (
                        <li><Link to="/schedule" onClick={toggleMenu}>Мое расписание</Link></li>
                    )}

                    {/* Ссылки для тренера */}
                    {currentUser?.role === 'trainer' && (
                        <>
                            <li className="menu-divider"></li>
                            <li><h3 className="menu_section_title">Тренер</h3></li>
                            <li><Link to="/schedule" onClick={toggleMenu}>Мое расписание</Link></li>
                            {/* Можно добавить другие ссылки для тренера, например, профиль */}
                        </>
                    )}

                    {/* Ссылки для администратора */}
                    {currentUser?.role === 'admin' && (
                        <>
                            <li className="menu-divider"></li>
                            <li><h3 className="menu_section_title">Управление</h3></li>
                            <li><Link to="/schedule" onClick={toggleMenu}>Расписание (Админ)</Link></li>
                            <li><Link to="/admin/trainers" onClick={toggleMenu}>Тренеры</Link></li>
                            <li><Link to="/admin/users" onClick={toggleMenu}>Пользователи</Link></li>
                            <li><Link to="/admin/categories" onClick={toggleMenu}>Категории</Link></li>
                            <li><Link to="/admin/direction-edit" onClick={toggleMenu}>Направления</Link></li>
                            <li><Link to="/admin/subscriptions" onClick={toggleMenu}>Абонементы</Link></li>
                            <li><Link to="/admin/articles/edit" onClick={toggleMenu}>Управление статьями</Link></li>
                            {/* Добавьте другие ссылки, если нужно */}
                        </>
                    )}
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
