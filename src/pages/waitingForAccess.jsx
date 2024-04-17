import Logo from '../logo';
import '../components/waitingForAccess.css'
import photo from "../Images/image.png";
import React from "react";
import HelpButton from '../components/HelpButton/HelpButton';
import PopupCalendar from '../components/PopupCalendar/PopupCalendar';
import '../components/PopupCalendar/PopupCalendar.css';

const WaitingForAccess = () => {
    return (

        <body >
            <HelpButton
                title="Landing Page"
                welcome="Welcome to the Waiting for Access page!"
                text="You must wait for the admin to give you access. Check back later."
            />
            <PopupCalendar /> {/*Render the PopupCalendar component*/}
            <img className={"waiting-logo"} src={photo}/>
            <div className={"waiting-text"}>
                <h1>Thank you for signing up, we are waiting for the administrator to approve your access.</h1>
                <h1>Your patience is appreciated, please check back later.</h1>
            </div>
        </body>
    )
}
export default WaitingForAccess;