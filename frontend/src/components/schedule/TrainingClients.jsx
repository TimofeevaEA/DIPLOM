import React, { useState, useEffect } from 'react';
import './TrainingClients.css';

const TrainingClients = ({ scheduleId, onClose, onScheduleUpdate }) => {
    const [bookedClients, setBookedClients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        fetchScheduleData();
        fetchBookedClients();
    }, [scheduleId]);

    const fetchScheduleData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/schedule/${scheduleId}`);
            if (!response.ok) throw new Error('Failed to fetch schedule');
            const data = await response.json();
            setIsCompleted(data.is_completed);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        }
    };

    const fetchBookedClients = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/schedule/${scheduleId}/clients`);
            if (!response.ok) throw new Error('Failed to fetch booked clients');
            const data = await response.json();
            setBookedClients(data);
            // Инициализируем карту посещаемости
            const initialAttendance = {};
            data.forEach(client => {
                initialAttendance[client.id] = client.status === 'Посетил';
            });
            setAttendanceMap(initialAttendance);
        } catch (error) {
            console.error('Error fetching booked clients:', error);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length >= 2) {
            try {
                const response = await fetch('http://localhost:5000/api/users');
                if (!response.ok) throw new Error('Failed to search clients');
                const data = await response.json();
                // Фильтруем только пользователей с ролью 'user'
                const filteredClients = data.filter(user => 
                    user.role === 'user' && 
                    (user.name.toLowerCase().includes(query.toLowerCase()) || 
                     user.phone.includes(query))
                );
                setSearchResults(filteredClients);
            } catch (error) {
                console.error('Error searching clients:', error);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleBookClient = async (clientId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/schedule/${scheduleId}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ clientId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to book client');
            }

            const data = await response.json();
            console.log('Booking successful:', data);
            
            // Обновляем список клиентов и данные расписания
            fetchBookedClients();
            if (typeof onScheduleUpdate === 'function') {
                onScheduleUpdate();
            }
        } catch (error) {
            console.error('Error booking client:', error);
            alert(error.message);
        }
    };

    const handleDeleteClient = async (bookingId) => {
        if (window.confirm('Удалить клиента с тренировки?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/client-schedule/${bookingId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Failed to delete booking');
                fetchBookedClients();
            } catch (error) {
                console.error('Error deleting booking:', error);
            }
        }
    };

    const handleAttendanceChange = (clientId) => {
        setAttendanceMap(prev => ({
            ...prev,
            [clientId]: !prev[clientId]
        }));
    };

    const handleSubmit = async () => {
        try {
            // Сначала обновляем статусы клиентов
            const updatePromises = bookedClients.map(client => {
                const newStatus = attendanceMap[client.id] ? 'Посетил' : 'Пропустил';
                return fetch(`http://localhost:5000/api/client-schedule/${client.id}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                });
            });

            await Promise.all(updatePromises);

            // Затем помечаем тренировку как проведенную
            await fetch(`http://localhost:5000/api/schedule/${scheduleId}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            onClose();
            // Обновляем список тренировок после проведения
            if (typeof onScheduleUpdate === 'function') {
                onScheduleUpdate();
            }
        } catch (error) {
            console.error('Error completing training:', error);
            alert('Ошибка при проведении тренировки');
        }
    };

    return (
        <div className="training-clients-overlay" onClick={onClose}>
            <div className="training-clients-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header compact-header">
                        <h3>Клиенты на тренировке</h3>
                        <button className="close-button" onClick={onClose}>×</button>
                    </div>

                    <div className="clients-list-block">
                        {bookedClients.length === 0 && (
                            <div className="no-clients">Нет клиентов</div>
                        )}
                        {bookedClients.map(client => (
                            <div key={client.id} className="client-item">
                                <div className="client-info">
                                    {!isCompleted ? (
                                        <input
                                            type="checkbox"
                                            checked={attendanceMap[client.id] || false}
                                            onChange={() => handleAttendanceChange(client.id)}
                                        />
                                    ) : (
                                        <span className={`status-indicator ${client.status.toLowerCase()}`}>
                                            {client.status === 'Посетил' ? '✓' : '✕'}
                                        </span>
                                    )}
                                    <span className="client-name">
                                        {client.client_name} {client.phone && `(${client.phone})`}
                                    </span>
                                    <span className="remaining-sessions">
                                        Осталось: {client.remaining_sessions || 0}
                                    </span>
                                </div>
                                {!isCompleted && (
                                    <button 
                                        className="delete-client-button"
                                        onClick={() => handleDeleteClient(client.id)}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {!isCompleted && (
                        <div className="clients-actions-block">
                            <button 
                                className="add-client-button compact-add-btn"
                                onClick={() => setShowAddForm(true)}
                            >
                                +
                            </button>

                            {showAddForm && (
                                <div className="add-client-form">
                                    <input
                                        type="text"
                                        placeholder="Поиск клиента..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="search-input"
                                    />
                                    <div className="search-results">
                                        {searchResults.map(client => (
                                            <div 
                                                key={client.id} 
                                                className="search-result-item"
                                                onClick={() => handleBookClient(client.id)}
                                            >
                                                {client.name} {client.phone && `(${client.phone})`}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button 
                                className="submit-button compact-submit-btn"
                                onClick={handleSubmit}
                            >
                                Провести
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainingClients;