import { useEffect } from 'react';
import './footer.css';

const Footer = () => {
    useEffect(() => {
        // Создаем и добавляем скрипт
        const script = document.createElement('script');
        script.src = 'https://mapgl.2gis.com/api/js/v1';
        script.async = true;
        
        // Когда скрипт загрузится, инициализируем карту
        script.onload = () => {
            const map = new window.mapgl.Map('map-container', {
                center: [83.03827557022423, 54.99048327623374],
                zoom: 16,
                key: 'e24ae811-db7a-49cd-b603-dcd4ad0c7359'
            });

            const marker = new window.mapgl.Marker(map, {
                coordinates: [83.03827557022423, 54.99048327623374]
            });
        };

        document.head.appendChild(script);

        // Очистка при размонтировании
        return () => {
            document.head.removeChild(script);
        };
    }, []);

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer_content">
                    <div className="footer_info">
                        <div className="footer_section">
                            <h3>Контакты</h3>
                            <p>Телефон: +7‒983‒318‒58‒09</p>
                            <p>Email: ivafitnessspace@gmail.com</p>
                            <p>Адрес: г. Новосибирск, ул. Пролетарская, 271/3 1 этаж</p>
                        </div>
                        <div className="footer_section">
                            <h3>Навигация</h3>
                            <ul>
                                <li><a href="/">Главная</a></li>
                                <li><a href="/about">О нас</a></li>
                                <li><a href="#section1">Расписание</a></li>
                                <li><a href="/create">Спорт</a></li>
                                <li><a href="/posts">Питание</a></li>
                            </ul>
                        </div>
                        <div className="footer_section">
                            <h3>Социальные сети</h3>
                            <div className="social_links">
                                <a href="https://vk.com/iva_fitness_space" className="social_link">VK</a>
                                <a href="https://t.me/+79833185809" className="social_link">Telegram</a>
                            </div>
                        </div>
                    </div>
                    <div 
                        id="map-container" 
                        className="footer_map"
                    ></div>
                </div>
                <div className="footer_bottom">
                    <p>© 2025 Все права защищены</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;