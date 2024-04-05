import React, { useState, useEffect } from 'react';
import { auth } from '../firebase'; // Import Firebase configuration
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase'; //Import database
import '../components/login.css'
import photo from "../Images/image.png";
import emailIcon from '../Images/email.png'
import passwordIcon from '../Images/password.png'
import Navbar from '../components/Navbar';
import HelpButton from '../components/HelpButton/HelpButton';
import PopupCalendar from '../components/PopupCalendar/PopupCalendar';
import '../components/PopupCalendar/PopupCalendar.css';

const Login = () => {
    const userCol = collection(db, "users");
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loginAttemptCount, setLoginAttemptCount] = useState(0);
    const [accountState, setAccountState] = useState('');
    const [selectedUserType, setSelectedUserType] = useState(''); // State to store selected user type
    const [uid, setUid] = useState('');

    const updateAcctState = async (email, newValue) => {
        const q = query(userCol, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            await updateDoc(userDoc.ref, {
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
                setUid(userDoc.id); // Update UID state
                console.log(uid);
                console.log(acctState);
                return { acctState, uid: userDoc.id }; // Return both account state and UID
            } else {
                console.log('Not found');
                return null;
            }
        } catch (error) {
            console.error("Error fetching account state", error);
            return null;
        }
    };

    useEffect(() => {
        const loginLogic = async () => {
            if (accountState === 'Suspended' || accountState === 'suspended') {
                console.log('User account suspended');
                setError('Account has been suspended. Please contact the system administrator.');
                return;
            } else if (accountState === 'Pending Admin Approval' || accountState === 'Rejected') {
                console.log('User has not been granted access by the administrator');
                navigate('/waiting-for-Access');
                return;
            } else {
                try {
                    await signInWithEmailAndPassword(auth, email, password);
                    const userData = uid;
                    localStorage.setItem("userData", JSON.stringify(userData));
                    console.log(userData);
                    setLoginAttemptCount(0);
                    navigate('/landing-page');
                } catch (error) {
                    console.log(error.message);
                    setError('Invalid login credentials');
                    if (error.code === 'auth/invalid-credential') {
                        setLoginAttemptCount(prevCount => prevCount + 1);
                        if (loginAttemptCount >= 3) {
                            try {
                                await updateAcctState(email, 'Suspended');
                                setError('Authentication failed too many times. Account will be suspended. Contact the system administrator.');
                                return;
                            } catch (error) {
                                console.error('Error when trying to disable account: ', error);
                            }
                        }
                    }
                }
            }
        };

        if (accountState !== '') {
            loginLogic();
        }
    }, [accountState, email, password, uid, navigate, loginAttemptCount]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { acctState, uid: fetchedUid } = await fetchAcctState(email);
            console.log(acctState);
            console.log(fetchedUid);
            if (acctState) {
                setAccountState(acctState);
                setUid(fetchedUid);
            }
        } catch (error) {
            console.error("Error handling login", error);
        }
    };

    return (
        <div>
            <Navbar />
            <HelpButton
                title="Login Page Help"
                welcome= "Welcome to the Login page!"
                UP="Username and Password: "
                UPDirections="Enter your registered username and password in the designated fields.
                Make sure to enter them correctly to avoid login errors. After three incorrect attempts you'll be locked
                out of the system."
                FP="Forgot Password:"
                FPDirections="If you've forgotten your password, don't worry!
                Click on the 'Forgot Password' link below the login form.
                You'll be guided through the steps to reset your password securely."
            />
            <PopupCalendar /> {/*Render the PopupCalendar component*/}
            <body className={"login-body"}>

                <img className={"login-logo"} src={photo} />

                <div className={"login-box"}>

                    <div className={"login-header"}>
                        <div className={"login-title"}>Log In</div>
                        <div className={"login-underline"}></div>
                    </div>


                    <form onSubmit={handleLogin}>

                        <div className={"login-email"}>
                            <img src={emailIcon} />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className={"login-password"}>
                            <img src={passwordIcon} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button className={"login-submit"} type="submit">Log In</button>
                    </form>

                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <div className={"login-links"}>
                        <Link to="/signup" className={"no-account"} title='Register for an account'>Don't have an account? Sign Up.</Link>
                        <Link to="/forgot-password" className={"forgot-password"} title='Reset password'>Forgot password</Link>
                    </div>
                </div>
            </body>
        </div>
    );
};

export default Login;
