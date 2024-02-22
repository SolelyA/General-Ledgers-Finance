import React, { useState } from 'react';
import { auth } from '../firebase'; // Import Firebase configuration
import { signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import signup from './signup';

import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase'; //Import database
import Logo from '../logo';
import './login.css'
import photo from './image.png'
import emailIcon from './email.png'
import passwordIcon from './password.png'


const Login = () => {
    const userCol = collection(db, "users");
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loginAttemptCount, setLoginAttemptCount] = useState(0);
    const [accountState, setAccountState] = useState('');
    const [selectedUserType, setSelectedUserType] = useState(''); // State to store selected user type

    const updateAcctState = async (email, newValue) => {
        const q = query(userCol, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            updateDoc(userDoc.ref, {
                accountState: newValue
            });
            console.log('Account state updated successfully to: ', newValue);
        } else {
            console.log('Account not found');
        }
    };

    const fetchAcctState = async (email) => {
        try {
            const q = query(userCol, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const acctState = userDoc.data().accountState;
                console.log(acctState);
                return acctState;
            } else {
                console.log('Not found');
                return;
            }
        } catch (error) {
            console.error("Error fetching account state", error);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setAccountState(await fetchAcctState(email));

            if (accountState === 'Suspended' || accountState === 'suspended') {
                console.log('User account suspended');
                setError('Account has been suspended. Please contact system administrator.');
                return;
            } else if (accountState === 'Pending Admin Approval' || accountState == 'Rejected') {
                console.log('User has not been granted access by administrator');
                navigate('/waiting-for-Access');
                return;
            } 
            else {
                await signInWithEmailAndPassword(auth, email, password);
                setLoginAttemptCount(0);
                navigate('/landing-page')
            }

        } catch (error) {
            console.log(error.message);
            setError('Invalid login credentials');
            if (error.code === 'auth/invalid-credential') {
                setLoginAttemptCount(prevCount => prevCount + 1);
                if (loginAttemptCount >= 3) {
                    try {
                        updateAcctState(email, 'Suspended');
                        setError('Authentication failed too many times. Account will be suspended. Contact system administrator.');
                        return;
                    } catch (error) {
                        console.error('Error when trying to disable account: ', error);
                    }
                }
            }
        }
    };

    return (
        <body className={"login-body"}>

            <img className={"login-logo"} src={photo}/>

            <div className={"login-box"}>

                <div className={"login-header"}>
                    <div className={"login-title"}>Log In</div>
                    <div className={"login-underline"}></div>
                </div>


                <form onSubmit={handleLogin}>

                    <div className={"login-email"}>
                        <img src={emailIcon}/>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className={"login-password"}>
                        <img src={passwordIcon}/>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button className={"login-submit"} type="submit">Log In</button>
                </form>

                {error && <p style={{color: 'red'}}>{error}</p>}

                <div className={"login-links"}>
                    <Link to="/signup" className={"no-account"}>Don't have an account? Sign Up.</Link>
                    <Link to="/forgot-password" className={"forgot-password"}>Forgot password</Link>
                </div>
            </div>
        </body>
    );
};

export default Login;
