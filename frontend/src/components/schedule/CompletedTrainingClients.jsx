import React, { useState, useEffect } from 'react';
import './CompletedTrainingClients.css';

const CompletedTrainingClients = ({ scheduleId, onClose }) => {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        fetchClients();
    }, [scheduleId]);

    const fetchClients = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/schedule/${scheduleId}/clients`);
            if (!response.ok) throw new Error('Failed to fetch clients');
            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    return (
        <div className="completed-training-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Список посещений</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="clients-list">
                    {Array.isArray(clients) && clients.map(client => (
                        <div key={client.id} className="client-row">
                            <span className={`status-dot ${client.status?.toLowerCase()}`} />
                            <span className="client-name">
                                {client.client_name || 'Без имени'}
                            </span>
                            <span className="client-status">
                                {client.status || 'Нет статуса'}
                            </span>
                        </div>
                    ))}
                    {clients.length === 0 && (
                        <div className="no-clients">Нет записей</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompletedTrainingClients; 