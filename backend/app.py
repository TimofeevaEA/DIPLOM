from . import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Создаем таблицы только при запуске приложения
    app.run(debug=True)


