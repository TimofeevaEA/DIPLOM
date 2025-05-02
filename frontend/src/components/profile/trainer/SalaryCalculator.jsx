import React, { useState } from 'react';
import './SalaryCalculator.css';

const SalaryCalculator = ({ onCalculate }) => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);

    const handleCalculate = async () => {
        setIsLoading(true);
        try {
            await onCalculate(month, year);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="salary-calculator">
            <h2>Расчет заработной платы</h2>
            <div className="calculator-controls">
                <div className="form-group">
                    <label>Месяц:</label>
                    <select 
                        value={month} 
                        onChange={(e) => setMonth(Number(e.target.value))}
                    >
                        <option value="1">Январь</option>
                        <option value="2">Февраль</option>
                        <option value="3">Март</option>
                        <option value="4">Апрель</option>
                        <option value="5">Май</option>
                        <option value="6">Июнь</option>
                        <option value="7">Июль</option>
                        <option value="8">Август</option>
                        <option value="9">Сентябрь</option>
                        <option value="10">Октябрь</option>
                        <option value="11">Ноябрь</option>
                        <option value="12">Декабрь</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Год:</label>
                    <input 
                        type="number" 
                        value={year} 
                        onChange={(e) => setYear(Number(e.target.value))}
                        min="2024"
                        max="2030"
                    />
                </div>
                <button 
                    className="calculate-btn"
                    onClick={handleCalculate}
                    disabled={isLoading}
                >
                    {isLoading ? 'Расчет...' : 'Рассчитать ЗП'}
                </button>
            </div>
        </div>
    );
};

export default SalaryCalculator; 