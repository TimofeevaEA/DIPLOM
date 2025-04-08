import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ArticleView.css';

const ArticleView = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchArticle();
    }, [id]);

    const fetchArticle = async () => {
        try {
            const response = await fetch(`/api/articles/${id}`);
            if (!response.ok) {
                throw new Error('Статья не найдена');
            }
            const data = await response.json();
            setArticle(data);
            setError(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="loading">Загрузка статьи...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Ошибка</h2>
                <p>{error}</p>
                <Link to="/articles" className="back-link">
                    Вернуться к списку статей
                </Link>
            </div>
        );
    }

    if (!article) {
        return <div>Статья не найдена</div>;
    }

    return (
        <div className="article-view">
            <nav className="article-nav">
                <Link to="/articles" className="back-link">
                    ← Назад к статьям
                </Link>
            </nav>

            <article className="article-full">
                <header className="article-header">
                    <h1>{article.title}</h1>
                    <div className="article-meta">
                        <span className="article-author">
                            Автор: {article.author.name}
                        </span>
                        <span className="article-date">
                            {formatDate(article.created_at)}
                        </span>
                        <span className="article-category">
                            {article.category === 'sport' ? 'Спорт' : 'Питание'}
                        </span>
                    </div>
                </header>

                {article.photo && (
                    <div className="article-main-image">
                        <img 
                            src={`/img/articles/${article.photo}`} 
                            alt={article.title}
                            loading="lazy"
                        />
                    </div>
                )}

                <div 
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                <footer className="article-footer">
                    <div className="article-update-info">
                        {article.updated_at !== article.created_at && (
                            <small>
                                Обновлено: {formatDate(article.updated_at)}
                            </small>
                        )}
                    </div>
                </footer>
            </article>
        </div>
    );
};

export default ArticleView; 