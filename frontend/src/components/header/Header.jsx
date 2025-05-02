import React, { useState, useEffect } from 'react';
import './header.css';
import menuIcon from '/img/header/menu.png';
import profileIcon from '/img/header/profile.png';
import AuthModal from '../authorization/authorization';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(() => {
        // Получаем пользователя из localStorage при инициализации
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [scrollPosition, setScrollPosition] = useState(0);
    const navigate = useNavigate();

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
        const userWithRole = {
            ...user,
            role: user.role || 'user'
        };
        
        setCurrentUser(userWithRole);
        localStorage.setItem('currentUser', JSON.stringify(userWithRole));
        setIsAuthModalOpen(false);
        window.dispatchEvent(new Event('authChange'));
    };

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
            if (isMenuOpen) {
                toggleMenu();
            }
            window.dispatchEvent(new Event('authChange'));
            navigate('/');
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    const handleProfileClick = () => {
        if (currentUser) {
            // Перенаправляем на соответствующий профиль в зависимости от роли
            if (currentUser.role === 'trainer') {
                navigate('/profile/trainer');
            } else if (currentUser.role === 'admin') {
                navigate('/profile/admin');
            } else {
                navigate('/profile/client');
            }
        } else {
            setIsAuthModalOpen(true);
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
                    {currentUser && <span className="user-name">{currentUser.name}</span>}
                    <a href="#" className="header_link" onClick={(e) => {
                        e.preventDefault();
                        handleProfileClick();
                    }}>
                        <img src={profileIcon} alt={currentUser ? "Профиль" : "Войти"} />
                    </a>
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
                        <>
                            <li><Link to="/schedule" onClick={toggleMenu}>Мое расписание</Link></li>
                            <li><Link to="/profile/client" onClick={toggleMenu}>Личный кабинет</Link></li>
                        </>
                    )}

                    {/* Ссылки для тренера */}
                    {currentUser?.role === 'trainer' && (
                        <>
                            <li className="menu-divider"></li>
                            <li><h3 className="menu_section_title">Тренер</h3></li>
                            <li><Link to="/schedule" onClick={toggleMenu}>Мое расписание</Link></li>
                            <li><Link to="/profile/trainer" onClick={toggleMenu}>Личный кабинет</Link></li>
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
                            <li><Link to="/profile/client" onClick={toggleMenu}>Личный кабинет</Link></li>
                        </>
                    )}

                    {currentUser && (
                        <li>
                            <a href="#" onClick={(e) => {
                                e.preventDefault();
                                handleLogout();
                                toggleMenu();
                            }}>Выйти</a>
                        </li>
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
