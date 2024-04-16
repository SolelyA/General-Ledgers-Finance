// EventLogButton.jsx

import React from 'react';
import './EventLogButton.css';

const EventLogButton = ({ accountId, onClick }) => {
    return (
        <button className="event-log-button" onClick={onClick}>
            Event Logs
        </button>
    );
};

export default EventLogButton;
