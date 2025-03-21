import React from 'react';

const ROOMS = ['Зал 1', 'Зал 2'];

const ScheduleTable = ({ days = [], timeSlots = [], renderCell }) => {
  if (!days.length || !timeSlots.length || !renderCell) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="schedule">
      <div className="schedule__header">
        <div className="time-column">Время</div>
        {days.map(day => (
          <div key={day} className="day-column">{day}</div>
        ))}
      </div>
      
      <div className="schedule__body">
        {timeSlots.map(time => (
          <div key={time} className="time-row">
            <div className="time-cell">{time}</div>
            {days.map(day => (
              <div key={`${day}-${time}`} className="day-cell">
                {ROOMS.map(room => (
                  <div key={`${day}-${time}-${room}`} className="room-cell">
                    {renderCell(time, day, room)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleTable; 