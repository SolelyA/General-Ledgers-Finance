import React, { useState } from 'react';
import { auth } from '../firebase'; // Import Firebase configuration
import { signInWithEmailAndPassword } from "firebase/auth";
import signup from './signup';
import { Link } from 'react-router-dom';



const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const passwordAttemptCount = 0;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('')

        try {
            await signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential;
                });
        } catch (error) {
            console.log(error.message)
            if(error.code === 'auth/invalid-credential'){
                
            }
        }
    };
    return (
        <div>
            <h2>Log In</h2>
            <form onSubmit={handleLogin}>
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
                <button type ="submit">Log In</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
            <Link to="/signup"> Sign Up </Link>
            </div>
        </div>
    )
}

export default Login;
