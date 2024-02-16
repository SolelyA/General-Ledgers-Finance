import React, { useState } from 'react';
import { auth } from '../firebase'; // Import Firebase configuration
import { createUserWithEmailAndPassword, updatePassword, sendPasswordResetEmail } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from '../firebase'; //Import database
import { Link, useNavigate } from 'react-router-dom';
import { sendSignupNotification } from '../emailUtils';


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

    const handleForgotPass = async(e) => {
        e.preventDefault()
        setError('')
        try{
            sendPasswordResetEmail(auth, email);
            console.log('Email sent');
            navigate('/login');

        }catch(error){
            console.log('Unable to send reset email')
            setError('There was an error trying to send the reset email. Contact system admin.')
        }
    }

    return (
        <div>
            <h1>Forgot Password</h1>
            <p> Enter your email. A link will be sent to your email to reset.</p>

            <form onSubmit={handleForgotPass}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit">Reset</button>
            </form>
        </div>
    )
};
export default ForgotPassword;