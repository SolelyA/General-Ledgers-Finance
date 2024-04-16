import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import HelpButton from '../components/HelpButton';
import JournalEntry from '../components/JournalEntry';
import ViewJournalEntries from '../components/ViewJournalEntries';
import '../components/ChartOfAccounts.css'
import emailjs from 'emailjs-com';
import { getUserData, getUserRole} from '../components/firestoreUtils.jsx'
 // Assuming you have these functions implemented

emailjs.init('Vi1TKgZ8-4VjyfZEd');



const ChartOfAccounts = () => {
    const acctsCol = collection(db, "accts");
    const [allAccts, setAllAccts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchAcctName, SetSearchAcctName] = useState("")
    const [searchAcctNum, SetSearchAcctNum] = useState("")
    const [toEmail, setToEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [userData, setUserData] = useState('')
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
    


    const goToNextAccount = () => {
        setCurrentIndex((prevIndex) => (prevIndex === allAccts.length - 1 ? 0 : prevIndex + 1));
    };

    const goToPreviousAccount = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? allAccts.length - 1 : prevIndex - 1));
    };

    const currentAccount = allAccts[currentIndex];

    useEffect(() => {
        fetchAllAccts();
        const fetchData = async () => {
            const userDataString = localStorage.getItem("userData");
            if (userDataString) {
              const uid = JSON.parse(userDataString);
              console.log(await getUserRole(uid))
              await setIsAuthenticated(await getUserRole(uid) === "admin" || await getUserRole(uid) === "Admin");
              console.log(isAuthenticated)
            }
          };
          fetchData();
        }, []);

        const renderProtectedRoute = () => {
            return isAuthenticated ? <div className="email-form-container">
            <h2 className="email-form-title">Contact Form</h2>
            <form className="email-form" onSubmit={handleSubmit}>
                <div className="email-form-group">
                    <label className="email-form-label" htmlFor="toEmail">To Email:</label>
                    <input
                        className="email-form-input"
                        type="email"
                        id="toEmail"
                        value={toEmail}
                        onChange={(e) => setToEmail(e.target.value)}
                    />
                </div>
                <div className="email-form-group">
                    <label className="email-form-label" htmlFor="subject">Subject:</label>
                    <input
                        className="email-form-input"
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </div>
                <div className="email-form-group">
                    <label className="email-form-label" htmlFor="message">Message:</label>
                    <textarea
                        className="email-form-textarea"
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                </div>
                <button className="email-form-button" type="submit" title="Send the email">Send Email</button>
            </form>
            {error && <p className="email-form-error">{error}</p>}
            {success && <p className="email-form-success">{success}</p>}
        </div>
         : <div className="email-form-container">
         <h2 className="email-form-title">Contact Form</h2>
         <form className="email-form" onSubmit={handleSubmit}>
             <div className="email-form-group">
                 <label className="email-form-label" htmlFor="toEmail">To Email:</label>
                 <input
                     className="email-form-input"
                     type="email"
                     id="toEmail"
                     value={toEmail}
                     onChange={(e) => setToEmail(e.target.value)}
                 />
             </div>
             <div className="email-form-group">
                 <label className="email-form-label" htmlFor="subject">Subject:</label>
                 <input
                     className="email-form-input"
                     type="text"
                     id="subject"
                     value={subject}
                     onChange={(e) => setSubject(e.target.value)}
                 />
             </div>
             <div className="email-form-group">
                 <label className="email-form-label" htmlFor="message">Message:</label>
                 <textarea
                     className="email-form-textarea"
                     id="message"
                     value={message}
                     onChange={(e) => setMessage(e.target.value)}
                 ></textarea>
             </div>
             <button className="email-form-button" type="submit" title="Send the email">Send Email</button>
         </form>
         {error && <p className="email-form-error">{error}</p>}
         {success && <p className="email-form-success">{success}</p>}
     </div>};

    const SearchAccountNumber = async (e) => {
        e.preventDefault();
        
        try {
            const q = query(acctsCol);
            const querySnapshot = await getDocs(q);
            const allAcctsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Filter accounts by account number
            const filteredAccts = allAcctsData.filter(acct =>
                acct.acctNumber.toLowerCase().includes(searchAcctNum.toLowerCase())
            );
    
            await setAllAccts(filteredAccts);
        } catch (error) {
            console.error("Error:", error);
        }
    }
    

    const SearchAccountName = async (e) => { //Method for searching account by name
        e.preventDefault();
        const q = query(acctsCol);
        const querySnapshot = await getDocs(q);
        const allAcctsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        await setAllAccts(allAcctsData.filter((allAcctsData) =>
            allAcctsData.acctName.toLowerCase().includes(searchAcctName.toLowerCase())
        ))

        try {

        } catch (error) {
            console.error("Error:", error);
        }
    }

    const fetchAllAccts = async () => {
        try {
            const q = query(acctsCol);
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const allAcctsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllAccts(allAcctsData);
    
                for (const account of allAcctsData) {
                    await calculateBalance(account.acctNumber);
                }
            } else {
                console.log('No accounts found');
            }
        } catch (error) {
            console.error("Error fetching account state", error)
        }
    }
    
    const calculateBalance = async (accountNum) => {
        try {
            const q = query(acctsCol, where('acctNumber', '==', accountNum));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const acctDoc = querySnapshot.docs[0];
                const { balance, debit, credit, initBalance, normalSide } = acctDoc.data();

                let newBal = 0;

                const parsedInitBalance = parseFloat(initBalance);
                const parsedDebit = parseFloat(debit);
                const parsedCredit = parseFloat(credit);

                if (normalSide === 'credit' || normalSide === 'Credit') {
                    newBal = parsedInitBalance + parsedCredit - parsedDebit;
                    console.log('credit');
                } else {
                    newBal = parsedInitBalance + parsedDebit - parsedCredit;
                    console.log('debit');
                    console.log(newBal)
                }

                await updateDoc(acctDoc.ref, { balance: newBal.toFixed(2) });
                newBal = 0;
            } else {
                console.log('Account not found');
            }
        } catch (error) {
            console.error("Error updating account balance", error);
        }
    };

    


    return (
        <>
        <div>
        {userData && (userData.selectedUserType === 'Accountant' || userData.selectedUserType === 'Admin' || userData.selectedUserType === 'Manager') ? (
                        <>
                                    <Navbar />
                                    <HelpButton
                                     title="View Accounts Page"
                                        welcome="Welcome to the View Accounts page!"
                                        text="Here you able to view all active accounts."
                                />
                    
                                <div className={"login-header"}>
                                    <div className={"login-title"}>Accounts</div>
                                    <div className={"coa-underline"}></div>
                                </div>
                    
                                <div className={"adminApproval"}>
                                    <div className={"admin-subheader"}>
                                        <div className={"admin-subtitle"}>Search By Name or Number</div>
                                        <div className={"coaSearch-subUnderline"}></div>
                                    </div>
                    
                                    <div className="w-full maxw-xl flex mx-auto p-20 text-xl">
                                        <form onSubmit={async (e) => { await SearchAccountName(e) }}>
                                            <div className={"coa-inputs"}>
                                                <input
                                                    type="text"
                                                    placeholder="Account Name"
                                                    onChange={async (e) => {
                                                        await SetSearchAcctName(e.target.value)
                                                    }}
                                                    value={searchAcctName}
                                                />
                                            </div>
                    
                                            <button type="submit">Search</button>
                                        </form>
                    
                                        <form onSubmit={async (e) => {
                                           await SearchAccountNumber(e)
                                        }}>
                    
                                            <div className={"coa-inputs"}>
                                                <input
                                                    type="text"
                                                    className="w-full placeholder-gray-400 text-gray-900 p-4"
                                                    placeholder="Account Number"
                                                    onChange={async (e) => {
                                                        await SetSearchAcctNum(e.target.value)
                                                    }}
                                                    value={searchAcctNum}
                                                />
                                            </div>
                    
                                            <button type="submit">Search</button>
                                        </form>
                    
                                    </div>
                    
                                    <div className="accounts-list">
                    
                                        <div className={"admin-subheader"}>
                                            <div className={"admin-subtitle"}>Accounts List</div>
                                            <div className={"coa-subUnderline"}></div>
                                        </div>
                    
                                        <div className={"coa-btns"}>
                                            <button className={"prev"} onClick={goToPreviousAccount} title='Go to previous entry'>Previous
                                            </button>
                                            <button className={"next"} onClick={goToNextAccount} title='Go to next entry'>Next</button>
                                        </div>
                    
                                        {currentAccount && (
                    
                                            <a href={`/ledger/${currentAccount.id}`} className="coa-table-link">
                                                <table className={"coa-table"}>
                    
                                                    <tr>
                                                        <td>Account Number:</td>
                                                        <td>{`  ${currentAccount.acctNumber}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Name:</td>
                                                        <td>{` ${currentAccount.acctName}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Category:</td>
                                                        <td>{` ${currentAccount.acctCategory}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Sub Category:</td>
                                                        <td>{` ${currentAccount.acctSubCategory}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Description:</td>
                                                        <td>{` ${currentAccount.acctDesc}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Type:</td>
                                                        <td>{` ${currentAccount.normalSide}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Initial Balance:</td>
                                                        <td>{` $${currentAccount.initBalance}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Debits:</td>
                                                        <td>{` $${currentAccount.debit}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Credits:</td>
                                                        <td>{` $${currentAccount.credit}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Balance:</td>
                                                        <td>{`  $${currentAccount.balance}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Creation:</td>
                                                        <td>{` ${currentAccount.dateTimeAdded}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>User's ID:</td>
                                                        <td>{` ${currentAccount.userID}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Order:</td>
                                                        <td>{` ${currentAccount.order}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Statement:</td>
                                                        <td>{` ${currentAccount.statement}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Comment:</td>
                                                        <td>{` ${currentAccount.comment}`}</td>
                                                    </tr>
                    
                                                </table>
                    
                    
                                            </a>
                                        )}
                                        
                                        {currentAccount &&(
                                            <div className={"coa-btns"}>
                                            <JournalEntry
                                            accountName = {currentAccount.acctName}
                                            accountId={currentAccount.id}
                                             />
                                        </div>
                                        )}
                    
                                        <div className={"coa-btns"}>
                                            <button className={"prev"} onClick={goToPreviousAccount} title='Go to previous entry'>Previous</button>
                                            <button className={"next"} onClick={goToNextAccount} title='Go to next entry'>Next</button>
                                        </div>
                    
                                        <div className={'coa-btns'}>
                                            <ViewJournalEntries
                                            />
                                        </div>
                    
                                    </div>
                                </div>
                                <div className="email-form-container">
                    <h2 className="email-form-title">Contact Form</h2>
                    <form className="email-form" onSubmit={handleSubmit}>
                        <div className="email-form-group">
                            <label className="email-form-label" htmlFor="toEmail">To Email:</label>
                            <input
                                className="email-form-input"
                                type="email"
                                id="toEmail"
                                value={toEmail}
                                onChange={(e) => setToEmail(e.target.value)}
                            />
                        </div>
                        <div className="email-form-group">
                            <label className="email-form-label" htmlFor="subject">Subject:</label>
                            <input
                                className="email-form-input"
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                        <div className="email-form-group">
                            <label className="email-form-label" htmlFor="message">Message:</label>
                            <textarea
                                className="email-form-textarea"
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            ></textarea>
                        </div>
                        <button className="email-form-button" type="submit" title="Send the email">Send Email</button>
                    </form>
                    {error && <p className="email-form-error">{error}</p>}
                    {success && <p className="email-form-success">{success}</p>}
                </div>
                    </>
                ) : (
                    <>
                                    <Navbar />
                                    <HelpButton
                                     title="View Accounts Page"
                                        welcome="Welcome to the View Accounts page!"
                                        text="Here you able to view all active accounts."
                                />
                    
                                <div className={"login-header"}>
                                    <div className={"login-title"}>Accounts</div>
                                    <div className={"coa-underline"}></div>
                                </div>
                    
                                <div className={"adminApproval"}>
                                    <div className={"admin-subheader"}>
                                        <div className={"admin-subtitle"}>Search By Name or Number</div>
                                        <div className={"coaSearch-subUnderline"}></div>
                                    </div>
                    
                                    <div className="w-full maxw-xl flex mx-auto p-20 text-xl">
                                        <form onSubmit={async (e) => { await SearchAccountName(e) }}>
                                            <div className={"coa-inputs"}>
                                                <input
                                                    type="text"
                                                    placeholder="Account Name"
                                                    onChange={async (e) => {
                                                        await SetSearchAcctName(e.target.value)
                                                    }}
                                                    value={searchAcctName}
                                                />
                                            </div>
                    
                                            <button type="submit">Search</button>
                                        </form>
                    
                                        <form onSubmit={async (e) => {
                                           await SearchAccountNumber(e)
                                        }}>
                    
                                            <div className={"coa-inputs"}>
                                                <input
                                                    type="text"
                                                    className="w-full placeholder-gray-400 text-gray-900 p-4"
                                                    placeholder="Account Number"
                                                    onChange={async (e) => {
                                                        await SetSearchAcctNum(e.target.value)
                                                    }}
                                                    value={searchAcctNum}
                                                />
                                            </div>
                    
                                            <button type="submit">Search</button>
                                        </form>
                    
                                    </div>
                    
                                    <div className="accounts-list">
                    
                                        <div className={"admin-subheader"}>
                                            <div className={"admin-subtitle"}>Accounts List</div>
                                            <div className={"coa-subUnderline"}></div>
                                        </div>
                    
                                        <div className={"coa-btns"}>
                                            <button className={"prev"} onClick={goToPreviousAccount} title='Go to previous entry'>Previous
                                            </button>
                                            <button className={"next"} onClick={goToNextAccount} title='Go to next entry'>Next</button>
                                        </div>
                    
                                        {currentAccount && (
                    
                                            <a href={`/ledger/${currentAccount.id}`} className="coa-table-link">
                                                <table className={"coa-table"}>
                    
                                                    <tr>
                                                        <td>Account Number:</td>
                                                        <td>{`  ${currentAccount.acctNumber}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Name:</td>
                                                        <td>{` ${currentAccount.acctName}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Category:</td>
                                                        <td>{` ${currentAccount.acctCategory}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Sub Category:</td>
                                                        <td>{` ${currentAccount.acctSubCategory}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Description:</td>
                                                        <td>{` ${currentAccount.acctDesc}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Type:</td>
                                                        <td>{` ${currentAccount.normalSide}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Initial Balance:</td>
                                                        <td>{` $${currentAccount.initBalance}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Debits:</td>
                                                        <td>{` $${currentAccount.debit}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Credits:</td>
                                                        <td>{` $${currentAccount.credit}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Balance:</td>
                                                        <td>{`  $${currentAccount.balance}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Creation:</td>
                                                        <td>{` ${currentAccount.dateTimeAdded}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>User's ID:</td>
                                                        <td>{` ${currentAccount.userID}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Order:</td>
                                                        <td>{` ${currentAccount.order}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Statement:</td>
                                                        <td>{` ${currentAccount.statement}`}</td>
                                                    </tr>
                    
                                                    <tr>
                                                        <td>Account Comment:</td>
                                                        <td>{` ${currentAccount.comment}`}</td>
                                                    </tr>
                    
                                                </table>
                    
                    
                                            </a>
                                        )}
                                        
                                        {currentAccount &&(
                                            <div className={"coa-btns"}>
                                            <JournalEntry
                                            accountName = {currentAccount.acctName}
                                            accountId={currentAccount.id}
                                             />
                                        </div>
                                        )}
                    
                                        <div className={"coa-btns"}>
                                            <button className={"prev"} onClick={goToPreviousAccount} title='Go to previous entry'>Previous</button>
                                            <button className={"next"} onClick={goToNextAccount} title='Go to next entry'>Next</button>
                                        </div>
                    
                                        <div className={'coa-btns'}>
                                            <ViewJournalEntries
                                            />
                                        </div>
                    
                                    </div>
                                </div>
                    </>
                )}
            
</div>
</>
    )

}


export default ChartOfAccounts;
