import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ArticleList.css';

const ArticleList = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchArticles();
    }, [selectedCategory]);

    const fetchArticles = async () => {
        try {
            const url = selectedCategory === 'all' 
                ? '/api/articles' 
                : `/api/articles?category=${selectedCategory}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Ошибка при загрузке статей');
            }
            const data = await response.json();
            setArticles(data);
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return <div className="loading">Загрузка статей...</div>;
    }

    return (
        <div className="articles-container">
            <div className="articles-header">
                <h1>Статьи</h1>
                <div className="category-filter">
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        aria-label="Фильтр по категории"
                    >
                        <option value="all">Все категории</option>
                        <option value="sport">Спорт</option>
                        <option value="food">Питание</option>
                        <option value="news">Новости</option>
                    </select>
                </div>
            </div>

            <div className="articles-grid">
                {articles.length > 0 ? (
                    articles.map(article => (
                        <article key={article.id} className="article-card">
                            {article.photo && (
                                <div className="article-image">
                                    <img 
                                        src={`/img/articles/${article.photo}`} 
                                        alt={article.title}
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div className="article-content">
                                <h2>{article.title}</h2>
                                <div className="article-meta">
                                    <span className="article-date">
                                        {formatDate(article.created_at)}
                                    </span>
                                    <span className="article-category">
                                        {article.category === 'sport' ? 'Спорт' : article.category === 'food' ? 'Питание' : 'Новости'}
                                    </span>
                                </div>
                                
                                <Link 
                                    to={`/articles/${article.id}`} 
                                    className="read-more"
                                    aria-label={`Читать статью "${article.title}"`}
                                >
                                    Читать далее
                                </Link>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="no-articles">
                        Статьи не найдены
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleList; 