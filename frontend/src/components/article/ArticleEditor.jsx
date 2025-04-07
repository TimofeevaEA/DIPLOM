import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import './ArticleEditor.css';

const ArticleEditor = () => {
    const [article, setArticle] = useState({
        title: '',
        content: '',
        category: 'sport',
        photo: null
    });
    const [preview, setPreview] = useState(null);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

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
            const response = await fetch('/api/articles', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Статья успешно создана!');
                setArticle({
                    title: '',
                    content: '',
                    category: 'sport',
                    photo: null
                });
                setPreview(null);
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Произошла ошибка при создании статьи');
            }
        } catch (error) {
            console.error('Ошибка при создании статьи:', error);
            alert(error.message || 'Произошла ошибка при создании статьи');
        }
    };

    return (
        <div className="article-editor">
            <h2>Создание новой статьи</h2>
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
                    aria-label="Опубликовать статью"
                >
                    Опубликовать статью
                </button>
            </form>
        </div>
    );
};

export default ArticleEditor;
