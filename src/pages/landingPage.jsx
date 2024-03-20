import Page from "../pageGreating";
import Logo from '../logo';
import photo from "../components/image.png";
import React from "react";
import Navbar from "../components/Navbar";


const LandingPage = () =>{
    Page('Aaron');


    return(
        <div>
            <Navbar />
            <img className={"waiting-logo"} src={photo}/>
            <div className={"waiting-text"}>
                <h1>Welcome To The Application Domain</h1>
            </div>
        </div>
    )
};

export default LandingPage
