import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ArticleList.css';

const RecentArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecentArticles();
    }, []);

    const fetchRecentArticles = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/articles');
            if (!response.ok) {
                throw new Error('Ошибка при загрузке статей');
            }
            const data = await response.json();
            const articlesData = data.articles || data;
            const recentArticles = Array.isArray(articlesData) ? articlesData.slice(0, 4) : [];
            setArticles(recentArticles);
        } catch (error) {
            console.error('Ошибка загрузки статей:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Загрузка статей...</div>;
    }

    if (error) {
        return <div className="error">Ошибка загрузки статей: {error}</div>;
    }

    if (articles.length === 0) {
        return null;
    }

    return (
        <section className="recent-articles">
            <div className="container">
                <div className="recent-articles-header">
                    <h1>ОБНОВЛЕНИЯ</h1>
                    <p className="subtitle">
                        Последние изменения,<br />
                        внесенные в содержание статей.
                    </p>
                    <p className="info-text">
                        Будьте всегда в курсе<br />
                        актуальной информации!
                    </p>
                </div>
                
                <div className="articles-grid">
                    {articles.map((article) => (
                        <div key={article.id} className="article-card">
                            {article.photo && (
                                <div className="article-image">
                                    <img 
                                        src={`/img/articles/${article.photo}`}
                                        alt={article.title}
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <h3>{article.title}</h3>
                            <Link 
                                to={`/articles/${article.id}`}
                                className="details-button"
                            >
                                Подробнее
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentArticles;
