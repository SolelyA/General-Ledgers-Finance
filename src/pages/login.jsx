import React, { useState } from 'react';
import { auth } from '../firebase'; // Import Firebase configuration
import { signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import signup from './signup';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase'; //Import database
import logoImage from '../images/logo.png'; // Import the logo image

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
            } else if (accountState === 'Pending Admin Approval') {
                console.log('User has not been granted access by administrator');
                navigate('/waiting-for-Access');
                return;
            } else if (accountState === 'Active') {
                if (!selectedUserType) {
                    setError('Please select user type.');
                    return;
                }

                // Depending on the selected user type, handle login accordingly
                if (selectedUserType === 'Admin') {
                    await signInWithEmailAndPassword(auth, email, password);
                    setLoginAttemptCount(0);
                    navigate('/admin-page');
                } else if (selectedUserType === 'Manager') {
                    // Handle manager login
                } else if (selectedUserType === 'Regular') {
                    await signInWithEmailAndPassword(auth, email, password);
                    setLoginAttemptCount(0);
                    // Redirect regular user to appropriate page
                }
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
        <div>
            <h2>Log In</h2>

            <img // Manipulates the logo
                src={logoImage}
                alt="Logo"
                style={{
                    width: '200px',    // Set the width of the image
                    height: 'auto',    // Maintain the aspect ratio
                    position: 'relative',    // Set the positioning to relative
                    top: '0px',    // Move the image 20 pixels down from its normal position
                    left: '0px' ,  // Move the image 50 pixels to the right from its normal position
                }}
            /> {/* Render the logo image */}

            <form onSubmit={handleLogin}>

                <select value={selectedUserType} onChange={(e) => setSelectedUserType(e.target.value)}>
                    <option value="">Select User Type</option>
                    <option value="Admin">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="Regular">Regular User</option>
                </select>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Log In</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <Link to="/signup">Don't have an account? Sign Up.</Link>
            </div>
            <div>
                 <p>Forgot password</p>
            </div>
        </div>
    );
};

export default Login;
