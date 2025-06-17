from locust import HttpUser, task, between, events
import time

class FitnessClubUser(HttpUser):
    wait_time = between(1, 3)  # Время ожидания между запросами
    
    def on_start(self):
        """Выполняется при старте каждого пользователя"""
        self.start_time = time.time()
        print("Начало тестирования")
    
    def on_stop(self):
        """Выполняется при остановке каждого пользователя"""
        duration = time.time() - self.start_time
        print(f"Тестирование завершено. Длительность: {duration:.2f} сек")
    
    @task(3)
    def get_schedule(self):
        """Получение расписания"""
        with self.client.get("/api/schedule/current-week", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Ошибка получения расписания: {response.status_code}")
    
    @task(2)
    def get_trainers(self):
        """Получение списка тренеров"""
        with self.client.get("/api/trainers", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Ошибка получения тренеров: {response.status_code}")
    
    @task(2)
    def get_directions(self):
        """Получение списка направлений"""
        with self.client.get("/api/directions", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Ошибка получения направлений: {response.status_code}")
    
    @task(1)
    def get_subscriptions(self):
        """Получение списка абонементов"""
        with self.client.get("/api/subscriptions", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Ошибка получения абонементов: {response.status_code}")
    
    @task(1)
    def get_rooms(self):
        """Получение списка залов"""
        with self.client.get("/api/rooms", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Ошибка получения залов: {response.status_code}")

# Обработчик для вывода итоговой статистики
@events.test_stop.add_listener
def on_test_stop(**kwargs):
    print("\n=== Итоги тестирования ===")
    print("Тест завершен!") 