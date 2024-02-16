import Page from "../pageGreating";
import Logo from '../logo';

const LandingPage = () =>{
    Page('Aaron');


    return(
        <div>
            <h1>
                Welcome To The Application Domain
            </h1>
            <Logo />
        </div>
    )
};

export default LandingPage
