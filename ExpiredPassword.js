import StartFirebase from '../firebaseConfig/index'
import React from 'react'
import {ref, onValue} from 'firebase/database'
import {Table} from 'react-bootstrap'

const db = StartFirebase();

export class ExpiredPasswords extends React.Component{
    constructor(){
        super();
        this.state = {
            tableData: []
        }
    }

componentDidMount(){
    const dbRef = ref(db, 'Customer');
    onValue(dbRef, (snapshot)=>{
       let records = []
       snapshot.forEach((childSnapshot)=>{
        let keyName = childSnapshot.key
        let data = childSnapshot.val()
        records.push({"key": keyName, "data":data})
       })
       console.log('Fetched Data: ', records)
       //Eliminates passwords with remaining days before expiration less than or equal to 0
       const recordFilter = records.filter(row=> row.data.PasswordDaysUntilExpired <= 0)
       this.setState({tableData: recordFilter})

    })
}

    render(){
        return(
            <Table>
                <thead>
                    <th>Password</th>
                    <th># of Days Until Password Expires</th>
                </thead>

                <tbody>
                    {this.state.tableData.map((row,index)=>{
                        return(<tr>
                            
                            <td>{row.data.Password}</td>
                            <td>{row.data.PasswordDaysUntilExpired}</td>
                        </tr>)
                        
                    })}
                </tbody>
            </Table>
        )
    }
}