import Page from "../pageGreating";
import Logo from '../logo';
import photo from "../components/image.png";
import React from "react";
import Navbar from "../components/Navbar";
import HelpButton from '../components/HelpButton';


const LandingPage = () =>{
    Page('Aaron');


    return(
        <div>
            <Navbar />
            <HelpButton
                title="Landing Page"
                text="Welcome to the Landing page. This is the home page."
            />
            <img className={"waiting-logo"} src={photo}/>
            <div className={"waiting-text"}>
                <h1>Welcome To The Application Domain</h1>
            </div>
        </div>
    )
};

export default LandingPage
