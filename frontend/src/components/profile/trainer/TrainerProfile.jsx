import React, { useState, useEffect } from 'react';
import ChangePassword from '../ChangePassword';
import SalaryCalculator from './SalaryCalculator';
import TrainerSchedule from './TrainerSchedule';
import { authAPI, trainerAPI } from '../../../api';
import './TrainerProfile.css';

function TrainerProfile() {
    const [trainerData, setTrainerData] = useState({
        name: '',
        email: '',
        phone: '',
        salary: 0,
        lessonsCount: 0,
        totalClients: 0,
        trainerId: null
    });

    const [salaryDetails, setSalaryDetails] = useState({
        baseSalary: 0,
        bonusPerClient: 0,
        totalSalary: 0
    });

    const [salaryError, setSalaryError] = useState('');
    const [noData, setNoData] = useState(false);

    useEffect(() => {
        // Загрузка данных тренера при монтировании компонента
        const savedUser = JSON.parse(localStorage.getItem('currentUser'));
        if (savedUser) {
            console.log('Current user:', savedUser);
            setTrainerData(prev => ({
                ...prev,
                name: savedUser.name,
                email: savedUser.email,
                phone: savedUser.phone
            }));
            // Получаем trainer_id по user_id
            trainerAPI.getTrainerIdByUserId(savedUser.id)
                .then(trainerId => {
                    console.log('Got trainer ID:', trainerId);
                    setTrainerData(prev => ({
                        ...prev,
                        trainerId: trainerId
                    }));
                })
                .catch(err => {
                    console.error('Error getting trainer ID:', err);
                    // trainerId не найден
                });
        }
    }, []);

    const calculateSalary = async (month, year) => {
        setSalaryError('');
        setNoData(false);
        try {
            if (!trainerData.trainerId) {
                setSalaryError('Не удалось получить trainer_id');
                return;
            }
            const data = await trainerAPI.getSalary(trainerData.trainerId, month, year);

            if (data.lessonsCount === 0) {
                setNoData(true);
            }

            const baseSalary = data.lessonsCount * 200;
            const bonusPerClient = data.totalClients * 50;
            const totalSalary = baseSalary + bonusPerClient;

            setSalaryDetails({ baseSalary, bonusPerClient, totalSalary });
            setTrainerData(prev => ({
                ...prev,
                lessonsCount: data.lessonsCount,
                totalClients: data.totalClients,
                salary: totalSalary
            }));
        } catch (error) {
            setSalaryError(error.message);
            setSalaryDetails({ baseSalary: 0, bonusPerClient: 0, totalSalary: 0 });
            setTrainerData(prev => ({
                ...prev,
                lessonsCount: 0,
                totalClients: 0,
                salary: 0
            }));
        }
    };

    return (
        <div className="trainer-profile">
            <div className="trainer-header">
                <h1>Личный кабинет тренера</h1>
            </div>
            <div className="trainer-content">
                <div className="trainer-info-card grid-personal" style={{gridArea: 'personal'}}>
                    <h2>Персональная информация</h2>
                    <div className="info-row">
                        <span>Имя:</span>
                        <span>{trainerData.name}</span>
                    </div>
                    <div className="info-row">
                        <span>Email:</span>
                        <span>{trainerData.email}</span>
                    </div>
                    <div className="info-row">
                        <span>Телефон:</span>
                        <span>{trainerData.phone}</span>
                    </div>
                </div>
                <div className="trainer-schedule-card grid-schedule" style={{gridArea: 'schedule'}}>
                    <h2>Расписание занятий</h2>
                    {trainerData.trainerId ? (
                        <TrainerSchedule trainerId={trainerData.trainerId} />
                    ) : (
                        <div className="error">Не удалось загрузить расписание</div>
                    )}
                </div>
                <div className="trainer-info-card grid-password" style={{gridArea: 'password'}}>
                    <ChangePassword />
                </div>
                <div className="trainer-salary-card grid-salary" style={{gridArea: 'salary'}}>
                    <SalaryCalculator onCalculate={calculateSalary} />
                    {salaryError && <div className="error-message">{salaryError}</div>}
                    {noData && <div className="info-message">Нет проведённых занятий за выбранный период.</div>}
                    {salaryDetails.totalSalary > 0 && (
                        <div className="salary-details">
                            <div className="info-row">
                                <span>Количество проведенных занятий:</span>
                                <span>{trainerData.lessonsCount}</span>
                            </div>
                            <div className="info-row">
                                <span>Базовая оплата (200₽ × {trainerData.lessonsCount}):</span>
                                <span>{salaryDetails.baseSalary} ₽</span>
                            </div>
                            <div className="info-row">
                                <span>Бонус за клиентов (50₽ × {trainerData.totalClients}):</span>
                                <span>{salaryDetails.bonusPerClient} ₽</span>
                            </div>
                            <div className="info-row highlight">
                                <span>Итого к оплате:</span>
                                <span>{salaryDetails.totalSalary} ₽</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TrainerProfile; 