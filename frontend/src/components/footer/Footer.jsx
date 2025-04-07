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
                key: 'e24ae811-db7a-49cd-b603-dcd4ad0c7359',
                zoomControl: {
                    position: 'topRight',
                    // Добавляем подписи для кнопок
                    labels: {
                        zoomIn: 'Увеличить масштаб карты',
                        zoomOut: 'Уменьшить масштаб карты'
                    }
                }
            });

            // Добавляем маркер с описанием
            const marker = new window.mapgl.Marker(map, {
                coordinates: [83.03827557022423, 54.99048327623374],
                label: {
                    text: 'IVA FITNESS SPACE',
                    offset: [0, -20]
                }
            });

            // Добавляем aria-label для контейнера карты
            const mapContainer = document.getElementById('map-container');
            mapContainer.setAttribute('aria-label', 'Карта расположения фитнес центра');
            mapContainer.setAttribute('role', 'region');
        };

        document.head.appendChild(script);

        // Очистка при размонтировании
        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    return (
        <footer className="footer" role="contentinfo">
            <div className="container">
                <div className="footer_content">
                    <div className="footer_info">
                        <div className="footer_section">
                            <h3>Контакты</h3>
                            <p>Телефон: <a href="tel:+79833185809" aria-label="Позвонить по телефону">+7‒983‒318‒58‒09</a></p>
                            <p>Email: <a href="mailto:ivafitnessspace@gmail.com" aria-label="Отправить email">ivafitnessspace@gmail.com</a></p>
                            <p>Адрес: г. Новосибирск, ул. Пролетарская, 271/3 1 этаж</p>
                        </div>
                        <div className="footer_section">
                            <h3>Навигация</h3>
                            <ul role="navigation">
                                <li><a href="/" aria-label="Перейти на главную страницу">Главная</a></li>
                                <li><a href="/about" aria-label="Перейти на страницу о нас">О нас</a></li>
                                <li><a href="#section1" aria-label="Перейти к расписанию">Расписание</a></li>
                                <li><a href="/create" aria-label="Перейти к разделу спорт">Спорт</a></li>
                                <li><a href="/posts" aria-label="Перейти к разделу питание">Питание</a></li>
                            </ul>
                        </div>
                        <div className="footer_section">
                            <h3>Социальные сети</h3>
                            <div className="social_links">
                                <a href="https://vk.com/iva_fitness_space" 
                                   className="social_link" 
                                   aria-label="Перейти в группу ВКонтакте"
                                   target="_blank" 
                                   rel="noopener noreferrer">VK</a>
                                <a href="https://t.me/+79833185809" 
                                   className="social_link" 
                                   aria-label="Написать в Telegram"
                                   target="_blank" 
                                   rel="noopener noreferrer">Telegram</a>
                            </div>
                        </div>
                    </div>
                    <div 
                        id="map-container" 
                        className="footer_map"
                        aria-label="Карта с расположением фитнес центра"
                        role="region"
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