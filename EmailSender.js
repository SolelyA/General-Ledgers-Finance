import reactLogo from './assets/react.svg'
import './App.css'
import { useRef, useEffect, useState} from "react"
import emailjs from "@emailjs/browser"

function App() {
  const [count, setCount] = useState(0)
  
  const [to, setTo] = useState("")
const [from, setFrom] = useState("")
const [subject, setSubject] = useState("")
const [message, setMessage] = useState("")
const [loading, setLoading] = useState(false)


  const sendEmail = async (e) => {

        e.preventDefault();
        const serviceId = "service_k6204oc";
        const templateId = "template_xg6xefa"
        const userId = 'DcL0utt6kmQDU-Tvm'
        try {
          await emailjs.init(userId)
          const response = await emailjs.send(serviceId, templateId, {
           to,
            from,
            subject, 
            message,
          });
          alert("email successfully sent check inbox");
        } catch (error) {
          console.log(error);
        }
}

    const labelForm = {textAlign: 'left', marginBottom: '50px'}
    const textInputStyle = { textAlign: 'left', marginBottom: '50px'}
    const textBoxFormat = {textAlign: 'left', marginBottom: '50px'}
    const emailTextBoxFormat = {textAlign: 'left', marginBottom: '50px', width:"300px", height: "350px"}

    return(
        <form className="Email" onSubmit={sendEmail}>
            <div  style={textInputStyle} className="TextBox">
            <label style={labelForm}>To: </label>
            <input style={textBoxFormat} type="text" name="to"
            
            value = {to}
            onChange = {(e) => setTo(e.target.value)}/>
            </div>

            <div style={textInputStyle} className="TextBox">
            <label style={labelForm}>From: </label>
            <input type = "text" name = "from"
            value = {from}
            onChange = {(e) => setFrom(e.target.value)}/>
            </div>
            <div style={textInputStyle} className="TextBox">
            <label style={labelForm}>Subject: </label>
            <input type = "text" name = "subject"
            value = {subject}
            onChange = {(e) => setSubject(e.target.value)}/>
            </div>

            <div style={textInputStyle} className = "TextBox">
            <label style={labelForm}>Message: </label>
            <input type = "text" name = "message" style = {emailTextBoxFormat}
            value = {message}
            onChange = {(e) => setMessage(e.target.value)}/>
            </div>
            <button type="submit">Send</button>
        </form>
        
    )

}

export default App
