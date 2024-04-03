import Page from "../pageGreating";
import Logo from '../logo';
import photo from "../Images/image.png";
import React from "react";
import Navbar from "../components/Navbar";
import HelpButton from '../components/HelpButton';
import PopupCalendar from '../components/PopupCalendar/PopupCalendar';
import '../components/PopupCalendar/PopupCalendar.css';


const LandingPage = () =>{
    Page('Aaron');

    return(
        <div>
            <Navbar />
            <HelpButton
                title="Landing Page"
                welcome="Welcome to the Landing page!"
                text="This is the home page."
            />
            <PopupCalendar /> {/*Render the PopupCalendar component*/}
            <img className={"waiting-logo"} src={photo}/>
            <div className={"waiting-text"}>
                <h1>Welcome To The Application Domain</h1>
            </div>
        </div>
    )
};

export default LandingPage
