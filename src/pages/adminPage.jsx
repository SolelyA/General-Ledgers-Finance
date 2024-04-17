import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { sendApprovalNotification } from '../emailUtils';
import { auth } from '../firebase'; // Import Firebase configuration
import Logo from '../logo';
import photo from "../Images/image.png";
import '../components/adminPage.css'
import emailjs from 'emailjs-com';
import Navbar from '../components/Navbar';
import { getUserRole } from '../components/firestoreUtils';
import HelpButton from '../components/HelpButton/HelpButton';
import PopupCalendar from '../components/PopupCalendar/PopupCalendar';
import '../components/PopupCalendar/PopupCalendar.css';

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

    const makeStyle = (accountState) => {
        if (accountState === 'Active') {
            return {
                background: 'rgb(145 254 159 / 47%)',
                color: '#086210',
                paddingRight: '72px',
                paddingLeft: '72px'
            }
        }
        else if (accountState === 'Rejected') {
            return {
                background: '#ffadad8f',
                color: '#880808',
                paddingRight: '63px',
                paddingLeft: '63px'
            }
        }
        else if (accountState === 'Deactived') {
            return {
                background: '#A8A8A8',
                color: 'black',
                paddingRight: '58px',
                paddingLeft: '58px'
            }
        }
        else {
            return {
                background: 'rgba(97, 179, 213, 0.8)',
                color: '#073c89',
            }
        }
    }

    return (
        <div>
            <Navbar />
            <HelpButton
                title="Admin Page Help"
                welcome="Welcome to the admin page!"
                text="Here you are able to see the User's List displaying their name, email, username,
                DOB, address, user type, and their acconut state, and all Users awaiting approval.
                An email contact form to reach out to the users on the site. Along with buttons to view and modify the account of charts.
                Lastly, at the bottom of the page there is a link to manage all the users signed up on the web app. "
            />
            <PopupCalendar /> {/*Render the PopupCalendar component*/}
            <img className={"signup-logo"} src={photo} />

            <div className={"login-header"}>
                <div className={"login-title"}>Admin Home Page</div>
                <div className={"admin-underline"}></div>
            </div>

            <div>
                <div className={"admin-subtitle"}>Chart of Accounts</div>
                <div className={"admin-coa-subUnderline"}></div>

                <button class="button" onClick={() => navigate("/chart-of-accounts")} title='View All Accounts in Chart'>View</button>
                <button class="button" onClick={() => navigate("/edit-accounts")} title='Modify Existing Accounts'>Edit</button>

            </div>


            <div className={"admin-container"}>

                <button className={"admin-manageUsers"} class="button" onClick={() => navigate("/manage-users")} title='Manage Existing Users'>Manage Users</button>

                <div className={"admin-subheader"}>
                    <div className={"admin-subtitle"}>Users List</div>
                    <div className={"admin-subUnderline"}></div>
                </div>

                <table className={"admin-table"}>
                    <tr className={"headers"}>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>DOB</th>
                        <th>Address</th>
                        <th>User Type</th>
                        <th>Account State</th>
                    </tr>

                    {users.map((user, key) => {
                        return (
                            <tr key={user}>
                                <td className={"name"}>{user.firstName} {user.lastName}</td>
                                <td>{user.email}</td>
                                <td>{user.userName} </td>
                                <td>{user.dob}</td>
                                <td>{user.address} <br /></td>
                                <td>{user.selectedUserType}</td>
                                <td className={"acc-stat"}>
                                    <span className={"status"} style={makeStyle(user.accountState)}>{user.accountState}</span>
                                </td>
                            </tr>
                        )
                    })}
                </table>
            </div>

            <div className={"admin-container"}>

                <div className={"admin-subheader"}>
                    <div className={"admin-subtitle"}>Users List with Pending Admin Approval</div>
                    <div className={"admin-subUnderline2"}></div>
                </div>

                <table className={"admin-table"}>

                    <tr className={"headers"}>
                        <th>Select</th>
                        <th>Name</th>
                        <th>Username</th>
                    </tr>

                    {pendingUsers.map((user, key) => {
                        return (
                            <tr key={user.id}>
                                <td>
                                    <input
                                        className={"pending-input"}
                                        type="checkbox"
                                        id={user.id}
                                        checked={selectedItems.includes(user.id)}
                                        onChange={(event) => handleCheckboxChange(event, user.id)}
                                    />
                                </td>

                                <td >
                                    <label className={"pending-userID"} htmlFor={user.id}>
                                        {`${user.firstName} ${user.lastName}`}
                                    </label>
                                </td>

                                <td>
                                    <label className={"pending-userID"} htmlFor={user.id}>
                                        {`${user.userName}`}
                                    </label>
                                </td>

                            </tr>
                        )
                    })}
                </table>

                <div className={"admin-buttons"}>
                    <button className={"select-activate"} onClick={setSelectedUsersToActiveHandler} title='Set all selected Users to Active Account State'>Set Selected Users to Active</button>
                    {'      '}
                    <button className={"select-reject"} onClick={setSelectedUsersToRejectedHandler} title='Set all selected Users to Rejected Account State'>Set Selected Users to Reject</button>
                </div>

            </div>

            <div className={"admin-container"}>
                <div className={"admin-subheader"}>
                    <div className={"admin-subtitle"}>Contact Form</div>
                    <div className={"admin-subUnderline3"}></div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={"email-form"}>
                        <div className={"email-and-sub"}>
                            <div className={"admin-email"}>
                                <label className={"email-form-label"} htmlFor="toEmail">To Email:</label>
                                <input
                                    className={"email-form-input"}
                                    type="email"
                                    id="toEmail"
                                    value={toEmail}
                                    onChange={(e) => setToEmail(e.target.value)}
                                />
                            </div>
                            <div className={"email-form-group"}>
                                <label className={"email-form-label"} htmlFor="subject">Subject:</label>
                                <input
                                    className={"email-form-input"}
                                    type="text"
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="admin-message">
                            <label className="email-form-label" htmlFor="message">Message:</label>
                            <textarea
                                className="email-form-textarea"
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div>
                        <button className={"email-form-button"} type="submit" title="Send the email">Send Email
                        </button>
                    </div>

                </form>
                {error && <p className="email-form-error">{error}</p>}
                {success && <p className="email-form-success">{success}</p>}
            </div>


        </div>
    );
};

export default AdminPage;
