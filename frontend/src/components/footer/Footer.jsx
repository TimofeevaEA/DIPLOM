import './footer.css';
const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer_content">
                    <div className="footer_section">
                        <h3>Контакты</h3>
                        <p>Телефон: +7 (999) 123-45-67</p>
                        <p>Email: info@example.com</p>
                        <p>Адрес: г. Москва, ул. Примерная, 123</p>
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
                            <a href="#" className="social_link">VK</a>
                            <a href="#" className="social_link">Telegram</a>
                        </div>
                    </div>
                </div>
                <div className="footer_bottom">
                    <p> 2024 Все права защищены</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;