import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import photo from "../Images/image.png";
import '../components/adminPage.css'
import emailjs from 'emailjs-com';
import Navbar from '../components/Navbar';
import { getUserData } from '../components/firestoreUtils';
import HelpButton from '../components/HelpButton/HelpButton';
import PopupCalendar from '../components/PopupCalendar/PopupCalendar';
import '../components/PopupCalendar/PopupCalendar.css';
import Popup from '../components/HelpButton/Popup'

const ManagerPage = () => {
    const userCol = collection(db, "users");
    const [users, setUsers] = useState([]);
    const [buttonPopup, setButtonPopup] = useState(false);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [toEmail, setToEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userData, setUserData] = useState('');
    const [notifData, setNotifData] = useState('');

    emailjs.init('Vi1TKgZ8-4VjyfZEd');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const userDataString = localStorage.getItem("userData");
            if (userDataString) {
                const userEmail = JSON.parse(userDataString);
                const userData = await getUserData(userEmail);
                setUserData(userData);
            }
        };

        fetchData();
    }, []);

    const fetchNotifications = async () => {
        try {
            const notifications = collection(db, `notifications`);
            const notifSnapshot = await getDocs(notifications);
            const notifData = notifSnapshot.docs.map(doc => doc.data());
            setNotifData(notifData);
        } catch (error) {
            console.error('Error fetching ledger data:', error);
        }
    }

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
        fetchNotifications();
    }, []);

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

    var readNotif = notifData.read
    return (
        <div>
            <Navbar />
            <img className={"signup-logo"} src={photo} />
            <HelpButton
                title="Manager Page Help"
                welcome="Welcome to the Manager page!"
                text="This page contains buttons to view and modify the account of charts.
                Every time a user adds a new entry to a ledger in the account of charts, you will be notified. Click on the bell icon to review them. "
            />
            {userData && (userData.selectedUserType === 'manager' || userData.selectedUserType === 'Manager' || userData.selectedUserType === 'Admin' || userData.selectedUserType === 'admin') ? (
                <div>
                    <div className={"login-header"}>
                        <div className={"login-title"}>Manager Home Page</div>
                        <div className={"admin-underline"}></div>
                    </div>

                    <div>
                        <div className={"admin-subtitle"}>Chart of Accounts</div>
                        <button class="button" onClick={() => navigate("/chart-of-accounts")} title='View All Accounts in Chart'>View</button>

                    </div>


                </div>

            ) : (
                <h1>How'd you end up here? You must be lost. Here's a way to get home.</h1>

            )}
            <button onClick={() => setButtonPopup(true)}>
                {readNotif ? (
                    "Click here to view notifications"
                ) : (
                    "Click here to view notifications"
                )}
            </button>

            <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
                {notifData && (
                    <div>
                        <h2>Notifications</h2>
                        <table>
                            <tbody>
                                {notifData.map((entry) => (
                                    <tr>
                                        <td>{entry.Message1} has made a new entry. Please review their table for approval</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Popup>
            <PopupCalendar />
        </div>
    );
};

export default ManagerPage;
