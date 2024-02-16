import React, { useState } from 'react';
import { auth } from '../firebase'; // Import Firebase configuration
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, getDocs, query } from "firebase/firestore";
import { db } from '../firebase'; //Import database
import { Link, useNavigate } from 'react-router-dom';
import { sendSignupNotification } from '../emailUtils';
import './signup.css'



const Signup = () => {
  const userCol = collection(db, "users")
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('');
  const [accountState, setAccountState] = useState('');

  const chars = ['A', 'a', 'B', 'b', 'C', 'c', 'D', 'd', 'E', 'e', 'F', 'f', 'G', 'g', 'H', 'h',
    'I', 'i', 'J', 'j', 'K', 'k', 'L', 'l', 'M', 'm', 'N', 'n', 'O', 'o', 'P', 'p',
    'Q', 'q', 'R', 'r', 'S', 's', 'T', 't', 'U', 'u', 'V', 'v', 'W', 'w', 'X', 'x',
    'Y', 'y', 'Z', 'z'];

  const specialCharacter = ['!', '@', '#', "$", '%', '^', '&', '*', '(', ')', '\\', '-', '_',
    '=', '+', '[', ']', '{', '}', '|', ';', ':', "'", '"', ',', '<',
    '.', '>', '/', '?', '~', '`'];

  const specialCharacters = new RegExp("[^A-Za-z0-9]");

  const addUserToDB = async () => {
    try {

      const generatedUserName = createUserName();
      setUserName(generatedUserName);

      addDoc(userCol, {
        email,
        firstName,
        lastName,
        dob,
        address,
        userName: generatedUserName,
        accountState: 'Pending Admin Approval',
        userType: 'User'
      });
      console.log('User added successfully')

      setEmail('');
      setFirstName('');
      setLastName('');
      setDob('');
      setAddress('');
      setPassword('');
      setUserName('');
      setUserType('');

    } catch (error) {
      console.error('Error occured when trying to add user to database', error)
      setError('An error occured during signup. Please try again later');
    }
  }

  const createUserName = () => {
    const dateName = new Date(dob);
    const month = dateName.getMonth() + 1;
    const day = dateName.getDate() + 1;

    let dayStr = String(day)
    let monStr = String(month)

    if (dayStr.length === 1) {
      dayStr = '0' + dayStr
    }
    if (monStr.length === 1) {
      monStr = '0' + monStr
    }

    const generatedUserName = firstName[0] + lastName + monStr + dayStr;
    console.log('Username created');

    return generatedUserName;
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('')
    if (password.length < 8) {
      setError('Password must be longer than 8 characters')
      console.error('Password has less than 8 characters')
      return;
    }
    else if (!chars.includes(password[0])) {
      setError('Password must start with a letter')
      console.error('Password does not start with a letter')
      return;
    }
    else if (!/[a-zA-Z]/.test(password)) {
      setError('Password must contain a letter')
      console.error('Password does not contain a letter')
      return;
    }
    else if (!specialCharacters.test(password)) {
      setError('Password must contain a special character (i.e. "!","/","?")')
      console.error('Password does not contain a special character')
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      addUserToDB();
      await sendSignupNotification(userName, email);
      navigate('/waiting-for-access')
    } catch (error) {
      console.log(error.message)
      if (error.code === 'auth/email-already-in-use') {
        setError('Email is already in use')
        // handle error, if you have multiple possible ones you could probably 
        // try using switch statement 
      } else {
        console.error('Signup Error:', error)
        setError('An error occured during signup. Please try again later')
      }
    }

  };

  return (
    <div className={""}>
      <h1>
        Sign Up
      </h1>
      <form className={"inputs"} onSubmit={handleSignup}>
        <input className={"email"}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
            className={"password"}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
            className={"firstname"}
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
            className={"lastname"}
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
            className={"dob"}
          type="date"
          placeholder="Date Of Birth"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
        <input
            className={"address"}
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button className={"signup"} type="submit">Sign Up</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Link to another page */}
      <div className={"login"}>
      <Link to="/login"> Log In </Link>
      </div>
    </div>
  );
  
};

export default Signup;
