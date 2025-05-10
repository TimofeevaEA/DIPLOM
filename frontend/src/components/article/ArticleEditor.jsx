import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './ArticleEditor.css';
import ArticleListView from './ArticleListView';

const ArticleEditor = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const navigate = useNavigate();
    const [article, setArticle] = useState({
        title: '',
        content: '',
        category: 'sport',
        photo: null
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    useEffect(() => {
        if (id) {
            fetchArticle();
        }
    }, [id]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/articles/${id}`);
            if (!response.ok) {
                throw new Error('Ошибка загрузки статьи');
            }
            const data = await response.json();
            setArticle({
                title: data.title,
                content: data.content,
                category: data.category,
                photo: null
            });
            if (data.photo) {
                setPreview(`/img/articles/${data.photo}`);
            }
        } catch (error) {
            console.error('Ошибка при загрузке статьи:', error);
            alert(error.message || 'Ошибка при загрузке статьи');
        } finally {
            setLoading(false);
        }
    };

    const handleEditorChange = (content, editor) => {
        setArticle(prev => ({
            ...prev,
            content: content
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setArticle(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert('Файл слишком большой. Максимальный размер 5MB');
                return;
            }
            setArticle(prev => ({
                ...prev,
                photo: file
            }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!article.title.trim() || !article.content.trim()) {
            alert('Заполните все обязательные поля');
            return;
        }

        const formData = new FormData();
        formData.append('title', article.title);
        formData.append('author_id', currentUser.id);
        formData.append('content', article.content);
        formData.append('category', article.category);
        if (article.photo) {
            formData.append('photo', article.photo);
        }

        try {
            const url = id ? `/api/articles/${id}` : '/api/articles';
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                alert(id ? 'Статья успешно обновлена!' : 'Статья успешно создана!');
                if (!id) {
                    setArticle({
                        title: '',
                        content: '',
                        category: 'sport',
                        photo: null
                    });
                    setPreview(null);
                }
                navigate('/articles');
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Произошла ошибка');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message || 'Произошла ошибка');
        }
    };

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    return (
        <div className="article-editor">
            <h1>{id ? 'Редактирование статьи' : 'Создание новой статьи'}</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Название статьи:</label>
                    <input
                        id="title"
                        type="text"
                        name="title"
                        value={article.title}
                        onChange={handleInputChange}
                        required
                        placeholder="Введите название статьи"
                        aria-label="Название статьи"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Категория:</label>
                    <select
                        id="category"
                        name="category"
                        value={article.category}
                        onChange={handleInputChange}
                        aria-label="Категория статьи"
                    >
                        <option value="sport">Спорт</option>
                        <option value="food">Питание</option>
                        <option value="news">Новости</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="photo">Фото:</label>
                    <input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        aria-label="Фото для статьи"
                    />
                    {preview && (
                        <img 
                            src={preview} 
                            alt="Предпросмотр фото" 
                            className="photo-preview"
                        />
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="content">Содержание статьи:</label>
                    <Editor
                        id="content"
                        apiKey="ваш_api_ключ_tiny"
                        init={{
                            height: 500,
                            menubar: true,
                            plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image',
                                'charmap', 'preview', 'anchor', 'searchreplace',
                                'visualblocks', 'code', 'fullscreen', 'insertdatetime',
                                'media', 'table', 'code', 'help', 'wordcount',
                                'image'
                            ],
                            toolbar: 'undo redo | formatselect | ' +
                                'bold italic backcolor | alignleft aligncenter ' +
                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                'removeformat | image | help',
                            language: 'ru',
                            content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; }',
                            images_upload_url: '/api/articles/upload-image',
                            automatic_uploads: true,
                            file_picker_types: 'image',
                            images_reuse_filename: true
                        }}
                        value={article.content}
                        onEditorChange={handleEditorChange}
                    />
                </div>

                <button 
                    type="submit" 
                    className="submit-btn"
                    aria-label={id ? "Сохранить изменения" : "Опубликовать статью"}
                >
                    {id ? "Сохранить изменения" : "Опубликовать статью"}
                </button>
            </form>
            {!id && <ArticleListView />}
        </div>
    );
};

export default ArticleEditor;
