import React from 'react'
import HelpIcon from '../../Images/HelpButton.png'
import './HelpButton.css'
import Popup from './Popup.jsx';
import './Popup.css'
import { useState } from 'react';

const HelpButton = ({ onClick, title, text, welcome, UP, UPDirections, FP, FPDirections }) => {
    const [buttonPopup, setButtonPopup] = useState(false)
    return (
        <>
            <button onClick={() => setButtonPopup(true)} className="custom-button">
                <img src={HelpIcon} alt="Custom Button" />
            </button>

            <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>

                <div className={"help-header"}>
                    <div className={"help-title"}>{title}</div>
                    <div className={"help-underline"}></div>
                </div>

                <p className={"welcome"}>{welcome}</p>

                <p><b>{UP}</b></p>

                <p>{UPDirections}</p>

                <p><b>{FP}</b></p>

                <p>{FPDirections}</p>

                <p>{text}</p>

            </Popup>
        </>
    );
};

export default HelpButton
