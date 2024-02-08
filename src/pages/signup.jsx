import React, { useState } from 'react';
import { auth } from '../firebase'; // Import Firebase configuration
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from '../firebase'; //Import database

const userCol = collection(db, "users")

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('')
    if (password.length < 8) {
      setError('Password must be longer than 8 characters')
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      addUserToDB();
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

  const addUserToDB = async () => {
    try {
      addDoc(userCol, {
        email,
        firstName,
        lastName,
        dob,
        address
      });
      console.log('User added successfully')

      setEmail('');
      setFirstName('');
      setLastName('');
      setDob('');
      setAddress('');

    } catch (error) {
      console.error('Error occured when trying to add user to database', error)
      setError('An error occured during signup. Please try again later');
    }
  }


  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
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
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="date"
          placeholder="Date Of Birth"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button type="submit">Sign Up</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Signup;
