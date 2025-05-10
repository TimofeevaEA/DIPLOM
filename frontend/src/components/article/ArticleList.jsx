import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ArticleList.css';

const PER_PAGE = 9;

const getCategoryLabel = (cat) => {
    if (cat === 'sport') return 'Спорт';
    if (cat === 'food') return 'Питание';
    if (cat === 'news') return 'Новости';
    return cat;
};

const ArticleList = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [articleCache, setArticleCache] = useState(new Map()); // Кэш статей
    const debounceRef = useRef();
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Загрузка статей при изменении поиска, категории или страницы
    useEffect(() => {
        fetchArticles();
    }, [search, selectedCategory, page]);

    // Debounce для поиска
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearch(searchValue);
            setPage(1);
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [searchValue]);

    const fetchArticles = async () => {
        setIsTransitioning(true);
        try {
            const params = [];
            if (selectedCategory !== 'all') params.push(`category=${selectedCategory}`);
            if (search) params.push(`search=${encodeURIComponent(search)}`);
            params.push(`page=${page}`);
            params.push(`per_page=${PER_PAGE}`);
            const url = `/api/articles${params.length ? '?' + params.join('&') : ''}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Ошибка при загрузке статей');
            }
            const data = await response.json();
            
            // Обновляем кэш новыми статьями
            const newCache = new Map(articleCache);
            (data.articles || data).forEach(article => {
                newCache.set(article.id, article);
            });
            setArticleCache(newCache);
            
            // Добавляем небольшую задержку для плавного перехода
            setTimeout(() => {
                setArticles(data.articles || data);
                setTotal(data.total || (Array.isArray(data) ? data.length : 0));
                setIsTransitioning(false);
            }, 150);
        } catch (error) {
            console.error('Ошибка:', error);
            setArticles([]);
            setTotal(0);
            setIsTransitioning(false);
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

    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

    const handleResetFilters = () => {
        setSelectedCategory('all');
        setSearch('');
        setSearchValue('');
        setPage(1);
    };

    return (
        <div className="articles-container">
            <div className="articles-header">
                <h1>Статьи</h1>
                <div className="category-filter">
                    <select 
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setPage(1);
                        }}
                        aria-label="Фильтр по категории"
                    >
                        <option value="all">Все категории</option>
                        <option value="sport">Спорт</option>
                        <option value="food">Питание</option>
                        <option value="news">Новости</option>
                    </select>
                </div>
                <input
                    type="text"
                    className="article-search-input"
                    placeholder="Поиск по названию или содержимому..."
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    style={{marginLeft: 16, minWidth: 180}}
                />
                {(selectedCategory !== 'all' || search) && (
                    <button className="reset-filters-btn" onClick={handleResetFilters}>
                        Сбросить фильтры
                    </button>
                )}
            </div>
            <div className={`articles-grid ${isTransitioning ? 'transitioning' : ''}`}>
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
                                        {getCategoryLabel(article.category)}
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
                        {search || selectedCategory !== 'all'
                            ? 'По вашему запросу ничего не найдено.'
                            : 'Статьи не найдены'}
                    </div>
                )}
            </div>
            <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>Назад</button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        className={page === i + 1 ? 'active' : ''}
                        onClick={() => setPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Вперёд</button>
            </div>
        </div>
    );
};

export default ArticleList; 