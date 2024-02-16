import React, { useState } from 'react';
import { auth } from '../firebase'; // Import Firebase configuration
import { signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import signup from './signup';

import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase'; //Import database

import './login.css'



const Login = () => {
    const userCol = collection(db, "users")
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loginAttemptCount, setLoginAttemptCount] = useState(0);
    const [accountState, setAccountState] = useState('');
    const [userType, setUserType] = useState('');

    const updateAcctState = async (email, newValue) =>{
        const q = query(userCol, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if(!querySnapshot.empty){
            const userDoc = querySnapshot.docs[0];
            updateDoc(userDoc.ref, {
                accountState: newValue
            });
            console.log('Account state updated successfully to: ', newValue)
        }else{
            console.log('Account not found')
        }
    }

    const fetchAcctState = async (email) =>{
        try{
            const q = query(userCol, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if(!querySnapshot.empty){
                const userDoc = querySnapshot.docs[0];
                const acctState = userDoc.data().accountState;
                console.log(acctState)
                return acctState;
            }else{
                console.log('Not found')
                return;
            }
    
    
        }catch(error){
            console.error("Error fetching account state", error)
        }
      }

      const fetchAcctType = async (email) =>{
        try{
            const q = query(userCol, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if(!querySnapshot.empty){
                const userDoc = querySnapshot.docs[0];
                const acctType = userDoc.data().userType;
                console.log(acctType)
                return acctType;
            }else{
                console.log('Not found')
                return;
            }
    
    
        }catch(error){
            console.error("Error fetching account state", error)
        }
      }
    

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('')

        try {
            setAccountState(await fetchAcctState(email));

            if(accountState === 'Suspended' || accountState === 'suspended'){
                console.log('User acct suspeneded')
                setError('Account has been suspeneded. Please contact system adminstrator.')
                return;
            }
            else if(accountState ==='Pending Admin Approval'){
                console.log('User has not been granted access by adminstrator')
                navigate('/waiting-for-Access')
                return;
            }
            else if(accountState === 'Active' && fetchAcctType(email) === 'Admin'){
                await signInWithEmailAndPassword(auth,email,password);
                setLoginAttemptCount(0);
                navigate('/admin-page')

            }
            else{
                await signInWithEmailAndPassword(auth,email,password);
                setLoginAttemptCount(0);
                navigate('/landing-page')
            }

        } catch (error) {
            console.log(error.message)
            setError('Invaild login credentials')
            if (error.code === 'auth/invalid-credential') {
                setLoginAttemptCount(prevCount => prevCount + 1);
                if (loginAttemptCount >= 3) {
                    try{
                        updateAcctState(email,'Suspended');
                        setError('Authentication failed too many times. Account will be suspended. Contanct system adminstrator.')
                        return;
                    }catch(error){
                        console.error('Error when trying to disable account: ', error);
                    }
                    

                }
            }
        };
    };
    return (
        <div>
            <h2>Log In</h2>
            <form className={"inputs2"} onSubmit={handleLogin}>
                <input
                    className={"email2"}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className={"password2"}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Log In</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <Link to="/signup"> Don't have an account? Sign Up. </Link>
            </div>
            <div>
                <Link to ="/forgot-password">Forgot password</Link>

                <button className={"submit2"} type ="submit">Log In</button>
            </form>
            </div>
        </div>
    )
}

export default Login;
