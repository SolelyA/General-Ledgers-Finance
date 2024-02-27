import Logo from '../logo';
import './waitingForAccess.css'
import photo from "./image.png";
import React from "react";
const WaitingForAccess = () => {
    return (

        <body className={"waiting-page"}>

            <img className={"waiting-logo"} src={photo}/>
            <div className={"waiting-text"}>
                <h1>Thank you for signing up, we are waiting for the administrator to approve your access.</h1>
                <h1>Your patience is appreciated, please check back later.</h1>
            </div>
        </body>
    )
}
export default WaitingForAccess;