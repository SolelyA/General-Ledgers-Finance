import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { sendApprovalNotification } from '../emailUtils';
import { auth } from '../firebase'; // Import Firebase configuration
import Logo from '../logo';
import emailjs from 'emailjs-com';

const AdminPage = () => {
    const userCol = collection(db, "users");
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [toEmail, setToEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    emailjs.init('Vi1TKgZ8-4VjyfZEd');


    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!toEmail || !subject || !message) {
            setError('All fields are required');
            return;
        }

        emailjs.sendForm('service_4exj81f', 'template_7mkgqeq', e.target)
            .then((result) => {
                console.log(result.text);
                setSuccess('Email sent successfully!');
                setToEmail('');
                setSubject('');
                setMessage('');
                setError('');
            }, (error) => {
                console.error(error.text);
                setError('An error occurred while sending the email.');
            });
    };

    useEffect(() => {
        fetchUsers();
        fetchPendingUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(userCol);
            const userData = querySnapshot.docs.map(doc => doc.data());
            setUsers(userData);
        } catch (error) {
            console.error('Error fetching users: ', error);
        }
    };

    const fetchPendingUsers = async () => {
        try {
            const q = query(userCol, where('accountState', '==', 'Pending Admin Approval'));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const pendingUsersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPendingUsers(pendingUsersData);
            } else {
                console.log('No users with pending admin approval found');
            }
        } catch (error) {
            console.error("Error fetching account state", error)
        }
    }

    const handleCheckboxChange = (event, userId) => {
        const { checked } = event.target;
        if (checked) {
            setSelectedItems(prevSelectedItems => [...prevSelectedItems, userId]);
        } else {
            setSelectedItems(prevSelectedItems => prevSelectedItems.filter(item => item !== userId));
        }
    };

    const setSelectedUsersToActiveHandler = async () => {
        try {
            await Promise.all(selectedItems.map(async (userId) => {
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {
                    accountState: 'Active'
                });
                //await sendApprovalNotification(userRef.userName, userRef.email);
                console.log(`Successfully updated account state to "Active" for user with ID: ${userId}`);
            }));

            await fetchPendingUsers();
            window.location.reload();

            setSelectedItems([]);
        } catch (error) {
            console.error('Error updating account states:', error);
        }
    };

    const setSelectedUsersToRejectedHandler = async () => {
        try {
            await Promise.all(selectedItems.map(async (userId) => {
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {
                    accountState: 'Rejected'
                });
                //await sendApprovalNotification(userRef.userName, userRef.email);
                console.log(`Successfully updated account state to "Rejected" for user with ID: ${userId}`);
            }));

            await fetchPendingUsers();
            window.location.reload();

            setSelectedItems([]);
        } catch (error) {
            console.error('Error updating account states:', error);
        }
    };

    const makeStyle=(accountState)=>{
        if(accountState === 'Active')
        {
            return {
                background: 'rgb(145 254 159 / 47%)',
                color: '#086210',
                paddingRight:'72px',
                paddingLeft:'72px'
            }
        }
        else if(accountState === 'Rejected')
        {
            return{
                background: '#ffadad8f',
                color: '#880808',
                paddingRight:'63px',
                paddingLeft:'63px'
            }
        }
        else if(accountState === 'Deactived')
        {
            return{
                background: '#A8A8A8',
                color: 'black',
                paddingRight:'58px',
                paddingLeft:'58px'
            }
        }
        else{
            return{
                background: 'rgba(97, 179, 213, 0.8)',
                color: '#073c89',
            }
        }
    }

    return (
        <div>
            <h1>Admin Home Page</h1>
            <h2>Users List</h2>
            <Logo />
            <ul>
                {users.map((user, index) => (
                    <React.Fragment key={index}>
                        <li key={index}>
                            <strong>Name:</strong> {user.firstName} {user.lastName} <strong>Email:</strong> {user.email} <br />
                            <strong>Username:</strong> {user.userName} <strong>DOB:</strong> {user.dob} <strong>Address:</strong> {user.address} <br />
                            <strong>User Type:</strong> {user.userType} <strong>Account State:</strong> {user.accountState}
                            {index !== user.length - 1 && <hr />}
                        </li>
                    </React.Fragment>
                ))}
            </ul>

            <div>
                <h2>Users List with Pending Admin Approval</h2>
                <ul>
                    {pendingUsers.map((user) => (
                        <React.Fragment key={user.id}>
                            <li key={user.id}>
                                <input
                                    type="checkbox"
                                    id={user.id}
                                    checked={selectedItems.includes(user.id)}
                                    onChange={(event) => handleCheckboxChange(event, user.id)}
                                />
                                <label htmlFor={user.id}>
                                    {`${user.firstName} ${user.lastName} (Username: ${user.userName})`}
                                </label>
                            </li>
                            {user.id !== user.length - 1 && <hr />}
                        </React.Fragment>
                    ))}
                </ul>
                <button onClick={setSelectedUsersToActiveHandler}>Set Selected Users to Active</button>
                {'      '}
                <button onClick={setSelectedUsersToRejectedHandler}>Set Selected Users to Rejected</button>
            </div>
            <div>
                <Link to="/manage-users">Manage Users</Link>
            </div>

            <div>
                <h2>Contact Form</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="toEmail">To Email:</label>
                        <input
                            type="email"
                            id="toEmail"
                            value={toEmail}
                            onChange={(e) => setToEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="subject">Subject:</label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="message">Message:</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                    </div>
                    <button type="submit">Send Email</button>
                </form>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </div>


        </div>
    );
};

export default AdminPage;
