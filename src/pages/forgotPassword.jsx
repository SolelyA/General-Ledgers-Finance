import React, { useState } from 'react';
import { auth } from '../firebase'; // Import Firebase configuration
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '../firebase'; //Import database
import { useNavigate } from 'react-router-dom';
import { sendSignupNotification } from '../emailUtils';
import photo from "../Images/image.png";
import '../components/forgotPassword.css'
import Navbar from '../components/Navbar';
import HelpButton from '../components/HelpButton/HelpButton';
import PopupCalendar from '../components/PopupCalendar/PopupCalendar';
import '../components/PopupCalendar/PopupCalendar.css';


const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [userReset, setUserReset] = useState('');

    const userCol = collection(db, "users")
    const navigate = useNavigate();

    //Probably won't need this fetch function but i'll leave it here -Aaron
    const fetchUserForReset = async (email) => {
        try {
            const q = query(userCol, where('email', '==', email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userForResetData = querySnapshot.docs[0]
                const userId = userForResetData.data().email
                setUserReset(userId);
            } else {
                console.log('No users with provided email');
                setError('No user found with provided email address')
            }
        } catch (error) {
            console.error("Error fetching for reset", error)
            setError('An unknown error has occured. Please contact system admin.')
        }
    }

    const handleForgotPass = async (e) => {
        e.preventDefault()
        setError('')
        try {
            sendPasswordResetEmail(auth, email);
            console.log('Email sent');
            navigate('/login');

        } catch (error) {
            console.log('Unable to send reset email')
            setError('There was an error trying to send the reset email. Contact system admin.')
        }
    }

    return (
        <div>
            <Navbar />
            <HelpButton
                title="Edit Accounts Page"
                welcome="Welcome to the Forgot Password page!"
                text="Enter your email for a forgot password link."
            />
            <PopupCalendar /> {/*Render the PopupCalendar component*/}
            <body>

                <img className={"login-logo"} src={photo} />

                <div className={"password-box"}>

                    <div className={"login-header"}>
                        <div className={"login-title"}>Forgot Password</div>
                        <div className={"password-underline"}></div>
                    </div>

                    <p> Enter your email. A link will be sent to your email to reset.</p>

                    <form onSubmit={handleForgotPass}>
                        <div className={"signup-email"}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button className={"login-submit"} type="submit" title='Reset password'>Reset</button>

                    </form>
                </div>
            </body>
        </div>
    )
};
export default ForgotPassword;