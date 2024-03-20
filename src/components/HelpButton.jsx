import React from 'react'
import HelpIcon from '../Images/HelpButton.png'
import './HelpButton.css'
import Popup from './Popup';
import './Popup.css'
import { useState } from 'react';

const HelpButton = ({ onClick, title, text }) => {
    const [buttonPopup, setButtonPopup] = useState(false)
    return (
        <>
            <button onClick={() => setButtonPopup(true)} className="custom-button">
                <img src={HelpIcon} alt="Custom Button" />
            </button>
            <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
                <h3>{title}</h3>
                <p>{text}</p>
            </Popup>
        </>
    );
};

export default HelpButton
