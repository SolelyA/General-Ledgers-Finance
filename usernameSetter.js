import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [val, setVal] = useState("")
  const [input, setInput] = useState('');
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  var date = new Date()
  const month = date.getMonth() + 1;
  const day = date.getDate()
  const fullDate = month + "/" + day
  
  const click = () => {

    if(firstName.trim() === '')
    {
      alert('Please enter a first name')
    }
    else if(lastName.trim() === '')
    {
      alert('Please enter a last name')
    }else{
      var username = Array.from(firstName)[0] + lastName

    if(month < 10) //If month is less than 10, add a 0 in front of it
    {
      username += "0"+month
    }
    else{
      username+=month
    }

    if(day < 10) //If day is less than 10, add a 0 in front of it
    {
      username += "0"+day
    }
    else{
      username+=day
    }
    alert("Your new username is " + username)
    }
  }
  const changefn = event => {
      setVal(event.target.value) //allows users to enter input
  }

  const changeln = event => {
    setVal(event.target.value) //allows users to enter input
}

  return(
    <div classname = "App">
      <p>
        Enter your first and last name:
      </p>
      <input type="text" placeholder="First Name"
       
      value = {firstName}
      onChange = {e => setFirstName(e.target.value)}/>

      <input type="text" placeholder="Last Name"
      
      value = {lastName}
      onChange = {e => setLastName(e.target.value)}/>
      <button onClick = {click}>Submit</button>
    </div>
  )
}

export default App
