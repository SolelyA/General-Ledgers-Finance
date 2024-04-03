import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, addDoc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { sendApprovalNotification } from '../emailUtils';
import { createUserWithEmailAndPassword, updatePassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebase'; // Import Firebase configuration
import Logo from '../logo';
import Navbar from '../components/Navbar';
import HelpButton from '../components/HelpButton';
import PopupCalendar from '../components/PopupCalendar/PopupCalendar';
import '../components/PopupCalendar/PopupCalendar.css';

const ManageUsers = () => {
    const userCol = collection(db, "users");

    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
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

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        try {
            const q = query(userCol);
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const allUserData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllUsers(allUserData);
            } else {
                console.log('No users found');
            }
        } catch (error) {
            console.error("Error fetching users", error)
        }
    }

    const setSelectedUsersToActiveHandler = async () => {
        try {
            await Promise.all(selectedItems.map(async (userId) => {
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {
                    accountState: 'Active'
                });
                console.log(`Successfully updated account state to "Active" for user with ID: ${userId}`);
            }));

            await fetchAllUsers();
            window.location.reload();

            setSelectedItems([]);
        } catch (error) {
            console.error('Error updating account states:', error);
        }
    };

    const setSelectedUsersToDeactivedHandler = async () => {
        try {
            await Promise.all(selectedItems.map(async (userId) => {
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {
                    accountState: 'Deactived'
                });
                console.log(`Successfully updated account state to "Deactivated" for user with ID: ${userId}`);
            }));

            await fetchAllUsers();
            window.location.reload();
            setSelectedItems([]);
        } catch (error) {
            console.error('Error updating account states:', error);
        }
    };

    const handleCheckboxChange = (event, userId) => {
        const { checked } = event.target;
        if (checked) {
            setSelectedItems(prevSelectedItems => [...prevSelectedItems, userId]);
        } else {
            setSelectedItems(prevSelectedItems => prevSelectedItems.filter(item => item !== userId));
        }
    };

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
        } catch (error) {
            console.log(error.message)
            if (error.code === 'auth/email-already-in-use') {
                setError('Email is already in use')
            } else {
                console.error('Signup Error:', error)
                setError('An error occured during signup. Please try again later')
            }
        }

    };

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

    return (
        <div>
            <Navbar />
            <HelpButton
                title="Edit Accounts Page"
                welcome="Welcome to the Manage Uers page!"
                text="Here you able to add, modify, and deactivate users."
            />
            <PopupCalendar /> {/*Render the PopupCalendar component*/}
            <h2>Users List</h2>
            <Logo />
            <ul>
                {allUsers.map((user) => (
                    <React.Fragment key={user.id}>
                        <li key={user.id}>
                            <input
                                type="checkbox"
                                id={user.id}
                                checked={selectedItems.includes(user.id)}
                                onChange={(event) => handleCheckboxChange(event, user.id)}
                            />
                            <label htmlFor={user.id}>
                                {`${user.firstName} ${user.lastName} (Username: ${user.userName}) (Account State: ${user.accountState}) (Account Role: ${user.userType})`}
                            </label>
                        </li>
                        {user.id !== user.length - 1 && <hr />}
                    </React.Fragment>
                ))}
            </ul>
            <button onClick={setSelectedUsersToActiveHandler} title='Set selected users to active account state'>Set Selected Users to Active</button>
            {'      '}
            <button onClick={setSelectedUsersToDeactivedHandler} title='Set selected users to deactivated account state'>Set Selected Users to Deactivated</button>

            <div>
                <h1>Create a new user</h1>
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
                    <input
                        type="text"
                        placeholder="Account State"
                        value={accountState}
                        onChange={(e) => setAccountState(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="User Role"
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                    />

                    <button type="submit" title='Create a new user'>Create New User</button>
                </form>
            </div>

            <div>
                <Link to ="/admin-page">Admin Home page</Link>
            </div>

        </div>
    )

}
export default ManageUsers