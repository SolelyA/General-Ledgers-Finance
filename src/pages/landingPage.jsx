import { getUserData } from '../components/firestoreUtils'
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from '../firebase';
import photo from "../Images/image.png";
import React from "react";
import Navbar from "../components/Navbar";
import HelpButton from '../components/HelpButton/HelpButton';
import PopupCalendar from '../components/PopupCalendar/PopupCalendar';
import '../components/PopupCalendar/PopupCalendar.css';
import '../components/LandingPage.css'
import Popup from '../components/HelpButton/Popup'


const LandingPage = () => {
    const navigate = useNavigate();
    const [notifData, setNotifData] = useState('');
    const [userData, setUserData] = useState('');
    const [buttonPopup, setButtonPopup] = useState(false);
    var readNotif = notifData.read

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

    useEffect(() => {
        fetchNotifications();
    }, []);


    return (
        <div>
            <Navbar />
            <HelpButton
                title="Landing Page"
                welcome="Welcome to the Landing page!"
                text="This is the home page."
            />
            <PopupCalendar /> {/*Render the PopupCalendar component*/}
            <img className={"waiting-logo"} src={photo} />
            <div className={"waiting-text"}>
                <h1>Welcome To the Application Domain</h1>
            </div>
            <div>
                {userData ? (
                    <>
                        <h1>Dashboard</h1>
                        <table className="ratios-table">
                            <thead>
                                <tr>
                                    <th>Ratios</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Liquidity</td>
                                    <td>Value 1</td>
                                </tr>
                                <tr>
                                    <td>Profitability</td>
                                    <td>Value 2</td>
                                </tr>
                                <tr>
                                    <td>Solvency</td>
                                    <td>Value 3</td>
                                </tr>
                                <tr>
                                    <td>Efficiency</td>
                                    <td>Value 4</td>
                                </tr>
                                <tr>
                                    <td>Valuation</td>
                                    <td>Value 5</td>
                                </tr>
                            </tbody>
                        </table>
                        <h2>Notifications</h2>
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
                    </>
                ) : (
                    <p>Please log in to view the dashboard</p>
                )}
            </div>
        </div>
    )

};

export default LandingPage
