import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ArticleListView.css';

const PER_PAGE = 10;

const ArticleListView = () => {
    const [articles, setArticles] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const debounceRef = useRef();
    const navigate = useNavigate();

    const fetchArticles = async (pageNum = 1, searchValue = '') => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({
                page: pageNum,
                per_page: PER_PAGE,
                search: searchValue
            });
            const res = await fetch(`/api/articles?${params.toString()}`);
            if (!res.ok) throw new Error('Ошибка загрузки статей');
            const data = await res.json();
            setArticles(data.articles);
            setTotal(data.total);
        } catch (e) {
            setError(e.message || 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    // Debounce поиск
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearch(searchValue);
            setPage(1);
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [searchValue]);

    useEffect(() => {
        fetchArticles(page, search);
        // eslint-disable-next-line
    }, [page, search]);

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Удалить статью?')) return;
        try {
            const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Ошибка удаления');
            fetchArticles(page, search);
        } catch (e) {
            alert(e.message || 'Ошибка удаления');
        }
    };

    const handleView = (id) => {
        navigate(`/articles/${id}`);
    };

    const handleEdit = (id) => {
        navigate(`/admin/articles/edit?id=${id}`);
    };

    const totalPages = Math.ceil(total / PER_PAGE);

    return (
        <div className="article-list-view">
            <h2>Список статей</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <input
                    type="text"
                    placeholder="Поиск по статьям..."
                    value={searchValue}
                    onChange={handleSearchChange}
                    className="article-search-input"
                />
                {loading && <div className="article-loading-spinner" title="Загрузка..." />}
            </div>
            {error && <div className="error">{error}</div>}
            <table className={`article-table${loading ? ' loading' : ''}`}>
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Дата</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {articles.map(article => (
                        <tr key={article.id}>
                            <td>{article.title}</td>
                            <td>{article.created_at}</td>
                            <td>
                                <button onClick={() => handleView(article.id)}>Просмотр</button>
                                <button onClick={() => handleEdit(article.id)}>Редактировать</button>
                                <button onClick={() => handleDelete(article.id)}>Удалить</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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

export default ArticleListView; 