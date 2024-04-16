import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, addDoc, Timestamp} from "firebase/firestore";
import {ref,uploadBytes,getDownloadURL 
} from "firebase/storage";
import { useParams } from 'react-router-dom';
import { db, storage } from '../firebase';
import Navbar from '../components/Navbar';
import HelpButton from '../components/HelpButton';
import '../components/ChartOfAccounts.css'
import { Button, Form, Modal, ProgressBar } from "react-bootstrap";
import { toast } from "react-toastify";
import {v4} from 'uuid'


const Ledger = () => {
    const { accountId } = useParams();
    const [ledgerData, setLedgerData] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const[searchJournalName, SetSearchJournalName] = useState("")
    const[searchJournalDate1, SetSearchJournalDate1] = useState("")
    const[searchJournalDate2, SetSearchJournalDate2] = useState("")
    const[searchJournalAmount, SetSearchJournalAmount] = useState("")
    const[searchStatus, SetSearchStatus] = useState("")
    const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(0);

  class FileUpload extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        selectedFile: null,
      };
    }

  }

    useEffect(() => {
        const fetchLedgerData = async () => {
            try {
                const ledgerCollectionRef = collection(db, `accts/${accountId}/transactions`);
                console.log(accountId)
                const ledgerSnapshot = await getDocs(ledgerCollectionRef);
                const ledgerData = ledgerSnapshot.docs.map(doc => doc.data());
                setLedgerData(ledgerData);
                for (const entry of ledgerData) {
                    await calculateBalance(entry.id);
                }
            } catch (error) {
                console.error('Error fetching ledger data:', error);
            }
        };

        

        fetchLedgerData();
    }, [accountId]);


    const handleCheckboxChange = async (e, searchStatus) => {
        e.preventDefault();
        
        setLedgerData(ledgerData.filter((ledgerData)=>
            ledgerData.status.toLowerCase().includes(searchStatus.toLowerCase())
        ))
        
    };

    const SearchJournalsByName = async (e) => { //Method for searching journal by name
        e.preventDefault();
        setLedgerData(ledgerData.filter((ledgerData)=>
            ledgerData.acctName.toLowerCase().includes(searchJournalName.toLowerCase())
        ))
    }


    const SearchJournalsByAmount = async (e) => { //Method for searching entries by name
        e.preventDefault();
        setLedgerData(ledgerData.filter((ledgerData)=>
            ledgerData.value.toLowerCase().includes(searchJournalAmount.toLowerCase())
        ))
    }

    const FindPostReference = async (e) => { //Method for searching entries by name
        e.preventDefault();
        setLedgerData(ledgerData.filter((ledgerData)=>
            ledgerData.postReference.toLowerCase().includes("true")
        ))
    }

    const dateFormat = (date) =>{ //Method for formatting date
        var [month, day, year] = date[0].split("/")
        var datef = [year, month, day].join("-")
        const newDate = new Date(datef)
        return newDate
    }

    const SearchEntryDate = async (e) => { //Method for searching account by date
        e.preventDefault();
        
        if(searchJournalDate1 !== null || searchJournalDate2 !== null){
            
            const datef1 = new Timestamp (searchJournalDate1)
            const datef2 = new Date (searchJournalDate2)
            var dateCounter = new Date(searchJournalDate1)
            var dateArray = []
            while (dateCounter <= datef2){ //Creates an array of dates between Date 1 and date 2 so they can be compared to all dates. 
                dateArray.push(new Date(dateCounter))
                dateCounter.setDate(dateCounter.getDate() +1)
            }


            if(ledgerData.specDate === null){
                alert("Nothing here!")
            }

            const CompareDate = new Timestamp(ledgerData.date)

            if(ledgerData.specDate >= datef1.getDate){
                alert("Found a date")
            }
            //const dataDate = ledgerData.date.split(" ")

            const ledgDataBefore = ledgerData

                const bothDatesFilter = ledgerData.filter((entry)=> {
                    const checkDate = new Date(entry.date)
                    return checkDate.getDate >= datef1.getDate && checkDate.getDate <= datef2.getDate
                })

                const date1Filter = ledgerData.filter((ledgerData)=> ledgerData.specDate >= datef1)
                const date2Filter = ledgerData.filter((ledgerData)=> ledgerData.specDate <= datef2)
            
                if(CompareDate.getDate >= datef1.getDate && CompareDate.getDate <= datef2.getDate){
                    alert("Match found 1")
                    setLedgerData(ledgerData.filter((entry)=> {
                        const checkDate = new Date(entry.date)
                        return checkDate.getDate >= datef1.getDate && checkDate.getDate <= datef2.getDate}))
                }
                else if(datef2) //Nothing entered for date 2
                {alert("Match found 2")
                    setLedgerData(ledgerData.filter((entry)=> {
                        const checkDate = new Date(entry.date)
                        return checkDate.getDate >= datef1.getDate})) 
                }
                else if(datef1) //nothing entered for date 1
                {alert("Match found 3")
                    setLedgerData(ledgerData.filter((entry)=> {
                        const checkDate = new Date(entry.date)
                        return checkDate.getDate >= datef1.getDate}))
                }
            
            if(ledgerData === ledgDataBefore){
                alert("Waaaah, I don't wanna make those changes!!!")
            }
            /*const filtered = query(ledgerData, where('specDate', '>=',datef1))
            const snapshot = await getDocs(filtered)
        if(filtered === null){
            alert("Nothing here!")
        }*/
        }else{
            alert("Wheres the data?!")
        }
    
    }

    
    const calculateBalance = async (EntryNum) => {
        try {
            const q = query(ledgerData, where('entry.id', '==', EntryNum));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const acctDoc = querySnapshot.docs[0];
                const { balance, debits, credits, initBalance, normalSide } = acctDoc.data();

                let newBal = 0;

                const parsedInitBalance = parseFloat(initBalance);
                const parsedDebit = parseFloat(debits);
                const parsedCredit = parseFloat(credits);

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

    const uploadFile = (event) =>{ //Uploads file to accounts corresponding "Documents" folder
        if(file === null){
            alert("Please select a file to upload")
            return
        }
        const fileType = file.name
        const fileExtension = fileType.split('.').pop()
        if(file === null){
            return
        }
        //else if(allowedExtensions.exec(file.type)){
        else if(fileExtension !== "png" && fileExtension !== "jpg" && fileExtension !== "docx" && fileExtension !== "xlsx" && fileExtension !== "csv" && fileExtension !== "pdf"){ //How to reference document types in this scenario
            alert("Please submit a .jpg, .png, PDF, Word, Excel, PDF, or .csv file")
            setFile(null)
            return
        }
        else{
            addDoc(collection(db,`accts/${accountId}/transactions/Documents/source`),{
                filename: file.name
            })
        }

    }

    const handleSubmitFunc = (e) =>{
            SearchJournalsByName(e)
            SearchEntryDate(e)
            SearchJournalsByAmount(e)
        
    }
    
    return (
        <div>
            <Navbar />
            <HelpButton
                title="Account's Ledger Page"
                welcome="Welcome to the Ledger page!"
                text="Here you able to view the selected account's ledger."
            />
            <h1>Ledger Page</h1>
            <h3>Search by journal name, amount, or date</h3>
            <div className="w-full maxw-xl flex mx-auto p-20 text-xl">
                <form>
                <input
                    type="text"
                    className="w-full placeholder-gray-400 text-gray-900 p-4"
                    placeholder="Account Name"
                    onChange={(e)=>{SetSearchJournalName(e.target.value)}}
                    value={searchJournalName}
                />
                </form>

                <form onSubmit={(e)=>{SearchEntryDate(e)}}>
                <input
                    type="text"
                    className="w-full placeholder-gray-400 text-gray-900 p-4"
                    placeholder="Start Date"
                    onChange={(e)=>{SetSearchJournalDate1(e.target.value)}}
                    value={searchJournalDate1}
                />
                <input
                    type="text"
                    className="w-full placeholder-gray-400 text-gray-900 p-4"
                    placeholder="End Date"
                    onChange={(e)=>{SetSearchJournalDate2(e.target.value)}}
                    value={searchJournalDate2}
                />
                </form>
                <form onSubmit={(e)=>{SearchJournalsByAmount(e)}}>
                <input
                    type="text"
                    className="w-full placeholder-gray-400 text-gray-900 p-4"
                    placeholder="Amount"
                    onChange={(e)=>{SetSearchJournalAmount(e.target.value)}}
                    value={searchJournalAmount}
                />
                </form>
                <button type="submit" onClick = {handleSubmitFunc}>Search</button>
            </div>

            <h3>Filter by:</h3>
            <div className = "StatusFilter">
            
            <input
                type="checkbox"
                onChange={(event) => handleCheckboxChange(event, "Approved")}
                 />
            <label>
            {`Approved`}
            </label>
            
            <input
                type="checkbox"
                onChange={(event) => handleCheckboxChange(event, "rejected")}
                 />
            <label>
            {`Rejected`}
            </label>
            
            <input
                type="checkbox"
                onChange={(event) => handleCheckboxChange(event, "pending")}
                 />
            <label>
            {`Pending Approval`}
            </label>
                    
            </div>

            <button onClick={FindPostReference}>PR</button>

            
            <table className={"coa-table"}>
                <thead>
                    <tr>
                        <th>Account Name</th>
                        <th>Date</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Balance</th>
                        <th>Source</th>
                    </tr>
                </thead>
                <tbody>
                    {ledgerData.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.acctName}</td>
                            <td>{entry.date}</td>
                            <td>{entry.type}</td>
                            <td>{entry.value}</td>
                            <td>{entry.desc}</td>
                            <td>{entry.status}</td>
                            <td>{entry.balance}</td>
                            <td><input type="file" onChange={(event) => {setFile(event.target.files[0])}}/>
                                 <button onClick={uploadFile} label = "Upload file">Upload File</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
           
        
        </div>
    );

};


export default Ledger;
