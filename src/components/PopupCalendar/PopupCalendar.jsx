import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './PopupCalendar.css';
import calendarIcon from '../../Images/CalendarIcon.png'; // Adjust the import path

function PopupCalendar() {
  const [showCalendar, setShowCalendar] = useState(false);

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  return (
    <div className="popup-calendar">
      <img src={calendarIcon} alt="Calendar" onClick={toggleCalendar} />
      {showCalendar && <Calendar />}
    </div>
  );
}

export default PopupCalendar;

